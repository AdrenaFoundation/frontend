import { Connection } from '@solana/web3.js';
import { twMerge } from 'tailwind-merge';

import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { WalletAdapterExtended } from '@/types';

import ADXJupiterWidget from './ADXJupiterWidget';

export default function ADXSwap({
  className,
  connected,
  adapters,
  activeRpc,
}: {
  className?: string;
  connected: boolean;
  adapters: WalletAdapterExtended[];
  activeRpc: { name: string; connection: Connection };
}) {
  const adxMint = window.adrena.client.adxToken.mint.toBase58();

  return (
    <div
      className={twMerge(
        'relative',
        className,
        !connected && 'overflow-hidden',
      )}
    >
      <div className={!connected ? 'blur-sm' : ''}>
        <ADXJupiterWidget
          defaultOutputMint={adxMint}
          connected={connected}
          adapters={adapters}
          activeRpc={activeRpc}
          id="adx-swap-widget"
          className="bg-transparent border-transparent min-w-[300px] w-full"
        />
      </div>

      {!connected ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-full w-full backdrop-blur-sm">
          <WalletConnection />
        </div>
      ) : null}
    </div>
  );
}
