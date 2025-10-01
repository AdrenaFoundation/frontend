import { useEffect, useMemo, useState } from 'react';

import { ChartPreferences } from '@/components/pages/trading/TradingChart/types';
import { PositionExtended, TokenSymbol } from '@/types';

import {
  EntityId,
  IChartingLibraryWidget,
  IChartWidgetApi,
} from '../../public/charting_library/charting_library';

// Constants for liquidation heatmap configuration
const LIQUIDATION_LINE_CONFIG = {
  EXPONENTIAL_POWER: 0.2,
  TRANSPARENCY: 0.45,
  LINE_WIDTH: 2,
  LINE_STYLE: 0,
  UPDATE_INTERVAL: 60000, // 1 minute
} as const;

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

export type LiquidationChartLine = {
  id: EntityId;
  symbol: TokenSymbol;
  position: string;
  value: number;
};

/**
 * Creates a liquidation heatmap line with exponential color distribution
 */
const getLiquidationVisualProperties = (
  positionSizeUsd: number,
  minSizeUsd: number,
  maxSizeUsd: number,
): LiquidationVisualProps => {
  if (maxSizeUsd === minSizeUsd) {
    return {
      color: '#FFFF0073',
      linewidth: LIQUIDATION_LINE_CONFIG.LINE_WIDTH,
      linestyle: LIQUIDATION_LINE_CONFIG.LINE_STYLE,
    };
  }

  const normalizedSize =
    (positionSizeUsd - minSizeUsd) / (maxSizeUsd - minSizeUsd);
  const exponentialSize = Math.pow(
    normalizedSize,
    LIQUIDATION_LINE_CONFIG.EXPONENTIAL_POWER,
  );

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
 * Creates a liquidation heatmap line
 */
const createLiquidationLine = (
  params: LiquidationLineParams,
): EntityId | null => {
  try {
    const { chart, price, startTime, color, linewidth, positionId } = params;
    const startTimestamp = startTime.getTime() / 1000;
    const currentTimestamp = Date.now() / 1000; // Use current time instead of far future

    return chart.createMultipointShape(
      [
        {
          time: startTimestamp,
          price,
        },
        {
          time: currentTimestamp, // End at current time
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

function getChartSymbol(chart: IChartWidgetApi): TokenSymbol {
  return chart.symbol().split('.')[1].split('/')[0];
}

export function useLiquidationLines({
  tokenSymbol,
  widget,
  widgetReady,
  allActivePositions,
  chartPreferences,
}: {
  tokenSymbol: TokenSymbol;
  widget: IChartingLibraryWidget | null;
  widgetReady: boolean | null;
  allActivePositions: PositionExtended[] | null;
  chartPreferences: ChartPreferences;
}): LiquidationChartLine[] {
  const [liquidationLines, setLiquidationLines] = useState<
    LiquidationChartLine[]
  >([]);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const chart = widget && widgetReady ? widget.activeChart() : null;

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
      try {
        const shape = chart.getShapeById(line.id).getProperties();
        if (shape.text?.includes('liquidation-heatmap-')) {
          chart.removeEntity(line.id);
        }
      } catch {
        // Shape doesn't exist, skip it
      }
    });
  };

  // Main liquidation lines effect - only runs when needed
  useEffect(() => {
    if (!chart || !widget || !widgetReady) return;

    try {
      const symbol = getChartSymbol(chart);

      // Clean up ALL existing liquidation lines first
      cleanupLiquidationLines(chart);

      if (
        !allActivePositions ||
        !chartPreferences.showAllActivePositionsLiquidationLines
      ) {
        setLiquidationLines([]);
        return;
      }

      const newLiquidationLines: LiquidationChartLine[] = [];

      // Draw liquidation lines for all active positions
      for (const position of allActivePositions) {
        if (position.liquidationPrice) {
          // Get visual properties based on position size USD
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
            newLiquidationLines.push({
              id,
              symbol,
              position: position.pubkey.toBase58(),
              value: position.liquidationPrice,
            });
          }
        }
      }

      setLiquidationLines(newLiquidationLines);
    } catch (e) {
      console.log('CATCH ERROR in liquidation lines:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chart,
    allActivePositions,
    chartPreferences.showAllActivePositionsLiquidationLines,
    currentTime, // Only updates every minute
    maxSizeUsd,
    minSizeUsd,
  ]);

  // Cleanup on symbol change
  useEffect(() => {
    if (!chart) return;

    // Clean up all liquidation lines when symbol changes
    cleanupLiquidationLines(chart);
    setLiquidationLines([]);
  }, [tokenSymbol, chart]);

  return liquidationLines;
}
