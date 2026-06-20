import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { fetchTopScores, updateScore, deleteScore } from '../services/database';

export default function RankingScreen({ navigation }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingScore, setEditingScore] = useState('');

  const loadScores = () => {
    fetchTopScores().then((data) => {
      setScores(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadScores();
  }, []);

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingScore(String(item.score));
  };

  const confirmEdit = async (item) => {
    const newScore = parseInt(editingScore, 10);
    if (!isNaN(newScore)) {
      await updateScore(item.id, newScore, item.total);
    }
    setEditingId(null);
    loadScores();
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Remover resultado',
      `Remover "${item.deck_title}" (${item.score}/${item.total}) do ranking?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await deleteScore(item.id);
            loadScores();
          },
        },
      ]
    );
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🏆 Ranking</Text>

      {loading ? (
        <ActivityIndicator color="#7c5cff" style={{ marginTop: 40 }} />
      ) : scores.length === 0 ? (
        <Text style={styles.empty}>Nenhuma partida jogada ainda.</Text>
      ) : (
        <FlatList
          data={scores}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.medal}>{medals[index] ?? `${index + 1}.`}</Text>
              <View style={styles.info}>
                <Text style={styles.deckTitle}>{item.deck_title}</Text>
                <Text style={styles.date}>
                  {new Date(item.played_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>

              {editingId === item.id ? (
                <TextInput
                  style={styles.editInput}
                  value={editingScore}
                  onChangeText={setEditingScore}
                  keyboardType="numeric"
                  autoFocus
                  onSubmitEditing={() => confirmEdit(item)}
                />
              ) : (
                <Text style={styles.score}>{item.score}/{item.total}</Text>
              )}

              {editingId === item.id ? (
                <TouchableOpacity onPress={() => confirmEdit(item)} style={styles.actionIcon}>
                  <Text style={styles.actionIconText}>✅</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => startEdit(item)} style={styles.actionIcon}>
                  <Text style={styles.actionIconText}>✏️</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionIcon}>
                <Text style={styles.actionIconText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20, paddingTop: 60 },
  back: { marginBottom: 16 },
  backText: { color: '#9a9ab0', fontSize: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 24 },
  empty: { color: '#9a9ab0', textAlign: 'center', marginTop: 60 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c2e', borderRadius: 12, padding: 14, marginBottom: 10 },
  medal: { fontSize: 22, width: 36 },
  info: { flex: 1 },
  deckTitle: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  date: { color: '#9a9ab0', fontSize: 12, marginTop: 2 },
  score: { color: '#7c5cff', fontSize: 18, fontWeight: 'bold' },
  editInput: {
    backgroundColor: '#28283c', borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 4, color: '#fff', fontSize: 15, width: 60, textAlign: 'center',
    borderWidth: 1, borderColor: '#7c5cff',
  },
  actionIcon: { paddingHorizontal: 6, paddingVertical: 4, marginLeft: 4 },
  actionIconText: { fontSize: 16 },
});
