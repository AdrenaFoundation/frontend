import '@dialectlabs/react-ui/index.css';

import { DialectSolanaWalletAdapter } from '@dialectlabs/blockchain-sdk-solana';
import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana';
import { Notifications, NotificationsButton } from '@dialectlabs/react-ui';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import notificationIcon from '@/../public/images/Icons/bell-fill.svg';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';
import { addNotification } from '@/utils';

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
  isMobile = false,
  isDialectSubscriber = false,
}: {
  adapters: PageProps['adapters'];
  isDialectSubscriber?: boolean;
  isMobile?: boolean;
}) => {
  const wallet = useSelector((state) => state.walletState.wallet);

  const key = 'dialect-auth-token-' + (wallet?.walletAddress ?? '');

  const isAuthenticated = Boolean(localStorage.getItem(key));

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

  useEffect(() => {
    if (wallet?.walletAddress && isDialectSubscriber && !isAuthenticated) {
      addNotification({
        type: 'info',
        title: 'Dialect session has expired',
        message: 'Please sign message again to view your Dialect notifications.',
        duration: 'long',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isConnected || !wallet || !customWalletAdapter) return null;

  return (
    <DialectSolanaSdk
      dappAddress={DAPP_ADDRESS}
      config={{ environment: 'production' }}
      customWalletAdapter={customWalletAdapter}
    >
      {isDialectSubscriber ? (
        <NotificationsButton>
          {({ open, setOpen, unreadCount, ref }) => {
            return (
              <div
                ref={ref}
                onClick={() => setOpen(!open)}
                className={twMerge(
                  ' !group !z-10 !border-r !border-[#414E5E] !p-1.5 !px-1.5 hover:bg-third transition-colors cursor-pointer rounded-l-lg',
                  open && 'bg-third', // Visual feedback when open or pinned
                  !wallet?.walletAddress && 'cursor-not-allowed opacity-50',
                  isMobile && '!border !border-[#414E5E] !p-2 !rounded-full',
                )}
                aria-label="Open notifications"
              >
                {/* Bell Icon */}
                <Image
                  src={notificationIcon}
                  alt="Notification Bell"
                  width={12}
                  height={12}
                  className="w-3 h-3"
                />

                {/* Notification Dot */}
                {unreadCount > 0 && (
                  <div
                    className={twMerge(
                      '!absolute !top-1 !right-1.5 !w-1.5 !h-1.5 !rounded-full !z-20',
                      isMobile && '!top-0 !right-0',
                    )}
                    style={{
                      backgroundColor: '#ef4444', // Force red color
                      animation:
                        'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                  />
                )}
              </div>
            );
          }}
        </NotificationsButton>
      ) : (
        <Notifications />
      )}
    </DialectSolanaSdk>
  );
};
