import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Alert, ScrollView, Modal,
} from 'react-native';
import { fetchShopItems, insertShopItem, updateShopItem, deleteShopItem } from '../services/database';

const EMPTY_FORM = {
  id: '', type: 'avatar', name: '', price: '0',
  emoji: '', cardColor: '#1c1c2e', borderColor: '#2a2a3e', accentColor: '#7c5cff',
};

export default function AdminShopScreen() {
  const [items, setItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    const rows = await fetchShopItems();
    setItems(rows);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(false);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setForm({
      id: item.id,
      type: item.type,
      name: item.name,
      price: String(item.price),
      emoji: item.emoji ?? '',
      cardColor: item.card_color ?? '#1c1c2e',
      borderColor: item.border_color ?? '#2a2a3e',
      accentColor: item.accent_color ?? '#7c5cff',
    });
    setEditing(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.id.trim() || !form.name.trim()) {
      Alert.alert('Erro', 'ID e Nome são obrigatórios.');
      return;
    }
    const payload = {
      id: form.id.trim(),
      type: form.type,
      name: form.name.trim(),
      price: parseInt(form.price) || 0,
      emoji: form.emoji.trim() || null,
      cardColor: form.cardColor.trim() || null,
      borderColor: form.borderColor.trim() || null,
      accentColor: form.accentColor.trim() || null,
    };
    try {
      if (editing) await updateShopItem(payload);
      else await insertShopItem(payload);
      setModalVisible(false);
      load();
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Excluir item', `Excluir "${item.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => { await deleteShopItem(item.id); load(); },
      },
    ]);
  };

  const f = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Admin — Loja</Text>
        <TouchableOpacity style={s.addBtn} onPress={openCreate}>
          <Text style={s.addBtnText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={s.empty}>Nenhum item cadastrado no banco.</Text>}
        renderItem={({ item }) => (
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.rowName}>{item.emoji ? `${item.emoji} ` : ''}{item.name}</Text>
              <Text style={s.rowSub}>{item.type} · 🪙 {item.price} · {item.id}</Text>
            </View>
            <TouchableOpacity style={s.editBtn} onPress={() => openEdit(item)}>
              <Text style={s.editBtnText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(item)}>
              <Text style={s.delBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.overlay}>
          <ScrollView style={s.modal} contentContainerStyle={{ padding: 20 }}>
            <Text style={s.modalTitle}>{editing ? 'Editar Item' : 'Novo Item'}</Text>

            <Text style={s.label}>ID (único, sem espaços)</Text>
            <TextInput style={[s.input, editing && { opacity: 0.5 }]}
              value={form.id} onChangeText={f('id')} editable={!editing}
              placeholder="ex: avatar_star" placeholderTextColor="#555" autoCapitalize="none" />

            <Text style={s.label}>Tipo</Text>
            <View style={s.typeRow}>
              {['avatar', 'deck'].map((t) => (
                <TouchableOpacity key={t}
                  style={[s.typeBtn, form.type === t && s.typeBtnActive]}
                  onPress={() => setForm((p) => ({ ...p, type: t }))}>
                  <Text style={s.typeBtnText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Nome</Text>
            <TextInput style={s.input} value={form.name} onChangeText={f('name')}
              placeholder="ex: Estrela" placeholderTextColor="#555" />

            <Text style={s.label}>Preço (moedas)</Text>
            <TextInput style={s.input} value={form.price} onChangeText={f('price')}
              keyboardType="numeric" placeholder="0" placeholderTextColor="#555" />

            {form.type === 'avatar' ? (
              <>
                <Text style={s.label}>Emoji</Text>
                <TextInput style={s.input} value={form.emoji} onChangeText={f('emoji')}
                  placeholder="⭐" placeholderTextColor="#555" />
              </>
            ) : (
              <>
                <Text style={s.label}>cardColor (hex)</Text>
                <TextInput style={s.input} value={form.cardColor} onChangeText={f('cardColor')}
                  placeholder="#1c1c2e" placeholderTextColor="#555" autoCapitalize="none" />
                <Text style={s.label}>borderColor (hex)</Text>
                <TextInput style={s.input} value={form.borderColor} onChangeText={f('borderColor')}
                  placeholder="#2a2a3e" placeholderTextColor="#555" autoCapitalize="none" />
                <Text style={s.label}>accentColor (hex)</Text>
                <TextInput style={s.input} value={form.accentColor} onChangeText={f('accentColor')}
                  placeholder="#7c5cff" placeholderTextColor="#555" autoCapitalize="none" />
              </>
            )}

            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                <Text style={s.saveBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 52 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  addBtn: { backgroundColor: '#7c5cff', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  empty: { color: '#9a9ab0', textAlign: 'center', marginTop: 40 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c2e', borderRadius: 12, padding: 14, marginBottom: 10 },
  rowName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  rowSub: { color: '#9a9ab0', fontSize: 12, marginTop: 2 },
  editBtn: { padding: 8 },
  editBtnText: { fontSize: 18 },
  delBtn: { padding: 8 },
  delBtnText: { fontSize: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1c1c2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  label: { color: '#9a9ab0', fontSize: 12, marginBottom: 4, marginTop: 10 },
  input: { backgroundColor: '#0f0f1a', color: '#fff', borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#2a2a3e' },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  typeBtn: { flex: 1, backgroundColor: '#0f0f1a', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#2a2a3e' },
  typeBtnActive: { borderColor: '#7c5cff' },
  typeBtnText: { color: '#fff', fontWeight: '600' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 8 },
  cancelBtn: { flex: 1, backgroundColor: '#2a2a3e', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: '#9a9ab0', fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: '#7c5cff', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
