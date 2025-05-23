import { SUPPORTED_RESOLUTIONS } from '@/constant';

import {
  DatafeedErrorCallback,
  HistoryCallback,
  IBasicDataFeed,
  LibrarySymbolInfo,
  OnReadyCallback,
  PeriodParams,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
} from '../../../../../public/charting_library/charting_library.js';
import { subscribeOnStream, unsubscribeFromStream } from './streaming';

const API_ENDPOINT = 'https://benchmarks.pyth.network/v1/shims/tradingview';

// Use it to keep a record of the most recent bar on the chart
const lastBarsCache = new Map();

const datafeed: IBasicDataFeed = {
  onReady: (callback: OnReadyCallback) => {
    console.log('[onReady]: Method call');

    fetch(`${API_ENDPOINT}/config`).then((response) => {
      response.json().then((configurationData) => {
        configurationData.supported_resolutions = SUPPORTED_RESOLUTIONS;
        setTimeout(() => callback(configurationData));
      });
    });
  },
  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: SearchSymbolsCallback,
  ) => {
    console.log('[searchSymbols]: Method call');

    fetch(`${API_ENDPOINT}/search?query=${userInput}`).then((response) => {
      response.json().then((data) => {
        onResultReadyCallback(data);
      });
    });
  },
  resolveSymbol: (
    symbolName: string,
    onSymbolResolvedCallback: ResolveCallback,
    onResolveErrorCallback: DatafeedErrorCallback,
  ) => {
    console.log('[resolveSymbol]: Method call', symbolName);

    fetch(`${API_ENDPOINT}/symbols?symbol=${symbolName}`).then((response) => {
      response
        .json()
        .then((symbolInfo) => {
          console.log('[resolveSymbol]: Symbol resolved', symbolInfo);
          symbolInfo.supported_resolutions = SUPPORTED_RESOLUTIONS;
          onSymbolResolvedCallback(symbolInfo);
        })
        .catch(() => {
          console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);

          onResolveErrorCallback('Cannot resolve symbol');
        });
    });
  },
  getBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onHistoryCallback: HistoryCallback,
    onErrorCallback: DatafeedErrorCallback,
  ) => {
    const { from, to, firstDataRequest } = periodParams;

    // Limit the range to 1 year for initial request
    const maxRange = 365 * 24 * 60 * 60; // 1 year in seconds
    const requestTo = to;
    const requestFrom = firstDataRequest ? Math.max(from, to - maxRange) : from;

    console.log('[getBars]: Method call', {
      symbol: symbolInfo.ticker,
      resolution,
      from: new Date(from * 1000).toISOString(),
      to: new Date(to * 1000).toISOString(),
      requestFrom: new Date(requestFrom * 1000).toISOString(),
      requestTo: new Date(requestTo * 1000).toISOString(),
      firstDataRequest,
    });

    fetch(
      `${API_ENDPOINT}/history?symbol=${symbolInfo.ticker}&from=${requestFrom}&to=${requestTo}&resolution=${resolution}`,
    )
      .then((response) => {
        response
          .json()
          .then((data) => {
            // Check for error response
            if (data.s === 'error') {
              console.log('[getBars]: Error:', data.errmsg);
              onHistoryCallback([], { noData: true });
              return;
            }

            // Validate data structure
            if (!data || !data.t || !Array.isArray(data.t)) {
              console.log('[getBars]: Invalid data structure received:', data);
              onHistoryCallback([], { noData: true });
              return;
            }

            if (data.t.length === 0) {
              onHistoryCallback([], { noData: true });
              return;
            }

            const bars = [];

            for (let i = 0; i < data.t.length; ++i) {
              if (
                data.t[i] &&
                data.o[i] !== undefined &&
                data.h[i] !== undefined &&
                data.l[i] !== undefined &&
                data.c[i] !== undefined
              ) {
                bars.push({
                  time: data.t[i] * 1000,
                  low: data.l[i],
                  high: data.h[i],
                  open: data.o[i],
                  close: data.c[i],
                });
              }
            }

            if (firstDataRequest) {
              lastBarsCache.set(symbolInfo.ticker, {
                ...bars[bars.length - 1],
              });
            }

            onHistoryCallback(bars, { noData: bars.length === 0 });
          })
          .catch((error) => {
            console.log('[getBars]: Get error', error);
            onErrorCallback(error);
          });
      })
      .catch((error) => {
        console.log('[getBars]: Fetch error', error);
        onErrorCallback(error);
      });
  },
  subscribeBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void,
  ) => {
    console.log(
      '[subscribeBars]: Method call with subscriberUID:',
      subscriberUID,
    );

    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.ticker),
    );
  },
  unsubscribeBars: (subscriberUID: string) => {
    console.log(
      '[unsubscribeBars]: Method call with subscriberUID:',
      subscriberUID,
    );

    unsubscribeFromStream(subscriberUID);
  },
};

export default datafeed;
