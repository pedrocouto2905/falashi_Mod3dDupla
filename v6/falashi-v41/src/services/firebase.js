import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCgD28E5WdA3v_7UnNqjxWTTXc6wj7pLws',
  authDomain: 'falashi-77ed8.firebaseapp.com',
  projectId: 'falashi-77ed8',
  storageBucket: 'falashi-77ed8.firebasestorage.app',
  messagingSenderId: '300998586552',
  appId: '1:300998586552:web:a8ff64b693bd1450f7c44d',
};

// Evita reinicializar o app (acontece com Fast Refresh do Expo Go)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// NOTA: este projeto não usa "firebase/auth". O pacote de Auth do Firebase
// JS SDK não tem suporte estável em Expo Go (quebra com "Component auth has
// not been registered yet"). Em vez disso, o login é feito de forma simples
// via Firestore + sessão local — ver src/services/authService.js
