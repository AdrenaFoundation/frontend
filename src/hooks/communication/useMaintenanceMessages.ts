import { useCallback, useEffect, useState } from 'react';

export interface MaintenanceMessage {
  id: number;
  message: string;
  pages: string[];
  color?: string;
  created_at: string;
  updated_at?: string;
}

export const useMaintenanceMessages = () => {
  const [messages, setMessages] = useState<MaintenanceMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/maintenance_message');
      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching maintenance messages:', result.error);
        setError(result.error || 'Failed to fetch messages');
        return;
      }

      setMessages(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching maintenance messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMessage = useCallback(
    async (message: string, pages: string[], color?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/maintenance_message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message, pages, color }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create message');
        }

        await fetchMessages();
        return result.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error creating maintenance message:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMessages],
  );

  const updateMessage = useCallback(
    async (
      id: number,
      updates: Pick<MaintenanceMessage, 'message' | 'pages' | 'color'>,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/maintenance_message', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, ...updates }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('Error updating maintenance message:', result.error);
          return;
        }

        await fetchMessages();
        return result.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error updating maintenance message:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMessages],
  );

  // Delete maintenance message
  const deleteMessage = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/maintenance_message', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete message');
        }

        await fetchMessages();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error deleting maintenance message:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMessages],
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    createMessage,
    updateMessage,
    deleteMessage,
  };
};
