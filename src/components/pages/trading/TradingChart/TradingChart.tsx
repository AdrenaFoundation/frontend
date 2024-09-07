import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import { PositionExtended, Token } from '@/types';
import { formatNumber } from '@/utils';

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
const greenColor = '#07956be6';
const redColor = '#c9243ae6';
const greyColor = '#78828e';
const whiteColor = '#ffffff';

function createEntryPositionLine(
  chart: IChartWidgetApi,
  position: PositionExtended,
): IPositionLineAdapter {
  const color = position.side === 'long' ? greenColor : redColor;
  return chart
    .createPositionLine({})
    .setText(`${position.side === 'long' ? 'Long' : 'Short'} Open`)
    .setLineLength(3)
    .setQuantity(formatNumber(position.sizeUsd, 2))
    .setPrice(position.price)
    .setLineColor(color)
    .setQuantityBackgroundColor(color)
    .setBodyBackgroundColor(color)
    .setBodyBorderColor(color)
    .setQuantityBorderColor(color)
    .setBodyTextColor(whiteColor)
    .setQuantityTextColor(whiteColor);
}

function createLiquidationPositionLine(
  chart: IChartWidgetApi,
  position: PositionExtended,
): IPositionLineAdapter {
  return (
    chart
      .createPositionLine({})
      .setText(`${position.side === 'long' ? 'Long' : 'Short'} Liq.`)
      .setLineLength(3)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .setQuantity(formatNumber(position.liquidationPrice!, 2)) // Price is checked before calling function
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .setPrice(position.liquidationPrice!) // Price is checked before calling function
      .setLineColor(greyColor)
      .setLineStyle(2)
      .setQuantityBackgroundColor(greyColor)
      .setQuantityBorderColor(greyColor)
      .setBodyBorderColor(greyColor)
      .setBodyBackgroundColor(greyColor)
      .setBodyTextColor(whiteColor)
  );
}

export default function TradingChart({
  token,
  positions,
}: {
  token: Token;
  positions: PositionExtended[] | null;
}) {
  const onLoadScriptRef: MutableRefObject<(() => void) | null> = useRef(null);
  const [widget, setWidget] = useState<Widget | null>(null);
  const [widgetReady, setWidgetReady] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  type PositionLine = {
    position: PublicKey;
    liquidation?: IPositionLineAdapter;
    entry: IPositionLineAdapter;
  };

  const [positionLines, setPositionLines] = useState<{
    short: PositionLine | null;
    long: PositionLine | null;
  } | null>(null);

  function modifyPositionLine(
    chart: IChartWidgetApi,
    position: PositionExtended | null,
    positionLine: PositionLine | null,
  ) {
    if (!position || !positionLine) return;

    positionLine.entry.setPrice(position.price);
    positionLine.entry.setQuantity(formatNumber(position.sizeUsd, 2));

    // if liquidationPrice is not set, remove liquidation directly
    if (!position.liquidationPrice) {
      if (positionLine.liquidation) positionLine.liquidation.remove();
      return;
    }

    // if liquidation is set, update it
    if (positionLine.liquidation) {
      positionLine.liquidation.setPrice(position.liquidationPrice);
      positionLine.liquidation.setQuantity(
        formatNumber(position.liquidationPrice, 2),
      );
    } else createLiquidationPositionLine(chart, position);
  }

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
          toolbar_bg: '#061018',
          datafeed,
          loading_screen: {
            backgroundColor: '#061018',
            foregroundColor: '#061018',
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
            'paneProperties.background': '#061018',
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
                  return formatNumber(price, 2, 2, 8);
                },
              };
            },
          },
        });

        widget.onChartReady(() => {
          setWidgetReady(true);
          setIsLoading(false);
        });

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
  }, []);

  // When the token changes, we need to change the symbol of the widget so we only reload the chart
  useEffect(() => {
    setWidgetReady(false);

    widget?.setSymbol(
      `Crypto.${token.symbol}/USD`,
      'D' as ResolutionString,
      () => {
        setWidgetReady(true);
      },
    );

    // delete all positions on chart
    positionLines?.long?.entry.remove();
    positionLines?.short?.entry.remove();
    positionLines?.long?.liquidation?.remove();
    positionLines?.short?.liquidation?.remove();

    setPositionLines(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token.symbol]);

  useEffect(() => {
    try {
      if (!widget || !widgetReady) return;

      const chart: IChartWidgetApi = widget.activeChart();

      const newPositionLines = positionLines ?? {
        short: null,
        long: null,
      };

      if (positions) {
        const longPosition =
          positions.find(
            (position) =>
              position.token.symbol === token.symbol &&
              position.side === 'long',
          ) ?? null;
        const shortPosition =
          positions.find(
            (position) =>
              position.token.symbol === token.symbol &&
              position.side === 'short',
          ) ?? null;

        // handle creation / modification / deletion for long positions
        if (longPosition) {
          if (newPositionLines && newPositionLines?.long) {
            modifyPositionLine(chart, longPosition, newPositionLines.long);
          } else {
            newPositionLines.long = {
              entry: createEntryPositionLine(chart, longPosition),
              liquidation: longPosition.liquidationPrice
                ? createLiquidationPositionLine(chart, longPosition)
                : undefined,
              position: longPosition.pubkey,
            };
          }
        } else if (newPositionLines.long) {
          newPositionLines.long.entry.remove();
          if (newPositionLines.long.liquidation)
            newPositionLines.long.liquidation.remove();
          newPositionLines.long = null;
        }

        // handle creation / modification / deletion for short positions
        if (shortPosition) {
          if (newPositionLines && newPositionLines?.short) {
            modifyPositionLine(chart, shortPosition, newPositionLines.short);
          } else {
            newPositionLines.short = {
              entry: createEntryPositionLine(chart, shortPosition),
              liquidation: shortPosition.liquidationPrice
                ? createLiquidationPositionLine(chart, shortPosition)
                : undefined,
              position: shortPosition.pubkey,
            };
          }
        } else if (newPositionLines.short) {
          newPositionLines.short.entry.remove();
          if (newPositionLines.short.liquidation)
            newPositionLines.short.liquidation.remove();
          newPositionLines.short = null;
        }
      }

      setPositionLines(newPositionLines);
    } catch {
      // ignore error due to conflicts with charts and react effects
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, token.symbol, !!widget, widgetReady]);

  return (
    <div className="flex flex-col w-full overflow-hidden bg-secondary backdrop-blur-md">
      <Loader className={twMerge('mt-[20%]', isLoading ? '' : 'hidden')} />
      <div
        id="wrapper-trading-chart"
        className={twMerge(
          'h-full w-full flex flex-col',
          isLoading ? 'hidden' : '',
        )}
      >
        <div id="chart-area" className="h-full flex flex-col rounded-b-lg" />
        <div className="copyright text-[0.5em] bg-secondary flex items-center text-center italic pt-2 pb-2 pr-4 text-[#ffffffA0] justify-center md:justify-end">
          The chart is provided by TradingView, an advanced platform that
          provides unparalleled access to live data e.g.
          <Link
            href={`https://www.tradingview.com/symbols/${token.symbol}USD/`}
            target="__blank"
            className="ml-1 underline"
          >
            {token.symbol} USD chart
          </Link>
        </div>
      </div>
    </div>
  );
}
