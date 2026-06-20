import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import useDeckStore from '../store/useDeckStore';
import { isAnswerCorrect } from '../utils/answerMatcher';
import { useSpeechRecognition } from '../services/speechService';

export default function SoloModeScreen({ route, navigation }) {
  const { deckId } = route.params;
  const deck = useDeckStore((state) => state.getDeckById(deckId));
  const equipped = useDeckStore((state) => state.equipped);
  const getCatalogItem = useDeckStore((state) => state.getCatalogItem);
  const deckSkin = getCatalogItem(equipped.deck);

  // Hook de reconhecimento de voz via WebView
  const { SpeechWebView, startListening, stopListening } = useSpeechRecognition();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [spokenText, setSpokenText] = useState('');
  const [score, setScore] = useState(0);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);

  // ---------- ANIMAÇÕES ----------
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardTranslateX = useRef(new Animated.Value(0)).current;
  const feedbackScale = useRef(new Animated.Value(0.85)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  // Entrada inicial da tela
  useEffect(() => {
    cardOpacity.setValue(0);
    cardTranslateX.setValue(20);
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(cardTranslateX, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [currentIndex]);

  // Quando o feedback aparece, faz um "pop" de escala + fade na caixa de resultado
  useEffect(() => {
    if (feedback) {
      feedbackScale.setValue(0.85);
      feedbackOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(feedbackScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(feedbackOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [feedback]);

  if (!deck || deck.cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Este deck não possui cartas.</Text>
      </View>
    );
  }

  const currentCard = deck.cards[currentIndex];
  const isLastCard = currentIndex === deck.cards.length - 1;

  const handleMicPress = async () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      setLoading(false);
      return;
    }

    setIsListening(true);
    setLoading(true);
    setFeedback(null);

    try {
      const transcript = await startListening();
      setSpokenText(transcript);
      checkAnswer(transcript);
    } catch (err) {
      const mensagem = Platform.OS === 'ios'
        ? 'Reconhecimento de voz não funciona no iOS ainda. Use o campo de texto abaixo.'
        : `Não foi possível reconhecer a voz: ${err.message}`;
      Alert.alert('Erro', mensagem);
    } finally {
      setIsListening(false);
      setLoading(false);
    }
  };

  const checkAnswer = (text) => {
    const correct = isAnswerCorrect(text, currentCard.answer);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
  };

  const handleManualCheck = () => {
    if (!manualInput.trim()) return;
    setSpokenText(manualInput);
    checkAnswer(manualInput);
  };

  const nextCard = () => {
    // Anima a saída da carta atual (fade + slide para a esquerda) antes de trocar
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(cardTranslateX, { toValue: -20, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setFeedback(null);
      setSpokenText('');
      setManualInput('');
      if (isLastCard) {
        navigation.replace('Result', {
          score,
          total: deck.cards.length,
          deckId,
        });
      } else {
        setCurrentIndex((i) => i + 1);
      }
    });
  };

  const micLabel = loading
    ? 'Ouvindo...'
    : isListening
    ? 'Parar'
    : 'Falar Resposta 🎙️';

  return (
    <View style={styles.container}>
      {/* WebView invisível — não ocupa espaço visual, só processa voz */}
      <SpeechWebView />

      <Text style={styles.progress}>
        {currentIndex + 1} / {deck.cards.length}
      </Text>

      <Animated.View
        style={[
          styles.card,
          { backgroundColor: deckSkin.cardColor, borderColor: deckSkin.borderColor },
          {
            opacity: cardOpacity,
            transform: [{ translateX: cardTranslateX }],
          },
        ]}
      >
        <Text style={styles.question}>{currentCard.question}</Text>
      </Animated.View>

      {feedback && (
        <Animated.View
          style={[
            styles.feedbackBox,
            feedback === 'correct' ? styles.correctBox : styles.wrongBox,
            {
              opacity: feedbackOpacity,
              transform: [{ scale: feedbackScale }],
            },
          ]}
        >
          <Text style={styles.feedbackText}>
            {feedback === 'correct' ? '✅ Acertou!' : '❌ Não foi essa...'}
          </Text>
          <Text style={styles.feedbackSub}>Você disse: "{spokenText}"</Text>
          {feedback === 'wrong' && (
            <Text style={styles.feedbackSub}>
              Resposta certa: "{currentCard.answer}"
            </Text>
          )}
        </Animated.View>
      )}

      {!feedback && (
        <>
          <TouchableOpacity
            style={[
              styles.micButton,
              { backgroundColor: deckSkin.accentColor },
              isListening && styles.micButtonActive,
            ]}
            onPress={handleMicPress}
            disabled={loading && !isListening}
          >
            <Text style={styles.micButtonText}>{micLabel}</Text>
          </TouchableOpacity>

          {/* Fallback manual — útil no iOS e para testes rápidos */}
          <View style={styles.manualBox}>
            <Text style={styles.manualLabel}>
              Ou digite (fallback / iOS):
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Resposta..."
              placeholderTextColor="#6a6a80"
              value={manualInput}
              onChangeText={setManualInput}
              onSubmitEditing={handleManualCheck}
            />
            <TouchableOpacity style={styles.manualButton} onPress={handleManualCheck}>
              <Text style={styles.manualButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {feedback && (
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: deckSkin.accentColor }]}
          onPress={nextCard}
        >
          <Text style={styles.nextButtonText}>
            {isLastCard ? 'Finalizar 🏁' : 'Próxima →'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    padding: 20,
    paddingTop: 60,
  },
  progress: {
    color: '#9a9ab0',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 30,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  question: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  micButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  micButtonActive: {
    backgroundColor: '#ff6b6b',
  },
  micButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  manualBox: {
    backgroundColor: '#1c1c2e',
    borderRadius: 14,
    padding: 14,
  },
  manualLabel: {
    color: '#9a9ab0',
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#28283c',
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    marginBottom: 10,
  },
  manualButton: {
    backgroundColor: '#3a3a4a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  manualButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  feedbackBox: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  correctBox: {
    backgroundColor: '#1f3d2b',
  },
  wrongBox: {
    backgroundColor: '#3d1f1f',
  },
  feedbackText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  feedbackSub: {
    color: '#cfcfdf',
    fontSize: 13,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  empty: {
    color: '#9a9ab0',
    textAlign: 'center',
    marginTop: 60,
  },
});
