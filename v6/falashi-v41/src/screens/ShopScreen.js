import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import useDeckStore from '../store/useDeckStore';

export default function ShopScreen({ navigation }) {
  const [tab, setTab] = useState('avatar'); // 'avatar' | 'deck'

  const coins = useDeckStore((state) => state.coins);
  const ownedCosmetics = useDeckStore((state) => state.ownedCosmetics);
  const equipped = useDeckStore((state) => state.equipped);
  const catalog = useDeckStore((state) => state.catalog);
  const loadCatalog = useDeckStore((state) => state.loadCatalog);
  const purchaseCosmetic = useDeckStore((state) => state.purchaseCosmetic);
  const selectEquippedCosmetic = useDeckStore((state) => state.selectEquippedCosmetic);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCatalog);
    return unsubscribe;
  }, [navigation, loadCatalog]);

  const items = catalog.filter((c) => c.type === tab);

  const handlePress = async (item) => {
    const owned = ownedCosmetics.includes(item.id);

    if (owned) {
      await selectEquippedCosmetic(item);
      return;
    }

    if (coins < item.price) {
      Alert.alert('Moedas insuficientes', `Você precisa de ${item.price} 🪙 para comprar este item.`);
      return;
    }

    const success = await purchaseCosmetic(item);
    if (success) {
      await selectEquippedCosmetic(item);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Loja</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate('AdminShop')} style={styles.adminBtn}>
            <Text style={styles.adminBtnText}>⚙️</Text>
          </TouchableOpacity>
          <View style={styles.coinsBadge}>
            <Text style={styles.coinsText}>🪙 {coins}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'avatar' && styles.tabButtonActive]}
          onPress={() => setTab('avatar')}
        >
          <Text style={styles.tabButtonText}>🙂 Avatares</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'deck' && styles.tabButtonActive]}
          onPress={() => setTab('deck')}
        >
          <Text style={styles.tabButtonText}>🃏 Baralhos</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const owned = ownedCosmetics.includes(item.id);
          const isEquipped = equipped[item.type] === item.id;
          return (
            <TouchableOpacity
              style={[
                styles.card,
                tab === 'deck' && { backgroundColor: item.cardColor, borderColor: item.borderColor },
                isEquipped && styles.cardEquipped,
              ]}
              onPress={() => handlePress(item)}
            >
              {tab === 'avatar' ? (
                <Text style={styles.emoji}>{item.emoji}</Text>
              ) : (
                <View style={[styles.deckPreview, { borderColor: item.accentColor }]}>
                  <Text style={[styles.deckPreviewText, { color: item.accentColor }]}>?</Text>
                </View>
              )}
              <Text style={styles.name}>{item.name}</Text>
              {isEquipped ? (
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
  adminBtn: { padding: 4 },
  adminBtnText: { fontSize: 20 },
  coinsBadge: {
    backgroundColor: '#2a1f00', borderRadius: 20, paddingVertical: 6,
    paddingHorizontal: 14, borderWidth: 1, borderColor: '#f5c518',
  },
  coinsText: { color: '#f5c518', fontSize: 15, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 10 },
  tabButton: {
    flex: 1, backgroundColor: '#1c1c2e', borderRadius: 12, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#1c1c2e',
  },
  tabButtonActive: { borderColor: '#7c5cff' },
  tabButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  grid: { paddingHorizontal: 14, paddingBottom: 40 },
  card: {
    flex: 1, margin: 6, backgroundColor: '#1c1c2e', borderRadius: 14,
    paddingVertical: 18, alignItems: 'center', borderWidth: 1.5,
    borderColor: '#1c1c2e', minWidth: 100,
  },
  cardEquipped: { borderColor: '#7c5cff', borderWidth: 2.5 },
  emoji: { fontSize: 36, marginBottom: 6 },
  deckPreview: {
    width: 44, height: 56, borderRadius: 8, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  deckPreviewText: { fontSize: 20, fontWeight: 'bold' },
  name: { color: '#ffffff', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  priceTag: { color: '#f5c518', fontSize: 12, fontWeight: 'bold' },
  ownedTag: { color: '#9a9ab0', fontSize: 12 },
  equippedTag: { color: '#7c5cff', fontSize: 12, fontWeight: 'bold' },
});
