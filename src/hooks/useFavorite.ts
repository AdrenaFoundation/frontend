import { useState } from 'react';

// filepath: /Users/abdirahim/Documents/GitHub/frontend/src/hooks/useFavorite.ts

export default function useFavorite() {
  const [favoriteAchievements, setFavoriteAchievements] = useState<number[]>(
    [],
  );
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavoriteAchievements = async (walletAddress: string) => {
    setIsFavoriteLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/favorite_achievements?wallet_address=${walletAddress}`,
      );
      const data = await response.json();

      if (data.favoriteAchievements) {
        setFavoriteAchievements(data.favoriteAchievements);
      }
    } catch (err) {
      console.error('Error fetching favorite achievements:', err);
      setError('Failed to fetch favorite achievements');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const createFavoriteAchievements = async (
    walletAddress: string,
    achievements: number[],
  ) => {
    setIsFavoriteLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/favorite_achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          favorite_achievements: achievements,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create favorite achievements');
      }

      setFavoriteAchievements(achievements);
    } catch (err) {
      console.error('Error creating favorite achievements:', err);
      setError('Failed to create favorite achievements');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const updateFavoriteAchievements = async (
    walletAddress: string,
    achievements: number[],
  ) => {
    setIsFavoriteLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/favorite_achievements`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          favorite_achievements: achievements,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite achievements');
      }

      setFavoriteAchievements(achievements);
    } catch (err) {
      console.error('Error updating favorite achievements:', err);
      setError('Failed to update favorite achievements');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  return {
    favoriteAchievements,
    isFavoriteLoading,
    error,
    fetchFavoriteAchievements,
    createFavoriteAchievements,
    updateFavoriteAchievements,
  };
}
