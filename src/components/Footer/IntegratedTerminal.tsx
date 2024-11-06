import { WalletProvider } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import React from 'react';

import { WalletAdapterExtended } from '@/types';

import IntegratedTerminalChild from './IntegratedTerminalChild';

export default function IntegratedTerminal({
  connected,
  className,
  activeRpc,
  adapters,
  id = 'Integrated-terminal',
}: {
  connected: boolean;
  className?: string;
  activeRpc: {
    name: string;
    connection: Connection;
  };
  id?: string;
  adapters: WalletAdapterExtended[];
}) {
  const adapter = adapters.find(x => x.name === 'Phantom');

  return (adapter ?
    <WalletProvider wallets={[adapter]} autoConnect>
      <IntegratedTerminalChild
        connected={connected}
        className={className}
        activeRpc={activeRpc}
        id={id}
      />
    </WalletProvider> : null
  );
}
