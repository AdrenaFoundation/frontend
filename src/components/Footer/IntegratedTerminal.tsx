import { WalletProvider } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import React from 'react';

import { walletAdapters } from '@/constant';

import IntegratedTerminalChild from './IntegratedTerminalChild';

export default function IntegratedTerminal({
  connected,
  className,
  activeRpc,
  id = 'Integrated-terminal',
}: {
  connected: boolean;
  className?: string;
  activeRpc: {
    name: string;
    connection: Connection;
  };
  id?: string;
}) {
  const adapter = walletAdapters['phantom'];

  return (
    <WalletProvider wallets={[adapter]} autoConnect>
      <IntegratedTerminalChild
        connected={connected}
        className={className}
        activeRpc={activeRpc}
        id={id}
      />
    </WalletProvider>
  );
}
