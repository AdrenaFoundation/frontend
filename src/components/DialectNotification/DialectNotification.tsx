import '@dialectlabs/react-ui/index.css';

import {
  DialectSolanaWalletAdapter,
} from "@dialectlabs/blockchain-sdk-solana";
import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana';
import { NotificationsButton } from '@dialectlabs/react-ui';
import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';

import { useSelector } from '@/store/store';
import { PageProps } from '@/types';


const DAPP_ADDRESS = '95dcepmNHXW4VdFeUrXEixzQAj3bxhemqYnHqViKQCD6';

export const DialectNotification = ({ adapters }: {
  adapters: PageProps['adapters'];
}) => {
  const wallet = useSelector((state) => state.walletState.wallet);

  const adapter = adapters.find((x) => x.name === 'Phantom');

  const isConnected = adapter?.connected || false;

  const customWalletAdapter: DialectSolanaWalletAdapter | null = useMemo(() => {
    if (!adapter || !wallet) return null;

    return {
      publicKey: new PublicKey(wallet.walletAddress),
      signMessage: async (message: Uint8Array) => {
        // @ts-ignore
        return await adapter.signMessage(message)
      },
      signTransaction: async (transaction: any) => {
        // @ts-ignore
        return await adapter.signTransaction(transaction);
      },
      signAllTransactions: async (transactions: any[]) => {
        // @ts-ignore
        return await adapter.signAllTransactions(transactions);
      },

    }
  }, [adapter, wallet, isConnected]);

  if (!isConnected || !wallet || !customWalletAdapter) return null;

  return (
    <DialectSolanaSdk
      dappAddress={DAPP_ADDRESS}
      config={{ environment: 'production', }}
      customWalletAdapter={customWalletAdapter}
    >
      <NotificationsButton theme={'dark'} />
    </DialectSolanaSdk>
  );
};
