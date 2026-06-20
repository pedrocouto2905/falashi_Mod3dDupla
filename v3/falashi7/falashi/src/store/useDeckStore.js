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
} from '../services/database';

const useDeckStore = create((set, get) => ({
  decks: [],
  isLoading: true,
  coins: 0,

  loadDecks: async () => {
    try {
      await initDatabase();
      const decks = await fetchAllDecks();
      const coins = await fetchCoins();
      set({ decks, coins, isLoading: false });
    } catch (err) {
      console.error('[useDeckStore] Erro ao carregar:', err);
      set({ isLoading: false });
    }
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
