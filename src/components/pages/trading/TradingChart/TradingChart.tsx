import React, { MutableRefObject, useEffect, useRef, useState } from 'react';

import useDatafeed from '@/hooks/useDatafeed';
import { Token } from '@/types';
// import datafeed from './TradingView/datafeed';

let tvScriptLoadingPromise: Promise<unknown>;

// We don't have access to proper type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Widget = any;

export default function TradingChart({ token }: { token: Token }) {
  const onLoadScriptRef: MutableRefObject<(() => void) | null> = useRef(null);
  const [widget, setWidget] = useState<Widget | null>(null);

  const disabledFeatures = ['header_widget', 'use_localstorage_for_settings'];
  const datafeed = useDatafeed();

  useEffect(() => {
    function createWidget() {
      if (document.getElementById('chart-area') && 'TradingView' in window) {
        // Force to any because we don't have access to the type of TradingView
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const widget = new (window.TradingView as any).widget({
          container_id: 'chart-area',
          library_path: '/charting_library/',
          width: '100%',
          height: '100%',
          autosize: true,
          symbol: `Bitfinex:${token.symbol}/USD`,
          interval: '1D',
          timezone: 'UTC',
          locale: 'en',
          save_image: true,
          allow_symbol_change: false,
          editablewatchlist: false,
          backgroundColor: '#151515',
          toolbar_bg: '#101419',
          datafeed: datafeed,
          loading_screen: {
            backgroundColor: '#101419',
            foregroundColor: '#101419',
          },
          header_widget_dom_node: false,
          disabled_features: disabledFeatures,
          enabled_features: [
            'header_fullscreen_button',
            'hide_left_toolbar_by_default',
          ],

          custom_css_url: '/tradingview.css',
          overrides: {
            'paneProperties.background': '#101419',
            'paneProperties.backgroundType': 'solid',
          },
          theme: 'dark',
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
        script.src = '/charting_library/charting_library.js';
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
  }, [token]);

  // useEffect(() => {
  //   if (!widget) return;

  //   widget.options.symbol = `Bitfinex:${token.symbol}USD`;

  //   widget.reload();
  // }, [token, widget]);

  return (
    <div className="flex flex-col w-full mb-5 border border-gray-200 rounded-2xl rounded-t-none overflow-hidden bg-gray-200/85 backdrop-blur-md">
      <div id="chart-area" className="h-full rounded-b-lg" />
      <div className="tradingview-widget-copyright"></div>
    </div>
  );
}
