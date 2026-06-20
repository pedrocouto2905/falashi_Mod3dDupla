import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import useDeckStore from '../store/useDeckStore';
import { COSMETICS, getCosmeticById } from '../utils/cosmetics';

export default function ProfileScreen({ navigation }) {
  const playerName = useDeckStore((state) => state.playerName);
  const coins = useDeckStore((state) => state.coins);
  const ownedCosmetics = useDeckStore((state) => state.ownedCosmetics);
  const equippedCosmetic = useDeckStore((state) => state.equippedCosmetic);
  const updatePlayerName = useDeckStore((state) => state.updatePlayerName);
  const selectEquippedCosmetic = useDeckStore((state) => state.selectEquippedCosmetic);

  const [nameInput, setNameInput] = useState(playerName);
  const [editingName, setEditingName] = useState(false);

  const avatar = getCosmeticById(equippedCosmetic);
  const ownedList = COSMETICS.filter((c) => ownedCosmetics.includes(c.id));
  const lockedCount = COSMETICS.length - ownedList.length;

  const handleSaveName = async () => {
    await updatePlayerName(nameInput);
    setEditingName(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── CABEÇALHO COM AVATAR GRANDE ── */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
        </View>

        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              maxLength={20}
              autoFocus
              onSubmitEditing={handleSaveName}
            />
            <TouchableOpacity style={styles.saveNameButton} onPress={handleSaveName}>
              <Text style={styles.saveNameText}>OK</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingName(true)}>
            <Text style={styles.playerName}>{playerName} ✏️</Text>
          </TouchableOpacity>
        )}

        <View style={styles.coinsBadge}>
          <Text style={styles.coinsText}>🪙 {coins}</Text>
        </View>
      </View>

      {/* ── GRADE DE COSMÉTICOS POSSUÍDOS ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Seus Avatares</Text>
        {lockedCount > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
            <Text style={styles.sectionLink}>+{lockedCount} na loja</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={ownedList}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const equipped = item.id === equippedCosmetic;
          return (
            <TouchableOpacity
              style={[styles.avatarOption, equipped && styles.avatarOptionEquipped]}
              onPress={() => selectEquippedCosmetic(item.id)}
            >
              <Text style={styles.avatarOptionEmoji}>{item.emoji}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 52 },

  header: { alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#1c1c2e',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
    borderColor: '#7c5cff', marginBottom: 12,
  },
  avatarEmoji: { fontSize: 48 },
  playerName: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },

  nameEditRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '100%',
  },
  nameInput: {
    flex: 1, backgroundColor: '#1c1c2e', borderRadius: 10, padding: 10,
    color: '#ffffff', fontSize: 16, marginRight: 8,
  },
  saveNameButton: {
    backgroundColor: '#7c5cff', borderRadius: 10, paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveNameText: { color: '#ffffff', fontWeight: 'bold' },

  coinsBadge: {
    backgroundColor: '#2a1f00', borderRadius: 20, paddingVertical: 6,
    paddingHorizontal: 14, borderWidth: 1, borderColor: '#f5c518',
  },
  coinsText: { color: '#f5c518', fontSize: 15, fontWeight: 'bold' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 10,
  },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  sectionLink: { color: '#7c5cff', fontSize: 13 },

  grid: { paddingHorizontal: 14 },
  avatarOption: {
    flex: 1, margin: 6, aspectRatio: 1, backgroundColor: '#1c1c2e', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5,
    borderColor: '#1c1c2e', minWidth: 60,
  },
  avatarOptionEquipped: { borderColor: '#7c5cff' },
  avatarOptionEmoji: { fontSize: 28 },
});
