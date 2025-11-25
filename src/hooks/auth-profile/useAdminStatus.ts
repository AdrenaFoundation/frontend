import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import supabaseAnonClient from '@/supabaseAnonClient';

export default function useAdminStatus(walletAddress: string | null) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const adminWalletAddresses = useSelector(
    (state) => state.supabaseAuth.verifiedWalletAddresses,
  );

  const checkAdminStatus = useCallback(
    async (address: string) => {
      if (!adminWalletAddresses.includes(address)) {
        setIsAdmin(false);
        return;
      }

      setIsLoading(true);

      try {
        const {
          data: { session },
        } = await supabaseAnonClient.auth.getSession();

        const response = await fetch(
          `/api/verify_signature?walletAddress=${address}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(session
                ? { Authorization: `Bearer ${session.access_token}` }
                : {}),
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    },
    [adminWalletAddresses],
  );

  useEffect(() => {
    if (!walletAddress) {
      setIsAdmin(false);
      return;
    }

    checkAdminStatus(walletAddress);
  }, [walletAddress, checkAdminStatus]);

  return { isAdmin, isLoading };
}
