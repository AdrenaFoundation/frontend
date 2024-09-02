import { WalletProvider } from '@solana/wallet-adapter-react';
import React from 'react';

import { walletAdapters } from '@/constant';

import IntegratedTerminalChild from './IntegratedTerminalChild';

export default function IntegratedTerminal({
  connected,
}: {
  connected: boolean;
}) {
  const adapter = walletAdapters['phantom'];

  return (
    <WalletProvider wallets={[adapter]} autoConnect>
      <IntegratedTerminalChild connected={connected} />
    </WalletProvider>
  );
}
