import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import {
  blueColor,
  greenColor,
  orangeColor,
  purpleColor,
  redColor,
} from '@/constant';
import {
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
  | 'breakEven';

export type PositionChartLine = {
  id: EntityId;
  type: LineType;
  symbol: TokenSymbol;
  position: string;
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
}): EntityId {
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
    ) as EntityId;
  } catch (e) {
    console.error('[CHART] ERROR CREATING LINE', e);
    throw new Error(`Error drawing line: ${e}`);
  }
}

function getChartSymbol(chart: IChartWidgetApi): TokenSymbol {
  return chart.symbol().split('.')[1].split('/')[0];
}

// Delete all the lines that are not attached to an existing position
function deleteDetachedPositionLines(
  chart: IChartWidgetApi,
  PositionChartLines: PositionChartLine[],
  positions: PositionExtended[],
): PositionChartLine[] {
  return PositionChartLines.filter((line) => {
    // If the drawn line is not related to an existing position, delete it
    if (!positions.some((p) => p.pubkey.toBase58() == line.position)) {
      chart.removeEntity(line.id);
      return false;
    }

    return true;
  });
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

export function useChartDrawing({
  widget,
  widgetReady,
  positions,
  showBreakEvenLine,
  toggleSizeUsdInChart,
  // array to keep up to date so we know which line chart is related to positions
  positionLinesIdsRef,
  // called every time a drawing fails
  drawingErrorCallback,
}: {
  widget: IChartingLibraryWidget | null;
  widgetReady: boolean | null;
  positions: PositionExtended[] | null;
  showBreakEvenLine: boolean;
  toggleSizeUsdInChart: boolean;
  positionLinesIdsRef: React.MutableRefObject<EntityId[]>;
  drawingErrorCallback: () => void;
}): PositionChartLine[] {
  const [positionChartLines, setPositionChartLines] = useState<
    PositionChartLine[]
  >([]);

  const chart = widget && widgetReady ? widget.activeChart() : null;

  useEffect(() => {
    // Means chart got reset
    if (!widgetReady) {
      setPositionChartLines([]);
      positionLinesIdsRef.current = [];
    }
  }, [widgetReady]);

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

    console.log('CHART CHANGED');
  }, [chart]);

  useEffect(() => {
    if (!chart) return;

    try {
      const symbol = getChartSymbol(chart);

      // Delete lines that are not attached to an existing position
      let updatedPositionChartLines = deleteDetachedPositionLines(
        chart,
        positionChartLines,
        positions ?? [],
      );

      if (!positions) {
        positionLinesIdsRef.current = [];
        setPositionChartLines(updatedPositionChartLines);
        return;
      }

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
      positions.forEach((position) => {
        // Ignore positions that's not related to the current chart symbol
        if (
          getTokenSymbol(position.token.symbol).toLowerCase() !==
          symbol.toLowerCase()
        ) {
          return;
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
      });

      positionLinesIdsRef.current = updatedPositionChartLines.map((l) => l.id);

      setPositionChartLines(updatedPositionChartLines);
    } catch (e) {
      drawingErrorCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, positions, toggleSizeUsdInChart, showBreakEvenLine]);

  return positionChartLines;
}
