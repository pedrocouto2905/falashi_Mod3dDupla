import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
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
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Falashi</Text>
          <Text style={styles.subtitle}>Seus decks</Text>
        </View>
        <View style={styles.coinsBadge}>
          <Text style={styles.coinsText}>🪙 {coins}</Text>
        </View>
      </View>

      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Você ainda não tem nenhum deck. Crie o primeiro!</Text>
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
              <Text style={styles.playButtonText}>Jogar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateDeck')}>
        <Text style={styles.fabText}>+ Novo Deck</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20, paddingTop: 60 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 16, color: '#9a9ab0', marginTop: 4 },
  coinsBadge: { backgroundColor: '#1c1c2e', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  coinsText: { color: '#f5c518', fontSize: 16, fontWeight: 'bold' },
  list: { paddingBottom: 100 },
  empty: { color: '#9a9ab0', textAlign: 'center', marginTop: 60, fontSize: 15 },
  deckCard: { backgroundColor: '#1c1c2e', borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deckInfo: { flex: 1 },
  deckTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  deckCount: { color: '#9a9ab0', fontSize: 13, marginTop: 4 },
  playButton: { backgroundColor: '#7c5cff', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  playButtonDisabled: { backgroundColor: '#3a3a4a' },
  playButtonText: { color: '#ffffff', fontWeight: '600' },
  fab: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#7c5cff', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  fabText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
