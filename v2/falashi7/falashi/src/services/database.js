import * as SQLite from 'expo-sqlite';

let db = null;

export async function initDatabase() {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('falashi.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY NOT NULL,
      deck_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wallet (
      id INTEGER PRIMARY KEY NOT NULL,
      coins INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO wallet (id, coins) VALUES (1, 0);

    CREATE TABLE IF NOT EXISTS ranking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deck_title TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      played_at INTEGER NOT NULL
    );
  `);

  return db;
}

function getDb() {
  if (!db) throw new Error('Banco não inicializado. Chame initDatabase() antes.');
  return db;
}

// ---------- DECKS ----------

export async function fetchAllDecks() {
  const database = getDb();
  const decks = await database.getAllAsync('SELECT * FROM decks ORDER BY created_at ASC');
  const cards = await database.getAllAsync('SELECT * FROM cards ORDER BY created_at ASC');
  return decks.map((deck) => ({
    id: deck.id,
    title: deck.title,
    cards: cards
      .filter((c) => c.deck_id === deck.id)
      .map((c) => ({ id: c.id, question: c.question, answer: c.answer })),
  }));
}

export async function insertDeck(id, title) {
  const database = getDb();
  await database.runAsync(
    'INSERT INTO decks (id, title, created_at) VALUES (?, ?, ?)',
    id, title, Date.now()
  );
}

export async function deleteDeck(id) {
  const database = getDb();
  await database.runAsync('DELETE FROM cards WHERE deck_id = ?', id);
  await database.runAsync('DELETE FROM decks WHERE id = ?', id);
}

// ---------- CARDS ----------

export async function insertCard(id, deckId, question, answer) {
  const database = getDb();
  await database.runAsync(
    'INSERT INTO cards (id, deck_id, question, answer, created_at) VALUES (?, ?, ?, ?, ?)',
    id, deckId, question, answer, Date.now()
  );
}

export async function deleteCard(id) {
  const database = getDb();
  await database.runAsync('DELETE FROM cards WHERE id = ?', id);
}

// ---------- WALLET ----------

export async function fetchCoins() {
  const database = getDb();
  const row = await database.getFirstAsync('SELECT coins FROM wallet WHERE id = 1');
  return row?.coins ?? 0;
}

export async function addCoins(amount) {
  const database = getDb();
  await database.runAsync('UPDATE wallet SET coins = coins + ? WHERE id = 1', amount);
  const row = await database.getFirstAsync('SELECT coins FROM wallet WHERE id = 1');
  return row?.coins ?? 0;
}

// ---------- RANKING ----------

export async function initRankingTable() {
  const database = getDb();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ranking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deck_title TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      played_at INTEGER NOT NULL
    );
  `);
}

export async function insertScore(deckTitle, score, total) {
  const database = getDb();
  await database.runAsync(
    'INSERT INTO ranking (deck_title, score, total, played_at) VALUES (?, ?, ?, ?)',
    deckTitle, score, total, Date.now()
  );
}

export async function fetchTopScores() {
  const database = getDb();
  return await database.getAllAsync(
    'SELECT * FROM ranking ORDER BY score DESC, played_at DESC LIMIT 10'
  );
}
