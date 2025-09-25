import { useEffect, useRef, useState } from 'react';

import { ChartPreferences } from '@/components/pages/trading/TradingChart/types';
import {
  blueColor,
  greenColor,
  orangeColor,
  purpleColor,
  redColor,
} from '@/constant';
import {
  EnrichedPositionApi,
  LimitOrder,
  PositionExtended,
  TokenSymbol,
  TradingViewChartSavedDrawing,
} from '@/types';
import { formatPriceInfo, getTokenSymbol } from '@/utils';

import {
  EntityId,
  IChartingLibraryWidget,
  IChartWidgetApi,
} from '../../public/charting_library/charting_library';
import useTPSL from './useTPSL';

// Global variable to track temporary lines and cleanup
/*
const temporaryLinesCleanup: (() => void) | null = null;

 function showTemporaryPositionLines(
  chart: IChartWidgetApi,
  position: PositionExtended,
): void {
  // Clear any existing temporary lines first
  if (temporaryLinesCleanup) {
    temporaryLinesCleanup();
    temporaryLinesCleanup = null;
  }

  const lineIds: EntityId[] = [];
  const time = new Date(Number(position.nativeObject.openTime) * 1000);

  try {
    // Create entry line
    const entryId = drawHorizontalLine({
      chart,
      price: position.price,
      text: `🟢 WATCHED ${position.side.toUpperCase()} - Entry`,
      color: position.side === 'long' ? greenColor : redColor,
      time,
      linestyle: 0,
      linewidth: 2,
      showPrice: true,
    });
    if (entryId) lineIds.push(entryId);

    // Create liquidation line
    if (position.liquidationPrice) {
      const liquidationId = drawHorizontalLine({
        chart,
        price: position.liquidationPrice,
        text: `🔴 WATCHED ${position.side.toUpperCase()} - Liquidation`,
        color: orangeColor,
        time,
        linestyle: 1,
        linewidth: 2,
        showPrice: true,
      });
      if (liquidationId) lineIds.push(liquidationId);
    }

    // Create stop loss line
    if (position.stopLossLimitPrice) {
      const stopLossId = drawHorizontalLine({
        chart,
        price: position.stopLossLimitPrice,
        text: `🔵 WATCHED ${position.side.toUpperCase()} - Stop Loss`,
        color: blueColor,
        time,
        linestyle: 1,
        linewidth: 1,
        showPrice: true,
      });
      if (stopLossId) lineIds.push(stopLossId);
    }

    // Create take profit line
    if (position.takeProfitLimitPrice) {
      const takeProfitId = drawHorizontalLine({
        chart,
        price: position.takeProfitLimitPrice,
        text: `🔵 WATCHED ${position.side.toUpperCase()} - Take Profit`,
        color: blueColor,
        time,
        linestyle: 1,
        linewidth: 1,
        showPrice: true,
      });
      if (takeProfitId) lineIds.push(takeProfitId);
    }

    // Create break even line
    if (position.breakEvenPrice) {
      console.log(
        '[Chart]: Creating break even line at price:',
        position.breakEvenPrice,
      );
      const breakEvenId = drawHorizontalLine({
        chart,
        price: position.breakEvenPrice,
        text: `🟣 WATCHED ${position.side.toUpperCase()} - Break Even`,
        color: `${purpleColor}80`,
        time,
        linestyle: 2,
        linewidth: 1,
        showPrice: true,
        horzLabelsAlign: 'left',
      });
      if (breakEvenId) {
        console.log('[Chart]: Break even line created with ID:', breakEvenId);
        lineIds.push(breakEvenId);
      } else {
        console.warn('[Chart]: Failed to create break even line');
      }
    } else {
      console.log('[Chart]: No break even price available for position');
    }

    console.log('[Chart]: Created temporary lines:', lineIds);

    // Create cleanup function
    const cleanup = () => {
      console.log('[Chart]: Cleaning up temporary lines:', lineIds);
      lineIds.forEach((id, index) => {
        try {
          console.log(
            `[Chart]: Removing line ${index + 1}/${lineIds.length} with ID:`,
            id,
          );
          chart.removeEntity(id);
          console.log(`[Chart]: Successfully removed line with ID:`, id);
        } catch (error) {
          console.warn(`[Chart]: Error removing temporary line ${id}:`, error);
        }
      });
      console.log('[Chart]: Finished cleaning up all temporary lines');
    };

    // Set global cleanup reference
    temporaryLinesCleanup = cleanup;

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (temporaryLinesCleanup === cleanup) {
        cleanup();
        temporaryLinesCleanup = null;
        console.log('[Chart]: Auto-removed temporary lines after 10 seconds');
      }
    }, 10000);
  } catch (error) {
    console.error('[Chart]: Error creating temporary position lines:', error);
  }
} */

export type LineType =
  | 'liquidation'
  | 'takeProfit'
  | 'stopLoss'
  | 'entry'
  | 'breakEven'
  | 'limitOrderTrigger'
  | 'limitOrderLimit';

export type PositionChartLine = {
  id: EntityId;
  type: LineType;
  symbol: TokenSymbol;
  position: string;
  orderId?: number;
  color?: string;
  value: number;
};

function drawHorizontalLine({
  chart,
  price,
  text,
  color,
  time,
  title,
  showPrice = true,
  linestyle = 0,
  linewidth = 1,
  horzLabelsAlign = 'right',
  lock = true,
}: {
  chart: IChartWidgetApi | null;
  price: number;
  text: string;
  showPrice?: boolean;
  color: string;
  time: Date;
  title?: string;
  linestyle?: number;
  linewidth?: number;
  horzLabelsAlign?: 'left' | 'middle ' | 'right';
  lock?: boolean;
}): EntityId | null {
  if (chart === null) {
    throw new Error('Chart is not ready');
  }

  try {
    return chart.createShape(
      {
        time: new Date(time).getTime() / 1000,
        price,
      },
      {
        zOrder: 'top',
        shape: 'horizontal_line',
        lock,
        disableSelection: true,
        overrides: {
          linestyle,
          linewidth,
          title,
          showPrice: showPrice === false ? false : true,
          bold: true,
          linecolor: color,
          horzLabelsAlign,
          vertLabelsAlign: 'bottom',
          showLabel: true,
          fontsize: 10,
          textcolor: color,
          showInObjectsTree: true,
        },
        text,
      },
    );
  } catch (e) {
    console.error('[CHART] ERROR CREATING LINE', e);
    throw new Error(`Error drawing line: ${e}`);
  }
}

function drawHorizontalLineFromTradeStart({
  chart,
  price,
  text,
  color,
  startTime,
  title,
  showPrice = true,
  linestyle = 0,
  linewidth = 1,
  horzLabelsAlign = 'right',
  lock = true,
}: {
  chart: IChartWidgetApi | null;
  price: number;
  text: string;
  showPrice?: boolean;
  color: string;
  startTime: Date;
  title?: string;
  linestyle?: number;
  linewidth?: number;
  horzLabelsAlign?: 'left' | 'middle ' | 'right';
  lock?: boolean;
}): EntityId | null {
  if (chart === null) {
    throw new Error('Chart is not ready');
  }

  try {
    // Create a trend line that starts from trade open time and extends far into the future
    const startTimestamp = startTime.getTime() / 1000;
    const farFutureTimestamp = startTimestamp + 365 * 24 * 60 * 60; // 1 year in the future

    return chart.createMultipointShape(
      [
        {
          time: startTimestamp,
          price,
        },
        {
          time: farFutureTimestamp,
          price,
        },
      ],
      {
        zOrder: 'top',
        shape: 'trend_line',
        lock,
        disableSelection: true,
        overrides: {
          linestyle,
          linewidth,
          title,
          showPrice: showPrice === false ? false : true,
          bold: true,
          linecolor: color,
          horzLabelsAlign,
          vertLabelsAlign: 'bottom',
          showLabel: true,
          fontsize: 10,
          textcolor: color,
          showInObjectsTree: true,
        },
        text,
      },
    );
  } catch (e) {
    console.error('[CHART] ERROR CREATING TIME-BASED LINE', e);
    throw new Error(`Error drawing time-based line: ${e}`);
  }
}

function getChartSymbol(chart: IChartWidgetApi): TokenSymbol {
  return chart.symbol().split('.')[1].split('/')[0];
}

function deleteDetachedLines(
  chart: IChartWidgetApi,
  positionChartLines: PositionChartLine[],
  positions: PositionExtended[],
  limitOrders: LimitOrder[],
): PositionChartLine[] {
  const newPositionChartLines = positionChartLines.filter((line) => {
    if (line.type === 'limitOrderTrigger' || line.type === 'limitOrderLimit') {
      if (!limitOrders.some((order) => order.id === line.orderId)) {
        console.log(
          'limitOrder from line not found in the limitOrders array',
          line.orderId,
        );
        console.log('removing limitOrder line', line.id);

        try {
          chart.removeEntity(line.id);
        } catch (error) {
          console.warn(`Error removing limitOrder ${line.id}:`, error);
        }
        return false;
      }
      return true;
    }

    if (!positions.some((p) => p.pubkey.toBase58() === line.position)) {
      console.log('removing position line', line.id);
      try {
        chart.removeEntity(line.id);
      } catch (error) {
        console.warn(`Error removing position line ${line.id}:`, error);
      }
      return false;
    }
    return true;
  });

  return newPositionChartLines;
}

function handlePositionLine({
  chart,
  position,
  text,
  title,
  positionChartLines,
  symbol,
  type,
  price,
  lock = true,
  showPrice,
  color,
  linestyle,
  linewidth,
  horzLabelsAlign,
}: {
  chart: IChartWidgetApi;
  position: PositionExtended;
  text: string;
  title?: string;
  positionChartLines: PositionChartLine[];
  symbol: string;
  type: LineType;
  price?: number | null;
  showPrice?: boolean;
  color: string;
  linestyle: number;
  linewidth: number;
  horzLabelsAlign?: 'left' | 'middle ' | 'right';
  lock?: boolean;
}): PositionChartLine[] {
  const existingLineIndex = positionChartLines.findIndex(
    (line) =>
      line.position === position.pubkey.toBase58() && line.type === type,
  );

  // If price is not good, delete existing line
  if (typeof price === 'undefined' || price === null) {
    if (existingLineIndex !== -1) {
      chart.removeEntity(positionChartLines[existingLineIndex].id);

      return positionChartLines.filter(
        (l) => l.id !== positionChartLines[existingLineIndex].id,
      );
    }

    return positionChartLines;
  }

  if (
    existingLineIndex !== -1 &&
    positionChartLines[existingLineIndex].value === price
  ) {
    return positionChartLines;
  }

  if (existingLineIndex !== -1) {
    chart.removeEntity(positionChartLines[existingLineIndex].id);
  }

  const id = drawHorizontalLine({
    chart,
    text,
    title,
    price,
    showPrice,
    time: new Date(Number(position.nativeObject.openTime) * 1000),
    color,
    linestyle,
    linewidth,
    horzLabelsAlign,
    lock,
  });

  if (id === null) return positionChartLines;

  if (existingLineIndex !== -1) {
    positionChartLines[existingLineIndex].id = id;
    positionChartLines[existingLineIndex].value = price;
    positionChartLines[existingLineIndex].position = position.pubkey.toBase58();
    return positionChartLines;
  }

  positionChartLines.push({
    id,
    type,
    symbol,
    position: position.pubkey.toBase58(),
    value: price,
  });

  return positionChartLines;
}

function handlePositionEntryPriceLine(params: {
  chart: IChartWidgetApi;
  symbol: string;
  position: PositionExtended;
  toggleSizeUsdInChart: boolean;
  positionChartLines: PositionChartLine[];
}): PositionChartLine[] {
  return handlePositionLine({
    ...params,
    type: 'entry',
    price: params.position.price,
    color: params.position.side === 'long' ? greenColor : redColor,
    text: `${params.position.side}${
      params.toggleSizeUsdInChart
        ? `: ${formatPriceInfo(params.position.sizeUsd, 0)}`
        : ''
    }`,
    linestyle: 0,
    linewidth: 2,
  });
}

function handlePositionLiquidationLine(params: {
  chart: IChartWidgetApi;
  symbol: string;
  position: PositionExtended;
  color?: string;
  showPrice?: boolean;
  text?: string | null;
  title?: string;
  horzLabelsAlign?: 'left' | 'middle ' | 'right';
  toggleSizeUsdInChart: boolean;
  linestyle?: number;
  linewidth?: number;
  positionChartLines: PositionChartLine[];
}): PositionChartLine[] {
  return handlePositionLine({
    ...params,
    type: 'liquidation',
    price: params.position.liquidationPrice,
    color: params.color ?? orangeColor,
    showPrice: params.showPrice === false ? false : true,
    title: params.title,
    text:
      params.text === null
        ? ''
        : `${params.position.side} - liq${
            params.toggleSizeUsdInChart
              ? `: ${formatPriceInfo(params.position.sizeUsd, 0)}`
              : ''
          }`,
    horzLabelsAlign: params.horzLabelsAlign ?? 'right',
    linestyle: params?.linestyle ?? 1,
    linewidth: params?.linewidth ?? 1,
  });
}

function handlePositionTakeProfitLine(params: {
  chart: IChartWidgetApi;
  symbol: string;
  position: PositionExtended;
  toggleSizeUsdInChart: boolean;
  positionChartLines: PositionChartLine[];
  lock: boolean;
}): PositionChartLine[] {
  return handlePositionLine({
    ...params,
    type: 'takeProfit',
    lock: params.lock,
    price: params.position.takeProfitLimitPrice,
    color: blueColor,
    linestyle: 1,
    linewidth: 1,
    text: `${params.position.side} - TP${
      params.toggleSizeUsdInChart
        ? `: ${formatPriceInfo(params.position.sizeUsd, 0)}`
        : ''
    }`,
  });
}

function handlePositionStopLossLine(params: {
  chart: IChartWidgetApi;
  symbol: string;
  position: PositionExtended;
  toggleSizeUsdInChart: boolean;
  positionChartLines: PositionChartLine[];
  lock: boolean;
}): PositionChartLine[] {
  return handlePositionLine({
    ...params,
    type: 'stopLoss',
    lock: params.lock,
    price: params.position.stopLossLimitPrice,
    color: blueColor,
    linestyle: 1,
    linewidth: 1,
    text: `${params.position.side} - SL${
      params.toggleSizeUsdInChart
        ? `: ${formatPriceInfo(params.position.sizeUsd, 0)}`
        : ''
    }`,
  });
}

function handlePositionBreakEvenLine(params: {
  chart: IChartWidgetApi;
  symbol: string;
  position: PositionExtended;
  positionChartLines: PositionChartLine[];
}): PositionChartLine[] {
  return handlePositionLine({
    ...params,
    type: 'breakEven',
    price: params.position.breakEvenPrice,
    color: `${purpleColor}80`,
    linestyle: 2,
    linewidth: 1,
    text: `${params.position.side} - break even`,
    horzLabelsAlign: 'left',
  });
}

function handleLimitOrderLine({
  chart,
  order,
  positionChartLines,
  price,
  symbol,
  type,
}: {
  chart: IChartWidgetApi;
  order: LimitOrder;
  positionChartLines: PositionChartLine[];
  price: number;
  symbol: string;
  type: 'limitOrderTrigger' | 'limitOrderLimit';
}): PositionChartLine[] {
  const existingLineIndex = positionChartLines.findIndex(
    (line) => line.orderId === order.id && line.type === type,
  );

  // If price is not good, delete existing line
  if (typeof price === 'undefined' || price === null) {
    if (existingLineIndex !== -1) {
      chart.removeEntity(positionChartLines[existingLineIndex].id);

      return positionChartLines.filter(
        (l) => l.id !== positionChartLines[existingLineIndex].id,
      );
    }

    return positionChartLines;
  }

  if (
    existingLineIndex !== -1 &&
    positionChartLines[existingLineIndex].value === price
  ) {
    return positionChartLines;
  }

  if (existingLineIndex !== -1) {
    chart.removeEntity(positionChartLines[existingLineIndex].id);
  }

  const time = new Date();
  const text = `${order.side} limit order #${order.id}`;

  const id = drawHorizontalLine({
    chart,
    price,
    text,
    time,
    color: order.side === 'long' ? greenColor : redColor,
    linestyle: 2,
    linewidth: 1,
    horzLabelsAlign: 'right',
  });

  if (id === null) return positionChartLines;

  if (existingLineIndex !== -1) {
    positionChartLines[existingLineIndex].id = id;
    positionChartLines[existingLineIndex].value = price;
    positionChartLines[existingLineIndex].position = `limit-${order.id}`;
    positionChartLines[existingLineIndex].orderId = order.id;
    return positionChartLines;
  }

  positionChartLines.push({
    id,
    type,
    symbol,
    position: `limit-${order.id}`,
    orderId: order.id,
    value: price,
  });

  return positionChartLines;
}

const getLiquidationVisualProperties = (
  positionSizeUsd: number,
  minSizeUsd: number,
  maxSizeUsd: number,
) => {
  const normalizedSize =
    (positionSizeUsd - minSizeUsd) / (maxSizeUsd - minSizeUsd);

  if (normalizedSize < 0.05) {
    // Small liquidations: Light orange, thin
    return {
      color: 'rgba(255,225,183,0.3)',
      linewidth: 1,
      linestyle: 1,
      opacity: 0.2,
    };
  } else if (normalizedSize < 0.66) {
    // Medium liquidations: Medium orange, medium thickness
    return {
      color: 'rgba(255,190,98,0.4)',
      linewidth: 1,
      linestyle: 0,
      opacity: 0.5,
    };
  } else {
    // Large liquidations: Dark orange, thick
    return {
      color: 'rgba(255,148,0,0.5)',
      linewidth: 2,
      linestyle: 0,
      opacity: 0.7,
    };
  }
};

export function useChartDrawing({
  tokenSymbol,
  widget,
  widgetReady,
  positions,
  positionHistory,
  allActivePositions,
  chartPreferences,
  showBreakEvenLine,
  toggleSizeUsdInChart,
  limitOrders,
  // called every time a drawing fails
  drawingErrorCallback,
}: {
  tokenSymbol: TokenSymbol;
  widget: IChartingLibraryWidget | null;
  widgetReady: boolean | null;
  positions: PositionExtended[] | null;
  positionHistory: EnrichedPositionApi[] | null;
  allActivePositions: PositionExtended[] | null;
  chartPreferences: ChartPreferences;
  showBreakEvenLine: boolean;
  toggleSizeUsdInChart: boolean;
  limitOrders: LimitOrder[] | null;
  drawingErrorCallback: () => void;
}): PositionChartLine[] {
  const [positionChartLines, setPositionChartLines] = useState<
    PositionChartLine[]
  >([]);

  const [allActivePositionChartLines, setAllActivePositionChartLines] =
    useState<PositionChartLine[]>([]);

  const [trickReload, setTrickReload] = useState<number>(0);
  const chart = widget && widgetReady ? widget.activeChart() : null;

  const { updateTPSL } = useTPSL();

  // Use refs to access current data in event handlers without recreating subscriptions
  const positionsRef = useRef(positions);
  const chartPreferencesRef = useRef(chartPreferences);
  const dragEventCleanupRef = useRef<(() => void) | null>(null);
  const ongoingUpdatesRef = useRef<Set<string>>(new Set()); // Track ongoing updates

  // Keep refs updated
  positionsRef.current = positions;
  chartPreferencesRef.current = chartPreferences;

  useEffect(
    () => {
      // Means chart got reset
      if (!widgetReady) {
        setPositionChartLines([]);
        setAllActivePositionChartLines([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widgetReady],
  );

  // Redraw what was saved in local storage
  useEffect(() => {
    if (!chart) return;

    const symbol = getChartSymbol(chart);
    const parsedChartShapes = JSON.parse(
      localStorage.getItem('chart_drawings') ?? '{}',
    ) as TradingViewChartSavedDrawing;

    try {
      if (parsedChartShapes[symbol]) {
        parsedChartShapes[symbol].forEach((shape) => {
          if (
            shape.options.text.includes('long') ||
            shape.options.text.includes('short') ||
            shape.options.text.includes('WATCHED')
          )
            return;

          chart.createMultipointShape(shape.points, {
            zOrder: 'top',
            shape: shape.name,
            showInObjectsTree: true,
            overrides: {
              ...shape.options,
            },
            text: shape.options.text,
          });
        });
      }
      // Clean up any WATCHED lines from localStorage
      if (parsedChartShapes[symbol]) {
        const cleanedShapes = parsedChartShapes[symbol].filter(
          (shape) => !shape.options.text.includes('WATCHED'),
        );

        if (cleanedShapes.length !== parsedChartShapes[symbol].length) {
          console.log('[Chart]: Cleaned up WATCHED lines from localStorage');
          parsedChartShapes[symbol] = cleanedShapes;
          localStorage.setItem(
            'chart_drawings',
            JSON.stringify(parsedChartShapes),
          );
        }
      }
    } catch (error) {
      console.error('error', error);

      localStorage.setItem(
        'chart_drawings',
        JSON.stringify({ ...parsedChartShapes, [symbol]: [] }),
      );
    }
  }, [chart]);

  useEffect(() => {
    if (!chart) return;

    try {
      const symbol = getChartSymbol(chart);

      // Delete lines that are not attached to existing positions/orders
      let updatedPositionChartLines = deleteDetachedLines(
        chart,
        positionChartLines,
        positions ?? [],
        limitOrders ?? [],
      );

      if (!positions && !limitOrders) {
        setPositionChartLines(updatedPositionChartLines);
        return;
      }

      // Remove all break even lines
      if (!showBreakEvenLine) {
        updatedPositionChartLines = updatedPositionChartLines.filter((line) => {
          if (line.type === 'breakEven') {
            chart.removeEntity(line.id);
            return false;
          }

          return true;
        });
      }

      // Draw lines for each position
      if (positions) {
        for (const position of positions) {
          // Ignore positions that's not related to the current chart symbol
          if (
            getTokenSymbol(position.token.symbol).toLowerCase() !==
            symbol.toLowerCase()
          ) {
            continue;
          }

          updatedPositionChartLines = handlePositionEntryPriceLine({
            chart,
            position,
            toggleSizeUsdInChart,
            positionChartLines: updatedPositionChartLines,
            symbol,
          });

          updatedPositionChartLines = handlePositionLiquidationLine({
            chart,
            position,
            toggleSizeUsdInChart,
            positionChartLines: updatedPositionChartLines,
            symbol,
          });

          updatedPositionChartLines = handlePositionTakeProfitLine({
            lock: !chartPreferences.updateTPSLByDrag,
            chart,
            position,
            toggleSizeUsdInChart,
            positionChartLines: updatedPositionChartLines,
            symbol,
          });

          updatedPositionChartLines = handlePositionStopLossLine({
            lock: !chartPreferences.updateTPSLByDrag,
            chart,
            position,
            toggleSizeUsdInChart,
            positionChartLines: updatedPositionChartLines,
            symbol,
          });

          if (showBreakEvenLine)
            updatedPositionChartLines = handlePositionBreakEvenLine({
              chart,
              position,
              positionChartLines: updatedPositionChartLines,
              symbol,
            });
        }
      }

      // Handle limit order lines
      if (limitOrders) {
        for (const order of limitOrders) {
          if (order.custodySymbol.toLowerCase() === symbol.toLowerCase()) {
            updatedPositionChartLines = handleLimitOrderLine({
              chart,
              order,
              positionChartLines: updatedPositionChartLines,
              symbol,
              type: 'limitOrderTrigger',
              price: order.triggerPrice,
            });

            /*  updatedPositionChartLines = order.limitPrice
                  ? handleLimitOrderLine({
                      chart,
                      order,
                      positionChartLines: updatedPositionChartLines,
                      symbol,
                      type: 'limitOrderLimit',
                      price: order.limitPrice,
                    })
                  : updatedPositionChartLines; */
          }
        }
      }

      setPositionChartLines(updatedPositionChartLines);
    } catch (e) {
      console.log('CATCH ERROR', e);
      drawingErrorCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chart,
    positions,
    limitOrders,
    trickReload,
    chartPreferences.updateTPSLByDrag,
    showBreakEvenLine,
  ]);

  useEffect(() => {
    if (!chart || !widget || !widgetReady) return;
    chart.clearMarks(1);

    if (
      chartPreferences.showPositionHistory ||
      chartPreferences.showAllActivePositions
    ) {
      widget.activeChart().refreshMarks();

      /* // Subscribe to mark click events
      widget.subscribe('onMarkClick', (markId) => {
        console.log('[Chart]: Mark clicked with ID:', markId, typeof markId);

        // Clear any existing temporary lines when clicking any mark
        if (temporaryLinesCleanup) {
          temporaryLinesCleanup();
          temporaryLinesCleanup = null;
          console.log('[Chart]: Cleared temporary lines due to mark click');
        }

        let position: EnrichedPositionApi | null = null;

        // Check if we're showing active positions and try to find in allActivePositions first
        if (chartPreferences.showAllActivePositions && allActivePositions) {
          console.log(
            '[Chart]: Searching in active positions (markId is array index)',
          );
          const activePosition = allActivePositions[markId as number];
          if (activePosition) {
            console.log('[Chart]: Found active position:', activePosition);
            console.log('[Chart]: Showing temporary lines for active position');

            // Show liquidation, stop loss, take profit, and break even lines for 10 seconds
            showTemporaryPositionLines(chart, activePosition);
            return;
          }
        }

        // If not found in active positions, try position history
        if (!position && positionHistory) {
          console.log('[Chart]: Searching in position history');
          console.log(
            '[Chart]: Available history positions:',
            positionHistory.map((p) => ({
              positionId: p.positionId,
              pubkey: p.pubkey.toBase58(),
              type: typeof p.positionId,
            })),
          );

          // Try different ways to find the position in history
          const foundPosition = positionHistory.find(
            (p) => p.positionId === markId,
          );
          if (foundPosition) {
            position = foundPosition;
          } else {
            // Try with number conversion if markId is a string
            if (typeof markId === 'string') {
              const numericMarkId = Number(markId);
              if (!isNaN(numericMarkId)) {
                const foundByNumber = positionHistory.find(
                  (p) => p.positionId === numericMarkId,
                );
                if (foundByNumber) {
                  position = foundByNumber;
                }
              }
            }
          }

          if (!position) {
            // Try using pubkey field (convert PublicKey to string for comparison)
            const markIdStr = String(markId);
            const foundByPubkey = positionHistory.find(
              (p) => p.pubkey.toBase58() === markIdStr,
            );
            if (foundByPubkey) {
              position = foundByPubkey;
            }
          }
        }

        if (!position) {
          console.log('[Chart]: Position not found for mark ID:', markId);
          console.log(
            '[Chart]: Tried both active positions and position history',
          );
          return;
        }

        console.log('[Chart]: Found position:', position);

        const { exitDate, entryDate, entryPrice, exitPrice, side } = position;

        if (!exitDate || !entryDate) {
          console.log(
            '[Chart]: Missing entry or exit date for position:',
            position,
          );
          return;
        }

        console.log('[Chart]: Drawing position line for:', {
          id: markId,
          side,
          entryDate,
          exitDate,
          entryPrice,
          exitPrice,
        });

        try {
          // Validate required values
          if (!entryPrice || !exitPrice || !entryDate || !exitDate) {
            console.error('[Chart]: Missing required values for drawing:', {
              entryPrice,
              exitPrice,
              entryDate,
              exitDate,
            });
            return;
          }

          // Remove any existing position drawings for this position
          const existingShapes = chart.getAllShapes();
          existingShapes.forEach((shape) => {
            const shapeProps = chart.getShapeById(shape.id).getProperties();
            if (shapeProps.text && shapeProps.text.includes(`#${markId}`)) {
              chart.removeEntity(shape.id);
            }
          });

          // Calculate profit/loss
          const pnl =
            side === 'long' ? exitPrice - entryPrice : entryPrice - exitPrice;
          const pnlPercentage = ((pnl / entryPrice) * 100).toFixed(2);

          // Use exact times from the position data to align with marks
          // The marks are placed at these exact times, so our drawing should match
          const alignedEntryTime = Math.floor(
            new Date(entryDate).getTime() / 1000,
          );
          const alignedExitTime = Math.floor(
            new Date(exitDate).getTime() / 1000,
          );

          console.log('[Chart]: Shape data:', {
            originalEntryTime: Math.floor(new Date(entryDate).getTime() / 1000),
            originalExitTime: Math.floor(new Date(exitDate).getTime() / 1000),
            alignedEntryTime,
            alignedExitTime,
            entryPrice,
            exitPrice,
            side,
            pnl,
            pnlPercentage,
            resolution: chart.resolution(),
          });

          // First try a simple trend line to test if the basic functionality works
          console.log('[Chart]: Testing with trend line first...');
          let shapeId;

          try {
            // First create trend line (we know this works)
            shapeId = chart.createMultipointShape(
              [
                {
                  time: alignedEntryTime,
                  price: entryPrice,
                },
                {
                  time: alignedExitTime,
                  price: exitPrice,
                },
              ],
              {
                shape: 'trend_line',
                zOrder: 'top',
                showInObjectsTree: true,
                overrides: {
                  linecolor: side === 'long' ? greenColor : redColor,
                  linewidth: 3,
                  linestyle: 0,
                },
                text: `${side.toUpperCase()} #${markId} P&L: ${pnlPercentage}%`,
              },
            );
            console.log('[Chart]: Trend line created successfully:', shapeId);

            // Now try to replace it with a position shape
            console.log(
              '[Chart]: Now trying position shape with minimal config...',
            );
            try {
              const positionShapeId = chart.createMultipointShape(
                [
                  {
                    time: alignedEntryTime,
                    price: entryPrice,
                  },
                  {
                    time: alignedExitTime,
                    price: exitPrice,
                  },
                ],
                {
                  shape: side === 'long' ? 'long_position' : 'short_position',
                  zOrder: 'top',
                  showInObjectsTree: true,
                  // No overrides at all - let it use defaults
                },
              );

              if (positionShapeId) {
                console.log(
                  '[Chart]: Position shape created successfully:',
                  positionShapeId,
                );
                // Remove the trend line since position shape worked
                if (shapeId) {
                  chart.removeEntity(shapeId);
                }
                shapeId = positionShapeId;
              }
            } catch (positionError) {
              console.error(
                '[Chart]: Position shape failed, keeping trend line:',
                positionError,
              );
              // Keep the trend line since position shape failed
            }
          } catch (trendError) {
            console.error('[Chart]: Even basic trend line failed:', trendError);
            throw trendError;
          }

          console.log('[Chart]: Position drawing created with ID:', shapeId);

          // Optional: Auto-remove the drawing after some time
          if (shapeId) {
            setTimeout(() => {
              try {
                if (chart.getShapeById(shapeId)) {
                  chart.removeEntity(shapeId);
                  console.log(
                    '[Chart]: Auto-removed position drawing:',
                    shapeId,
                  );
                }
              } catch (error) {
                console.log(
                  '[Chart]: Error auto-removing position drawing:',
                  error,
                );
              }
            }, 10000); // Remove after 10 seconds
          }
        } catch (error) {
          console.error('[Chart]: Error creating position drawing:', error);
          drawingErrorCallback();
        }
      });*/
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chart,
    chartPreferences.showPositionHistory,
    // chartPreferences.showAllActivePositions, // disabled
    positionHistory,
    // allActivePositions, // disabled
  ]);

  useEffect(() => {
    if (!chart || !widget || !widgetReady) return;

    try {
      const symbol = getChartSymbol(chart);

      let drawnActivePositionLines: PositionChartLine[] = deleteDetachedLines(
        chart,
        allActivePositionChartLines,
        allActivePositions ?? [],
        [],
      );

      if (!allActivePositions) {
        setAllActivePositionChartLines(drawnActivePositionLines);
        return;
      }

      // Remove all liquidation lines
      if (!chartPreferences.showAllActivePositionsLiquidationLines) {
        widget
          .activeChart()
          .getAllShapes()
          .forEach((line) => {
            const shape = chart.getShapeById(line.id).getProperties();
            if (shape.title === 'all-active-positions-liquidation-line') {
              chart.removeEntity(line.id);
            }
          });
        setAllActivePositionChartLines([]);
        return;
      }

      const maxSizeUsd = Math.max(
        ...allActivePositions.map((p) => p.sizeUsd ?? 0),
      );
      const minSizeUsd = Math.min(
        ...allActivePositions.map((p) => p.sizeUsd ?? 0),
      );

      // Draw liquidation lines for all active positions
      for (const position of allActivePositions) {
        if (
          chartPreferences.showAllActivePositionsLiquidationLines &&
          position.liquidationPrice
        ) {
          // Check if line already exists for this position
          const existingLine = drawnActivePositionLines.find(
            (line) =>
              line.position === position.pubkey.toBase58() &&
              line.type === 'liquidation' &&
              line.value === position.liquidationPrice,
          );

          if (existingLine) {
            // Line already exists, skip creating a new one
            continue;
          }

          // Get visual properties based on position size USD (post-leverage)
          const visualProps = getLiquidationVisualProperties(
            position.sizeUsd ?? 0,
            minSizeUsd,
            maxSizeUsd,
          );

          // Create time-based liquidation line starting from trade open
          const positionOpenTime = new Date(
            Number(position.nativeObject.openTime) * 1000,
          );

          const id = drawHorizontalLineFromTradeStart({
            chart,
            text: '',
            title: 'all-active-positions-liquidation-line',
            price: position.liquidationPrice,
            showPrice: false,
            startTime: positionOpenTime,
            color: visualProps.color, // Make sure we're using the calculated color
            horzLabelsAlign: 'left',
            linestyle: visualProps.linestyle, // Make sure we're using the calculated linestyle
            linewidth: visualProps.linewidth, // Make sure we're using the calculated linewidth
            lock: true,
          });

          if (id) {
            drawnActivePositionLines.push({
              id,
              type: 'liquidation',
              symbol,
              position: position.pubkey.toBase58(),
              value: position.liquidationPrice,
            });
          }
        }
      }

      setAllActivePositionChartLines(drawnActivePositionLines);
    } catch (e) {
      console.log('CATCH ERROR', e);
      drawingErrorCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chart,
    allActivePositions,
    trickReload,
    chartPreferences.showAllActivePositionsLiquidationLines,
  ]);

  useEffect(() => {
    if (!chart) return;

    // Delete all lines to be redrawn
    deleteDetachedLines(chart, positionChartLines, [], []);
    deleteDetachedLines(chart, allActivePositionChartLines, [], []);

    // clear all marks
    chart.clearMarks(1);

    setPositionChartLines([]);
    chart.getAllShapes().forEach((line) => {
      const shape = chart.getShapeById(line.id).getProperties();
      if (shape.title === 'all-active-positions-liquidation-line') {
        chart.removeEntity(line.id);
      }
    });
    setAllActivePositionChartLines([]);

    setTrickReload((prev) => prev + 1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenSymbol]);

  useEffect(() => {
    if (!chart) return;
    // Delete all lines to be redrawn
    deleteDetachedLines(chart, positionChartLines, [], []);
    setPositionChartLines([]);
    setTrickReload((prev) => prev + 1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleSizeUsdInChart, chartPreferences.updateTPSLByDrag]);

  // Setup drag handling once when chart becomes readyAdd commentMore actions
  useEffect(() => {
    if (!chart || !widget || !widgetReady) return;

    // Setup drag handling once
    const setupDragHandling = () => {
      const handleDrawingEvent = (id: EntityId) => {
        setTimeout(() => {
          try {
            // Check if drag handling is enabled (using current ref value)
            if (!chartPreferencesRef.current.updateTPSLByDrag) return;

            const line = chart?.getShapeById(id);
            if (!line) return;

            const [points] = line.getPoints();
            const { price } = points;
            const shape = line.getProperties();
            const text = shape?.text;

            if (!(text?.includes('SL') || text?.includes('TP'))) return;

            const symbol = getChartSymbol(chart);
            const position = positionsRef.current?.find(
              (p) =>
                getTokenSymbol(p.token.symbol).toLowerCase() ===
                symbol.toLowerCase(),
            );

            const currentPrice = !text.includes('SL')
              ? position?.takeProfitLimitPrice
              : position?.stopLossLimitPrice;

            if (!position || currentPrice === price) return;

            const type = text.includes('SL') ? 'stopLoss' : 'takeProfit';
            const updateKey = `${position.pubkey.toBase58()}-${type}`;

            if (ongoingUpdatesRef.current.has(updateKey)) {
              return;
            }

            ongoingUpdatesRef.current.add(updateKey);

            updateTPSL(type, price, position)
              .then((isSuccess) => {
                if (!isSuccess && position) {
                  // If update failed, revert the line to the original position
                  line.setPoints([
                    {
                      time: Number(position.nativeObject.openTime) * 1000,
                      price:
                        type === 'stopLoss'
                          ? position.stopLossLimitPrice!
                          : position.takeProfitLimitPrice!,
                    },
                  ]);
                }
              })
              .finally(() => {
                ongoingUpdatesRef.current.delete(updateKey);
              });
          } catch (error) {
            console.log('Error handling drawing event:', error);
          }
        }, 200);
      };

      // Subscribe to drawing events
      widget.subscribe('drawing_event', handleDrawingEvent);

      // Return cleanup function
      return () => {
        if (widget) {
          try {
            widget.unsubscribe('drawing_event', handleDrawingEvent);
          } catch (error) {
            console.warn(
              'Error while unsubscribing from drawing_event:',
              error,
            );
          }
        }
      };
    };

    // Setup drag handling and store cleanup function
    dragEventCleanupRef.current = setupDragHandling();

    // Cleanup on unmount or when chart changes
    return () => {
      if (dragEventCleanupRef.current) {
        dragEventCleanupRef.current();
        dragEventCleanupRef.current = null;
      }
    };
  }, [chart, widget, widgetReady, updateTPSL]);

  return positionChartLines;
}
