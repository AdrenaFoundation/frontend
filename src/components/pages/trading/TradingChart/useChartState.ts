import { useEffect, useRef, useState } from 'react';

import { Token } from '@/types';

import { ResolutionString } from '../../../../../public/charting_library/charting_library';
import {
  DEFAULT_RESOLUTION,
  DEFAULT_TIMEZONE,
  STORAGE_KEY_RESOLUTION,
} from './constants';
import { createTradingViewWidget } from './createTradingViewWidget';
import { ChartLoadRef, ChartState, Widget } from './types';

// Script loading promise to ensure we only load TV script once
let tvScriptLoadingPromise: Promise<unknown>;

export function useChartState(token: Token): ChartState & {
  onLoadScriptRef: ChartLoadRef;
  reloadWidget: () => void;
  updateSymbol: (token: Token, resolution: string) => void;
} {
  const onLoadScriptRef = useRef<(() => void) | null>(null);

  const [widget, setWidget] = useState<Widget | null>(null);
  const [widgetReady, setWidgetReady] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingCounter, setLoadingCounter] = useState<number>(0);

  // Retrieve saved settings or use defaults
  const savedResolution =
    localStorage.getItem(STORAGE_KEY_RESOLUTION) || DEFAULT_RESOLUTION;
  const savedTimezone =
    localStorage.getItem('trading_chart_timezone') || DEFAULT_TIMEZONE;

  const reloadWidget = () => {
    console.log('Reloading widget...');
    setWidgetReady(false);
    setWidget(null);
    setIsLoading(true);
    setLoadingCounter((prev) => prev + 1);
  };

  useEffect(() => {
    function createWidget() {
      const newWidget = createTradingViewWidget({
        token,
        savedResolution,
        savedTimezone,
        setWidgetReady,
        setIsLoading,
      });

      if (newWidget) {
        setWidget(newWidget);
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
    // Only trigger once when the chart loads or when there is an error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingCounter]);

  const updateSymbol = (token: Token, resolution: string) => {
    if (!widget) return;

    setWidgetReady(false);

    widget.setSymbol(
      `Crypto.${token.symbol}/USD`,
      resolution as ResolutionString,
      () => {
        setWidgetReady(true);
      },
    );
  };

  return {
    widget,
    widgetReady,
    isLoading,
    loadingCounter,
    onLoadScriptRef,
    reloadWidget,
    updateSymbol,
  };
}
