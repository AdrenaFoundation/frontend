import React, { MutableRefObject, useEffect, useRef, useState } from 'react';

import { Token } from '@/types';

let tvScriptLoadingPromise: Promise<unknown>;

// We don't have access to proper type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Widget = any;

export default function TradingChart({ token }: { token: Token }) {
  const onLoadScriptRef: MutableRefObject<(() => void) | null> = useRef(null);
  const [widget, setWidget] = useState<Widget | null>(null);

  const chartOverrides = {
    'paneProperties.background': '#16182e',
    'paneProperties.backgroundGradientStartColor': '#16182e',
    'paneProperties.backgroundGradientEndColor': '#16182e',
    'paneProperties.backgroundType': 'solid',
    'paneProperties.vertGridProperties.color': 'rgba(35, 38, 59, 1)',
    'paneProperties.vertGridProperties.style': 2,
    'paneProperties.horzGridProperties.color': 'rgba(35, 38, 59, 1)',
    'paneProperties.horzGridProperties.style': 2,
    'mainSeriesProperties.priceLineColor': '#3a3e5e',
    'scalesProperties.textColor': '#fff',
    'scalesProperties.lineColor': '#16182e',
  };

  useEffect(() => {
    function createWidget() {
      if (document.getElementById('chart-area') && 'TradingView' in window) {
        // Force to any because we don't have access to the type of TradingView
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const widget = new (window.TradingView as any).widget({
          container_id: 'chart-area',
          width: '100%',
          height: '100%',
          autosize: true,
          symbol: `PYTH:${token.name}USD`,
          interval: 'D',
          timezone: 'UTC',
          style: '1',
          locale: 'en',
          save_image: true,
          allow_symbol_change: false,
          editablewatchlist: false,
          backgroundColor: '#080808',
          overrides: chartOverrides,
          hotlist: false,
          hidevolume: true,
          disabled_features: [
            'symbol_search_hot_key',
            'header_compare',
            'compare_symbol',
            'border_around_the_chart',
            'add_to_watchlist',
          ],
          enabled_features: [
            'header_fullscreen_button',
            'hide_left_toolbar_by_default',
          ],

          // Styling
          theme: 'Dark',
        });

        console.log('widget', widget);
        console.log('window.TradingView', window.TradingView);

        setWidget(widget);
      }
    }

    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current?.());

    return () => {
      onLoadScriptRef.current = null;
    };

    // Only trigger it onces when the chart load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!widget) return;

    widget.options.symbol = `PYTH:${token.name}USD`;
    widget.reload();
  }, [token, widget]);

  return (
    <div className="flex flex-col w-full">
      <div id="chart-area" />
      <div className="tradingview-widget-copyright"></div>
    </div>
  );
}
