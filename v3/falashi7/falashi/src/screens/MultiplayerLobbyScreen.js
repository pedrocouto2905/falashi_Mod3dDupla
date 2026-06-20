import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createRoom, joinRoom } from '../services/multiplayerService';

export default function MultiplayerLobbyScreen({ navigation }) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Digite seu nome primeiro.');
      return;
    }
    setLoading(true);
    try {
      const code = await createRoom(name.trim());
      navigation.navigate('MultiplayerGame', {
        code,
        playerKey: 'host',
        playerName: name.trim(),
      });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível criar a sala. Verifique sua conexão e a configuração do Firebase.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      Alert.alert('Digite seu nome primeiro.');
      return;
    }
    if (joinCode.trim().length !== 4) {
      Alert.alert('Digite o código de 4 dígitos da sala.');
      return;
    }
    setLoading(true);
    try {
      await joinRoom(joinCode.trim(), name.trim());
      navigation.navigate('MultiplayerGame', {
        code: joinCode.trim(),
        playerKey: 'guest',
        playerName: name.trim(),
      });
    } catch (err) {
      Alert.alert('Erro', err.message || 'Não foi possível entrar na sala.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Multiplayer</Text>
      <Text style={styles.subtitle}>
        Versão de teste — deck fixo "Capitais do Mundo", resposta por texto.
      </Text>

      <Text style={styles.label}>Seu nome</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Caio"
        placeholderTextColor="#6a6a80"
        value={name}
        onChangeText={setName}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#7c5cff" style={{ marginTop: 30 }} />
      ) : (
        <>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
            <Text style={styles.primaryButtonText}>Criar Sala</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <Text style={styles.dividerText}>ou</Text>
          </View>

          <Text style={styles.label}>Código da sala</Text>
          <TextInput
            style={styles.input}
            placeholder="0000"
            placeholderTextColor="#6a6a80"
            value={joinCode}
            onChangeText={setJoinCode}
            keyboardType="number-pad"
            maxLength={4}
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={handleJoin}>
            <Text style={styles.secondaryButtonText}>Entrar na Sala</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  subtitle: { color: '#9a9ab0', fontSize: 13, marginBottom: 30 },
  label: { color: '#9a9ab0', fontSize: 13, marginBottom: 8 },
  input: {
    backgroundColor: '#1c1c2e',
    borderRadius: 12,
    padding: 14,
    color: '#ffffff',
    marginBottom: 16,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#7c5cff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: {
    backgroundColor: '#1c1c2e',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  divider: { alignItems: 'center', marginVertical: 20 },
  dividerText: { color: '#6a6a80', fontSize: 13 },
});
