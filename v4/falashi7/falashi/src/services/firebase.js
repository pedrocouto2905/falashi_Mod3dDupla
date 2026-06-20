/**
 * firebase.js
 *
 * Inicialização do Firebase (Web SDK modular - funciona em Expo Go,
 * sem build nativo, sem custo no plano gratuito Spark).
 *
 * Observação: getAnalytics() não é usado aqui de propósito — o módulo de
 * Analytics do Firebase depende de APIs de navegador (window, document)
 * que não existem no React Native, e causaria erro ao importar.
 * Não precisamos de Analytics para o multiplayer funcionar.
 *
 * Lembrete: não habilite o plano Blaze (faturamento) neste projeto.
 * O Firestore no plano Spark é gratuito e mais que suficiente para o app.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCgD28E5WdA3v_7UnNqjxWTTXc6wj7pLws',
  authDomain: 'falashi-77ed8.firebaseapp.com',
  projectId: 'falashi-77ed8',
  storageBucket: 'falashi-77ed8.firebasestorage.app',
  messagingSenderId: '300998586552',
  appId: '1:300998586552:web:a8ff64b693bd1450f7c44d',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
