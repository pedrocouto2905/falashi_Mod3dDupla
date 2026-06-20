import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import useDeckStore from './src/store/useDeckStore';

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
          backgroundColor: '#1c1c2e',
          borderTopColor: '#2a2a3e',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#7c5cff',
        tabBarInactiveTintColor: '#9a9ab0',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Decks"
        component={DecksScreen}
        options={{
          tabBarLabel: 'Decks',
          tabBarIcon: () => <Text style={{ fontSize: 22, lineHeight: 26 }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Battle"
        component={BattleScreen}
        options={{
          tabBarLabel: 'Batalha',
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: focused ? '#7c5cff' : '#2a2a3e',
              borderRadius: 28, width: 44, height: 44,
              justifyContent: 'center', alignItems: 'center',
              marginTop: -10,
            }}>
              <Text style={{ fontSize: 22, lineHeight: 26 }}>⚔️</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Ranking"
        component={RankingScreen}
        options={{
          tabBarLabel: 'Ranking',
          tabBarIcon: () => <Text style={{ fontSize: 22, lineHeight: 26 }}>🏆</Text>,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarLabel: 'Loja',
          tabBarIcon: () => <Text style={{ fontSize: 22, lineHeight: 26 }}>🛍️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const loadDecks = useDeckStore((state) => state.loadDecks);
  useEffect(() => { loadDecks(); }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={stackOptions}>
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="CreateDeck" component={CreateDeckScreen} options={{ title: 'Novo Deck' }} />
        <Stack.Screen name="DeckDetail" component={DeckDetailScreen} options={{ title: 'Deck' }} />
        <Stack.Screen name="SoloMode" component={SoloModeScreen} options={{ title: 'Modo Solo' }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Resultado', headerBackVisible: false }} />
        <Stack.Screen name="MultiplayerLobby" component={MultiplayerLobbyScreen} options={{ title: 'Multiplayer' }} />
        <Stack.Screen name="MultiplayerGame" component={MultiplayerGameScreen} options={{ title: 'Partida', headerBackVisible: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
