import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import useDeckStore from '../store/useDeckStore';

export default function BattleScreen({ navigation }) {
  const decks = useDeckStore((state) => state.decks);
  const coins = useDeckStore((state) => state.coins);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.coinsBadge}>
          <Text style={styles.coinsText}>🪙 {coins}</Text>
        </View>
        <Text style={styles.headerTitle}>FALASHI</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Ranking')}>
          <Text style={styles.trophyBadge}>🏆</Text>
        </TouchableOpacity>
      </View>

      {/* ARENA GRANDE — ocupa a maior parte da tela */}
      <View style={styles.arenaContainer}>
        <View style={styles.arenaBox}>
          <Text style={styles.arenaEmoji}>🏟️</Text>
          <Text style={styles.arenaName}>Arena do Saber</Text>
          <Text style={styles.arenaSub}>Escolha seu modo de batalha</Text>
        </View>
      </View>

      {/* BOTÕES GRANDES EMBAIXO */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.bigButton, styles.soloButton]}
          onPress={() => {
            const deck = decks.find((d) => d.cards.length > 0);
            if (deck) navigation.navigate('SoloMode', { deckId: deck.id });
            else navigation.navigate('Decks');
          }}
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

      {/* SLOTS DE DECK */}
      <Text style={styles.sectionLabel}>DECKS DISPONÍVEIS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deckSlots} contentContainerStyle={{ paddingRight: 20 }}>
        {decks.length === 0 ? (
          <TouchableOpacity style={styles.emptySlot} onPress={() => navigation.navigate('Decks')}>
            <Text style={styles.emptySlotIcon}>➕</Text>
            <Text style={styles.emptySlotText}>Criar deck</Text>
          </TouchableOpacity>
        ) : (
          decks.map((deck) => (
            <TouchableOpacity
              key={deck.id}
              style={[styles.deckSlot, deck.cards.length === 0 && styles.deckSlotDisabled]}
              disabled={deck.cards.length === 0}
              onPress={() => navigation.navigate('SoloMode', { deckId: deck.id })}
            >
              <Text style={styles.deckSlotIcon}>📖</Text>
              <Text style={styles.deckSlotTitle} numberOfLines={1}>{deck.title}</Text>
              <Text style={styles.deckSlotCount}>{deck.cards.length} cartas</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

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

  // Arena ocupa o espaço central
  arenaContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  arenaBox: {
    alignItems: 'center',
    backgroundColor: '#1a1040',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#7c5cff',
    paddingVertical: 32,
    paddingHorizontal: 48,
    shadowColor: '#7c5cff', shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  arenaEmoji: { fontSize: 90 },
  arenaName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  arenaSub: { color: '#9a9ab0', fontSize: 13, marginTop: 6 },

  // Botões
  buttonsRow: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16, marginTop: 16,
  },
  bigButton: {
    flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    borderBottomWidth: 4, elevation: 8,
  },
  soloButton: {
    backgroundColor: '#7c5cff', borderColor: '#4a2eb0',
    shadowColor: '#7c5cff', shadowOpacity: 0.5, shadowRadius: 10,
  },
  multiButton: {
    backgroundColor: '#f5a623', borderColor: '#b87200',
    shadowColor: '#f5a623', shadowOpacity: 0.5, shadowRadius: 10,
  },
  bigButtonIcon: { fontSize: 26, marginBottom: 4 },
  bigButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  // Deck slots
  sectionLabel: {
    color: '#9a9ab0', fontSize: 10, letterSpacing: 2,
    paddingHorizontal: 20, marginBottom: 10,
  },
  deckSlots: { paddingLeft: 20, marginBottom: 16 },
  deckSlot: {
    backgroundColor: '#1c1c2e', borderRadius: 14, padding: 14, marginRight: 10,
    alignItems: 'center', width: 90, borderWidth: 1, borderColor: '#2a2a3e',
  },
  deckSlotDisabled: { opacity: 0.4 },
  deckSlotIcon: { fontSize: 26, marginBottom: 6 },
  deckSlotTitle: { color: '#fff', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  deckSlotCount: { color: '#9a9ab0', fontSize: 10, marginTop: 3 },
  emptySlot: {
    backgroundColor: '#1c1c2e', borderRadius: 14, padding: 14, marginRight: 10,
    alignItems: 'center', width: 90, borderWidth: 1, borderStyle: 'dashed',
    borderColor: '#3a3a4e', justifyContent: 'center', height: 100,
  },
  emptySlotIcon: { fontSize: 24, marginBottom: 4 },
  emptySlotText: { color: '#9a9ab0', fontSize: 11, textAlign: 'center' },
});
