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
      hiddenUI: ['poweredBy'],
      // Default to 'all networks' for maximum bridge options
      fromChain: undefined, // undefined = 'all chains' selector
      toChain: ChainId.SOL, // Default to Solana as destination
      theme: {
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
        // Scale down wallet button to match scaled widget
        shape: {
          borderRadius: 6,
          borderRadiusSecondary: 12,
        },
        typography: {
          fontFamily: 'inherit',
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
      // Auto-detect and prefer tokens from connected wallets
      tokens: {
        allow: [], // Empty = allow all tokens
        featured: [], // Auto-detect from wallet balances
      },
      chains: {
        allow: [], // Empty = allow all chains ('all networks')
        deny: [], // Don't deny any chains
      },
    };

    if (defaultOutputMint) {
      config.toToken = defaultOutputMint;
      config.toChain = ChainId.SOL;
    }

    return config;
  }, [defaultOutputMint, rpcEndpoint]);

  return (
    <div
      className={className}
      id={id}
      style={{
        transform: 'scale(0.85)',
        transformOrigin: 'top center',
        width: '117.65%',
        marginLeft: '-8.825%',
      }}
    >
      <LiFiWidgetComponent config={widgetConfig} integrator="adrena-lifi" />
    </div>
  );
}
