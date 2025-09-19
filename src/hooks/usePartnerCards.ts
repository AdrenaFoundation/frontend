import { useCallback, useEffect, useState } from 'react';

export interface PartnerCard {
  id: number;
  name: string;
  description: string;
  link: string;
  logo_blob_url: string;
  gradient_color_1: string;
  gradient_color_2: string;
  bg_color: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const usePartnerCards = () => {
  const [cards, setCards] = useState<PartnerCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/partner_cards');
      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching partner cards:', result.error);
        setError(result.error || 'Failed to fetch cards');
        return;
      }

      setCards(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching partner cards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCard = useCallback(
    async (cardData: Omit<PartnerCard, 'id' | 'created_at' | 'updated_at'>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/partner_cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cardData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create card');
        }

        await fetchCards();
        return result.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error creating partner card:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCards],
  );

  const updateCard = useCallback(
    async (
      id: number,
      updates: Partial<Omit<PartnerCard, 'id' | 'created_at' | 'updated_at'>>,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/partner_cards', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, ...updates }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update card');
        }

        await fetchCards();
        return result.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error updating partner card:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCards],
  );

  const deleteCard = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/partner_cards?id=${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete card');
        }

        await fetchCards();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error deleting partner card:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCards],
  );

  // Upload image to Vercel Blob
  const uploadLogo = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `/api/upload-partner-logo?filename=${file.name}`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    return result.url;
  }, []);

  // Fetch cards on mount
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return {
    cards,
    loading,
    error,
    uploadLogo,
    createCard,
    updateCard,
    deleteCard,
    fetchCards,
  };
};
