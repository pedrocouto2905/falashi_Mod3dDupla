import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import useDeckStore from '../store/useDeckStore';
import { COSMETICS } from '../utils/cosmetics';

export default function ShopScreen() {
  const coins = useDeckStore((state) => state.coins);
  const ownedCosmetics = useDeckStore((state) => state.ownedCosmetics);
  const equippedCosmetic = useDeckStore((state) => state.equippedCosmetic);
  const purchaseCosmetic = useDeckStore((state) => state.purchaseCosmetic);
  const selectEquippedCosmetic = useDeckStore((state) => state.selectEquippedCosmetic);

  const handlePress = async (item) => {
    const owned = ownedCosmetics.includes(item.id);

    if (owned) {
      await selectEquippedCosmetic(item.id);
      return;
    }

    if (coins < item.price) {
      Alert.alert('Moedas insuficientes', `Você precisa de ${item.price} 🪙 para comprar este avatar.`);
      return;
    }

    const success = await purchaseCosmetic(item.id);
    if (success) {
      await selectEquippedCosmetic(item.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Loja de Avatares</Text>
        <View style={styles.coinsBadge}>
          <Text style={styles.coinsText}>🪙 {coins}</Text>
        </View>
      </View>

      <FlatList
        data={COSMETICS}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const owned = ownedCosmetics.includes(item.id);
          const equipped = equippedCosmetic === item.id;
          return (
            <TouchableOpacity
              style={[styles.card, equipped && styles.cardEquipped]}
              onPress={() => handlePress(item)}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.name}>{item.name}</Text>
              {equipped ? (
                <Text style={styles.equippedTag}>Equipado</Text>
              ) : owned ? (
                <Text style={styles.ownedTag}>Possui</Text>
              ) : (
                <Text style={styles.priceTag}>🪙 {item.price}</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 52 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  coinsBadge: {
    backgroundColor: '#2a1f00', borderRadius: 20, paddingVertical: 6,
    paddingHorizontal: 14, borderWidth: 1, borderColor: '#f5c518',
  },
  coinsText: { color: '#f5c518', fontSize: 15, fontWeight: 'bold' },
  grid: { paddingHorizontal: 14, paddingBottom: 40 },
  card: {
    flex: 1, margin: 6, backgroundColor: '#1c1c2e', borderRadius: 14,
    paddingVertical: 18, alignItems: 'center', borderWidth: 1.5,
    borderColor: '#1c1c2e', minWidth: 100,
  },
  cardEquipped: { borderColor: '#7c5cff' },
  emoji: { fontSize: 36, marginBottom: 6 },
  name: { color: '#ffffff', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  priceTag: { color: '#f5c518', fontSize: 12, fontWeight: 'bold' },
  ownedTag: { color: '#9a9ab0', fontSize: 12 },
  equippedTag: { color: '#7c5cff', fontSize: 12, fontWeight: 'bold' },
});
