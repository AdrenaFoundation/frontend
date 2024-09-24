import { WalletProvider } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import React from 'react';

import { walletAdapters } from '@/constant';

import IntegratedTerminalChild from './IntegratedTerminalChild';

export default function IntegratedTerminal({
  connected,
  className,
  activeRpc,
}: {
  connected: boolean;
  className?: string;
  activeRpc: {
    name: string;
    connection: Connection;
  };
}) {
  const adapter = walletAdapters['phantom'];

  return (
    <WalletProvider wallets={[adapter]} autoConnect>
      <IntegratedTerminalChild
        connected={connected}
        className={className}
        activeRpc={activeRpc}
      />
    </WalletProvider>
  );
}
