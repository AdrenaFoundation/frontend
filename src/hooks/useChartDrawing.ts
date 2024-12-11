import { use, useCallback, useEffect } from 'react';

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
} from '../../public/charting_library/charting_library';

export function useChartDrawing({
  widget,
  widgetReady,
  positions,
  showBreakEvenLine,
  activePositionLineIDs,
  breakEvenLinesID,
  toggleSizeUsdInChart,
}: {
  widget: IChartingLibraryWidget | null;
  widgetReady: boolean | null;
  positions: PositionExtended[] | null;
  showBreakEvenLine: boolean;
  activePositionLineIDs: React.MutableRefObject<EntityId[]>;
  breakEvenLinesID: React.MutableRefObject<EntityId[]>;
  toggleSizeUsdInChart: boolean;
}) {
  const chart = widget && widgetReady ? widget.activeChart() : null;

  useEffect(() => {
    if (!widgetReady || !chart) return;

    const symbol = chart.symbol().split('.')[1].split('/')[0] as TokenSymbol;
    const parsedChartShapes = JSON.parse(
      localStorage.getItem('chart_drawings') ?? '{}',
    ) as TradingViewChartSavedDrawing;

    try {
      chart.getAllShapes().forEach((line) => {
        if (
          !(
            activePositionLineIDs.current.includes(line.id) ||
            breakEvenLinesID.current.includes(line.id)
          )
        ) {
          chart.removeEntity(line.id);
        }
      });

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
  }, [widgetReady, chart]);

  // handles position lines
  useEffect(() => {
    if (!widgetReady || !chart) return;
    const symbol = chart.symbol().split('.')[1].split('/')[0] as TokenSymbol;

    chart.getAllShapes().forEach((shape) => {
      if (
        shape.name === 'horizontal_line' &&
        activePositionLineIDs.current.includes(shape.id)
      ) {
        chart.removeEntity(shape.id);

        activePositionLineIDs.current = activePositionLineIDs.current.filter(
          (id) => id !== shape.id,
        );
      }
    });

    if (!positions) return;

    setTimeout(() => {
      positions.forEach((position) => {
        if (
          getTokenSymbol(position.token.symbol).toLowerCase() !==
          symbol.toLowerCase()
        )
          return;

        addHorizontalLine({
          text: `${position.side}${
            toggleSizeUsdInChart
              ? `: ${formatPriceInfo(position.sizeUsd, 0)}`
              : ''
          }`,
          price: position.price,
          time: new Date(Number(position.nativeObject.openTime) * 1000),
          color: position.side === 'long' ? greenColor : redColor,
          linestyle: 0,
          linewidth: 2,
        });

        if (position?.liquidationPrice) {
          addHorizontalLine({
            text: `${position.side} – liq${
              toggleSizeUsdInChart
                ? `: ${formatPriceInfo(position.sizeUsd, 0)}`
                : ''
            }`,
            price: position.liquidationPrice,
            time: new Date(Number(position.nativeObject.openTime) * 1000),
            color: orangeColor,
            linestyle: 1,
            linewidth: 1,
          });
        }

        if (
          position.takeProfitIsSet &&
          position?.takeProfitLimitPrice &&
          position.takeProfitLimitPrice > 0
        ) {
          addHorizontalLine({
            text: `${position.side} – TP${
              toggleSizeUsdInChart
                ? `: ${formatPriceInfo(position.sizeUsd, 0)}`
                : ''
            }`,
            price: position.takeProfitLimitPrice,
            time: new Date(Number(position.nativeObject.openTime) * 1000),
            color: blueColor,
            linestyle: 1,
            linewidth: 1,
          });
        }

        if (
          position.stopLossIsSet &&
          position?.stopLossLimitPrice &&
          position.stopLossLimitPrice > 0
        ) {
          addHorizontalLine({
            text: `${position.side} – SL${
              toggleSizeUsdInChart
                ? `: ${formatPriceInfo(position.sizeUsd, 0)}`
                : ''
            }`,
            price: position.stopLossLimitPrice,
            time: new Date(Number(position.nativeObject.openTime) * 1000),
            color: blueColor,
            linestyle: 1,
            linewidth: 1,
          });
        }
      });
    }, 100);
  }, [chart, widgetReady, positions, toggleSizeUsdInChart]);

  // handle break even lines
  useEffect(() => {
    if (!widgetReady || !chart || !positions) return;
    const symbol = chart.symbol().split('.')[1].split('/')[0] as TokenSymbol;

    chart.getAllShapes().forEach((shape) => {
      if (
        shape.name === 'horizontal_line' &&
        breakEvenLinesID.current.includes(shape.id)
      ) {
        chart.removeEntity(shape.id);

        breakEvenLinesID.current = breakEvenLinesID.current.filter(
          (id) => id !== shape.id,
        );
      }
    });

    if (showBreakEvenLine) {
      positions.forEach((position) => {
        if (
          getTokenSymbol(position.token.symbol).toLowerCase() !==
          symbol.toLowerCase()
        )
          return;

        addHorizontalLine({
          text: `${getTokenSymbol(position.side)} – break even`,
          price: position.breakEvenPrice,
          time: new Date(Number(position.nativeObject.openTime) * 1000),
          color: `${purpleColor}80`,
          linestyle: 2,
          linewidth: 1,
          horzLabelsAlign: 'left',
        });
      });
    }
  }, [chart, widgetReady, positions, showBreakEvenLine]);

  const addHorizontalLine = useCallback(
    ({
      price,
      text,
      color,
      time,
      linestyle = 0,
      linewidth = 1,
      horzLabelsAlign = 'right',
    }: {
      price: number;
      text: string;
      color: string;
      time: Date;
      linestyle?: number;
      linewidth?: number;
      horzLabelsAlign?: 'left' | 'middle ' | 'right';
    }) => {
      if (!chart || !widgetReady) return;

      const lineID = chart.createShape(
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

      if (text.includes('break even')) {
        breakEvenLinesID.current = [...breakEvenLinesID.current, lineID];
      } else {
        activePositionLineIDs.current = [
          ...activePositionLineIDs.current,
          lineID,
        ];
      }
    },
    [chart, widgetReady],
  );
}
