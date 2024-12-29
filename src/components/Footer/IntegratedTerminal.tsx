import { WalletProvider } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';

import { Token, WalletAdapterExtended } from '@/types';

import IntegratedTerminalChild from './IntegratedTerminalChild';

export default function IntegratedTerminal({
  connected,
  className,
  activeRpc,
  adapters,
  allowedTokenB,
  setTokenB,
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
  allowedTokenB: Token[];
  setTokenB: (t: Token) => void;
}) {
  const adapter = adapters.find(x => x.name === 'Phantom');

  return (adapter ?
    <WalletProvider wallets={[adapter]} autoConnect>
      <IntegratedTerminalChild
        connected={connected}
        className={className}
        activeRpc={activeRpc}
        allowedTokenB={allowedTokenB}
        setTokenB={setTokenB}
        id={id}
      />
    </WalletProvider> : null
  );
}
