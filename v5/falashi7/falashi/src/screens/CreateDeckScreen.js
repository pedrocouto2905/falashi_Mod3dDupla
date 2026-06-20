import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import useDeckStore from '../store/useDeckStore';

export default function CreateDeckScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const addDeck = useDeckStore((state) => state.addDeck);

  const handleCreate = async () => {
    if (title.trim().length === 0) {
      Alert.alert('Atenção', 'Dê um nome para o seu deck.');
      return;
    }
    try {
      const deckId = await addDeck(title.trim());
      navigation.replace('DeckDetail', { deckId });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível criar o deck.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Deck</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Biologia - Sistema Circulatório"
        placeholderTextColor="#6a6a80"
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Criar Deck</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    padding: 20,
    paddingTop: 40,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1c1c2e',
    borderRadius: 12,
    padding: 14,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#7c5cff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
