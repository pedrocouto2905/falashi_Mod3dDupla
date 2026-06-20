import { create } from 'zustand';
import {
  initDatabase,
  fetchAllDecks,
  insertDeck,
  deleteDeck,
  insertCard,
  deleteCard,
  fetchCoins,
  addCoins,
  fetchOwnedCosmetics,
  buyCosmetic,
  fetchEquippedCosmetic,
  equipCosmetic,
  fetchPlayerName,
  savePlayerName,
} from '../services/database';
import { getCosmeticById } from '../utils/cosmetics';

const useDeckStore = create((set, get) => ({
  decks: [],
  isLoading: true,
  coins: 0,
  ownedCosmetics: ['avatar_default'],
  equippedCosmetic: 'avatar_default',
  playerName: 'Jogador',

  loadDecks: async () => {
    try {
      await initDatabase();
      const decks = await fetchAllDecks();
      const coins = await fetchCoins();
      const ownedRaw = await fetchOwnedCosmetics();
      const equippedCosmetic = await fetchEquippedCosmetic();
      const playerName = await fetchPlayerName();
      const ownedCosmetics = ownedRaw.includes('avatar_default')
        ? ownedRaw
        : ['avatar_default', ...ownedRaw];
      set({ decks, coins, ownedCosmetics, equippedCosmetic, playerName, isLoading: false });
    } catch (err) {
      console.error('[useDeckStore] Erro ao carregar:', err);
      set({ isLoading: false });
    }
  },

  updatePlayerName: async (name) => {
    const trimmed = name.trim() || 'Jogador';
    await savePlayerName(trimmed);
    set({ playerName: trimmed });
  },

  // Compra um cosmético se houver moedas suficientes. Retorna true/false.
  purchaseCosmetic: async (cosmeticId) => {
    const { coins, ownedCosmetics } = get();
    if (ownedCosmetics.includes(cosmeticId)) return false;

    const cosmetic = getCosmeticById(cosmeticId);
    if (coins < cosmetic.price) return false;

    await buyCosmetic(cosmeticId);
    const newCoins = await addCoins(-cosmetic.price);
    set((state) => ({
      coins: newCoins,
      ownedCosmetics: [...state.ownedCosmetics, cosmeticId],
    }));
    return true;
  },

  selectEquippedCosmetic: async (cosmeticId) => {
    await equipCosmetic(cosmeticId);
    set({ equippedCosmetic: cosmeticId });
  },

  // Chamado ao fim de uma partida — +10 moedas por acerto
  awardCoins: async (correctAnswers) => {
    if (correctAnswers <= 0) return;
    const amount = correctAnswers * 10;
    const newTotal = await addCoins(amount);
    set({ coins: newTotal });
    return amount;
  },

  addDeck: async (title) => {
    const newDeck = { id: Date.now().toString(), title, cards: [] };
    await insertDeck(newDeck.id, newDeck.title);
    set((state) => ({ decks: [...state.decks, newDeck] }));
    return newDeck.id;
  },

  removeDeck: async (deckId) => {
    await deleteDeck(deckId);
    set((state) => ({ decks: state.decks.filter((d) => d.id !== deckId) }));
  },

  addCard: async (deckId, question, answer) => {
    const newCard = { id: Date.now().toString(), question, answer };
    await insertCard(newCard.id, deckId, question, answer);
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === deckId ? { ...d, cards: [...d.cards, newCard] } : d
      ),
    }));
  },

  removeCard: async (deckId, cardId) => {
    await deleteCard(cardId);
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === deckId
          ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) }
          : d
      ),
    }));
  },

  getDeckById: (deckId) => get().decks.find((d) => d.id === deckId),
}));

export default useDeckStore;
