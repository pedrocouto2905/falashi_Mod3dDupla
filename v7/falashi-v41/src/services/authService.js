// authService.js — login local simples (sem Firestore, sem internet)
// Salva usuário no SQLite local. Suficiente para projeto acadêmico.

import {
  fetchSessionEmail,
  saveSessionEmail,
  clearSessionEmail,
  fetchLocalUser,
  saveLocalUser,
} from './database';

function simpleHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export async function signUp(email, password) {
  const normalized = email.trim().toLowerCase();
  if (password.length < 6) throw { code: 'auth/weak-password' };

  const existing = await fetchLocalUser(normalized);
  if (existing) throw { code: 'auth/email-already-in-use' };

  await saveLocalUser(normalized, simpleHash(password));
  await saveSessionEmail(normalized);
  return normalized;
}

export async function signIn(email, password) {
  const normalized = email.trim().toLowerCase();
  const user = await fetchLocalUser(normalized);

  if (!user) throw { code: 'auth/user-not-found' };
  if (user.passwordHash !== simpleHash(password)) throw { code: 'auth/wrong-password' };

  await saveSessionEmail(normalized);
  return normalized;
}

export async function signOut() {
  await clearSessionEmail();
}

export async function getCurrentSession() {
  return await fetchSessionEmail();
}
