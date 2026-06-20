// Catálogo simples de cosméticos. Para adicionar um novo, basta incluir um
// objeto aqui — a loja e as telas lêem dessa lista automaticamente.
//
// type: 'avatar' -> aparece no Perfil/Home, troca o emoji do jogador
// type: 'deck'   -> aparece no Modo Solo/Multiplayer, troca o visual da carta

export const COSMETICS = [
  // ---------- AVATARES ----------
  { id: 'avatar_default', type: 'avatar', emoji: '🙂', name: 'Padrão', price: 0 },
  { id: 'avatar_fox', type: 'avatar', emoji: '🦊', name: 'Raposa', price: 50 },
  { id: 'avatar_cat', type: 'avatar', emoji: '🐱', name: 'Gato', price: 50 },
  { id: 'avatar_dragon', type: 'avatar', emoji: '🐲', name: 'Dragão', price: 150 },
  { id: 'avatar_robot', type: 'avatar', emoji: '🤖', name: 'Robô', price: 150 },
  { id: 'avatar_crown', type: 'avatar', emoji: '👑', name: 'Coroa', price: 300 },
  { id: 'avatar_alien', type: 'avatar', emoji: '👽', name: 'Alien', price: 300 },

  // ---------- BARALHOS (skin visual da carta no jogo) ----------
  {
    id: 'deck_default',
    type: 'deck',
    name: 'Clássico',
    price: 0,
    cardColor: '#1c1c2e',
    borderColor: '#2a2a3e',
    accentColor: '#7c5cff',
  },
  {
    id: 'deck_fire',
    type: 'deck',
    name: 'Fogo',
    price: 80,
    cardColor: '#2e1410',
    borderColor: '#ff6b35',
    accentColor: '#ff6b35',
  },
  {
    id: 'deck_ocean',
    type: 'deck',
    name: 'Oceano',
    price: 80,
    cardColor: '#0d1f2e',
    borderColor: '#2ea3ff',
    accentColor: '#2ea3ff',
  },
  {
    id: 'deck_forest',
    type: 'deck',
    name: 'Floresta',
    price: 120,
    cardColor: '#11220f',
    borderColor: '#4caf50',
    accentColor: '#4caf50',
  },
  {
    id: 'deck_gold',
    type: 'deck',
    name: 'Dourado',
    price: 250,
    cardColor: '#2a1f00',
    borderColor: '#f5c518',
    accentColor: '#f5c518',
  },
  {
    id: 'deck_neon',
    type: 'deck',
    name: 'Neon',
    price: 250,
    cardColor: '#1a0f2e',
    borderColor: '#ff00d4',
    accentColor: '#ff00d4',
  },
];

export function getCosmeticById(id) {
  return COSMETICS.find((c) => c.id === id) ?? COSMETICS[0];
}

export function getCosmeticsByType(type) {
  return COSMETICS.filter((c) => c.type === type);
}

// Converte row do banco para o formato de cosmético
export function dbRowToCosmetic(row) {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    price: row.price,
    emoji: row.emoji,
    cardColor: row.card_color,
    borderColor: row.border_color,
    accentColor: row.accent_color,
  };
}

// Retorna catálogo mesclado: hardcoded + itens do banco (banco sobrescreve se id repetido)
export function mergeCatalogs(dbItems) {
  const merged = [...COSMETICS];
  for (const row of dbItems) {
    const item = dbRowToCosmetic(row);
    const idx = merged.findIndex((c) => c.id === item.id);
    if (idx >= 0) merged[idx] = item;
    else merged.push(item);
  }
  return merged;
}
