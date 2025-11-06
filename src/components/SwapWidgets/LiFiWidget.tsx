import {
  ChainId,
  LiFiWidget as LiFiWidgetComponent,
  WidgetConfig,
} from '@lifi/widget';
import { Connection } from '@solana/web3.js';
import { useEffect, useMemo, useRef, useState } from 'react';

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
        container: {
          display: 'flex',
          minHeight: '31.25rem', // Minimum height for comfortable viewing (500px)
        },
        palette: {
          primary: {
            main: '#c084fc', // purple-400 to match bridge tab exactly
          },
          secondary: {
            main: '#15202C', // border-bcolor for secondary elements
          },
          background: {
            paper: '#0B1420', // bg-third
            default: '#060D16', // bg-main
          },
          text: {
            primary: '#e3e6ea', // text-whiteLabel
            secondary: '#7e7d85', // text-grayLabel
          },
        },
        shape: {
          borderRadius: 6,
          borderRadiusSecondary: 6,
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
      // Show only tokens with balances in 'From' selection
      tokens: {
        from: {
          allow: [], // Empty = show all, but widget auto-prioritizes tokens with balances
        },
        to: {
          allow: [], // Allow all for destination
        },
        featured: [], // Auto-detect from wallet balances and show at top
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [scaledHeight, setScaledHeight] = useState<number>(650);

  // Dynamically measure widget height and calculate scaled dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const actualHeight = entry.contentRect.height;
        // Calculate visual height after 0.85 scale
        setScaledHeight(actualHeight * 0.85);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Apply custom logo classes to ADX and ALP tokens by symbol
  useEffect(() => {
    if (!containerRef.current) return;

    const applyLogoClasses = () => {
      if (!containerRef.current) return;

      // Find all token list items
      const tokenButtons =
        containerRef.current.querySelectorAll('[role="button"]');

      tokenButtons.forEach((btn) => {
        const text = btn.textContent || '';

        // Check if this is an ADX token (symbol "ADX" + name contains "Adrena")
        if (text.includes('ADX') && text.includes('Adrena')) {
          if (!btn.classList.contains('adrena-token-adx')) {
            btn.classList.add('adrena-token-adx');
            console.log('✅ Applied ADX logo');
          }
        }

        // Check if this is an ALP token (symbol "ALP" + name contains "Adrena")
        if (text.includes('ALP') && text.includes('Adrena')) {
          if (!btn.classList.contains('adrena-token-alp')) {
            btn.classList.add('adrena-token-alp');
            console.log('✅ Applied ALP logo');
          }
        }
      });
    };

    // Run on mount and after delays
    applyLogoClasses();
    const timeout1 = setTimeout(applyLogoClasses, 500);
    const timeout2 = setTimeout(applyLogoClasses, 1500);

    // Watch for DOM changes
    const observer = new MutationObserver(applyLogoClasses);
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  return (
    <>
      <style>{`
        /* Force white text on wallet button/menu */
        #${id} [data-testid="wallet-menu-button"],
        #${id} [data-testid="wallet-menu-button"] *,
        #${id} button[aria-label*="wallet" i],
        #${id} button[aria-label*="wallet" i] *,
        #${id} header button,
        #${id} header button * {
          color: #ffffff;
        }

        /* Style wallet dropdown - scale to 85% */
        .MuiPopover-paper.MuiMenu-paper {
          transform: scale(0.85) !important;
          transform-origin: top right !important;
        
        }

        /* Wallet dropdown background and border */
        .MuiMenu-paper {
          background-color: #0B1420 !important; /* bg-third */
          border: 1px solid #15202C !important; /* border-bcolor */
        }

        /* Wallet menu items */
        .MuiMenu-paper .MuiMenuItem-root {
          background-color: #0B1420 !important; /* bg-third */
          color: #e3e6ea !important; /* text-whiteLabel */
        }

        /* Wallet menu items hover */
        .MuiMenu-paper .MuiMenuItem-root:hover {
          background-color: #15202C !important; /* border-bcolor */
        }

        /* "Connect another wallet" button */
        .MuiMenu-paper .MuiButton-root {
          background-color: #c084fc !important; /* purple-400 */
        }

        /* "Connect another wallet" button hover */
        .MuiMenu-paper .MuiButton-root:hover {
          background-color: #a855f7 !important; /* purple-500 for hover */
        }

        /* Custom ADX logo - target avatar inside button with class */
        .adrena-token-adx .MuiAvatar-root,
        .adrena-token-adx .MuiAvatar-circular {
          background-image: url('/images/adx.svg') !important;
          background-size: cover !important;
          background-position: center !important;
          background-color: transparent !important;
          color: transparent !important;
          text-indent: -9999px !important;
        }
        
        /* Custom ALP logo - target avatar inside button with class */
        .adrena-token-alp .MuiAvatar-root,
        .adrena-token-alp .MuiAvatar-circular {
          background-image: url('/images/alp.svg') !important;
          background-size: cover !important;
          background-position: center !important;
          background-color: transparent !important;
          color: transparent !important;
          text-indent: -9999px !important;
        }
      `}</style>
      <div
        className={className}
        style={{
          minHeight: `${Math.min(scaledHeight, 425)}px`, // Minimum 425px scaled (500px * 0.85)
          maxHeight: `${Math.min(scaledHeight, 765)}px`, // Maximum 765px scaled (900px * 0.85)
          height: `${scaledHeight}px`,
          overflow: 'visible',
        }}
      >
        <div
          ref={containerRef}
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
      </div>
    </>
  );
}
