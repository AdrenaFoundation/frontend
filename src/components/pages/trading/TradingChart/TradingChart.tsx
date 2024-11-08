import { PublicKey } from '@solana/web3.js';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import { PositionExtended, Token, TokenSymbol } from '@/types';
import { formatNumber, formatNumberShort, getTokenSymbol } from '@/utils';

import {
  EntityId,
  IChartingLibraryWidget,
  IChartWidgetApi,
  IPositionLineAdapter,
  ISymbolValueFormatter,
  PricedPoint,
  ResolutionString,
  SupportedLineTools,
} from '../../../../../public/charting_library/charting_library';
import datafeed from './datafeed';

let tvScriptLoadingPromise: Promise<unknown>;

type Widget = IChartingLibraryWidget;
const greenColor = '#07956be6';
const redColor = '#c9243ae6';
const greyColor = '#78828e';
const whiteColor = '#ffffff';
const orangeColor = '#f77f00';
const blueColor = '#3a86ff';

function createEntryPositionLine(
  chart: IChartWidgetApi,
  position: PositionExtended,
): IPositionLineAdapter {
  const color = position.side === 'long' ? greenColor : redColor;
  const label = getLabel(
    position.token.symbol,
    position.side,
    position.side === 'long' ? 'Long' : 'Short',
  );
  return chart
    .createPositionLine({})
    .setText(label)
    .setLineLength(3)
    .setPrice(position.price)
    .setLineColor(color)
    .setBodyBackgroundColor(color)
    .setBodyBorderColor(color)
    .setBodyTextColor(whiteColor)
    .setQuantity('$' + formatNumberShort(position.sizeUsd, 0))
    .setQuantityBackgroundColor(greyColor)
    .setQuantityBorderColor(greyColor);
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
      .setPrice(position.liquidationPrice!) // Price is checked before calling function
      .setLineColor(orangeColor)
      .setLineStyle(1)
      .setBodyBorderColor(orangeColor)
      .setBodyBackgroundColor(orangeColor)
      .setBodyTextColor(whiteColor)
      .setQuantity('$' + formatNumberShort(position.sizeUsd, 0))
      .setQuantityBackgroundColor(greyColor)
      .setQuantityBorderColor(greyColor)
  );
}

function getLabel(
  tokenSymbol: string,
  side: 'long' | 'short',
  type: 'SL' | 'TP' | 'Long' | 'Short',
): string {
  const symbol = getTokenSymbol(tokenSymbol);

  // Return the label for the position line
  if (type === 'Long' || type === 'Short') {
    return `${symbol} ${type}`;
  }

  // Return the label for the stop loss or take profit line
  const sideLabel = side === 'long' ? '' : '-Short';
  return `${symbol}${sideLabel}-${type}`;
}

function createTakeProfitPositionLine(
  chart: IChartWidgetApi,
  position: PositionExtended,
): IPositionLineAdapter {
  const label = getLabel(position.token.symbol, position.side, 'TP');
  return (
    chart
      .createPositionLine({})
      .setText(label)
      .setLineLength(3)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .setPrice(position.takeProfitLimitPrice!)
      .setLineColor(blueColor)
      .setLineStyle(1)
      .setBodyBorderColor(blueColor)
      .setBodyBackgroundColor(blueColor)
      .setBodyTextColor(whiteColor)
      .setQuantity('$' + formatNumberShort(position.sizeUsd, 0))
      .setQuantityBackgroundColor(greyColor)
      .setQuantityBorderColor(greyColor)
  );
}

function createStopLossPositionLine(
  chart: IChartWidgetApi,
  position: PositionExtended,
): IPositionLineAdapter {
  const label = getLabel(position.token.symbol, position.side, 'SL');
  return (
    chart
      .createPositionLine({})
      .setText(label)
      .setLineLength(3)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .setPrice(position.stopLossLimitPrice!)
      .setLineColor(blueColor)
      .setLineStyle(1)
      .setBodyBorderColor(blueColor)
      .setBodyBackgroundColor(blueColor)
      .setBodyTextColor(whiteColor)
      .setQuantity('$' + formatNumberShort(position.sizeUsd, 0))
      .setQuantityBackgroundColor(greyColor)
      .setQuantityBorderColor(greyColor)
  );
}

const STORAGE_KEY_RESOLUTION = 'trading_chart_resolution';

export default function TradingChart({
  token,
  positions,
}: {
  token: Token;
  positions: PositionExtended[] | null;
}) {
  const onLoadScriptRef: MutableRefObject<(() => void) | null> = useRef(null);

  const savedShapes = localStorage.getItem('chart_shapes');

  const [drawings, setDrawings] = useState<
    Record<
      TokenSymbol,
      {
        id: EntityId;
        name: Exclude<
          SupportedLineTools,
          'cursor' | 'dot' | 'arrow_cursor' | 'eraser' | 'measure' | 'zoom'
        >;
        points: PricedPoint[];
        symbol: TokenSymbol;
      }[]
    >
  >(savedShapes ? JSON.parse(savedShapes) : []);
  const [widget, setWidget] = useState<Widget | null>(null);
  const [widgetReady, setWidgetReady] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  type PositionLine = {
    position: PublicKey;
    liquidation?: IPositionLineAdapter;
    entry: IPositionLineAdapter;
    stopLoss?: IPositionLineAdapter;
    takeProfit?: IPositionLineAdapter;
  };

  const [positionLines, setPositionLines] = useState<{
    short: PositionLine | null;
    long: PositionLine | null;
  } | null>(null);

  // Retrieve saved resolution or default to 'H'
  const savedResolution = localStorage.getItem(STORAGE_KEY_RESOLUTION) || 'H';

  function modifyPositionLine(
    chart: IChartWidgetApi,
    position: PositionExtended | null,
    positionLine: PositionLine | null,
  ) {
    if (!position || !positionLine) return;

    positionLine.entry.setPrice(position.price);

    // Handle Liquidation
    if (!position.liquidationPrice) {
      if (positionLine.liquidation) {
        positionLine.liquidation.remove();
        positionLine.liquidation = undefined;
      }
    } else {
      if (positionLine.liquidation) {
        positionLine.liquidation.setPrice(position.liquidationPrice);
      } else {
        positionLine.liquidation = createLiquidationPositionLine(
          chart,
          position,
        );
      }
    }

    // Handle Take Profit
    if (!position.takeProfitIsSet || !position.takeProfitLimitPrice) {
      if (positionLine.takeProfit) {
        positionLine.takeProfit.remove();
        positionLine.takeProfit = undefined;
      }
    } else {
      if (positionLine.takeProfit) {
        positionLine.takeProfit.setPrice(position.takeProfitLimitPrice);
      } else {
        positionLine.takeProfit = createTakeProfitPositionLine(chart, position);
      }
    }

    // Handle Stop Loss
    if (!position.stopLossIsSet || !position.stopLossLimitPrice) {
      if (positionLine.stopLoss) {
        positionLine.stopLoss.remove();
        positionLine.stopLoss = undefined;
      }
    } else {
      if (positionLine.stopLoss) {
        positionLine.stopLoss.setPrice(position.stopLossLimitPrice);
      } else {
        positionLine.stopLoss = createStopLossPositionLine(chart, position);
      }
    }
  }

  useEffect(() => {
    function createWidget() {
      if (document.getElementById('chart-area') && 'TradingView' in window) {
        const widget = new window.TradingView.widget({
          container: 'chart-area',
          library_path: '/charting_library/',
          width: 100,
          height: 100,
          autosize: true,
          symbol: `Crypto.${getTokenSymbol(token.symbol)}/USD`,
          timezone: 'Etc/UTC',
          locale: 'en',
          toolbar_bg: '#171B26',
          datafeed,
          loading_screen: {
            backgroundColor: '#171B26',
            foregroundColor: '#171B26',
          },
          favorites: {
            intervals: ['1', '5', '15', '1h', '4h', 'D'] as ResolutionString[],
            chartTypes: ['Candles'],
          },
          disabled_features: [
            'header_symbol_search',
            'header_chart_type',
            'header_compare',
            'display_market_status',
            'create_volume_indicator_by_default',
            'header_undo_redo',
            'symbol_info',
            'symbol_info_long_description',
            'symbol_info_price_source',
          ],
          enabled_features: [
            'hide_left_toolbar_by_default',
            'header_indicators',
            'header_fullscreen_button',
            'header_settings',
          ],
          custom_css_url: '/tradingview.css',
          overrides: {
            'paneProperties.background': '#171B26',
            'paneProperties.backgroundType': 'solid',
            'paneProperties.legendProperties.showStudyArguments': false,
            'paneProperties.legendProperties.showStudyTitles': false,
            'paneProperties.legendProperties.showStudyValues': false,
            'paneProperties.legendProperties.showSeriesTitle': false,
            'paneProperties.legendProperties.showBarChange': false,
            'paneProperties.legendProperties.showSeriesOHLC': true,
            'mainSeriesProperties.priceLineColor': 'yellow',
          },
          theme: 'dark',
          interval: savedResolution as ResolutionString,
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

          widget.subscribe('drawing_event', () => {
            const allShapes = widget.activeChart().getAllShapes();
            const symbol = widget
              .activeChart()
              .symbol()
              .split('.')[1]
              .split('/')[0] as TokenSymbol;

            drawings[symbol] = allShapes.map((shape) => {
              return {
                id: shape.id,
                name: shape.name as Exclude<
                  SupportedLineTools,
                  | 'cursor'
                  | 'dot'
                  | 'arrow_cursor'
                  | 'eraser'
                  | 'measure'
                  | 'zoom'
                >,
                points: widget.activeChart().getShapeById(shape.id).getPoints(),
                symbol,
              };
            });

            const copiedDrawings = { ...drawings };

            setDrawings(drawings);

            localStorage.setItem(
              'chart_shapes',
              JSON.stringify(copiedDrawings),
            );
          });

          // Listen for resolution changes
          widget
            .activeChart()
            .onIntervalChanged()
            .subscribe(null, (newInterval: ResolutionString) => {
              localStorage.setItem(STORAGE_KEY_RESOLUTION, newInterval);
            });
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

  useEffect(() => {
    // add drawings if any
    if (widget && widgetReady) {
      const symbol = widget
        .activeChart()
        .symbol()
        .split('.')[1]
        .split('/')[0] as TokenSymbol;

      const savedDrawings = drawings[symbol];
      if (savedDrawings && savedDrawings.length > 0) {
        savedDrawings.forEach(({ name, points }) => {
          widget.activeChart().createMultipointShape(points, {
            shape: name,
          });
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetReady]);

  // When the token changes, we need to change the symbol of the widget so we only reload the chart
  useEffect(() => {
    setWidgetReady(false);

    widget?.setSymbol(
      `Crypto.${getTokenSymbol(token.symbol)}/USD`,
      savedResolution as ResolutionString,
      () => {
        setWidgetReady(true);
      },
    );

    // delete all positions on chart
    positionLines?.long?.entry.remove();
    positionLines?.short?.entry.remove();
    positionLines?.long?.liquidation?.remove();
    positionLines?.short?.liquidation?.remove();
    positionLines?.long?.takeProfit?.remove();
    positionLines?.short?.takeProfit?.remove();
    positionLines?.long?.stopLoss?.remove();
    positionLines?.short?.stopLoss?.remove();

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
        if (longPosition && !longPosition.pendingCleanupAndClose) {
          if (newPositionLines && newPositionLines?.long) {
            modifyPositionLine(chart, longPosition, newPositionLines.long);
          } else {
            newPositionLines.long = {
              entry: createEntryPositionLine(chart, longPosition),
              liquidation: longPosition.liquidationPrice
                ? createLiquidationPositionLine(chart, longPosition)
                : undefined,
              position: longPosition.pubkey,
              takeProfit:
                longPosition.takeProfitIsSet &&
                  longPosition.takeProfitLimitPrice &&
                  longPosition.takeProfitLimitPrice > 0
                  ? createTakeProfitPositionLine(chart, longPosition)
                  : undefined,
              stopLoss:
                longPosition.stopLossIsSet &&
                  longPosition.stopLossLimitPrice &&
                  longPosition.stopLossLimitPrice > 0
                  ? createStopLossPositionLine(chart, longPosition)
                  : undefined,
            };
          }
        } else if (newPositionLines.long) {
          newPositionLines.long.entry.remove();

          if (newPositionLines.long.liquidation)
            newPositionLines.long.liquidation.remove();
          if (newPositionLines.long.takeProfit)
            newPositionLines.long.takeProfit.remove();
          if (newPositionLines.long.stopLoss)
            newPositionLines.long.stopLoss.remove();

          newPositionLines.long = null;
        }

        // handle creation / modification / deletion for short positions
        if (shortPosition && !shortPosition.pendingCleanupAndClose) {
          if (newPositionLines && newPositionLines?.short) {
            modifyPositionLine(chart, shortPosition, newPositionLines.short);
          } else {
            newPositionLines.short = {
              entry: createEntryPositionLine(chart, shortPosition),
              liquidation: shortPosition.liquidationPrice
                ? createLiquidationPositionLine(chart, shortPosition)
                : undefined,
              position: shortPosition.pubkey,
              takeProfit:
                shortPosition.takeProfitIsSet &&
                  shortPosition.takeProfitLimitPrice &&
                  shortPosition.takeProfitLimitPrice > 0
                  ? createTakeProfitPositionLine(chart, shortPosition)
                  : undefined,
              stopLoss:
                shortPosition.stopLossIsSet &&
                  shortPosition.stopLossLimitPrice &&
                  shortPosition.stopLossLimitPrice > 0
                  ? createStopLossPositionLine(chart, shortPosition)
                  : undefined,
            };
          }
        } else if (newPositionLines.short) {
          newPositionLines.short.entry.remove();

          if (newPositionLines.short.liquidation)
            newPositionLines.short.liquidation.remove();
          if (newPositionLines.short.takeProfit)
            newPositionLines.short.takeProfit.remove();
          if (newPositionLines.short.stopLoss)
            newPositionLines.short.stopLoss.remove();

          newPositionLines.short = null;
        }
      }

      setPositionLines(newPositionLines);
    } catch {
      // ignore error due to conflicts with charts and react effects
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    positions,
    token.symbol,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!widget,
    widgetReady,
  ]);

  return (
    <div className="flex flex-col w-full overflow-hidden bg-secondary select-none">
      <Loader className={twMerge('mt-[20%]', isLoading ? '' : 'hidden')} />
      <div
        id="wrapper-trading-chart"
        className={twMerge(
          'h-full w-full flex flex-col',
          isLoading ? 'hidden' : '',
        )}
      >
        <div id="chart-area" className="h-full flex flex-col rounded-b-lg" />
      </div>
    </div>
  );
}
