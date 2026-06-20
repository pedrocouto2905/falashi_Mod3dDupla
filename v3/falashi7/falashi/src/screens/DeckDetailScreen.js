import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import useDeckStore from '../store/useDeckStore';

export default function DeckDetailScreen({ route, navigation }) {
  const { deckId } = route.params;
  const deck = useDeckStore((state) => state.getDeckById(deckId));
  const addCard = useDeckStore((state) => state.addCard);
  const removeCard = useDeckStore((state) => state.removeCard);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  if (!deck) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Deck não encontrado.</Text>
      </View>
    );
  }

  const handleAddCard = async () => {
    if (question.trim().length === 0 || answer.trim().length === 0) {
      Alert.alert('Atenção', 'Preencha a pergunta e a resposta.');
      return;
    }
    try {
      await addCard(deckId, question.trim(), answer.trim());
      setQuestion('');
      setAnswer('');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar a carta.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{deck.title}</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Pergunta"
          placeholderTextColor="#6a6a80"
          value={question}
          onChangeText={setQuestion}
        />
        <TextInput
          style={styles.input}
          placeholder="Resposta esperada"
          placeholderTextColor="#6a6a80"
          value={answer}
          onChangeText={setAnswer}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
          <Text style={styles.addButtonText}>Adicionar Carta</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={deck.cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma carta neste deck ainda.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardQuestion}>{item.question}</Text>
              <Text style={styles.cardAnswer}>Resposta: {item.answer}</Text>
            </View>
            <TouchableOpacity onPress={() => removeCard(deckId, item.id)}>
              <Text style={styles.removeText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={[
          styles.playButton,
          deck.cards.length === 0 && styles.playButtonDisabled,
        ]}
        disabled={deck.cards.length === 0}
        onPress={() => navigation.navigate('SoloMode', { deckId })}
      >
        <Text style={styles.playButtonText}>Jogar Modo Solo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  form: {
    backgroundColor: '#1c1c2e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#28283c',
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#7c5cff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  empty: {
    color: '#9a9ab0',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#1c1c2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardQuestion: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  cardAnswer: {
    color: '#9a9ab0',
    fontSize: 13,
    marginTop: 4,
  },
  removeText: {
    color: '#ff6b6b',
    fontSize: 13,
    marginLeft: 10,
  },
  playButton: {
    backgroundColor: '#7c5cff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  playButtonDisabled: {
    backgroundColor: '#3a3a4a',
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
