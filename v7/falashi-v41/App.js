import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import { getCurrentSession, signOut } from './src/services/authService';
import { initDatabase } from './src/services/database';
import useDeckStore from './src/store/useDeckStore';

import AuthScreen from './src/screens/AuthScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BattleScreen from './src/screens/BattleScreen';
import DecksScreen from './src/screens/DecksScreen';
import RankingScreen from './src/screens/RankingScreen';
import CreateDeckScreen from './src/screens/CreateDeckScreen';
import DeckDetailScreen from './src/screens/DeckDetailScreen';
import SoloModeScreen from './src/screens/SoloModeScreen';
import ResultScreen from './src/screens/ResultScreen';
import MultiplayerLobbyScreen from './src/screens/MultiplayerLobbyScreen';
import MultiplayerGameScreen from './src/screens/MultiplayerGameScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminShopScreen from './src/screens/AdminShopScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackOptions = {
  headerStyle: { backgroundColor: '#0f0f1a' },
  headerTintColor: '#ffffff',
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#0f0f1a' },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Battle"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1c1c2e', borderTopColor: '#2a2a3e',
          borderTopWidth: 1, height: 64, paddingBottom: 8, paddingTop: 4,
        },
        tabBarActiveTintColor: '#7c5cff',
        tabBarInactiveTintColor: '#9a9ab0',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Decks" component={DecksScreen}
        options={{ tabBarLabel: 'Decks', tabBarIcon: () => <Text style={{ fontSize: 22, lineHeight: 26 }}>📚</Text> }} />
      <Tab.Screen name="Ranking" component={RankingScreen}
        options={{ tabBarLabel: 'Ranking', tabBarIcon: () => <Text style={{ fontSize: 22, lineHeight: 26 }}>🏆</Text> }} />
      <Tab.Screen name="Battle" component={BattleScreen}
        options={{
          tabBarLabel: 'Batalha',
          tabBarIcon: ({ focused }) => (
            <View style={{ backgroundColor: focused ? '#7c5cff' : '#2a2a3e', borderRadius: 28, width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginTop: -10 }}>
              <Text style={{ fontSize: 22, lineHeight: 26 }}>⚔️</Text>
            </View>
          ),
        }} />
      <Tab.Screen name="Shop" component={ShopScreen}
        options={{ tabBarLabel: 'Loja', tabBarIcon: () => <Text style={{ fontSize: 22, lineHeight: 26 }}>🛍️</Text> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: () => <Text style={{ fontSize: 22, lineHeight: 26 }}>👤</Text> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const loadDecks = useDeckStore((state) => state.loadDecks);
  const sessionUser = useDeckStore((state) => state.sessionUser);
  const setSessionUser = useDeckStore((state) => state.setSessionUser);
  const user = sessionUser;

  useEffect(() => {
    (async () => {
      try {
        // Garante que o banco local (SQLite) está pronto antes de ler a sessão,
        // já que getCurrentSession() depende dele estar inicializado.
        await initDatabase();
        const session = await getCurrentSession();
        setSessionUser(session);
        if (session) loadDecks();
      } catch (err) {
        console.error('[App] Erro ao iniciar:', err);
        setSessionUser(null); // em caso de erro, manda para a tela de login em vez de travar
      }
    })();
  }, []);

  const handleLoggedIn = (email) => {
    setSessionUser(email);
    loadDecks();
  };

  // Tela de carregamento enquanto verifica sessão
  if (user === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7c5cff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {!user ? (
        // Não logado — mostra login e cadastro
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {({ navigation }) => <AuthScreen navigation={navigation} onLoggedIn={handleLoggedIn} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {({ navigation }) => <RegisterScreen navigation={navigation} onLoggedIn={handleLoggedIn} />}
          </Stack.Screen>
        </Stack.Navigator>
      ) : (
        // Logado — mostra o app completo
        <Stack.Navigator screenOptions={stackOptions}>
          <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="CreateDeck" component={CreateDeckScreen} options={{ title: 'Novo Deck' }} />
          <Stack.Screen name="DeckDetail" component={DeckDetailScreen} options={{ title: 'Deck' }} />
          <Stack.Screen name="SoloMode" component={SoloModeScreen} options={{ title: 'Modo Solo' }} />
          <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Resultado', headerBackVisible: false }} />
          <Stack.Screen name="MultiplayerLobby" component={MultiplayerLobbyScreen} options={{ title: 'Multiplayer' }} />
          <Stack.Screen name="MultiplayerGame" component={MultiplayerGameScreen} options={{ title: 'Partida', headerBackVisible: false }} />
          <Stack.Screen name="AdminShop" component={AdminShopScreen} options={{ title: 'Admin — Loja' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
