import { useCallback, useEffect, useState } from 'react';

import { Token } from '@/types';
import { getTokenSymbol } from '@/utils';

const FAVORITES_STORAGE_KEY = 'tokenFavorites';

export function useFavorites(availableTokens: Token[] = []) {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!savedFavorites) return;

      const parsed = JSON.parse(savedFavorites);
      if (
        !Array.isArray(parsed) ||
        !parsed.every((item) => typeof item === 'string')
      ) {
        localStorage.removeItem(FAVORITES_STORAGE_KEY);
        setFavorites([]);
        return;
      }

      const validTokenSymbols = new Set(
        availableTokens.map((token) => getTokenSymbol(token.symbol)),
      );
      const validFavorites = parsed.filter((symbol) =>
        validTokenSymbols.has(symbol),
      );

      const contentChanged =
        validFavorites.length !== parsed.length ||
        !validFavorites.every((fav, index) => fav === parsed[index]);

      if (contentChanged) {
        localStorage.setItem(
          FAVORITES_STORAGE_KEY,
          JSON.stringify(validFavorites),
        );
      }

      setFavorites(validFavorites);
    } catch {
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
      setFavorites([]);
    }
  }, [availableTokens]);

  const addFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      if (prev.includes(symbol)) return prev;

      const newFavorites = [...prev, symbol];

      try {
        localStorage.setItem(
          FAVORITES_STORAGE_KEY,
          JSON.stringify(newFavorites),
        );
      } catch (error) {
        console.error('Error saving favorites:', error);
      }

      return newFavorites;
    });
  }, []);

  const removeFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.filter((fav) => fav !== symbol);

      try {
        localStorage.setItem(
          FAVORITES_STORAGE_KEY,
          JSON.stringify(newFavorites),
        );
      } catch (error) {
        console.error('Error saving favorites:', error);
      }

      return newFavorites;
    });
  }, []);

  const toggleFavorite = useCallback(
    (symbol: string) => {
      if (favorites.includes(symbol)) {
        removeFavorite(symbol);
      } else {
        addFavorite(symbol);
      }
    },
    [favorites, addFavorite, removeFavorite],
  );

  const isFavorite = useCallback(
    (symbol: string) => favorites.includes(symbol),
    [favorites],
  );

  const getFavoriteTokens = useCallback(
    (tokens: Token[]) =>
      tokens.filter((token) =>
        favorites.includes(getTokenSymbol(token.symbol)),
      ),
    [favorites],
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoriteTokens,
  };
}
