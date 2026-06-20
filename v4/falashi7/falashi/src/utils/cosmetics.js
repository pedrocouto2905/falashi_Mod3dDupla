// Catálogo simples de cosméticos. Para adicionar um novo, basta incluir um
// objeto aqui — a loja e a Home lêem dessa lista automaticamente.
export const COSMETICS = [
  { id: 'avatar_default', emoji: '🙂', name: 'Padrão', price: 0 },
  { id: 'avatar_fox', emoji: '🦊', name: 'Raposa', price: 50 },
  { id: 'avatar_cat', emoji: '🐱', name: 'Gato', price: 50 },
  { id: 'avatar_dragon', emoji: '🐲', name: 'Dragão', price: 150 },
  { id: 'avatar_robot', emoji: '🤖', name: 'Robô', price: 150 },
  { id: 'avatar_crown', emoji: '👑', name: 'Coroa', price: 300 },
  { id: 'avatar_alien', emoji: '👽', name: 'Alien', price: 300 },
];

export function getCosmeticById(id) {
  return COSMETICS.find((c) => c.id === id) ?? COSMETICS[0];
}
