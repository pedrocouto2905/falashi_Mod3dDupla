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

    CREATE TABLE IF NOT EXISTS local_users (
      email TEXT PRIMARY KEY NOT NULL,
      passwordHash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY NOT NULL,
      email TEXT
    );

    INSERT OR IGNORE INTO session (id, email) VALUES (1, NULL);

    CREATE TABLE IF NOT EXISTS ranking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deck_title TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      played_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY NOT NULL,
      player_name TEXT NOT NULL DEFAULT 'Jogador'
    );

    INSERT OR IGNORE INTO profile (id, player_name) VALUES (1, 'Jogador');

    CREATE TABLE IF NOT EXISTS profile_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      target_count INTEGER NOT NULL DEFAULT 0,
      progress_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shop_items (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL DEFAULT 0,
      emoji TEXT,
      card_color TEXT,
      border_color TEXT,
      accent_color TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  // Migração leve: adiciona a coluna user_email se ainda não existir
  // (necessária para a sessão de login local, ver authService.js)
  try {
    const profileInfo = await db.getAllAsync('PRAGMA table_info(profile)');
    const hasEmailColumn = profileInfo.some((col) => col.name === 'user_email');
    if (!hasEmailColumn) {
      await db.execAsync('ALTER TABLE profile ADD COLUMN user_email TEXT;');
    }
  } catch (err) {
    console.warn('[database] Migração de user_email ignorada:', err.message);
  }

  // Migração leve: adiciona as colunas de meta (target/progresso) se o banco
  // já existia de uma versão anterior, antes de as metas terem esses campos.
  try {
    const profileInfoCols = await db.getAllAsync('PRAGMA table_info(profile_info)');
    const hasTarget = profileInfoCols.some((col) => col.name === 'target_count');
    if (!hasTarget) {
      await db.execAsync('ALTER TABLE profile_info ADD COLUMN target_count INTEGER NOT NULL DEFAULT 0;');
    }
    const hasProgress = profileInfoCols.some((col) => col.name === 'progress_count');
    if (!hasProgress) {
      await db.execAsync('ALTER TABLE profile_info ADD COLUMN progress_count INTEGER NOT NULL DEFAULT 0;');
    }
  } catch (err) {
    console.warn('[database] Migração de metas ignorada:', err.message);
  }

  // wallet, owned_cosmetics e equipped passam a ter dono (user_email), porque antes
  // eram tabelas únicas e compartilhadas por todo mundo que usasse o app no aparelho —
  // por isso contas diferentes apareciam com o mesmo nome/moedas/cosméticos.
  // Como isso muda a chave primária dessas tabelas, recriamos do zero quando necessário
  // (perde dados antigos de teste, mas é o que corrige o problema).
  try {
    const decksInfo = await db.getAllAsync('PRAGMA table_info(decks)');
    const decksHasOwner = decksInfo.some((col) => col.name === 'user_email');
    if (!decksHasOwner) {
      await db.execAsync('ALTER TABLE decks ADD COLUMN user_email TEXT;');
    }

    const walletInfo = await db.getAllAsync('PRAGMA table_info(wallet)');
    const walletHasOwner = walletInfo.some((col) => col.name === 'user_email');
    if (!walletHasOwner) {
      await db.execAsync('DROP TABLE IF EXISTS wallet;');
      await db.execAsync(`
        CREATE TABLE wallet (
          user_email TEXT PRIMARY KEY NOT NULL,
          coins INTEGER NOT NULL DEFAULT 0
        );
      `);
    }

    const cosmeticsInfo = await db.getAllAsync('PRAGMA table_info(owned_cosmetics)');
    const cosmeticsHasOwner = cosmeticsInfo.some((col) => col.name === 'user_email');
    if (!cosmeticsHasOwner) {
      await db.execAsync('DROP TABLE IF EXISTS owned_cosmetics;');
      await db.execAsync(`
        CREATE TABLE owned_cosmetics (
          user_email TEXT NOT NULL,
          cosmetic_id TEXT NOT NULL,
          bought_at INTEGER NOT NULL,
          PRIMARY KEY (user_email, cosmetic_id)
        );
      `);
    }

    const equippedInfo = await db.getAllAsync('PRAGMA table_info(equipped)');
    const equippedHasOwner = equippedInfo.some((col) => col.name === 'user_email');
    if (!equippedHasOwner) {
      await db.execAsync('DROP TABLE IF EXISTS equipped;');
      await db.execAsync(`
        CREATE TABLE equipped (
          user_email TEXT NOT NULL,
          cosmetic_type TEXT NOT NULL,
          cosmetic_id TEXT NOT NULL,
          PRIMARY KEY (user_email, cosmetic_type)
        );
      `);
    }
  } catch (err) {
    console.warn('[database] Erro ao migrar tabelas por usuário:', err.message);
  }

  return db;
}

function getDb() {
  if (!db) throw new Error('Banco não inicializado. Chame initDatabase() antes.');
  return db;
}

// ---------- COSMÉTICOS (por usuário) ----------

export async function fetchOwnedCosmetics(email) {
  const database = getDb();
  const rows = await database.getAllAsync(
    'SELECT cosmetic_id FROM owned_cosmetics WHERE user_email = ?', email
  );
  return rows.map((r) => r.cosmetic_id);
}

export async function buyCosmetic(cosmeticId, email) {
  const database = getDb();
  await database.runAsync(
    'INSERT OR IGNORE INTO owned_cosmetics (user_email, cosmetic_id, bought_at) VALUES (?, ?, ?)',
    email, cosmeticId, Date.now()
  );
}

export async function fetchEquipped(email) {
  const database = getDb();
  const rows = await database.getAllAsync(
    'SELECT cosmetic_type, cosmetic_id FROM equipped WHERE user_email = ?', email
  );
  const result = { avatar: 'avatar_default', deck: 'deck_default' };
  rows.forEach((r) => { result[r.cosmetic_type] = r.cosmetic_id; });
  return result;
}

export async function equipCosmetic(cosmeticType, cosmeticId, email) {
  const database = getDb();
  await database.runAsync(
    `INSERT INTO equipped (user_email, cosmetic_type, cosmetic_id) VALUES (?, ?, ?)
     ON CONFLICT(user_email, cosmetic_type) DO UPDATE SET cosmetic_id = ?`,
    email, cosmeticType, cosmeticId, cosmeticId
  );
}

// ---------- PERFIL (por usuário) ----------

export async function fetchPlayerName(email) {
  const database = getDb();
  const row = await database.getFirstAsync(
    'SELECT player_name FROM profile WHERE user_email = ?', email
  );
  return row?.player_name ?? 'Jogador';
}

export async function savePlayerName(name, email) {
  const database = getDb();
  const existing = await database.getFirstAsync(
    'SELECT id FROM profile WHERE user_email = ?', email
  );
  if (existing) {
    await database.runAsync(
      'UPDATE profile SET player_name = ? WHERE user_email = ?', name, email
    );
  } else {
    await database.runAsync(
      'INSERT INTO profile (user_email, player_name) VALUES (?, ?)', email, name
    );
  }
}

// ---------- METAS DO PERFIL (CRUD completo, por usuário) ----------

// CREATE
export async function addProfileInfo(email, label, value, target = 0) {
  const database = getDb();
  const result = await database.runAsync(
    'INSERT INTO profile_info (user_email, label, value, target_count, progress_count, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    email, label, value, target, 0, Date.now()
  );
  return result.lastInsertRowId;
}

// READ
export async function fetchProfileInfo(email) {
  const database = getDb();
  return await database.getAllAsync(
    'SELECT * FROM profile_info WHERE user_email = ? ORDER BY created_at ASC', email
  );
}

// UPDATE
export async function updateProfileInfo(id, label, value, target = 0) {
  const database = getDb();
  await database.runAsync(
    'UPDATE profile_info SET label = ?, value = ?, target_count = ? WHERE id = ?', label, value, target, id
  );
}

// UPDATE (apenas o progresso, usado pelo botão +1 / reset)
export async function updateProfileInfoProgress(id, progress) {
  const database = getDb();
  await database.runAsync(
    'UPDATE profile_info SET progress_count = ? WHERE id = ?', progress, id
  );
}

// DELETE
export async function deleteProfileInfo(id) {
  const database = getDb();
  await database.runAsync('DELETE FROM profile_info WHERE id = ?', id);
}

// ---------- DECKS (por usuário) ----------

export async function fetchAllDecks(email) {
  const database = getDb();
  const decks = await database.getAllAsync(
    'SELECT * FROM decks WHERE user_email = ? ORDER BY created_at ASC', email
  );
  const cards = await database.getAllAsync('SELECT * FROM cards ORDER BY created_at ASC');
  return decks.map((deck) => ({
    id: deck.id,
    title: deck.title,
    cards: cards
      .filter((c) => c.deck_id === deck.id)
      .map((c) => ({ id: c.id, question: c.question, answer: c.answer })),
  }));
}

export async function insertDeck(id, title, email) {
  const database = getDb();
  await database.runAsync(
    'INSERT INTO decks (id, title, created_at, user_email) VALUES (?, ?, ?, ?)',
    id, title, Date.now(), email
  );
}

export async function updateDeck(id, title) {
  const database = getDb();
  await database.runAsync('UPDATE decks SET title = ? WHERE id = ?', title, id);
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

export async function updateCard(id, question, answer) {
  const database = getDb();
  await database.runAsync(
    'UPDATE cards SET question = ?, answer = ? WHERE id = ?',
    question, answer, id
  );
}

export async function deleteCard(id) {
  const database = getDb();
  await database.runAsync('DELETE FROM cards WHERE id = ?', id);
}

// ---------- WALLET (por usuário) ----------

export async function fetchCoins(email) {
  const database = getDb();
  const row = await database.getFirstAsync('SELECT coins FROM wallet WHERE user_email = ?', email);
  if (row) return row.coins;
  await database.runAsync('INSERT OR IGNORE INTO wallet (user_email, coins) VALUES (?, 0)', email);
  return 0;
}

export async function addCoins(amount, email) {
  const database = getDb();
  await database.runAsync('INSERT OR IGNORE INTO wallet (user_email, coins) VALUES (?, 0)', email);
  await database.runAsync('UPDATE wallet SET coins = coins + ? WHERE user_email = ?', amount, email);
  const row = await database.getFirstAsync('SELECT coins FROM wallet WHERE user_email = ?', email);
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

export async function updateScore(id, score, total) {
  const database = getDb();
  await database.runAsync(
    'UPDATE ranking SET score = ?, total = ? WHERE id = ?',
    score, total, id
  );
}

export async function deleteScore(id) {
  const database = getDb();
  await database.runAsync('DELETE FROM ranking WHERE id = ?', id);
}

// ---------- USERS (auth local) ----------

export async function initUsersTable() {
  const database = getDb();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS local_users (
      email TEXT PRIMARY KEY NOT NULL,
      passwordHash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY NOT NULL,
      email TEXT
    );
    INSERT OR IGNORE INTO session (id, email) VALUES (1, NULL);
  `);
}

export async function fetchLocalUser(email) {
  const database = getDb();
  return await database.getFirstAsync('SELECT * FROM local_users WHERE email = ?', email);
}

export async function saveLocalUser(email, passwordHash) {
  const database = getDb();
  await database.runAsync(
    'INSERT INTO local_users (email, passwordHash) VALUES (?, ?)',
    email, passwordHash
  );
}

export async function fetchSessionEmail() {
  try {
    const database = getDb();
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS local_users (
        email TEXT PRIMARY KEY NOT NULL,
        passwordHash TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS session (
        id INTEGER PRIMARY KEY NOT NULL,
        email TEXT
      );
      INSERT OR IGNORE INTO session (id, email) VALUES (1, NULL);
    `);
    const row = await database.getFirstAsync('SELECT email FROM session WHERE id = 1');
    return row?.email ?? null;
  } catch {
    return null;
  }
}

export async function saveSessionEmail(email) {
  const database = getDb();
  await database.runAsync('UPDATE session SET email = ? WHERE id = 1', email);
}

export async function clearSessionEmail() {
  const database = getDb();
  await database.runAsync('UPDATE session SET email = NULL WHERE id = 1');
}

// ── CRUD Loja ──────────────────────────────────────────────────────────────

export async function fetchShopItems() {
  const database = getDb();
  return await database.getAllAsync('SELECT * FROM shop_items ORDER BY created_at ASC');
}

export async function insertShopItem({ id, type, name, price, emoji, cardColor, borderColor, accentColor }) {
  const database = getDb();
  await database.runAsync(
    `INSERT INTO shop_items (id, type, name, price, emoji, card_color, border_color, accent_color, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, type, name, price, emoji ?? null, cardColor ?? null, borderColor ?? null, accentColor ?? null, Date.now()
  );
}

export async function updateShopItem({ id, name, price, emoji, cardColor, borderColor, accentColor }) {
  const database = getDb();
  await database.runAsync(
    `UPDATE shop_items SET name=?, price=?, emoji=?, card_color=?, border_color=?, accent_color=? WHERE id=?`,
    name, price, emoji ?? null, cardColor ?? null, borderColor ?? null, accentColor ?? null, id
  );
}

export async function deleteShopItem(id) {
  const database = getDb();
  await database.runAsync('DELETE FROM shop_items WHERE id = ?', id);
}
