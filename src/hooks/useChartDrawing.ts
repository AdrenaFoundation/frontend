import { useEffect, useMemo, useRef, useState } from 'react';

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

// Constants for liquidation heatmap configuration
const LIQUIDATION_LINE_CONFIG = {
  EXPONENTIAL_POWER: 0.2,
  TRANSPARENCY: 0.45,
  LINE_WIDTH: 2,
  LINE_STYLE: 0,
  UPDATE_INTERVAL: 60000, // 1 minute
  FAR_FUTURE_DAYS: 365,
} as const;

// Type definitions for liquidation heatmap
type LiquidationVisualProps = {
  color: string;
  linewidth: number;
  linestyle: number;
};

type LiquidationLineParams = {
  chart: IChartWidgetApi;
  price: number;
  startTime: Date;
  color: string;
  linewidth: number;
  positionId: string;
};

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

/**
 * Creates a liquidation heatmap line with exponential color distribution
 * @param positionSizeUsd - Position size in USD for color calculation
 * @param minSizeUsd - Minimum position size for normalization
 * @param maxSizeUsd - Maximum position size for normalization
 * @returns Visual properties for the liquidation line
 */
const getLiquidationVisualProperties = (
  positionSizeUsd: number,
  minSizeUsd: number,
  maxSizeUsd: number,
): LiquidationVisualProps => {
  // Handle edge case where all positions have the same size
  if (maxSizeUsd === minSizeUsd) {
    return {
      color: '#FFFF0073', // Bright yellow with 45% transparency
      linewidth: LIQUIDATION_LINE_CONFIG.LINE_WIDTH,
      linestyle: LIQUIDATION_LINE_CONFIG.LINE_STYLE,
    };
  }

  // Use exponential distribution for better color spread
  const normalizedSize =
    (positionSizeUsd - minSizeUsd) / (maxSizeUsd - minSizeUsd);
  const exponentialSize = Math.pow(
    normalizedSize,
    LIQUIDATION_LINE_CONFIG.EXPONENTIAL_POWER,
  );

  // Continuous gradient from dark red (smallest) to bright yellow (biggest)
  // Dark red: rgb(139, 0, 0) -> Bright yellow: rgb(255, 255, 0)
  const red = Math.round(139 + 116 * exponentialSize);
  const green = Math.round(0 + 255 * exponentialSize);
  const blue = 0;
  const alpha = Math.round(LIQUIDATION_LINE_CONFIG.TRANSPARENCY * 255);

  return {
    color: `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}${alpha.toString(16).padStart(2, '0')}`,
    linewidth: LIQUIDATION_LINE_CONFIG.LINE_WIDTH,
    linestyle: LIQUIDATION_LINE_CONFIG.LINE_STYLE,
  };
};

/**
 * Creates a liquidation heatmap line with squared appearance
 * @param params - Parameters for creating the liquidation line
 * @returns EntityId of the created line or null if failed
 */
const createLiquidationLine = (
  params: LiquidationLineParams,
): EntityId | null => {
  try {
    const { chart, price, startTime, color, linewidth, positionId } = params;
    const startTimestamp = startTime.getTime() / 1000;
    const farFutureTimestamp =
      startTimestamp + LIQUIDATION_LINE_CONFIG.FAR_FUTURE_DAYS * 24 * 60 * 60;

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
        lock: true,
        disableSelection: true,
        overrides: {
          linestyle: LIQUIDATION_LINE_CONFIG.LINE_STYLE,
          linewidth,
          linecolor: color,
          showPrice: false,
          showLabel: false,
          showInObjectsTree: false,
        },
        text: `liquidation-heatmap-${positionId}`,
      },
    );
  } catch (error) {
    console.error('[HEATMAP] Error creating liquidation line:', error);
    return null;
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
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chart,
    chartPreferences.showPositionHistory,
    // chartPreferences.showAllActivePositions, // disabled
    positionHistory,
    // allActivePositions, // disabled
  ]);

  // Add a time-based state to trigger updates
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Update current time every minute to refresh liquidation lines
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, LIQUIDATION_LINE_CONFIG.UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Memoize expensive calculations for liquidation heatmap
  const { maxSizeUsd, minSizeUsd } = useMemo(() => {
    if (!allActivePositions?.length) return { maxSizeUsd: 0, minSizeUsd: 0 };

    const sizes = allActivePositions.map((p) => p.sizeUsd ?? 0);
    return {
      maxSizeUsd: Math.max(...sizes),
      minSizeUsd: Math.min(...sizes),
    };
  }, [allActivePositions]);

  /**
   * Cleans up all existing liquidation lines from the chart
   */
  const cleanupLiquidationLines = (chart: IChartWidgetApi) => {
    chart.getAllShapes().forEach((line) => {
      const shape = chart.getShapeById(line.id).getProperties();
      if (shape.text?.includes('liquidation-heatmap-')) {
        try {
          chart.removeEntity(line.id);
        } catch (e) {
          // Line might already be removed
        }
      }
    });
  };

  // Liquidation heatmap effect
  useEffect(() => {
    if (!chart || !widget || !widgetReady) return;

    try {
      const symbol = getChartSymbol(chart);

      // Clean up ALL existing liquidation lines first
      cleanupLiquidationLines(chart);

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

      // Remove all liquidation lines when disabled
      if (!chartPreferences.showAllActivePositionsLiquidationLines) {
        widget
          .activeChart()
          .getAllShapes()
          .forEach((line) => {
            const shape = chart.getShapeById(line.id).getProperties();
            // Check for both old and new liquidation line patterns
            if (
              shape.title === 'all-active-positions-liquidation-line' ||
              shape.text?.includes('liquidation-heatmap-')
            ) {
              chart.removeEntity(line.id);
            }
          });
        setAllActivePositionChartLines([]);
        return;
      }

      // Draw liquidation lines for all active positions
      for (const position of allActivePositions) {
        if (
          chartPreferences.showAllActivePositionsLiquidationLines &&
          position.liquidationPrice
        ) {
          // Remove existing line for this position first
          const existingLineIndex = drawnActivePositionLines.findIndex(
            (line) =>
              line.position === position.pubkey.toBase58() &&
              line.type === 'liquidation',
          );

          if (existingLineIndex !== -1) {
            // Remove the existing line from chart and state
            try {
              chart.removeEntity(
                drawnActivePositionLines[existingLineIndex].id,
              );
            } catch (e) {
              // Line might already be removed
            }
            drawnActivePositionLines.splice(existingLineIndex, 1);
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

          const id = createLiquidationLine({
            chart,
            price: position.liquidationPrice,
            startTime: positionOpenTime,
            color: visualProps.color,
            linewidth: visualProps.linewidth,
            positionId: position.pubkey.toBase58(),
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
    currentTime,
    maxSizeUsd,
    minSizeUsd,
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
      // Clean up both old and new liquidation line patterns
      if (
        shape.title === 'all-active-positions-liquidation-line' ||
        shape.text?.includes('liquidation-heatmap-')
      ) {
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
