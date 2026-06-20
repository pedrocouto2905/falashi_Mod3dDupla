import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchTopScores } from '../services/database';

export default function RankingScreen({ navigation }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopScores().then((data) => {
      setScores(data);
      setLoading(false);
    });
  }, []);

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
              <Text style={styles.score}>{item.score}/{item.total}</Text>
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
});
