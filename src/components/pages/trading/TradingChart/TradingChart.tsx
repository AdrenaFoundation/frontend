import { PublicKey } from '@solana/web3.js';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';

import usePositions from '@/hooks/usePositions';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { formatPriceInfo } from '@/utils';

import {
  IChartingLibraryWidget,
  IChartWidgetApi,
  IDatafeedChartApi,
  IDatafeedQuotesApi,
  IExternalDatafeed,
  IPositionLineAdapter,
  ResolutionString,
} from '../../../../../public/charting_library/charting_library';
import datafeed from './datafeed';

let tvScriptLoadingPromise: Promise<unknown>;

type Widget = IChartingLibraryWidget;

export default function TradingChart({ token }: { token: Token }) {
  const onLoadScriptRef: MutableRefObject<(() => void) | null> = useRef(null);
  const [widget, setWidget] = useState<Widget | null>(null);
  const [widgetReady, setWidgetReady] = useState<boolean>(false);
  const [chartPositions, setChartPositions] = useState<
    [
      PublicKey,
      {
        entryPrice: IPositionLineAdapter;
        liquidationPrice: IPositionLineAdapter | null;
      },
    ][]
  >([]);

  const tokenPrice = useSelector((s) => s.tokenPrices[token.symbol]) ?? null;

  const { positions, triggerPositionsReload } = usePositions();

  useEffect(() => {
    function createWidget() {
      if (document.getElementById('chart-area') && 'TradingView' in window) {
        // Force to any because we don't have access to the type of TradingView
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const widget = new window.TradingView.widget({
          container_id: 'chart-area',
          container: '',
          library_path: '/charting_library/',
          width: 100,
          height: 100,
          autosize: true,
          symbol: `Crypto.${token.symbol}/USD`,
          timezone: 'Etc/UTC',
          locale: 'en',
          toolbar_bg: '#0b0e13',
          datafeed,
          loading_screen: {
            backgroundColor: '#101419',
            foregroundColor: '#101419',
          },
          favorites: {
            intervals: [
              '1',
              '5',
              '15',
              '1h',
              'D',
              'W',
              'M',
            ] as ResolutionString[],
            chartTypes: ['Candles'],
          },
          disabled_features: [
            'use_localstorage_for_settings',
            'header_symbol_search',
            'header_layouts',
            'header_chart_type',
            'header_compare',
            'header_indicators',
            'display_market_status',
            'create_volume_indicator_by_default',
            'header_undo_redo',
          ],

          // TODO:
          // - Rewrite last price indicator css
          // - Set favorites for resolutions
          // - Disable volume
          enabled_features: [
            'header_fullscreen_button',
            'hide_left_toolbar_by_default',
            'header_saveload',
            'header_screenshot',
            'header_settings',
            'items_favoriting',
          ],

          custom_css_url: '/tradingview.css',
          overrides: {
            'paneProperties.background': '#0b0e13',
            'paneProperties.backgroundType': 'solid',
          },
          theme: 'Dark',
          interval: 'D' as ResolutionString,
        });

        console.log('widget', widget);
        console.log('window.TradingView', window.TradingView);

        setWidget(widget);
        setWidgetReady(true);
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
      // Reset charts positions
      setWidgetReady(false);
      setChartPositions([]);
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

  // useEffect(() => {
  //   try {
  //     if (!widgetReady || !widget || typeof widget.chart !== 'function') return;

  //     const chart: IChartWidgetApi = widget.chart();

  //     //
  //     // Delete all and recreate
  //     // Not optimized, but otherwise, sometimes it doesn't show up
  //     //
  //     Object.values(chartPositions).map(([, positionLine]) => {
  //       try {
  //         positionLine.entryPrice.remove();
  //         positionLine.liquidationPrice?.remove();
  //       } catch (e) {
  //         console.log(e);
  //         // ignore error due to position not existing anymore on the chart
  //         // could be because user changed of pair
  //       }
  //     });

  //     if (!chart) {
  //       setChartPositions([]);
  //       return;
  //     }

  //     console.log('positions', positions);

  //     const updatedChartPositions: [
  //       PublicKey,
  //       {
  //         entryPrice: IPositionLineAdapter;
  //         liquidationPrice: IPositionLineAdapter | null;
  //       },
  //     ][] = [];

  //     if (positions) {
  //       positions.forEach((position) => {
  //         // Ignore positions about different pairs
  //         if (position.token.symbol !== token.symbol) {
  //           console.log('position wrong symbol');
  //           return;
  //         }

  //         // Calculate liquidation price in asset
  //         const liquidationToken =
  //           position.liquidationPrice !== null &&
  //           typeof position.liquidationPrice !== 'undefined' &&
  //           tokenPrice !== null
  //             ? position.liquidationPrice / tokenPrice
  //             : null;

  //         // Add position
  //         console.log('add position', position.pubkey);

  //         console.log('liquidationToken', liquidationToken);

  //         updatedChartPositions.push([
  //           position.pubkey,
  //           {
  //             entryPrice: chart
  //               .createPositionLine({})
  //               .setText(`${token.symbol} ${position.side} Entry Price`)
  //               .setLineLength(3)
  //               .setQuantity(formatPriceInfo(position.sizeUsd))
  //               .setPrice(position.price)
  //               .setLineColor(position.side === 'long' ? 'green' : 'red'),
  //             liquidationPrice:
  //               typeof position.liquidationPrice !== 'undefined'
  //                 ? chart
  //                     .createPositionLine({})
  //                     .setText(
  //                       `${token.symbol} ${position.side} Liquidation Price`,
  //                     )
  //                     .setLineLength(3)
  //                     .setQuantity(formatPriceInfo(position.liquidationPrice))
  //                     .setPrice(position.liquidationPrice)
  //                     .setLineColor(position.side === 'long' ? 'gray' : 'gray')
  //                 : null,
  //           },
  //         ]);
  //       });
  //     }

  //     setChartPositions(updatedChartPositions);

  //     // const highPositionLine = widget.chart().createPositionLine({});
  //     // highPositionLine
  //     //   .setText('MY POSITION')
  //     //   .setQuantity('500')
  //     //   .setLineLength(3)
  //     //   .setPrice(3200)
  //     //   .setLineColor('yellow');
  //   } catch (e) {
  //     // Ignore error, will retry automatically
  //     // Can happens when something happens to the chart
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [widgetReady, positions, tokenPrice, widget, token.symbol]);

  return (
    <div className="flex flex-col w-full mb-5 border border-gray-200 rounded-2xl rounded-t-none overflow-hidden bg-gray-200/85 backdrop-blur-md">
      <div id="chart-area" className="h-full rounded-b-lg" />
      <div className="tradingview-widget-copyright"></div>
    </div>
  );
}
