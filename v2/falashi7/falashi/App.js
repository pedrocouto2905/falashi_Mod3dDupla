import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import CreateDeckScreen from './src/screens/CreateDeckScreen';
import DeckDetailScreen from './src/screens/DeckDetailScreen';
import SoloModeScreen from './src/screens/SoloModeScreen';
import ResultScreen from './src/screens/ResultScreen';
import RankingScreen from './src/screens/RankingScreen';
import MultiplayerLobbyScreen from './src/screens/MultiplayerLobbyScreen';
import MultiplayerGameScreen from './src/screens/MultiplayerGameScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#0f0f1a' },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#0f0f1a' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateDeck" component={CreateDeckScreen} options={{ title: 'Novo Deck' }} />
        <Stack.Screen name="DeckDetail" component={DeckDetailScreen} options={{ title: 'Deck' }} />
        <Stack.Screen name="SoloMode" component={SoloModeScreen} options={{ title: 'Modo Solo' }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Resultado', headerBackVisible: false }} />
        <Stack.Screen name="Ranking" component={RankingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MultiplayerLobby" component={MultiplayerLobbyScreen} options={{ title: 'Multiplayer' }} />
        <Stack.Screen name="MultiplayerGame" component={MultiplayerGameScreen} options={{ title: 'Partida', headerBackVisible: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
