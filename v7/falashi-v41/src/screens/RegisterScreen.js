import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { signUp } from '../services/authService';
import { savePlayerName } from '../services/database';

export default function RegisterScreen({ navigation, onLoggedIn }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha nome, email e senha.');
      return;
    }
    setLoading(true);
    try {
      const loggedEmail = await signUp(email.trim(), password);
      await savePlayerName(name.trim(), loggedEmail);
      onLoggedIn(loggedEmail);
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Este email já está cadastrado.',
        'auth/weak-password': 'Senha muito fraca. Use ao menos 6 caracteres.',
      };
      Alert.alert('Erro', msgs[err.code] ?? 'Não foi possível completar o cadastro.');
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
        <Text style={styles.cardTitle}>Criar conta</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#6a6a80"
          value={name}
          onChangeText={setName}
        />
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
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor="#6a6a80"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Cadastrar</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchButton}>
          <Text style={styles.switchText}>
            Já tem conta? <Text style={styles.switchLink}>Entrar</Text>
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
