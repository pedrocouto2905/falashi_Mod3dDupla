import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, Alert } from 'react-native';
import useDeckStore from '../store/useDeckStore';

export default function BattleScreen({ navigation }) {
  const decks = useDeckStore((state) => state.decks);
  const coins = useDeckStore((state) => state.coins);
  const addDeck = useDeckStore((state) => state.addDeck);
  const renameDeck = useDeckStore((state) => state.renameDeck);
  const removeDeck = useDeckStore((state) => state.removeDeck);
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const playableDecks = decks.filter((d) => d.cards.length > 0);

  const handleCreateDeck = async () => {
    const name = newDeckName.trim();
    if (!name) return;
    await addDeck(name);
    setNewDeckName('');
  };

  const startEdit = (deck) => {
    setEditingId(deck.id);
    setEditingName(deck.title);
  };

  const confirmEdit = async () => {
    const name = editingName.trim();
    if (name) await renameDeck(editingId, name);
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteDeck = (deck) => {
    Alert.alert(
      'Excluir deck',
      `Tem certeza que deseja excluir "${deck.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => removeDeck(deck.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.coinsBadge}>
          <Text style={styles.coinsText}>🪙 {coins}</Text>
        </View>
        <Text style={styles.headerTitle}>FALASHI</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Ranking' })}>
          <Text style={styles.trophyBadge}>🏆</Text>
        </TouchableOpacity>
      </View>

      {/* ARENA GRANDE */}
      <View style={styles.arenaContainer}>
        <View style={styles.arenaBox}>
          <Text style={styles.arenaEmoji}>🏟️</Text>
          <Text style={styles.arenaName}>Arena do Saber</Text>
          <Text style={styles.arenaSub}>Escolha seu modo de batalha</Text>
        </View>
      </View>

      {/* BOTÕES */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.bigButton, styles.soloButton]}
          onPress={() => setShowDeckPicker(true)}
        >
          <Text style={styles.bigButtonIcon}>🧠</Text>
          <Text style={styles.bigButtonText}>Solo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bigButton, styles.multiButton]}
          onPress={() => navigation.navigate('MultiplayerLobby')}
        >
          <Text style={styles.bigButtonIcon}>⚔️</Text>
          <Text style={styles.bigButtonText}>Batalha!</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL ESCOLHA DE DECK */}
      <Modal visible={showDeckPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Escolha um Deck</Text>

            {/* CRIAR NOVO DECK */}
            <View style={styles.createRow}>
              <TextInput
                style={styles.createInput}
                placeholder="Nome do novo deck..."
                placeholderTextColor="#6a6a80"
                value={newDeckName}
                onChangeText={setNewDeckName}
              />
              <TouchableOpacity style={styles.createButton} onPress={handleCreateDeck}>
                <Text style={styles.createButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {playableDecks.length === 0 && decks.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>Nenhum deck ainda.{'\n'}Crie um acima!</Text>
              </View>
            ) : (
              <FlatList
                data={decks}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 300 }}
                renderItem={({ item }) => (
                  <View style={styles.deckOption}>
                    <Text style={styles.deckOptionIcon}>📖</Text>

                    {editingId === item.id ? (
                      <TextInput
                        style={styles.editInput}
                        value={editingName}
                        onChangeText={setEditingName}
                        autoFocus
                        onSubmitEditing={confirmEdit}
                      />
                    ) : (
                      <TouchableOpacity
                        style={styles.deckOptionInfo}
                        disabled={item.cards.length === 0}
                        onPress={() => {
                          setShowDeckPicker(false);
                          navigation.navigate('SoloMode', { deckId: item.id });
                        }}
                      >
                        <Text style={styles.deckOptionTitle}>{item.title}</Text>
                        <Text style={styles.deckOptionCount}>{item.cards.length} cartas</Text>
                      </TouchableOpacity>
                    )}

                    {editingId === item.id ? (
                      <TouchableOpacity onPress={confirmEdit} style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>✅</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => startEdit(item)} style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>✏️</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDeleteDeck(item)} style={styles.actionIcon}>
                      <Text style={styles.actionIconText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}

            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowDeckPicker(false)}>
              <Text style={styles.modalCancelText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 52 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 8,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 3 },
  coinsBadge: {
    backgroundColor: '#2a1f00', borderRadius: 20, paddingVertical: 6,
    paddingHorizontal: 14, borderWidth: 1, borderColor: '#f5c518',
  },
  coinsText: { color: '#f5c518', fontSize: 14, fontWeight: 'bold' },
  trophyBadge: { fontSize: 26 },

  arenaContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  arenaBox: {
    alignItems: 'center', backgroundColor: '#1a1040', borderRadius: 24,
    borderWidth: 1.5, borderColor: '#7c5cff', paddingVertical: 40, paddingHorizontal: 52,
    shadowColor: '#7c5cff', shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  arenaEmoji: { fontSize: 100 },
  arenaName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  arenaSub: { color: '#9a9ab0', fontSize: 13, marginTop: 6 },

  buttonsRow: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 32, marginTop: 20,
  },
  bigButton: {
    flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    borderBottomWidth: 4, elevation: 8,
  },
  soloButton: { backgroundColor: '#7c5cff', borderColor: '#4a2eb0' },
  multiButton: { backgroundColor: '#f5a623', borderColor: '#b87200' },
  bigButtonIcon: { fontSize: 26, marginBottom: 4 },
  bigButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#1c1c2e', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalEmpty: { alignItems: 'center', paddingVertical: 20 },
  modalEmptyText: { color: '#9a9ab0', textAlign: 'center', fontSize: 14, lineHeight: 22, marginBottom: 20 },
  deckOption: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#28283c',
    borderRadius: 12, padding: 14, marginBottom: 10,
  },
  deckOptionIcon: { fontSize: 24, marginRight: 12 },
  deckOptionInfo: { flex: 1 },
  deckOptionTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  deckOptionCount: { color: '#9a9ab0', fontSize: 12, marginTop: 2 },
  deckOptionArrow: { color: '#7c5cff', fontSize: 22, fontWeight: 'bold' },
  modalCancelButton: {
    marginTop: 12, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#28283c', alignItems: 'center',
  },
  modalCancelText: { color: '#9a9ab0', fontSize: 15, fontWeight: '600' },

  // CRUD
  createRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  createInput: {
    flex: 1, backgroundColor: '#28283c', borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, color: '#fff', fontSize: 14,
  },
  createButton: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#7c5cff',
    alignItems: 'center', justifyContent: 'center',
  },
  createButtonText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  editInput: {
    flex: 1, backgroundColor: '#1c1c2e', borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 6, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#7c5cff',
  },
  actionIcon: { paddingHorizontal: 8, paddingVertical: 4 },
  actionIconText: { fontSize: 18 },
});
