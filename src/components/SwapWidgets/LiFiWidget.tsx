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
      fromChain: undefined, // 'all chains' selector
      toChain: ChainId.SOL, // Default to Solana
      theme: {
        container: {
          display: 'flex',
          minHeight: '31.25rem', // Minimum height for comfortable viewing (500px)
        },
        palette: {
          primary: { main: '#c084fc' }, // purple-400 matches bridge tab
          secondary: { main: '#15202C' }, // border-bcolor
          background: { paper: '#0B1420', default: '#060D16' }, // bg-third, bg-main
          text: { primary: '#e3e6ea', secondary: '#7e7d85' }, // whiteLabel, grayLabel
        },
        shape: { borderRadius: 6, borderRadiusSecondary: 6 },
      },
      walletConfig: {
        forceInternalWalletManagement: true,
      },
      sdkConfig: {
        rpcUrls: { [ChainId.SOL]: [rpcEndpoint] },
        routeOptions: {
          maxPriceImpact: 0.02, // 2%
          slippage: 0.005, // 0.5%
          allowSwitchChain: true,
        },
      },
      tokens: {
        from: { allow: [] },
        to: { allow: [] },
        featured: [], // Prioritizes tokens with balances
      },
      chains: { allow: [], deny: [] },
    };

    if (defaultOutputMint) {
      config.toToken = defaultOutputMint;
      config.toChain = ChainId.SOL;
    }

    return config;
  }, [defaultOutputMint, rpcEndpoint]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scaledHeight, setScaledHeight] = useState<number>(650);

  // Measure widget height and scale to 85%
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setScaledHeight(entry.contentRect.height * 0.85);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Apply custom logos to ADX/ALP tokens
  useEffect(() => {
    if (!containerRef.current) return;

    const applyLogoClasses = () => {
      if (!containerRef.current) return;

      const tokenButtons =
        containerRef.current.querySelectorAll('[role="button"]');

      tokenButtons.forEach((btn) => {
        const text = btn.textContent || '';

        if (
          text.includes('ADX') &&
          text.includes('Adrena') &&
          !btn.classList.contains('adrena-token-adx')
        ) {
          btn.classList.add('adrena-token-adx');
        }

        if (
          text.includes('ALP') &&
          text.includes('Adrena') &&
          !btn.classList.contains('adrena-token-alp')
        ) {
          btn.classList.add('adrena-token-alp');
        }
      });
    };

    applyLogoClasses();
    const timeout1 = setTimeout(applyLogoClasses, 500);
    const timeout2 = setTimeout(applyLogoClasses, 1500);

    const observer = new MutationObserver(applyLogoClasses);
    observer.observe(containerRef.current, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  return (
    <>
      <style>{`
        /* Wallet button - white text */
        #${id} [data-testid="wallet-menu-button"],
        #${id} [data-testid="wallet-menu-button"] *,
        #${id} button[aria-label*="wallet" i],
        #${id} button[aria-label*="wallet" i] *,
        #${id} header button,
        #${id} header button * {
          color: #ffffff;
        }

        /* Wallet dropdown - 85% scale, dark theme */
        .MuiPopover-paper.MuiMenu-paper {
          transform: scale(0.85) !important;
          transform-origin: top right !important;
          background-color: #0B1420 !important;
          border: 1px solid #15202C !important;
        }

        .MuiMenu-paper .MuiMenuItem-root {
          background-color: #0B1420 !important;
          color: #e3e6ea !important;
        }

        .MuiMenu-paper .MuiMenuItem-root:hover {
          background-color: #15202C !important;
        }

        .MuiMenu-paper .MuiButton-root {
          background-color: #c084fc !important;
        }

        .MuiMenu-paper .MuiButton-root:hover {
          background-color: #a855f7 !important;
        }

        /* Custom token logos */
        .adrena-token-adx .MuiAvatar-root,
        .adrena-token-adx .MuiAvatar-circular {
          background-image: url('/images/adx.svg') !important;
          background-size: cover !important;
          background-position: center !important;
          background-color: transparent !important;
          color: transparent !important;
          text-indent: -9999px !important;
        }
        
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
          minHeight: `${Math.min(scaledHeight, 425)}px`,
          maxHeight: `${Math.min(scaledHeight, 765)}px`,
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
