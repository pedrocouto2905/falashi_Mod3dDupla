import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, TextInput, Modal,
} from 'react-native';
import useDeckStore from '../store/useDeckStore';
import FadeInView from '../components/FadeInView';

export default function DecksScreen({ navigation }) {
  const decks = useDeckStore((state) => state.decks);
  const equipped = useDeckStore((state) => state.equipped);
  const removeDeck = useDeckStore((state) => state.removeDeck);
  const renameDeck = useDeckStore((state) => state.renameDeck);
  const loadCatalog = useDeckStore((state) => state.loadCatalog);
  const getCatalogItem = useDeckStore((state) => state.getCatalogItem);
  const avatar = getCatalogItem(equipped.avatar);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCatalog);
    return unsubscribe;
  }, [navigation, loadCatalog]);

  const [editModal, setEditModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const openEdit = (deck) => {
    setEditingDeck(deck);
    setEditTitle(deck.title);
    setEditModal(true);
  };

  const handleRename = async () => {
    if (editTitle.trim().length === 0) {
      Alert.alert('Atenção', 'O nome não pode ser vazio.');
      return;
    }
    try {
      await renameDeck(editingDeck.id, editTitle.trim());
      setEditModal(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível renomear o deck.');
    }
  };

  const confirmDelete = (deck) => {
    Alert.alert(
      'Excluir deck',
      `Tem certeza que quer excluir "${deck.title}"? Todas as cartas serão apagadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => removeDeck(deck.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FadeInView>
        <View style={styles.header}>
          <Text style={styles.title}>📚 Decks</Text>
          <TouchableOpacity
            style={styles.avatarBadge}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
          </TouchableOpacity>
        </View>
      </FadeInView>

      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum deck ainda.{'\n'}Crie o primeiro!</Text>
        }
        renderItem={({ item, index }) => (
          <FadeInView delay={index * 60} duration={280}>
            <View style={styles.cardRow}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('DeckDetail', { deckId: item.id })}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardCount}>{item.cards.length} cartas</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.editBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item)}>
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </FadeInView>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateDeck')}>
        <Text style={styles.fabText}>+ Novo Deck</Text>
      </TouchableOpacity>

      {/* Modal de edição do título */}
      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Renomear Deck</Text>
            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Nome do deck"
              placeholderTextColor="#6a6a80"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setEditModal(false)}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={handleRename}>
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
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20, paddingTop: 60 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  avatarBadge: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c1c2e',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5,
    borderColor: '#7c5cff',
  },
  avatarEmoji: { fontSize: 22 },
  list: { paddingBottom: 100 },
  empty: { color: '#9a9ab0', textAlign: 'center', marginTop: 40, fontSize: 14, lineHeight: 22 },

  cardRow: { marginBottom: 12 },
  card: {
    backgroundColor: '#1c1c2e', borderRadius: 14, padding: 18,
    flexDirection: 'row', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: '#7c5cff',
  },
  cardLeft: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cardCount: { color: '#9a9ab0', fontSize: 12, marginTop: 3 },
  arrow: { color: '#7c5cff', fontSize: 24, fontWeight: 'bold' },

  actions: {
    flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6, gap: 8,
  },
  editBtn: {
    backgroundColor: '#28283c', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  editBtnText: { fontSize: 16 },
  deleteBtn: {
    backgroundColor: '#2e1a1a', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  deleteBtnText: { fontSize: 16 },

  fab: {
    position: 'absolute', bottom: 28, left: 20, right: 20,
    backgroundColor: '#7c5cff', paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', borderBottomWidth: 4, borderColor: '#4a2eb0',
    elevation: 10,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#1c1c2e', borderRadius: 18, padding: 24, width: '100%',
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  modalInput: {
    backgroundColor: '#28283c', borderRadius: 10, padding: 12, color: '#fff',
    fontSize: 16, marginBottom: 18,
  },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#28283c' },
  modalBtnSave: { backgroundColor: '#7c5cff' },
  modalBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
