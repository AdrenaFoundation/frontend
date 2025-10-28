import {
  ChainId,
  LiFiWidget as LiFiWidgetComponent,
  WidgetConfig,
} from '@lifi/widget';
import { Connection } from '@solana/web3.js';
import { useMemo } from 'react';

import { WalletAdapterExtended } from '@/types';

interface LiFiWidgetProps {
  adapters: WalletAdapterExtended[];
  activeRpc: { name: string; connection: Connection };
  id: string;
  className?: string;
  defaultOutputMint?: string;
}

export default function LiFiWidget({
  activeRpc,
  id,
  className,
  defaultOutputMint,
}: LiFiWidgetProps) {
  const rpcEndpoint = useMemo(
    () => activeRpc.connection.rpcEndpoint,
    [activeRpc.connection.rpcEndpoint],
  );

  const widgetConfig: WidgetConfig = useMemo(() => {
    const config: WidgetConfig = {
      integrator: 'adrena-lifi',
      variant: 'compact',
      appearance: 'dark',
      theme: {
        container: {
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          backgroundColor: 'rgb(6, 13, 22)',
        },
        palette: {
          primary: {
            main: 'rgb(199, 242, 132)',
          },
          secondary: {
            main: 'rgb(33, 42, 54)',
          },
          background: {
            paper: 'rgb(16, 23, 31)',
            default: 'rgb(6, 13, 22)',
          },
          text: {
            primary: 'rgb(232, 249, 255)',
          },
        },
      },
      walletConfig: {
        usePartialWalletManagement: true,
      },
      sdkConfig: {
        rpcUrls: {
          [ChainId.SOL]: [rpcEndpoint],
        },
        routeOptions: {
          maxPriceImpact: 0.02, // 2% for cross-chain
          slippage: 0.005, // 0.5%
          allowSwitchChain: true,
        },
      },
    };

    if (defaultOutputMint) {
      config.toToken = defaultOutputMint;
      config.toChain = ChainId.SOL;
    }

    return config;
  }, [defaultOutputMint, rpcEndpoint]);

  return (
    <div className={className} id={id}>
      <LiFiWidgetComponent config={widgetConfig} integrator="adrena-lifi" />
    </div>
  );
}
