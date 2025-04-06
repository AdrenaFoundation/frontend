import { Token, TokenSymbol } from '@/types';
import { formatNumber, getTokenSymbol } from '@/utils';

import {
  ChartingLibraryFeatureset,
  IChartingLibraryWidget,
  ResolutionString,
  Timezone,
} from '../../../../../public/charting_library/charting_library';
import {
  CHART_BACKGROUND,
  CHART_PRICE_LINE_COLOR,
  CHART_TEXT_COLOR,
  DISABLED_FEATURES,
  ENABLED_FEATURES,
  FAVORITE_CHART_TYPES,
  FAVORITE_INTERVALS,
  STORAGE_KEY_DRAWINGS,
} from './constants';
import datafeed from './datafeed';

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
          'paneProperties.legendProperties.showStudyArguments': 'false',
          'paneProperties.legendProperties.showStudyTitles': 'false',
          'paneProperties.legendProperties.showStudyValues': 'false',
          'paneProperties.legendProperties.showSeriesTitle': 'false',
          'paneProperties.legendProperties.showBarChange': 'false',
          'paneProperties.legendProperties.showSeriesOHLC': 'true',
          'mainSeriesProperties.priceLineColor': CHART_PRICE_LINE_COLOR,
          'scalesProperties.textColor': CHART_TEXT_COLOR,
          timezone: savedTimezone as Timezone,
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

      configureChartOnReady(widget, savedTimezone);
    });

    return widget;
  }

  return null;
}

/**
 * Configure chart settings and subscriptions when ready
 */
function configureChartOnReady(
  widget: IChartingLibraryWidget,
  savedTimezone: string,
) {
  // Apply chart visual overrides
  widget.applyOverrides({
    'paneProperties.backgroundType': 'solid',
    'paneProperties.background': CHART_BACKGROUND,
    'paneProperties.legendProperties.showStudyArguments': false,
    'paneProperties.legendProperties.showStudyTitles': false,
    'paneProperties.legendProperties.showStudyValues': false,
    'paneProperties.legendProperties.showSeriesTitle': false,
    'paneProperties.legendProperties.showBarChange': false,
    'paneProperties.legendProperties.showSeriesOHLC': true,
    'mainSeriesProperties.priceLineColor': CHART_PRICE_LINE_COLOR,
    'scalesProperties.textColor': CHART_TEXT_COLOR,
    timezone: savedTimezone as Timezone,
  });

  // Subscribe to drawing events to save user drawings
  widget.subscribe('drawing_event', () => {
    const symbol = widget
      .activeChart()
      .symbol()
      .split('.')[1]
      .split('/')[0] as TokenSymbol;

    const parsedChartShapes = JSON.parse(
      localStorage.getItem(STORAGE_KEY_DRAWINGS) ?? '{}',
    );

    const userDrawings = widget
      .activeChart()
      .getAllShapes()
      .map((line) => {
        const points = widget.activeChart().getShapeById(line.id).getPoints();

        const shape = widget
          .activeChart()
          .getShapeById(line.id)
          .getProperties();

        // Uses text to filter out our drawings
        if (shape.text.includes('long') || shape.text.includes('short')) {
          return null;
        }

        // Save user drawn line
        return {
          id: line.id,
          points,
          name: line.name,
          options: shape,
        };
      })
      .filter((line) => line);

    localStorage.setItem(
      STORAGE_KEY_DRAWINGS,
      JSON.stringify({
        ...parsedChartShapes,
        [symbol]: userDrawings,
      }),
    );
  });

  // Listen for resolution changes
  widget
    .activeChart()
    .onIntervalChanged()
    .subscribe(null, (newInterval: ResolutionString) => {
      if (!isSupportedResolution(newInterval)) {
        localStorage.setItem('trading_chart_resolution', '1D');
        return;
      }

      localStorage.setItem('trading_chart_resolution', newInterval);
    });
}

/**
 * Check if a resolution is supported
 */
function isSupportedResolution(resolution: string): boolean {
  // Import from constants or use a specific list
  const SUPPORTED_RESOLUTIONS = [
    '1',
    '3',
    '5',
    '15',
    '30',
    '1h',
    '2h',
    '4h',
    'D',
    '1D',
    '1W',
    '1M',
  ];

  return SUPPORTED_RESOLUTIONS.includes(resolution);
}
