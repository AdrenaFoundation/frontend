import { useEffect, useState } from 'react';

import {
  blueColor,
  greenColor,
  orangeColor,
  purpleColor,
  redColor,
} from '@/constant';
import {
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
  value: number;
};

function drawHorizontalLine({
  chart,
  price,
  text,
  color,
  time,
  linestyle = 0,
  linewidth = 1,
  horzLabelsAlign = 'right',
}: {
  chart: IChartWidgetApi | null;
  price: number;
  text: string;
  color: string;
  time: Date;
  linestyle?: number;
  linewidth?: number;
  horzLabelsAlign?: 'left' | 'middle ' | 'right';
}): EntityId | null {
  if (chart === null) {
    throw new Error('Chart is not ready');
  }

  try {
    return chart.createShape(
      {
        time: new Date(time).getTime(),
        price,
      },
      {
        zOrder: 'top',
        shape: 'horizontal_line',
        lock: true,
        disableSelection: true,
        overrides: {
          linestyle,
          linewidth,
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
      console.log('limitOrder position type', line.orderId);
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
  positionChartLines,
  symbol,
  type,
  price,
  color,
  linestyle,
  linewidth,
  horzLabelsAlign,
}: {
  chart: IChartWidgetApi;
  position: PositionExtended;
  text: string;
  positionChartLines: PositionChartLine[];
  symbol: string;
  type: LineType;
  price?: number | null;
  color: string;
  linestyle: number;
  linewidth: number;
  horzLabelsAlign?: 'left' | 'middle ' | 'right';
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
    price,
    time: new Date(Number(position.nativeObject.openTime) * 1000),
    color,
    linestyle,
    linewidth,
    horzLabelsAlign,
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
  toggleSizeUsdInChart: boolean;
  positionChartLines: PositionChartLine[];
}): PositionChartLine[] {
  return handlePositionLine({
    ...params,
    type: 'liquidation',
    price: params.position.liquidationPrice,
    color: orangeColor,
    text: `${params.position.side} - liq${
      params.toggleSizeUsdInChart
        ? `: ${formatPriceInfo(params.position.sizeUsd, 0)}`
        : ''
    }`,
    linestyle: 1,
    linewidth: 1,
  });
}

function handlePositionTakeProfitLine(params: {
  chart: IChartWidgetApi;
  symbol: string;
  position: PositionExtended;
  toggleSizeUsdInChart: boolean;
  positionChartLines: PositionChartLine[];
}): PositionChartLine[] {
  return handlePositionLine({
    ...params,
    type: 'takeProfit',
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
}): PositionChartLine[] {
  return handlePositionLine({
    ...params,
    type: 'stopLoss',
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
  console.log('handleLimitOrderLine', order);
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

export function useChartDrawing({
  tokenSymbol,
  widget,
  widgetReady,
  positions,
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
  showBreakEvenLine: boolean;
  toggleSizeUsdInChart: boolean;
  limitOrders: LimitOrder[] | null;
  drawingErrorCallback: () => void;
}): PositionChartLine[] {
  const [positionChartLines, setPositionChartLines] = useState<
    PositionChartLine[]
  >([]);

  const [trickReload, setTrickReload] = useState<number>(0);

  const chart = widget && widgetReady ? widget.activeChart() : null;

  useEffect(
    () => {
      // Means chart got reset
      if (!widgetReady) {
        setPositionChartLines([]);
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
            shape.options.text.includes('short')
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

      setPositionChartLines(updatedPositionChartLines);

      /*       if (!positions && !limitOrders) {
        console.log(
          'no positions or limit orders, updating positionChartLines',
          updatedPositionChartLines,
        );
        setPositionChartLines(updatedPositionChartLines);
        return;
      }
 */
      // Remove all break even lines
      if (!showBreakEvenLine) {
        updatedPositionChartLines = positionChartLines.filter((line) => {
          if (line.type === 'breakEven') {
            chart.removeEntity(line.id);
            return false;
          }

          return true;
        });
      }

      // Draw lines for each position
      if (positions) {
        console.log('processing positions');
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
            chart,
            position,
            toggleSizeUsdInChart,
            positionChartLines: updatedPositionChartLines,
            symbol,
          });

          updatedPositionChartLines = handlePositionStopLossLine({
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
        console.log('processing limit orders');
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

      console.log('positions', positions);
      console.log('limitOrders', limitOrders);
      console.log('updatedPositionChartLines', updatedPositionChartLines);

      setPositionChartLines(updatedPositionChartLines);
    } catch (e) {
      console.log('CATCH ERROR', e);
      drawingErrorCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, positions, limitOrders, trickReload, showBreakEvenLine]);

  useEffect(() => {
    if (!chart) return;

    // Delete all lines to be redrawn
    deleteDetachedLines(chart, positionChartLines, [], []);

    setPositionChartLines([]);

    setTrickReload((prev) => prev + 1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleSizeUsdInChart, tokenSymbol]);

  return positionChartLines;
}
