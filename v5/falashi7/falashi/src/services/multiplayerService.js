/**
 * multiplayerService.js
 *
 * Lógica mínima de multiplayer via Firestore.
 * Estrutura: um único documento por sala em rooms/{code}, sem subcoleções.
 *
 * Documento da sala:
 * {
 *   code: "1234",
 *   deckTitle: "Capitais do Mundo",
 *   currentIndex: 0,
 *   host: { name, score },
 *   guest: { name, score } | null,
 *   status: "waiting" | "playing" | "finished",
 *   lastAnswer: { player: "host"|"guest", correct: bool } | null,
 * }
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

function generateRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function createRoom(hostName) {
  const code = generateRoomCode();
  const roomRef = doc(db, 'rooms', code);

  await setDoc(roomRef, {
    code,
    currentIndex: 0,
    host: { name: hostName, score: 0 },
    guest: null,
    status: 'waiting',
    lastAnswer: null,
  });

  return code;
}

export async function joinRoom(code, guestName) {
  const roomRef = doc(db, 'rooms', code);
  const snap = await getDoc(roomRef);

  if (!snap.exists()) {
    throw new Error('Sala não encontrada. Verifique o código.');
  }

  const data = snap.data();
  if (data.guest) {
    throw new Error('Essa sala já está cheia.');
  }

  await updateDoc(roomRef, {
    guest: { name: guestName, score: 0 },
    status: 'playing',
  });

  return data;
}

export function listenToRoom(code, callback) {
  const roomRef = doc(db, 'rooms', code);
  return onSnapshot(roomRef, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

export async function submitAnswer(code, playerKey, correct, currentScore) {
  const roomRef = doc(db, 'rooms', code);
  const newScore = correct ? currentScore + 1 : currentScore;

  await updateDoc(roomRef, {
    [`${playerKey}.score`]: newScore,
    lastAnswer: { player: playerKey, correct },
  });

  return newScore;
}

export async function advanceQuestion(code, nextIndex) {
  const roomRef = doc(db, 'rooms', code);
  await updateDoc(roomRef, {
    currentIndex: nextIndex,
    lastAnswer: null,
  });
}

export async function finishRoom(code) {
  const roomRef = doc(db, 'rooms', code);
  await updateDoc(roomRef, { status: 'finished' });
}
