import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import useDeckStore from '../store/useDeckStore';
import { insertScore } from '../services/database';
import FadeInView from '../components/FadeInView';

export default function ResultScreen({ route, navigation }) {
  const { score, total, deckId } = route.params;
  const percent = Math.round((score / total) * 100);
  const awardCoins = useDeckStore((state) => state.awardCoins);
  const coins = useDeckStore((state) => state.coins);
  const getDeckById = useDeckStore((state) => state.getDeckById);
  const [earned, setEarned] = useState(0);

  const scoreScale = useRef(new Animated.Value(0.4)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const deck = getDeckById(deckId);
    insertScore(deck?.title ?? 'Deck', score, total);
    awardCoins(score).then((amount) => setEarned(amount ?? 0));

    Animated.parallel([
      Animated.spring(scoreScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scoreOpacity, {
        toValue: 1,
        duration: 300,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <FadeInView>
        <Text style={styles.title}>Resultado</Text>
      </FadeInView>

      <Animated.View
        style={[
          styles.scoreBox,
          { opacity: scoreOpacity, transform: [{ scale: scoreScale }] },
        ]}
      >
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreTotal}>de {total}</Text>
      </Animated.View>

      <FadeInView delay={250}>
        <Text style={styles.percent}>{percent}% de acerto</Text>
      </FadeInView>

      {earned > 0 && (
        <FadeInView delay={350}>
          <View style={styles.coinsEarned}>
            <Text style={styles.coinsEarnedText}>+{earned} 🪙 ganhos!</Text>
            <Text style={styles.coinsTotal}>Total: {coins} moedas</Text>
          </View>
        </FadeInView>
      )}

      <FadeInView delay={450} style={{ width: '100%', alignItems: 'center' }}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SoloMode', { deckId })}>
          <Text style={styles.buttonText}>Jogar de novo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Main', { screen: 'Ranking' })}>
          <Text style={styles.buttonText}>🏆 Ver Ranking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => navigation.navigate('Main')}>
          <Text style={styles.buttonText}>Voltar para Decks</Text>
        </TouchableOpacity>
      </FadeInView>
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
