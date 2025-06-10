import { useCallback, useEffect, useState } from 'react';

import { SettingsState } from '@/reducers/settingsReducer';
import { useSelector } from '@/store/store';
import { DEFAULT_SETTINGS } from '@/utils';

export interface FetchedSettingsType {
  id: string;
  wallet_address: string;
  preferences: SettingsState;
  created_at: string;
}

interface UseFetchUserSettingsResult {
  preferences: FetchedSettingsType['preferences'] | null;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (newSettings: SettingsState) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

export const useFetchUserSettings = (): UseFetchUserSettingsResult => {
  const wallet = useSelector((state) => state.walletState.wallet);
  const settingsFromStore = useSelector((state) => state.settings);

  const [settings, setSettings] = useState<FetchedSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = wallet?.walletAddress;

  const fetchPreferences = useCallback(async () => {
    if (!walletAddress) {
      setSettings(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/settings?wallet_address=${encodeURIComponent(walletAddress)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch settings');
      }

      // If settings exist, use them
      if (data.settings && Object.keys(data.settings).length > 0) {
        setSettings(data.settings);
      } else {
        // If no settings or empty object, initialize with defaults
        await initializeDefaultSettings();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const updatePreferences = useCallback(
    async (newSettings: SettingsState) => {
      if (!walletAddress) {
        setError('Wallet address is required to update settings');
        return;
      }

      // if newSettings and settings are the same, do nothing
      if (
        JSON.stringify(newSettings) === JSON.stringify(settings?.preferences)
      ) {
        console.log('No changes detected, skipping update');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // If we already have settings, update with PATCH
        // If not, create new with POST
        const method = settings ? 'PATCH' : 'POST';

        const response = await fetch('/api/settings', {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet_address: walletAddress,
            preferences: newSettings,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              `Failed to ${settings ? 'update' : 'create'} settings`,
          );
        }

        setSettings(data.settings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
        console.error('Error updating settings:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, settings],
  );

  // Function to initialize with current settings
  const initializeDefaultSettings = useCallback(async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          preferences: settingsFromStore || DEFAULT_SETTINGS,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize settings');
      }

      setSettings(data.settings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
      console.error('Error initializing settings:', err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  // Function to manually refresh settings
  const refreshPreferences = useCallback(async () => {
    await fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch settings on initial load and wallet address change
  useEffect(() => {
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  return {
    preferences: settings?.preferences ?? null,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences,
  };
};

export default useFetchUserSettings;
