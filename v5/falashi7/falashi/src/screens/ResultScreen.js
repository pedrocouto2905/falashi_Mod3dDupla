import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useDeckStore from '../store/useDeckStore';
import { insertScore } from '../services/database';

export default function ResultScreen({ route, navigation }) {
  const { score, total, deckId } = route.params;
  const percent = Math.round((score / total) * 100);
  const awardCoins = useDeckStore((state) => state.awardCoins);
  const coins = useDeckStore((state) => state.coins);
  const getDeckById = useDeckStore((state) => state.getDeckById);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    const deck = getDeckById(deckId);
    insertScore(deck?.title ?? 'Deck', score, total);
    awardCoins(score).then((amount) => setEarned(amount ?? 0));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado</Text>

      <View style={styles.scoreBox}>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreTotal}>de {total}</Text>
      </View>

      <Text style={styles.percent}>{percent}% de acerto</Text>

      {earned > 0 && (
        <View style={styles.coinsEarned}>
          <Text style={styles.coinsEarnedText}>+{earned} 🪙 ganhos!</Text>
          <Text style={styles.coinsTotal}>Total: {coins} moedas</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SoloMode', { deckId })}>
        <Text style={styles.buttonText}>Jogar de novo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Main', { screen: 'Ranking' })}>
        <Text style={styles.buttonText}>🏆 Ver Ranking</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => navigation.navigate('Main')}>
        <Text style={styles.buttonText}>Voltar para Decks</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20, paddingTop: 100, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 40 },
  scoreBox: { alignItems: 'center', marginBottom: 12 },
  scoreValue: { fontSize: 64, fontWeight: 'bold', color: '#7c5cff' },
  scoreTotal: { fontSize: 18, color: '#9a9ab0' },
  percent: { fontSize: 16, color: '#cfcfdf', marginBottom: 24 },
  coinsEarned: { backgroundColor: '#1c1c2e', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center', marginBottom: 36 },
  coinsEarnedText: { fontSize: 22, fontWeight: 'bold', color: '#f5c518' },
  coinsTotal: { fontSize: 13, color: '#9a9ab0', marginTop: 4 },
  button: { backgroundColor: '#7c5cff', paddingVertical: 16, borderRadius: 14, alignItems: 'center', width: '100%', marginBottom: 12 },
  secondaryButton: { backgroundColor: '#3a3a4a' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
