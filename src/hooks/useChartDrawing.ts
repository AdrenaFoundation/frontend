import { useCallback, useEffect, useState } from 'react';

import {
  blueColor,
  greenColor,
  orangeColor,
  purpleColor,
  redColor,
} from '@/constant';
import { PositionExtended, TokenSymbol } from '@/types';
import { formatNumberShort, getTokenSymbol } from '@/utils';

import {
  EntityId,
  IChartingLibraryWidget,
  PricedPoint,
  SupportedLineTools,
} from '../../public/charting_library/charting_library';

export function useChartDrawing({
  widget,
  widgetReady,
  positions,
  showBreakEvenLine,
}: {
  widget: IChartingLibraryWidget | null;
  widgetReady: boolean | null;
  positions: PositionExtended[] | null;
  showBreakEvenLine: boolean;
}) {
  useEffect(() => {
    if (!widgetReady || !widget) return;

    const symbol = widget
      .activeChart()
      .symbol()
      .split('.')[1]
      .split('/')[0] as TokenSymbol;
    const parsedChartShapes = JSON.parse(
      localStorage.getItem('chart_shapes') ?? '{}',
    );

    const currentShapes = widget.activeChart().getAllShapes();
    const currentShapesIds = currentShapes.map((shape) => shape.id);

    try {
      if (parsedChartShapes[symbol]) {
        console.log('drawings', parsedChartShapes[symbol]);
        parsedChartShapes[symbol].forEach((shape: any) => {
          if (!currentShapesIds.includes(shape.id)) {
            widget.activeChart().createMultipointShape(shape.points, {
              zOrder: 'top',
              shape: shape.name,
              showInObjectsTree: true,
              overrides: {
                ...shape.options,
              },
              text: shape.options.text,
            });
          }
        });
      }
    } catch (error) {
      console.error('error', error);

      localStorage.setItem(
        'chart_drawings',
        JSON.stringify({ ...parsedChartShapes, [symbol]: [] }),
      );
    }
  }, [widgetReady, widget]);

  // handles position lines
  useEffect(() => {
    if (!widgetReady || !widget || !positions) return;
    widget
      .activeChart()
      .getAllShapes()
      .filter((shape) => shape.name === 'horizontal_line')
      .forEach((line) => {
        const shape = widget
          .activeChart()
          .getShapeById(line.id)
          .getProperties();

        // TODO: revisit and refactor
        if (shape.text.includes('long') || shape.text.includes('short')) {
          widget.activeChart().removeEntity(line.id);
        }
      });

    positions.forEach((position) => {
      addHorizontalLine({
        id: `${position.token.symbol}-${position.side}` as EntityId,
        text: `${getTokenSymbol(position.token.symbol)} ${
          position.side
        }: $${formatNumberShort(position.sizeUsd, 0)}`,
        price: position.price,
        time: new Date(Number(position.nativeObject.openTime) * 1000),
        color: position.side === 'long' ? greenColor : redColor,
        linestyle: 0,
        linewidth: 2,
      });

      if (position?.liquidationPrice) {
        addHorizontalLine({
          id: `liq-${position.token.symbol}-${position.side}` as EntityId,
          text: `${position.side} – liq: $${formatNumberShort(
            position.sizeUsd,
            0,
          )}`,
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
          id: `tp-${position.token.symbol}-${position.side}` as EntityId,
          text: `${position.side} – TP: $${formatNumberShort(
            position.sizeUsd,
            0,
          )}`,
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
          id: `sl-${position.token.symbol}-${position.side}` as EntityId,
          text: `${position.side} – SL: $${formatNumberShort(
            position.sizeUsd,
            0,
          )}`,
          price: position.stopLossLimitPrice,
          time: new Date(Number(position.nativeObject.openTime) * 1000),
          color: blueColor,
          linestyle: 1,
          linewidth: 1,
        });
      }
    });
  }, [widgetReady, positions]);

  // handle break even lines
  useEffect(() => {
    if (!widgetReady || !widget || !positions) return;

    positions.forEach((position) => {
      if (showBreakEvenLine) {
        addHorizontalLine({
          id: `be-${position.token.symbol}-${position.side}` as EntityId,
          text: `${getTokenSymbol(position.token.symbol)} ${getTokenSymbol(
            position.side,
          )} – break even`,
          price: position.breakEvenPrice,
          time: new Date(Number(position.nativeObject.openTime) * 1000),
          color: `${purpleColor}80`,
          linestyle: 2,
          linewidth: 1,
        });
      } else {
        widget
          .activeChart()
          .getAllShapes()
          .filter((shape) => shape.name === 'horizontal_line')
          .forEach((line) => {
            const currentText = widget
              .activeChart()
              .getShapeById(line.id)
              .getProperties().text;

            if (currentText.includes('break even')) {
              widget.activeChart().removeEntity(line.id);
            }
          });
      }
    });
  }, [widgetReady, positions, showBreakEvenLine]);

  const addHorizontalLine = useCallback(
    ({
      id, // TODO: unique id for the position lines
      price,
      text,
      color,
      time,
      linestyle = 0,
      linewidth = 1,
    }: {
      id: EntityId;
      price: number;
      text: string;
      color: string;
      time: Date;
      linestyle?: number;
      linewidth?: number;
    }) => {
      if (!widget || !widgetReady) return;

      widget.activeChart().createShape(
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
            horzLabelsAlign: 'right',
            vertLabelsAlign: 'bottom',
            showLabel: true,
            fontsize: 10,
            textcolor: color,
            showInObjectsTree: true,
          },
          text,
        },
      );
    },
    [widget, widgetReady],
  );
}
