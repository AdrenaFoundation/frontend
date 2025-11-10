import { getPrimaryDomain } from '@bonfida/spl-name-service';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import { useSelector } from '@/store/store';

export default function useSNSPrimaryDomain(targetWalletPubkey?: string) {
  const wallet = useSelector((state) => state.walletState.wallet);

  const [snsDomain, setSnsDomain] = useState<string | null>(null);
  const connection = window.adrena.client.connection;

  useEffect(() => {
    if (!connection || !wallet?.walletAddress) return;

    const fetchOwner = async () => {
      try {
        const domain = await getPrimaryDomain(
          connection,
          new PublicKey(targetWalletPubkey ?? wallet.walletAddress),
        );

        if (!domain) {
          setSnsDomain(null);
          return;
        }

        setSnsDomain(domain.reverse);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // Silently handle the specific SNSError
        if (
          error.name === 'SNSError' ||
          (error.message &&
            error.message.includes('favourite account does not exist'))
        ) {
          setSnsDomain(null);
        } else {
          console.error('Error fetching SNS primary domain:', error);
          setSnsDomain(null);
        }
      }
    };

    fetchOwner();
  }, [connection, targetWalletPubkey, wallet?.walletAddress]); // Added wallet address as dependency

  return snsDomain;
}
