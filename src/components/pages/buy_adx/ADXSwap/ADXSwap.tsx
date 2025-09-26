import { Connection } from '@solana/web3.js';
import { twMerge } from 'tailwind-merge';

import JupiterWidget from '@/components/JupiterWidget/JupiterWidget';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { WalletAdapterExtended } from '@/types';

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

  console.log('connected', connected);

  return (
    <div
      className={twMerge(
        'relative',
        className,
        !connected && 'overflow-hidden',
      )}
    >
      <div className={!connected ? 'blur-sm' : ''}>
        <JupiterWidget
          adapters={adapters}
          activeRpc={activeRpc}
          id="adx-swap-widget"
          className="bg-transparent border-transparent min-w-[300px] w-full min-h-[550px]"
          defaultOutputMint={adxMint}
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
