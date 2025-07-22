import '@dialectlabs/react-ui/index.css';

import { DialectSolanaWalletAdapter } from '@dialectlabs/blockchain-sdk-solana';
import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana';
import { Notifications } from '@dialectlabs/react-ui';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { useMemo } from 'react';

import { useSelector } from '@/store/store';
import { PageProps } from '@/types';

const DAPP_ADDRESS = process.env.NEXT_PUBLIC_DIALECT_APP_ID || '';

if (!DAPP_ADDRESS) {
  console.error('NEXT_PUBLIC_DIALECT_APP_ID is not set');
}

interface WalletWithSigningMethods {
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  signTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T,
  ) => Promise<T>;
  signAllTransactions: <T extends Transaction | VersionedTransaction>(
    transactions: T[],
  ) => Promise<T[]>;
}

export const DialectNotification = ({
  adapters,
}: {
  adapters: PageProps['adapters'];
}) => {
  const wallet = useSelector((state) => state.walletState.wallet);

  const adapter = adapters.find((x) => x.name === 'Phantom');

  const isConnected = adapter?.connected || false;

  const customWalletAdapter: DialectSolanaWalletAdapter | null = useMemo(() => {
    if (!adapter || !wallet) return null;

    const walletInstance = adapter as unknown as WalletWithSigningMethods;

    return {
      publicKey: new PublicKey(wallet.walletAddress),
      signMessage: async (message: Uint8Array): Promise<Uint8Array> => {
        return await walletInstance.signMessage(message);
      },
      signTransaction: async <T extends Transaction | VersionedTransaction>(
        transaction: T,
      ): Promise<T> => {
        return await walletInstance.signTransaction(transaction);
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(
        transactions: T[],
      ): Promise<T[]> => {
        return await walletInstance.signAllTransactions(transactions);
      },
    };
  }, [adapter, wallet]);

  if (!isConnected || !wallet || !customWalletAdapter) return null;

  return (
    <DialectSolanaSdk
      dappAddress={DAPP_ADDRESS}
      config={{ environment: 'production' }}
      customWalletAdapter={customWalletAdapter}
    >
      <Notifications />
    </DialectSolanaSdk>
  );
};
