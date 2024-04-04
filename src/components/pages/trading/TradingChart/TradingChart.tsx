import Link from 'next/link';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';

import usePositions from '@/hooks/usePositions';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatPriceInfo } from '@/utils';

import {
  IChartingLibraryWidget,
  IChartWidgetApi,
  IPositionLineAdapter,
  ISymbolValueFormatter,
  ResolutionString,
} from '../../../../../public/charting_library/charting_library';
import datafeed from './datafeed';

let tvScriptLoadingPromise: Promise<unknown>;

type Widget = IChartingLibraryWidget;

export default function TradingChart({ token }: { token: Token }) {
  const onLoadScriptRef: MutableRefObject<(() => void) | null> = useRef(null);
  const [widget, setWidget] = useState<Widget | null>(null);

  const [positionLines, setPositionLines] = useState<IPositionLineAdapter[]>(
    [],
  );

  const tokenPrice = useSelector((s) => s.tokenPrices[token.symbol]) ?? null;

  const { positions } = usePositions();

  useEffect(() => {
    function createWidget() {
      if (document.getElementById('chart-area') && 'TradingView' in window) {
        // Force to any because we don't have access to the type of TradingView
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const widget = new window.TradingView.widget({
          container: 'chart-area',
          library_path: '/charting_library/',
          width: 100,
          height: 100,
          autosize: true,
          symbol: `Crypto.${token.symbol}/USD`,
          timezone: 'Etc/UTC',
          locale: 'en',
          toolbar_bg: '#000f23',
          datafeed,
          loading_screen: {
            backgroundColor: '#000f23',
            foregroundColor: '#000f23',
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
            'header_chart_type',
            'header_compare',
            'header_indicators',
            'display_market_status',
            'create_volume_indicator_by_default',
            'header_undo_redo',
            'symbol_info',
            'symbol_info_long_description',
            'symbol_info_price_source',
          ],

          enabled_features: [
            'header_fullscreen_button',
            'hide_left_toolbar_by_default',
            'header_saveload',
            'header_screenshot',
            'header_settings',

            // Favorite times are displayed in the top of the chart
            'items_favoriting',
          ],

          custom_css_url: '/tradingview.css',
          overrides: {
            // Adapt colors
            'paneProperties.background': '#000f23',
            'paneProperties.backgroundType': 'solid',
            // Hides the legend
            'paneProperties.legendProperties.showStudyArguments': false,
            'paneProperties.legendProperties.showStudyTitles': false,
            'paneProperties.legendProperties.showStudyValues': false,
            'paneProperties.legendProperties.showSeriesTitle': false,
            'paneProperties.legendProperties.showBarChange': false,
            'paneProperties.legendProperties.showSeriesOHLC': true,

            // Last price line
            'mainSeriesProperties.priceLineColor': 'yellow',
          },
          theme: 'dark',
          interval: 'D' as ResolutionString,
          custom_formatters: {
            priceFormatterFactory: (): ISymbolValueFormatter | null => {
              return {
                format: (price: number): string => {
                  return `${formatPriceInfo(price)}`;
                },
              };
            },
          },
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
      // Reset charts positions
      setPositionLines([]);
      onLoadScriptRef.current = null;
    };

    // Only trigger it onces when the chart load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    // tricks to make sure the widget is ready, otherwise it crashed when calling .chart());
    if (!widget || !(widget as unknown as { _ready: boolean })._ready) return;

    const chart: IChartWidgetApi = widget.chart();

    // Remove everything
    positionLines.forEach((positionLine) => {
      positionLine.remove();
    });

    const newPositionLines: IPositionLineAdapter[] = [];

    if (positions) {
      positions.forEach((position) => {
        // Ignore positions about different pairs
        if (position.token.symbol !== token.symbol) {
          return;
        }

        const liquidationToken =
          position.liquidationPrice !== null &&
          typeof position.liquidationPrice !== 'undefined' &&
          tokenPrice !== null
            ? position.liquidationPrice / tokenPrice
            : null;

        newPositionLines.push(
          chart
            .createPositionLine({})
            .setText(
              `${token.symbol} ${
                position.side === 'long' ? 'Long' : 'Short'
              } Entry Price`,
            )
            .setLineLength(3)
            .setQuantity(formatPriceInfo(position.sizeUsd))
            .setPrice(position.price)
            .setLineColor(position.side === 'long' ? '#1d8c46' : '#ac302f')
            .setQuantityBackgroundColor(
              position.side === 'long' ? '#1d8c46a0' : '#ac302fa0',
            )
            .setQuantityBorderColor(
              position.side === 'long' ? '#22c55e' : '#c83a38',
            )
            .setBodyBorderColor(
              position.side === 'long' ? '#22c55e' : '#c83a38',
            )
            .setBodyBackgroundColor(
              position.side === 'long' ? '#1d8c46a0' : '#ac302fa0',
            )
            .setBodyTextColor('#ffffff'),
        );

        if (
          liquidationToken !== null &&
          typeof position.liquidationPrice !== 'undefined'
        )
          newPositionLines.push(
            chart
              .createPositionLine({})
              .setText(
                `${token.symbol} ${
                  position.side === 'long' ? 'Long' : 'Short'
                } Liquidation Price`,
              )
              .setLineLength(3)
              .setQuantity(formatPriceInfo(position.liquidationPrice, false, 3))
              .setPrice(position.liquidationPrice)
              .setLineColor(position.side === 'long' ? '#000f23' : '#000f23')
              .setQuantityBackgroundColor('#000f23a0')
              .setQuantityBorderColor('#939393')
              .setBodyBorderColor('#939393')
              .setBodyBackgroundColor('#000f23a0')
              .setBodyTextColor('#ffffff'),
          );
      });
    }

    setPositionLines(newPositionLines);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, token.symbol, tokenPrice, widget]);

  return (
    <div className="flex flex-col w-full overflow-hidden bg-gray-200/85 backdrop-blur-md">
      <div id="chart-area" className="h-full rounded-b-lg" />
      <div className="copyright text-[0.6em] bg-[#000f23] flex items-center justify-end italic pt-2 pb-2 pr-4 text-[#ffffffA0]">
        The chart is provided by TradingView, an advanced platform that provides
        unparalleled access to live data e.g.
        <Link
          href={`https://www.tradingview.com/symbols/${token.symbol}USD/`}
          target="__blank"
          className="ml-1 underline"
        >
          {token.symbol} USD chart
        </Link>
        .
      </div>
    </div>
  );
}
