import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import useDeckStore from '../store/useDeckStore';
import { signOut } from '../services/authService';
import {
  fetchProfileInfo,
  addProfileInfo,
  updateProfileInfo,
  updateProfileInfoProgress,
  deleteProfileInfo,
} from '../services/database';

export default function ProfileScreen({ navigation }) {
  const playerName = useDeckStore((state) => state.playerName);
  const coins = useDeckStore((state) => state.coins);
  const ownedCosmetics = useDeckStore((state) => state.ownedCosmetics);
  const equipped = useDeckStore((state) => state.equipped);
  const sessionUser = useDeckStore((state) => state.sessionUser);
  const setSessionUser = useDeckStore((state) => state.setSessionUser);
  const updatePlayerName = useDeckStore((state) => state.updatePlayerName);
  const selectEquippedCosmetic = useDeckStore((state) => state.selectEquippedCosmetic);
  const catalog = useDeckStore((state) => state.catalog);
  const loadCatalog = useDeckStore((state) => state.loadCatalog);
  const getCatalogItem = useDeckStore((state) => state.getCatalogItem);

  const [nameInput, setNameInput] = useState(playerName);
  const [editingName, setEditingName] = useState(false);

  // ── Minhas Metas (CRUD completo) ──
  const [infoList, setInfoList] = useState([]);
  const [labelInput, setLabelInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [targetInput, setTargetInput] = useState('');
  const [editingInfoId, setEditingInfoId] = useState(null); // null = criando novo

  useEffect(() => {
    if (sessionUser) {
      fetchProfileInfo(sessionUser).then(setInfoList);
    }
  }, [sessionUser]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCatalog);
    return unsubscribe;
  }, [navigation, loadCatalog]);

  const resetInfoForm = () => {
    setLabelInput('');
    setValueInput('');
    setTargetInput('');
    setEditingInfoId(null);
  };

  const handleSaveInfo = async () => {
    if (!labelInput.trim() || !valueInput.trim()) {
      Alert.alert('Atenção', 'Preencha os campos de meta e objetivo.');
      return;
    }
    const target = parseInt(targetInput, 10) || 0;
    if (editingInfoId) {
      await updateProfileInfo(editingInfoId, labelInput.trim(), valueInput.trim(), target);
    } else {
      await addProfileInfo(sessionUser, labelInput.trim(), valueInput.trim(), target);
    }
    const updated = await fetchProfileInfo(sessionUser);
    setInfoList(updated);
    resetInfoForm();
  };

  const handleEditInfo = (item) => {
    setEditingInfoId(item.id);
    setLabelInput(item.label);
    setValueInput(item.value);
    setTargetInput(item.target_count ? String(item.target_count) : '');
  };

  const handleBumpProgress = async (item, delta) => {
    const max = item.target_count || 0;
    let next = (item.progress_count || 0) + delta;
    if (next < 0) next = 0;
    if (max > 0 && next > max) next = max;
    await updateProfileInfoProgress(item.id, next);
    const updated = await fetchProfileInfo(sessionUser);
    setInfoList(updated);
  };

  const handleDeleteInfo = (id) => {
    Alert.alert('Excluir', 'Remover esta informação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteProfileInfo(id);
          const updated = await fetchProfileInfo(sessionUser);
          setInfoList(updated);
          if (editingInfoId === id) resetInfoForm();
        },
      },
    ]);
  };

  const avatar = getCatalogItem(equipped.avatar);
  const allAvatars = catalog.filter((c) => c.type === 'avatar');
  const allDecks = catalog.filter((c) => c.type === 'deck');
  const ownedAvatars = allAvatars.filter((c) => ownedCosmetics.includes(c.id));
  const ownedDecks = allDecks.filter((c) => ownedCosmetics.includes(c.id));
  const lockedCount =
    (allAvatars.length - ownedAvatars.length) +
    (allDecks.length - ownedDecks.length);

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

      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(item) => item.key}
        renderItem={() => (
          <>
            {/* ── AVATARES POSSUÍDOS ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Seus Avatares</Text>
            </View>
            <View style={styles.row}>
              {ownedAvatars.map((item) => {
                const isEquipped = item.id === equipped.avatar;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.optionBox, isEquipped && styles.optionBoxEquipped]}
                    onPress={() => selectEquippedCosmetic(item)}
                  >
                    <Text style={styles.optionEmoji}>{item.emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── BARALHOS POSSUÍDOS ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Seus Baralhos</Text>
              {lockedCount > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
                  <Text style={styles.sectionLink}>+{lockedCount} na loja</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.row}>
              {ownedDecks.map((item) => {
                const isEquipped = item.id === equipped.deck;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.deckBox,
                      { backgroundColor: item.cardColor, borderColor: item.borderColor },
                      isEquipped && styles.deckBoxEquipped,
                    ]}
                    onPress={() => selectEquippedCosmetic(item)}
                  >
                    <Text style={[styles.deckBoxText, { color: item.accentColor }]}>?</Text>
                    <Text style={styles.deckBoxName}>{item.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── MINHAS METAS (CRUD completo) ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Minhas Metas</Text>
            </View>

            <View style={styles.infoForm}>
              <TextInput
                style={styles.infoInput}
                placeholder="Meta (ex: Matemática)"
                placeholderTextColor="#6a6a80"
                value={labelInput}
                onChangeText={setLabelInput}
              />
              <TextInput
                style={styles.infoInput}
                placeholder="Objetivo (ex: 10 cartas por dia)"
                placeholderTextColor="#6a6a80"
                value={valueInput}
                onChangeText={setValueInput}
              />
              <TextInput
                style={styles.infoInput}
                placeholder="Quantidade alvo (ex: 10)"
                placeholderTextColor="#6a6a80"
                value={targetInput}
                onChangeText={setTargetInput}
                keyboardType="numeric"
              />
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.infoSaveButton} onPress={handleSaveInfo}>
                  <Text style={styles.infoSaveText}>
                    {editingInfoId ? 'Salvar edição' : '+ Adicionar'}
                  </Text>
                </TouchableOpacity>
                {editingInfoId && (
                  <TouchableOpacity style={styles.infoCancelButton} onPress={resetInfoForm}>
                    <Text style={styles.infoCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {infoList.length === 0 ? (
              <Text style={styles.infoEmpty}>Nenhuma meta ainda. Adicione uma acima!</Text>
            ) : (
              infoList.map((item) => {
                const target = item.target_count || 0;
                const progress = item.progress_count || 0;
                const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
                const done = target > 0 && progress >= target;
                return (
                  <View key={item.id} style={styles.infoItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoLabel}>{item.label}</Text>
                      <Text style={styles.infoValue}>{item.value}</Text>
                      {target > 0 && (
                        <>
                          <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${pct}%` }, done && styles.progressBarFillDone]} />
                          </View>
                          <View style={styles.progressRow}>
                            <Text style={styles.progressText}>
                              {progress}/{target} {done ? '✅' : `(${pct}%)`}
                            </Text>
                            <View style={{ flexDirection: 'row' }}>
                              <TouchableOpacity onPress={() => handleBumpProgress(item, -1)} style={styles.bumpButton}>
                                <Text style={styles.bumpButtonText}>-</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleBumpProgress(item, 1)} style={styles.bumpButton}>
                                <Text style={styles.bumpButtonText}>+1</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleEditInfo(item)} style={styles.infoIconButton}>
                      <Text style={styles.infoIcon}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteInfo(item.id)} style={styles.infoIconButton}>
                      <Text style={styles.infoIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                await signOut();
                setSessionUser(null);
              }}
            >
              <Text style={styles.logoutText}>🚪 Sair da conta</Text>
            </TouchableOpacity>
          </>
        )}
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
    paddingHorizontal: 20, marginBottom: 10, marginTop: 8,
  },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  sectionLink: { color: '#7c5cff', fontSize: 13 },

  row: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, marginBottom: 10 },
  optionBox: {
    width: 60, height: 60, margin: 6, backgroundColor: '#1c1c2e', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5,
    borderColor: '#1c1c2e',
  },
  optionBoxEquipped: { borderColor: '#7c5cff' },
  optionEmoji: { fontSize: 28 },

  deckBox: {
    width: 80, height: 96, margin: 6, borderRadius: 12, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  deckBoxEquipped: { borderWidth: 3, borderColor: '#7c5cff' },
  deckBoxText: { fontSize: 24, fontWeight: 'bold' },
  deckBoxName: { color: '#ffffff', fontSize: 10, marginTop: 4, fontWeight: '600' },
  logoutButton: {
    marginHorizontal: 20, marginTop: 24, marginBottom: 40,
    paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#2a1020', borderWidth: 1, borderColor: '#ff4444',
    alignItems: 'center',
  },
  logoutText: { color: '#ff4444', fontSize: 15, fontWeight: 'bold' },

  infoForm: { paddingHorizontal: 20, marginBottom: 14 },
  infoInput: {
    backgroundColor: '#1c1c2e', borderRadius: 10, padding: 12,
    color: '#ffffff', fontSize: 14, marginBottom: 8,
  },
  infoSaveButton: {
    backgroundColor: '#7c5cff', borderRadius: 10, paddingVertical: 10,
    paddingHorizontal: 16, alignItems: 'center', marginRight: 8,
  },
  infoSaveText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  infoCancelButton: {
    backgroundColor: '#2a2a3e', borderRadius: 10, paddingVertical: 10,
    paddingHorizontal: 16, alignItems: 'center',
  },
  infoCancelText: { color: '#9a9ab0', fontWeight: 'bold', fontSize: 13 },
  infoEmpty: {
    color: '#6a6a80', fontSize: 13, textAlign: 'center', marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c2e',
    borderRadius: 10, padding: 12, marginHorizontal: 20, marginBottom: 8,
  },
  infoLabel: { color: '#9a9ab0', fontSize: 11, textTransform: 'uppercase' },
  infoValue: { color: '#ffffff', fontSize: 15, fontWeight: '600', marginTop: 2 },
  infoIconButton: { paddingHorizontal: 8 },
  infoIcon: { fontSize: 18 },

  progressBarBg: {
    height: 6, backgroundColor: '#2a2a3e', borderRadius: 3, marginTop: 8, overflow: 'hidden',
  },
  progressBarFill: { height: 6, backgroundColor: '#7c5cff', borderRadius: 3 },
  progressBarFillDone: { backgroundColor: '#3ddc84' },
  progressRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6,
  },
  progressText: { color: '#9a9ab0', fontSize: 12 },
  bumpButton: {
    backgroundColor: '#2a2a3e', borderRadius: 8, paddingVertical: 4,
    paddingHorizontal: 10, marginLeft: 6,
  },
  bumpButtonText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
});
