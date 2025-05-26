import { debounce } from '@mui/material/utils';
import { useEffect, useState } from 'react';

import { ChartPreferences } from '@/components/pages/trading/TradingChart/types';
import {
  blueColor,
  greenColor,
  normalize,
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
  ILineDataSourceApi,
} from '../../public/charting_library/charting_library';
import useTPSL from './useTPSL';

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
    if (!chart || !widget || !widgetReady || !chartPreferences.updateTPSLByDrag)
      return;

    const symbol = getChartSymbol(chart);

    const debouncedUpdateTPSL = debounce(
      (
        line: ILineDataSourceApi,
        text: string,
        price: number,
        position: PositionExtended | null,
      ) => {
        const type = text.includes('SL') ? 'stopLoss' : 'takeProfit';
        updateTPSL(type, price, position).then((isSuccess) => {
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
        });
      },
      500,
    );

    widget.subscribe('drawing_event', (id) => {
      setTimeout(() => {
        try {
          const line = chart?.getShapeById(id);
          if (!line) return;

          const [points] = line.getPoints();
          const { price } = points;
          const shape = line.getProperties();

          const text = shape?.text;

          if (!(text?.includes('SL') || text?.includes('TP'))) return;

          const position = positions?.find(
            (p) =>
              getTokenSymbol(p.token.symbol).toLowerCase() ===
              symbol.toLowerCase(),
          );

          const currentPrice = !text.includes('SL')
            ? position?.takeProfitLimitPrice
            : position?.stopLossLimitPrice;

          if (!position || currentPrice === price) return;

          debouncedUpdateTPSL(line, text, price, position);
        } catch (error) {
          console.log('Error handling drawing event:', error);
        }
      }, 500);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetReady, chartPreferences.updateTPSLByDrag]);

  useEffect(() => {
    if (!chart || !widget || !widgetReady) return;
    chart.clearMarks(1);

    if (
      chartPreferences.showPositionHistory ||
      chartPreferences.showAllActivePositions
    ) {
      widget.activeChart().refreshMarks();

      // widget.subscribe('onMarkClick', (id) => {
      if (!positionHistory) return;

      //   const position = positionHistory.find((p) => p.positionId === id);
      //   if (!position) return;
      //   const { exitDate, entryDate } = position;

      //   const roundTimeToInterval = (time: Date) => {};

      //   // draw a position line
      //   console.log('drawing position line', {
      //     id: id,
      //     time: new Date(exitDate!).getTime() / 1000,
      //     entryDate,
      //   });

      //   console.log('position', position);

      //   widget.activeChart().createMultipointShape(
      //     [
      //       {
      //         time: Math.floor(new Date(entryDate).getTime()) / 1000,
      //         price: position.entryPrice,
      //       },
      //       {
      //         time: Math.floor(new Date(exitDate!).getTime()) / 1000,
      //         price: position.exitPrice,
      //       },
      //     ],
      //     {
      //       shape: 'long_position',
      //       overrides: {
      //         text: ``,
      //         // profitLevel:
      //       },
      //     },
      //   );
      // });
    }

    // widget.subscribe('mouse_down', () => {
    //   //get all shapes
    //   const shapes = chart.getAllShapes();
    //   console.log('shapes', shapes);

    //   const matchedShape = shapes.find(
    //     (shape) => shape.name === 'long_position',
    //   );
    //   if (matchedShape) {
    //     const points = chart.getShapeById(matchedShape.id).getPoints();
    //     const shape = chart.getShapeById(matchedShape.id).getProperties();
    //     console.log('shape', shape);
    //     console.log('points', points);
    //   }
    // });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chart,
    chartPreferences.showPositionHistory,
    chartPreferences.showAllActivePositions,
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

      // Draw liquidation lines for all active positions
      for (const position of allActivePositions) {
        if (
          chartPreferences.showAllActivePositionsLiquidationLines &&
          position.liquidationPrice
        ) {
          // add all liquidation lines
          const maxSize = Math.max(
            ...allActivePositions.map((p) => p.size ?? 0),
          );

          const minSize = Math.min(
            ...allActivePositions.map((p) => p.size ?? 0),
          );

          const linewidth = normalize(position.size, 1, 5, minSize, maxSize);

          // const orangeFaded = 'rgba(248, 128, 1, 0.3)';
          const orange = 'rgba(248, 128, 1, 0.7)';
          // const yellow = 'rgba(248, 128, 1, 1)';

          // const leverage = position.sizeUsd / position.collateralUsd;

          // const color = (() => {
          //   if (leverage < 25) return orangeFaded;
          //   if (leverage < 50) return orange;
          //   return yellow;
          // })();

          drawnActivePositionLines = handlePositionLiquidationLine({
            chart,
            position,
            toggleSizeUsdInChart,
            showPrice: false,
            text: null,
            title: 'all-active-positions-liquidation-line',
            color: orange,
            horzLabelsAlign: 'left',
            linestyle: 0,
            linewidth,
            positionChartLines: drawnActivePositionLines,
            symbol,
          });
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

  return positionChartLines;
}
