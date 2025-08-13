import { WalletName } from '@solana/wallet-adapter-base';
import { WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { useEffect } from 'react';

import { useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';

export default function ADXJupiterWidget({
  connected,
  adapters,
  activeRpc,
  defaultOutputMint,
  id = 'adx-jupiter-widget',
  className,
}: {
  connected: boolean;
  adapters: WalletAdapterExtended[];
  activeRpc: { name: string; connection: Connection };
  defaultOutputMint: string;
  id?: string;
  className?: string;
}) {
  const adapter = adapters.find((x) => x.name === 'Phantom');
  if (!adapter) return null;

  return (
    <WalletProvider wallets={[adapter]} autoConnect>
      <Inner
        connected={connected}
        activeRpc={activeRpc}
        defaultOutputMint={defaultOutputMint}
        id={id}
        className={className}
      />
    </WalletProvider>
  );
}

function Inner({
  connected,
  activeRpc,
  defaultOutputMint,
  id,
  className,
}: {
  connected: boolean;
  activeRpc: { name: string; connection: Connection };
  defaultOutputMint: string;
  id: string;
  className?: string;
}) {
  const walletState = useSelector((s) => s.walletState.wallet);
  const passthroughWalletContextState = useWallet();

  useEffect(() => {
    if (connected && walletState?.adapterName) {
      passthroughWalletContextState.select(
        walletState.adapterName as WalletName,
      );
    }
  }, [connected, walletState, passthroughWalletContextState]);

  useEffect(() => {
    window.Jupiter.init({
      displayMode: 'integrated',
      integratedTargetId: id,
      enableWalletPassthrough: true,
      endpoint: activeRpc.connection.rpcEndpoint,
      formProps: {
        initialInputMint: 'So11111111111111111111111111111111111111112', // SOL
        initialOutputMint: defaultOutputMint, // ADX
        fixedMint: defaultOutputMint,
        swapMode: 'ExactInOrOut',
      },
      branding: {
        name: 'Adrena',
        logoUri: 'https://app.adrena.xyz/_next/static/media/adx.ed486967.svg',
      },
    });
  }, [activeRpc.name, id, defaultOutputMint]);

  useEffect(() => {
    if (!window.Jupiter.syncProps) return;
    window.Jupiter.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState.connected, connected]);

  return <div id={id} className={className} />;
}
