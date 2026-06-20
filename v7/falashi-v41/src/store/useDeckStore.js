import { create } from 'zustand';
import {
  initDatabase,
  fetchAllDecks,
  insertDeck,
  updateDeck,
  deleteDeck,
  insertCard,
  updateCard,
  deleteCard,
  fetchCoins,
  addCoins,
  fetchOwnedCosmetics,
  buyCosmetic,
  fetchEquipped,
  equipCosmetic,
  fetchPlayerName,
  savePlayerName,
  fetchShopItems,
} from '../services/database';
import { COSMETICS, mergeCatalogs, getCosmeticById as getHardcodedCosmeticById } from '../utils/cosmetics';

const useDeckStore = create((set, get) => ({
  sessionUser: undefined,
  setSessionUser: (user) => set({ sessionUser: user }),
  decks: [],
  isLoading: true,
  coins: 0,
  ownedCosmetics: ['avatar_default', 'deck_default'],
  equipped: { avatar: 'avatar_default', deck: 'deck_default' },
  playerName: 'Jogador',
  catalog: COSMETICS, // catálogo mesclado (hardcoded + banco); atualizado por loadCatalog

  // Busca os itens do banco e mescla com os hardcoded. Chamada no carregamento
  // inicial e sempre que um cosmético é comprado/equipado/criado no Admin, para
  // que avatares/baralhos criados no banco apareçam corretamente em todas as
  // telas (Loja, Perfil, badge de avatar, skin do baralho no Modo Solo, etc).
  loadCatalog: async () => {
    try {
      const dbItems = await fetchShopItems();
      set({ catalog: mergeCatalogs(dbItems) });
    } catch (err) {
      console.error('[useDeckStore] Erro ao carregar catálogo:', err);
    }
  },

  // Busca um cosmético no catálogo mesclado (com fallback pro hardcoded,
  // garantindo que sempre retorna algo válido mesmo antes do catálogo carregar).
  getCatalogItem: (id) => {
    const found = get().catalog.find((c) => c.id === id);
    return found ?? getHardcodedCosmeticById(id);
  },

  loadDecks: async () => {
    try {
      await initDatabase();
      const email = get().sessionUser;
      const decks = await fetchAllDecks(email);
      const coins = await fetchCoins(email);
      const ownedRaw = await fetchOwnedCosmetics(email);
      const equipped = await fetchEquipped(email);
      const playerName = await fetchPlayerName(email);
      const defaults = ['avatar_default', 'deck_default'];
      const ownedCosmetics = [...new Set([...defaults, ...ownedRaw])];
      set({ decks, coins, ownedCosmetics, equipped, playerName, isLoading: false });
      await get().loadCatalog();
    } catch (err) {
      console.error('[useDeckStore] Erro ao carregar:', err);
      set({ isLoading: false });
    }
  },

  updatePlayerName: async (name) => {
    const trimmed = name.trim() || 'Jogador';
    await savePlayerName(trimmed, get().sessionUser);
    set({ playerName: trimmed });
  },

  // Compra um cosmético se houver moedas suficientes. Retorna true/false.
  // Aceita o objeto cosmético inteiro (resolvido pela tela a partir do catálogo
  // mesclado hardcoded+banco) para não depender só do array hardcoded.
  purchaseCosmetic: async (cosmetic) => {
    const { coins, ownedCosmetics, sessionUser } = get();
    if (ownedCosmetics.includes(cosmetic.id)) return false;
    if (coins < cosmetic.price) return false;

    await buyCosmetic(cosmetic.id, sessionUser);
    const newCoins = await addCoins(-cosmetic.price, sessionUser);
    set((state) => ({
      coins: newCoins,
      ownedCosmetics: [...state.ownedCosmetics, cosmetic.id],
    }));
    return true;
  },

  selectEquippedCosmetic: async (cosmetic) => {
    await equipCosmetic(cosmetic.type, cosmetic.id, get().sessionUser);
    set((state) => ({
      equipped: { ...state.equipped, [cosmetic.type]: cosmetic.id },
    }));
  },

  // Chamado ao fim de uma partida — +10 moedas por acerto
  awardCoins: async (correctAnswers) => {
    if (correctAnswers <= 0) return;
    const amount = correctAnswers * 10;
    const newTotal = await addCoins(amount, get().sessionUser);
    set({ coins: newTotal });
    return amount;
  },

  addDeck: async (title) => {
    const newDeck = { id: Date.now().toString(), title, cards: [] };
    await insertDeck(newDeck.id, newDeck.title, get().sessionUser);
    set((state) => ({ decks: [...state.decks, newDeck] }));
    return newDeck.id;
  },

  renameDeck: async (deckId, newTitle) => {
    await updateDeck(deckId, newTitle);
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === deckId ? { ...d, title: newTitle } : d
      ),
    }));
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

  editCard: async (deckId, cardId, question, answer) => {
    await updateCard(cardId, question, answer);
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.map((c) =>
                c.id === cardId ? { ...c, question, answer } : c
              ),
            }
          : d
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
