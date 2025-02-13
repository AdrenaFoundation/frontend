import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import { SUPPORTED_RESOLUTIONS } from '@/constant';
import { useChartDrawing } from '@/hooks/useChartDrawing';
import { PositionExtended, Token, TokenSymbol } from '@/types';
import { formatNumber, getTokenSymbol } from '@/utils';

import {
  ChartPropertiesOverrides,
  EntityId,
  IChartingLibraryWidget,
  ISymbolValueFormatter,
  ResolutionString,
  SupportedLineTools,
  Timezone,
} from '../../../../../public/charting_library/charting_library';
import datafeed from './datafeed';

let tvScriptLoadingPromise: Promise<unknown>;

type Widget = IChartingLibraryWidget;

const STORAGE_KEY_RESOLUTION = 'trading_chart_resolution';

export default function TradingChart({
  token,
  positions,
  showBreakEvenLine,
  toggleSizeUsdInChart,
}: {
  token: Token;
  positions: PositionExtended[] | null;
  showBreakEvenLine: boolean;
  toggleSizeUsdInChart: boolean;
}) {
  const onLoadScriptRef: MutableRefObject<(() => void) | null> = useRef(null);

  const [widget, setWidget] = useState<Widget | null>(null);
  const [widgetReady, setWidgetReady] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingCounter, setIsLoadingCounter] = useState<number>(0);

  useChartDrawing({
    tokenSymbol: token.symbol,
    widget,
    widgetReady,
    positions,
    showBreakEvenLine,
    toggleSizeUsdInChart,
    drawingErrorCallback: () => {
      console.log('ERROR DRAWING ON CHART, RELOAD WIDGET');

      setWidgetReady(false);
      setWidget(null);
      setIsLoading(true);

      // Force refresh the widget
      setIsLoadingCounter((i) => i + 1);
    },
  });

  // Retrieve saved resolution or default to 'H'
  const savedResolution = localStorage.getItem(STORAGE_KEY_RESOLUTION) || 'H';

  // Retrieve saved timezone or default to locale timezone
  const savedTimezone =
    localStorage.getItem('trading_chart_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    function createWidget() {
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
          toolbar_bg: '#0d1118',
          datafeed,
          loading_screen: {
            backgroundColor: '#0d1118',
            foregroundColor: '#0d1118',
          },
          favorites: {
            intervals: [
              '1',
              '3',
              '5',
              '15',
              '1h',
              '4h',
              'D',
            ] as ResolutionString[],
            chartTypes: ['Candles'],
          },
          disabled_features: [
            'header_symbol_search',
            'header_chart_type',
            'header_compare',
            'display_market_status',
            'create_volume_indicator_by_default',
            'header_undo_redo',
            'symbol_info',
            'symbol_info_long_description',
            'symbol_info_price_source',
          ],
          enabled_features: [
            'hide_left_toolbar_by_default',
            'header_indicators',
            'header_fullscreen_button',
            'header_settings',
          ],
          settings_adapter: {
            initialSettings: {
              'paneProperties.background': '#0d1118',
              'paneProperties.backgroundType': 'solid',
              'paneProperties.legendProperties.showStudyArguments': 'false',
              'paneProperties.legendProperties.showStudyTitles': 'false',
              'paneProperties.legendProperties.showStudyValues': 'false',
              'paneProperties.legendProperties.showSeriesTitle': 'false',
              'paneProperties.legendProperties.showBarChange': 'false',
              'paneProperties.legendProperties.showSeriesOHLC': 'true',
              'mainSeriesProperties.priceLineColor': '#FFFF05',
              'scalesProperties.textColor': '#B3B5BE',
              timezone: savedTimezone as Timezone,
            },
            setValue: function (_, value) {
              const chartprops = JSON.parse(value) as ChartPropertiesOverrides;
              const currentTimezone = chartprops.timezone;

              if (!currentTimezone || currentTimezone === savedTimezone) {
                return;
              }

              localStorage.setItem('trading_chart_timezone', currentTimezone);
            },
            removeValue: function () { },
          },
          custom_css_url: '/tradingview.css',
          theme: 'dark',
          interval: SUPPORTED_RESOLUTIONS.includes(
            savedResolution as ResolutionString,
          )
            ? (savedResolution as ResolutionString)
            : ('1D' as ResolutionString),
          custom_formatters: {
            priceFormatterFactory: (): ISymbolValueFormatter | null => {
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

          widget.applyOverrides({
            'paneProperties.background': '#0d1118',
            'paneProperties.backgroundType': 'solid',
            'paneProperties.legendProperties.showStudyArguments': false,
            'paneProperties.legendProperties.showStudyTitles': false,
            'paneProperties.legendProperties.showStudyValues': false,
            'paneProperties.legendProperties.showSeriesTitle': false,
            'paneProperties.legendProperties.showBarChange': false,
            'paneProperties.legendProperties.showSeriesOHLC': true,
            'mainSeriesProperties.priceLineColor': '#FFFF05',
            'scalesProperties.textColor': '#B3B5BE',
            timezone: savedTimezone as Timezone,
          });

          // Note: this event is triggered before positionLines array is updated in the react state
          // So we can't check in the event if the positionLines matches our own drawing or the user's drawing
          // For now, will use the name of the draws to filter out ours drawing (liquidation, entry, break even etc.)
          widget.subscribe('drawing_event', () => {
            const symbol = widget
              .activeChart()
              .symbol()
              .split('.')[1]
              .split('/')[0] as TokenSymbol;
            const parsedChartShapes = JSON.parse(
              localStorage.getItem('chart_drawings') ?? '{}',
            );

            const userDrawings = widget
              .activeChart()
              .getAllShapes()
              .map((line) => {
                const points = widget
                  .activeChart()
                  .getShapeById(line.id)
                  .getPoints();

                const shape = widget
                  .activeChart()
                  .getShapeById(line.id)
                  .getProperties();

                // Uses text to filter out our drawings
                if (
                  shape.options.text.includes('long') ||
                  shape.options.text.includes('short')
                ) {
                  return null;
                }

                // Save user drawn line
                return {
                  id: line.id as EntityId,
                  points,
                  name: line.name as SupportedLineTools,
                  options: shape,
                };
              })
              .filter((line) => line);

            localStorage.setItem(
              'chart_drawings',
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
              if (!SUPPORTED_RESOLUTIONS.includes(newInterval)) {
                localStorage.setItem(STORAGE_KEY_RESOLUTION, '1D');
                return;
              }

              localStorage.setItem(STORAGE_KEY_RESOLUTION, newInterval);
            });
        });

        setWidget(widget);
      }
    }

    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = '/charting_library/charting_library.js';
        script.type = 'text/javascript';
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current?.());

    return () => {
      onLoadScriptRef.current = null;
    };

    // Only trigger it onces when the chart load or when there is an error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingCounter]);

  // When the token changes, we need to change the symbol of the widget so we only reload the chart
  useEffect(() => {
    if (!widget) return;

    setWidgetReady(false);

    widget.setSymbol(
      `Crypto.${getTokenSymbol(token.symbol)}/USD`,
      savedResolution as ResolutionString,
      () => {
        setWidgetReady(true);
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
