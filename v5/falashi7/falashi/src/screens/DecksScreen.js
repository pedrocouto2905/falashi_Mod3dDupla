import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import useDeckStore from '../store/useDeckStore';
import { getCosmeticById } from '../utils/cosmetics';

export default function DecksScreen({ navigation }) {
  const decks = useDeckStore((state) => state.decks);
  const equippedCosmetic = useDeckStore((state) => state.equippedCosmetic);
  const avatar = getCosmeticById(equippedCosmetic);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Decks</Text>
        <TouchableOpacity
          style={styles.avatarBadge}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum deck ainda.{'\n'}Crie o primeiro!</Text>
        }
        renderItem={({ item }) => (
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
  card: {
    backgroundColor: '#1c1c2e', borderRadius: 14, padding: 18, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: '#7c5cff',
  },
  cardLeft: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cardCount: { color: '#9a9ab0', fontSize: 12, marginTop: 3 },
  arrow: { color: '#7c5cff', fontSize: 24, fontWeight: 'bold' },
  fab: {
    position: 'absolute', bottom: 28, left: 20, right: 20,
    backgroundColor: '#7c5cff', paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', borderBottomWidth: 4, borderColor: '#4a2eb0',
    elevation: 10,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});
