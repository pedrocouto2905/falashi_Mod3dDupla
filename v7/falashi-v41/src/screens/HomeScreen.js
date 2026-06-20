import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, ImageBackground,
} from 'react-native';
import useDeckStore from '../store/useDeckStore';

export default function HomeScreen({ navigation }) {
  const decks = useDeckStore((state) => state.decks);
  const isLoading = useDeckStore((state) => state.isLoading);
  const loadDecks = useDeckStore((state) => state.loadDecks);
  const coins = useDeckStore((state) => state.coins);

  useEffect(() => { loadDecks(); }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7c5cff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.logo}>⚡ FALASHI</Text>
        <View style={styles.coinsBadge}>
          <Text style={styles.coinsText}>🪙 {coins}</Text>
        </View>
      </View>

      {/* ── BANNER BATALHAR ── */}
      <View style={styles.arenaCard}>
        <View style={styles.arenaInfo}>
          <Text style={styles.arenaLabel}>MODO BATALHA</Text>
          <Text style={styles.arenaTitle}>Arena do Saber</Text>
          <Text style={styles.arenaSub}>Desafie seus amigos</Text>
        </View>
        <TouchableOpacity
          style={styles.battleButton}
          onPress={() => navigation.navigate('MultiplayerLobby')}
        >
          <Text style={styles.battleButtonText}>BATALHAR</Text>
        </TouchableOpacity>
      </View>

      {/* ── SEÇÃO DECKS ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📚 Seus Decks</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Ranking')}>
          <Text style={styles.sectionLink}>🏆 Ranking</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum deck ainda.{'\n'}Crie o primeiro abaixo!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.deckCard}>
            <TouchableOpacity
              style={styles.deckInfo}
              onPress={() => navigation.navigate('DeckDetail', { deckId: item.id })}
            >
              <Text style={styles.deckTitle}>{item.title}</Text>
              <Text style={styles.deckCount}>{item.cards.length} cartas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, item.cards.length === 0 && styles.playButtonDisabled]}
              disabled={item.cards.length === 0}
              onPress={() => navigation.navigate('SoloMode', { deckId: item.id })}
            >
              <Text style={styles.playButtonText}>▶ Solo</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ── FAB ── */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateDeck')}>
        <Text style={styles.fabText}>+ Novo Deck</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 52 },
  centered: { justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  logo: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', letterSpacing: 2 },
  coinsBadge: {
    backgroundColor: '#2a1f00', borderRadius: 20, paddingVertical: 6,
    paddingHorizontal: 14, borderWidth: 1, borderColor: '#f5c518',
  },
  coinsText: { color: '#f5c518', fontSize: 15, fontWeight: 'bold' },

  // Arena card
  arenaCard: {
    marginHorizontal: 20, borderRadius: 16, backgroundColor: '#1a1040',
    borderWidth: 1.5, borderColor: '#7c5cff', padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#7c5cff', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  arenaInfo: { flex: 1 },
  arenaLabel: { color: '#9a9ab0', fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  arenaTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  arenaSub: { color: '#9a9ab0', fontSize: 12, marginTop: 2 },
  battleButton: {
    backgroundColor: '#7c5cff', paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 12, borderBottomWidth: 3, borderColor: '#4a2eb0',
  },
  battleButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },

  // Seção decks
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 10,
  },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  sectionLink: { color: '#7c5cff', fontSize: 13 },

  list: { paddingHorizontal: 20, paddingBottom: 100 },
  empty: { color: '#9a9ab0', textAlign: 'center', marginTop: 40, fontSize: 14, lineHeight: 22 },

  deckCard: {
    backgroundColor: '#1c1c2e', borderRadius: 14, padding: 16, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderLeftWidth: 3, borderLeftColor: '#7c5cff',
  },
  deckInfo: { flex: 1 },
  deckTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  deckCount: { color: '#9a9ab0', fontSize: 12, marginTop: 3 },
  playButton: {
    backgroundColor: '#7c5cff', paddingVertical: 9, paddingHorizontal: 16,
    borderRadius: 10, borderBottomWidth: 2, borderColor: '#4a2eb0',
  },
  playButtonDisabled: { backgroundColor: '#3a3a4a', borderColor: '#2a2a3a' },
  playButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 13 },

  fab: {
    position: 'absolute', bottom: 28, left: 20, right: 20,
    backgroundColor: '#7c5cff', paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', borderBottomWidth: 4, borderColor: '#4a2eb0',
    shadowColor: '#7c5cff', shadowOpacity: 0.5, shadowRadius: 10, elevation: 10,
  },
  fabText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});
