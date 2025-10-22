import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { useAllAdxStaking } from './useAllAdxStaking';

let interval: NodeJS.Timeout | null = null;

const HOLDERS_INTERVAL_IN_MS = 30_000;

export default function useADXHolderCount(): number | null {
  const [holderCount, setHolderCount] = useState<number | null>(null);
  // Use shared cached ADX staking data
  const { allAdxStaking } = useAllAdxStaking();

  const loadHolders = useCallback(async () => {
    const connection = window.adrena.client.readonlyConnection;

    if (!connection) return;

    try {
      const [accounts, allStaking] = await Promise.all([
        connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
          filters: [
            {
              dataSize: AccountLayout.span, // Filter only token accounts
            },
            {
              memcmp: {
                offset: 0, // Mint address starts at byte 0
                bytes: window.adrena.client.adxToken.mint.toBase58(),
              },
            },
          ],
        }),
        window.adrena.client.loadAllStaking(),
      ]);

      const directHolderNumber = accounts
        .map((account) => {
          const data = AccountLayout.decode(
            new Uint8Array(account.account.data),
          );

          return {
            owner: new PublicKey(data.owner).toBase58(),
            amount: Number(data.amount), // Raw amount (native lamports)
            account: account.pubkey.toBase58(),
          };
        })
        .filter((holder) => {
          const amountInUI =
            holder.amount /
            Math.pow(10, window.adrena.client.adxToken.decimals);
          return amountInUI > 0;
        }).length;

      const nbStakedHolders = (allStaking || []).filter(
        (staking) =>
          staking.stakingType === 1 &&
          (staking.liquidStake.amount.toNumber() > 10 ||
            staking.lockedStakes.length > 0),
      ).length;

      setHolderCount(directHolderNumber + nbStakedHolders);
    } catch (e) {
      console.log('Error loading ADX token supply', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.adrena.client.readonlyConnection, allAdxStaking]);

  useEffect(() => {
    loadHolders();

    interval = setInterval(() => {
      loadHolders();
    }, HOLDERS_INTERVAL_IN_MS);

    return () => {
      if (!interval) {
        return;
      }

      clearInterval(interval);
      interval = null;
    };
  }, [loadHolders]);

  return holderCount;
}
