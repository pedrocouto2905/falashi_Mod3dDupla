import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { signIn } from '../services/authService';

export default function AuthScreen({ navigation, onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha email e senha.');
      return;
    }
    setLoading(true);
    try {
      const loggedEmail = await signIn(email.trim(), password);
      onLoggedIn(loggedEmail);
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
      };
      Alert.alert('Erro', msgs[err.code] ?? 'Não foi possível completar a ação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.logo}>⚡ FALASHI</Text>
      <Text style={styles.subtitle}>Flashcards com estilo</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Entrar</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#6a6a80"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#6a6a80"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Entrar</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.switchButton}>
          <Text style={styles.switchText}>
            Não tem conta? <Text style={styles.switchLink}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0f0f1a',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#fff', letterSpacing: 3 },
  subtitle: { color: '#9a9ab0', fontSize: 14, marginTop: 6, marginBottom: 40 },
  card: {
    width: '100%', backgroundColor: '#1c1c2e', borderRadius: 20,
    padding: 24, borderWidth: 1.5, borderColor: '#7c5cff',
  },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    backgroundColor: '#28283c', borderRadius: 12, padding: 14,
    color: '#fff', marginBottom: 14, fontSize: 15,
  },
  button: {
    backgroundColor: '#7c5cff', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', borderBottomWidth: 3, borderColor: '#4a2eb0', marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  switchButton: { marginTop: 18, alignItems: 'center' },
  switchText: { color: '#9a9ab0', fontSize: 14 },
  switchLink: { color: '#7c5cff', fontWeight: 'bold' },
});
