import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, Modal,
} from 'react-native';
import useDeckStore from '../store/useDeckStore';

export default function DeckDetailScreen({ route, navigation }) {
  const { deckId } = route.params;
  const deck = useDeckStore((state) => state.getDeckById(deckId));
  const addCard = useDeckStore((state) => state.addCard);
  const editCard = useDeckStore((state) => state.editCard);
  const removeCard = useDeckStore((state) => state.removeCard);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const [editModal, setEditModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

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
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a carta.');
    }
  };

  const openEditCard = (card) => {
    setEditingCard(card);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
    setEditModal(true);
  };

  const handleEditCard = async () => {
    if (editQuestion.trim().length === 0 || editAnswer.trim().length === 0) {
      Alert.alert('Atenção', 'Preencha a pergunta e a resposta.');
      return;
    }
    try {
      await editCard(deckId, editingCard.id, editQuestion.trim(), editAnswer.trim());
      setEditModal(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível editar a carta.');
    }
  };

  const confirmRemoveCard = (cardId) => {
    Alert.alert(
      'Remover carta',
      'Tem certeza que quer remover esta carta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeCard(deckId, cardId) },
      ]
    );
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
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editCardBtn} onPress={() => openEditCard(item)}>
                <Text style={styles.editCardText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeCardBtn} onPress={() => confirmRemoveCard(item.id)}>
                <Text style={styles.removeText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.playButton, deck.cards.length === 0 && styles.playButtonDisabled]}
        disabled={deck.cards.length === 0}
        onPress={() => navigation.navigate('SoloMode', { deckId })}
      >
        <Text style={styles.playButtonText}>Jogar Modo Solo</Text>
      </TouchableOpacity>

      {/* Modal de edição de carta */}
      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Editar Carta</Text>
            <TextInput
              style={styles.input}
              placeholder="Pergunta"
              placeholderTextColor="#6a6a80"
              value={editQuestion}
              onChangeText={setEditQuestion}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="Resposta esperada"
              placeholderTextColor="#6a6a80"
              value={editAnswer}
              onChangeText={setEditAnswer}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setEditModal(false)}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={handleEditCard}>
                <Text style={styles.modalBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 },
  form: {
    backgroundColor: '#1c1c2e', borderRadius: 14, padding: 14, marginBottom: 16,
  },
  input: {
    backgroundColor: '#28283c', borderRadius: 10, padding: 12,
    color: '#ffffff', marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#7c5cff', paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  addButtonText: { color: '#ffffff', fontWeight: '600' },

  list: { paddingBottom: 100 },
  empty: { color: '#9a9ab0', textAlign: 'center', marginTop: 20 },

  card: {
    backgroundColor: '#1c1c2e', borderRadius: 12, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
  },
  cardQuestion: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  cardAnswer: { color: '#9a9ab0', fontSize: 13, marginTop: 4 },
  cardActions: { flexDirection: 'column', gap: 6, marginLeft: 8 },
  editCardBtn: {
    backgroundColor: '#28283c', borderRadius: 8, padding: 6, alignItems: 'center',
  },
  editCardText: { fontSize: 15 },
  removeCardBtn: {
    backgroundColor: '#2e1a1a', borderRadius: 8, padding: 6, alignItems: 'center',
  },
  removeText: { fontSize: 15 },

  playButton: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    backgroundColor: '#7c5cff', paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  playButtonDisabled: { backgroundColor: '#3a3a4a' },
  playButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#1c1c2e', borderRadius: 18, padding: 24, width: '100%',
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#28283c' },
  modalBtnSave: { backgroundColor: '#7c5cff' },
  modalBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
