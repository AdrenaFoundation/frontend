import { Token } from '@/types';
import { formatNumber, getTokenSymbol } from '@/utils';

import {
  ChartingLibraryFeatureset,
  ResolutionString,
  Timezone,
} from '../../../../../public/charting_library/charting_library';
import { configureChartOnReady } from './configureChartOnReady';
import {
  CHART_BACKGROUND,
  CHART_PRICE_LINE_COLOR,
  CHART_TEXT_COLOR,
  DISABLED_FEATURES,
  ENABLED_FEATURES,
  FAVORITE_CHART_TYPES,
  FAVORITE_INTERVALS,
} from './constants';
import datafeed from './datafeed';
import { isSupportedResolution } from './subscriptions/resolutionSubscription';

/**
 * Creates and configures a TradingView widget for the chart
 */
export function createTradingViewWidget({
  token,
  savedResolution,
  savedTimezone,
  setWidgetReady,
  setIsLoading,
}: {
  token: Token;
  savedResolution: string;
  savedTimezone: string;
  setWidgetReady: (ready: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}) {
  if (document.getElementById('chart-area') && 'TradingView' in window) {
    const widget = new window.TradingView.widget({
      container: 'chart-area',
      library_path: '/charting_library/',
      width: 100,
      height: 100,
      autosize: true,
      symbol: `Crypto.${getTokenSymbol(token.symbol)}/USD`,
      timezone: 'Etc/UTC',
      locale: 'en',
      toolbar_bg: CHART_BACKGROUND,
      datafeed,
      loading_screen: {
        backgroundColor: CHART_BACKGROUND,
        foregroundColor: CHART_BACKGROUND,
      },
      favorites: {
        intervals: [...FAVORITE_INTERVALS] as ResolutionString[],
        chartTypes: [...FAVORITE_CHART_TYPES],
      },
      disabled_features: [...DISABLED_FEATURES] as ChartingLibraryFeatureset[],
      enabled_features: [...ENABLED_FEATURES] as ChartingLibraryFeatureset[],
      settings_adapter: {
        initialSettings: {
          'paneProperties.backgroundType': 'solid',
          'paneProperties.background': CHART_BACKGROUND,
          'paneProperties.legendProperties.showStudyArguments': 'true',
          'paneProperties.legendProperties.showStudyTitles': 'true',
          'paneProperties.legendProperties.showStudyValues': 'false',
          'paneProperties.legendProperties.showSeriesTitle': 'false',
          'paneProperties.legendProperties.showBarChange': 'false',
          'paneProperties.legendProperties.showSeriesOHLC': 'true',
          'mainSeriesProperties.priceLineColor': CHART_PRICE_LINE_COLOR,
          'scalesProperties.textColor': CHART_TEXT_COLOR,
          timezone: savedTimezone as Timezone,
          'paneProperties.legendProperties.showVisibilityButton': 'true',
        },
        setValue: function (key, value) {
          if (key === 'chartproperties') {
            const chartprops = JSON.parse(value);
            const currentTimezone = chartprops.timezone;

            if (!currentTimezone || currentTimezone === savedTimezone) {
              return;
            }

            localStorage.setItem('trading_chart_timezone', currentTimezone);
          }
        },
        removeValue: function () {},
      },
      custom_css_url: '/tradingview.css',
      theme: 'dark',
      interval: isSupportedResolution(savedResolution)
        ? (savedResolution as ResolutionString)
        : ('1D' as ResolutionString),
      custom_formatters: {
        priceFormatterFactory: () => {
          return {
            format: (price: number): string => {
              return formatNumber(price, 2, 2, 8);
            },
          };
        },
      },
    });

    widget.onChartReady(() => {
      setWidgetReady(true);
      setIsLoading(false);

      // Configure the chart and subscribe to events
      configureChartOnReady(widget, savedTimezone);
    });

    return widget;
  }

  return null;
}
