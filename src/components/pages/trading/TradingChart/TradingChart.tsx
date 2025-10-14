import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import { useChartDrawing } from '@/hooks/useChartDrawing';
import { useSelector } from '@/store/store';
import { TokenSymbol } from '@/types';
import { getTokenSymbol } from '@/utils';

import { ResolutionString } from '../../../../../public/charting_library/charting_library';
import { STORAGE_KEY_RESOLUTION } from './constants';
import { loadStudiesForSymbol } from './subscriptions/studiesSubscription';
import { ChartOptions } from './types';
import { useChartState } from './useChartState';

export default function TradingChart({
  token,
  positions,
  limitOrders,
  showBreakEvenLine,
  toggleSizeUsdInChart,
  positionHistory,
  allActivePositions,
  chartPreferences,
  getMarksCallback,
}: ChartOptions) {
  const { widget, widgetReady, isLoading, reloadWidget } = useChartState(
    token,
    getMarksCallback,
  );

  // Get current streaming price
  const selectedTokenPrice = useSelector(
    (s) => s.streamingTokenPrices[getTokenSymbol(token.symbol)] ?? null,
  );

  // Track price movement for color changes
  const [priceColor, setPriceColor] = useState<string>('#10e1a3'); // Default green
  const previousPriceRef = useRef<number | null>(null);

  // Update price line color based on price movement
  useEffect(() => {
    if (selectedTokenPrice !== null && previousPriceRef.current !== null) {
      const newColor =
        selectedTokenPrice > previousPriceRef.current
          ? '#10e1a3' // Green (same as your green color)
          : selectedTokenPrice < previousPriceRef.current
            ? '#f24f4f' // Red (same as your red color)
            : priceColor; // Keep current color if no change

      if (newColor !== priceColor) {
        setPriceColor(newColor);
      }
    }

    // Update the previous price reference
    if (selectedTokenPrice !== null) {
      previousPriceRef.current = selectedTokenPrice;
    }
  }, [selectedTokenPrice, priceColor]);

  // Apply price line color to TradingView widget
  useEffect(() => {
    if (!widget || !widgetReady) return;

    widget.applyOverrides({
      'mainSeriesProperties.priceLineColor': priceColor,
    });
  }, [widget, widgetReady, priceColor]);

  // Use chart drawing hook to draw positions and orders
  useChartDrawing({
    tokenSymbol: token.symbol,
    widget,
    widgetReady,
    positions,
    positionHistory,
    allActivePositions,
    chartPreferences,
    limitOrders,
    showBreakEvenLine,
    toggleSizeUsdInChart,
    drawingErrorCallback: reloadWidget,
  });

  // Update chart symbol when token changes
  useEffect(() => {
    if (!widget || !widgetReady) return;

    // Retrieve saved resolution or default to '60'
    const savedResolution =
      localStorage.getItem(STORAGE_KEY_RESOLUTION) || '60';

    widget.setSymbol(
      `Crypto.${getTokenSymbol(token.symbol)}/USD`,
      savedResolution as ResolutionString,
      () => {
        widget.onChartReady(() => {
          loadStudiesForSymbol(widget, token.symbol as TokenSymbol);
        });
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token.symbol, widgetReady]);

  return (
    <div className="flex flex-col w-full overflow-hidden bg-secondary select-none relative">
      <Loader
        className={twMerge(
          'absolute inset-0 flex items-center justify-center',
          isLoading ? '' : 'hidden',
        )}
      />
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
