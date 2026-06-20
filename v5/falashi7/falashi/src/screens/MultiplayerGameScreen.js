import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { isAnswerCorrect } from '../utils/answerMatcher';
import { MULTIPLAYER_DECK } from '../utils/multiplayerDeck';
import {
  listenToRoom,
  submitAnswer,
  advanceQuestion,
  finishRoom,
} from '../services/multiplayerService';

export default function MultiplayerGameScreen({ route, navigation }) {
  const { code, playerKey, playerName } = route.params; // playerKey: 'host' | 'guest'
  const opponentKey = playerKey === 'host' ? 'guest' : 'host';

  const [room, setRoom] = useState(null);
  const [answer, setAnswer] = useState('');
  const [hasAnsweredThisRound, setHasAnsweredThisRound] = useState(false);
  const lastIndexRef = useRef(0);

  useEffect(() => {
    const unsubscribe = listenToRoom(code, (data) => {
      setRoom(data);
      // Reseta o campo de resposta sempre que a pergunta avança
      if (data.currentIndex !== lastIndexRef.current) {
        lastIndexRef.current = data.currentIndex;
        setAnswer('');
        setHasAnsweredThisRound(false);
      }
    });
    return unsubscribe;
  }, [code]);

  if (!room) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7c5cff" />
        <Text style={styles.waitingText}>Conectando à sala...</Text>
      </View>
    );
  }

  // Sala esperando o segundo jogador (só acontece pro host)
  if (room.status === 'waiting') {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.codeLabel}>Código da sala</Text>
        <Text style={styles.codeBig}>{room.code}</Text>
        <Text style={styles.waitingText}>Compartilhe esse código com o outro jogador.</Text>
        <ActivityIndicator size="large" color="#7c5cff" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (room.status === 'finished') {
    const me = room[playerKey];
    const opponent = room[opponentKey];
    const result = me.score > opponent.score ? 'Você venceu! 🏆'
      : me.score < opponent.score ? 'Você perdeu.'
      : 'Empate!';

    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.finishedTitle}>{result}</Text>
        <Text style={styles.scoreLine}>{me.name}: {me.score}</Text>
        <Text style={styles.scoreLine}>{opponent.name}: {opponent.score}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.popToTop()}>
          <Text style={styles.primaryButtonText}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = MULTIPLAYER_DECK.cards[room.currentIndex];
  const isLastCard = room.currentIndex === MULTIPLAYER_DECK.cards.length - 1;
  const me = room[playerKey];
  const opponent = room[opponentKey];
  const opponentAnswered = room.lastAnswer && room.lastAnswer.player === opponentKey;

  const handleSubmit = async () => {
    if (!answer.trim() || hasAnsweredThisRound) return;
    setHasAnsweredThisRound(true);
    const correct = isAnswerCorrect(answer, currentCard.answer);
    await submitAnswer(code, playerKey, correct, me.score);
  };

  // Só o host controla o avanço de pergunta (evita corrida entre os dois clientes)
  const handleNext = async () => {
    if (isLastCard) {
      await finishRoom(code);
    } else {
      await advanceQuestion(code, room.currentIndex + 1);
    }
  };

  const bothAnswered =
    room.lastAnswer &&
    ((room.lastAnswer.player === 'host' && room.guest && hasAnsweredThisRound && playerKey === 'guest') ||
      (room.lastAnswer.player === 'guest' && room.host && hasAnsweredThisRound && playerKey === 'host') ||
      (hasAnsweredThisRound && opponentAnswered));

  return (
    <View style={styles.container}>
      <View style={styles.scoreboard}>
        <Text style={styles.scoreboardText}>{me.name}: {me.score}</Text>
        <Text style={styles.scoreboardText}>{opponent.name}: {opponent.score}</Text>
      </View>

      <Text style={styles.progress}>
        {room.currentIndex + 1} / {MULTIPLAYER_DECK.cards.length}
      </Text>

      <View style={styles.card}>
        <Text style={styles.question}>{currentCard.question}</Text>
      </View>

      {!hasAnsweredThisRound ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Digite sua resposta..."
            placeholderTextColor="#6a6a80"
            value={answer}
            onChangeText={setAnswer}
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>Confirmar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.waitingBox}>
          <Text style={styles.waitingText}>
            {opponentAnswered
              ? `${opponent.name} já respondeu.`
              : `Aguardando ${opponent.name}...`}
          </Text>
          {!opponentAnswered && <ActivityIndicator color="#7c5cff" style={{ marginTop: 10 }} />}

          {opponentAnswered && playerKey === 'host' && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>
                {isLastCard ? 'Ver Resultado' : 'Próxima Pergunta →'}
              </Text>
            </TouchableOpacity>
          )}
          {opponentAnswered && playerKey === 'guest' && (
            <Text style={styles.waitingHint}>Aguardando o host avançar...</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20, paddingTop: 60 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1c1c2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  scoreboardText: { color: '#ffffff', fontWeight: '600' },
  progress: { color: '#9a9ab0', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  card: {
    backgroundColor: '#1c1c2e',
    borderRadius: 16,
    padding: 30,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  question: { color: '#ffffff', fontSize: 20, fontWeight: '600', textAlign: 'center' },
  input: {
    backgroundColor: '#1c1c2e',
    borderRadius: 12,
    padding: 14,
    color: '#ffffff',
    marginBottom: 16,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#7c5cff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  waitingBox: { alignItems: 'center', marginTop: 20 },
  waitingText: { color: '#9a9ab0', fontSize: 14, textAlign: 'center', marginTop: 16 },
  waitingHint: { color: '#6a6a80', fontSize: 12, marginTop: 10, textAlign: 'center' },
  codeLabel: { color: '#9a9ab0', fontSize: 16 },
  codeBig: { color: '#ffffff', fontSize: 56, fontWeight: 'bold', marginVertical: 10 },
  finishedTitle: { color: '#ffffff', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  scoreLine: { color: '#cfcfdf', fontSize: 16, marginBottom: 6 },
});
