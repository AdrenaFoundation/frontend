import { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import { useChartDrawing } from '@/hooks/useChartDrawing';
import { getTokenSymbol } from '@/utils';

import { ResolutionString } from '../../../../../public/charting_library/charting_library';
import { STORAGE_KEY_RESOLUTION } from './constants';
import { ChartOptions } from './types';
import { useChartState } from './useChartState';

export default function TradingChart({
  token,
  positions,
  limitOrders,
  showBreakEvenLine,
  toggleSizeUsdInChart,
}: ChartOptions) {
  const {
    widget,
    widgetReady,
    isLoading,
    reloadWidget,
  } = useChartState(token);

  // Use chart drawing hook to draw positions and orders
  useChartDrawing({
    tokenSymbol: token.symbol,
    widget,
    widgetReady,
    positions,
    limitOrders,
    showBreakEvenLine,
    toggleSizeUsdInChart,
    drawingErrorCallback: reloadWidget,
  });

  // Update chart symbol when token changes
  useEffect(() => {
    if (!widget) return;

    // Retrieve saved resolution or default to 'H'
    const savedResolution = localStorage.getItem(STORAGE_KEY_RESOLUTION) || 'H';

    widget.setSymbol(
      `Crypto.${getTokenSymbol(token.symbol)}/USD`,
      savedResolution as ResolutionString,
      () => {
        widget.onChartReady(() => { });
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token.symbol]);

  return (
    <div className="flex flex-col w-full overflow-hidden bg-secondary select-none">
      <Loader
        className={twMerge(
          'mt-[20%] ml-auto mr-auto',
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
