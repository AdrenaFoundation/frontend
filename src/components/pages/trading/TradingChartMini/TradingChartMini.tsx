import { useEffect } from 'react';

import { Token } from '@/types';
import { getTokenSymbol } from '@/utils';

import TradingChartHeaderStats from '../TradingChartHeader/TradingChartHeaderStats';

export default function TradingChartMini({
  token,
  selectedAction,
  numberLong,
  numberShort,
}: {
  token: Token;
  selectedAction: 'long' | 'short' | 'swap' | 'bridge';
  numberLong?: number;
  numberShort?: number;
}) {
  useEffect(() => {
    const cleanUpWidget = () => {
      const container = document.getElementById(
        'tradingview-mini-widget-container',
      );
      if (container) {
        container.innerHTML = '';
      }
    };

    cleanUpWidget();

    const script = document.createElement('script');
    script.id = 'tradingview-widget-script';
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;

    script.innerHTML = JSON.stringify({
      symbol: `COINBASE:${getTokenSymbol(token.symbol)}USD`,
      width: '100%',
      height: '100',
      locale: 'en',
      dateRange: '1D',
      colorTheme: 'dark',
      isTransparent: true,
      autosize: true,
      chartOnly: true,
    });

    document
      .getElementById('tradingview-mini-widget-container')
      ?.appendChild(script);

    return cleanUpWidget;
  }, [token.symbol]);

  return (
    <div>
      <div className="p-2">
        <TradingChartHeaderStats
          selected={token}
          selectedAction={selectedAction}
          numberLong={numberLong}
          numberShort={numberShort}
          compact={true}
          showIcon={true}
          className="mb-2"
        />
      </div>
      <div className="relative">
        <div
          id="tradingview-mini-widget-container"
          className="w-full h-[100px]"
        />
        {/* Overlay to disable clicks */}
        <div className="absolute inset-0 z-10 cursor-default" />
      </div>
    </div>
  );
}
