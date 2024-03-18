import {
  ErrorCallback,
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
    onResolveErrorCallback: ErrorCallback,
  ) => {
    console.log('[resolveSymbol]: Method call', symbolName);

    fetch(`${API_ENDPOINT}/symbols?symbol=${symbolName}`).then((response) => {
      response
        .json()
        .then((symbolInfo) => {
          console.log('[resolveSymbol]: Symbol resolved', symbolInfo);
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
    onErrorCallback: ErrorCallback,
  ) => {
    const { from, to, firstDataRequest } = periodParams;

    console.log('[getBars]: Method call', symbolInfo, resolution, from, to);

    fetch(
      `${API_ENDPOINT}/history?symbol=${symbolInfo.ticker}&from=${periodParams.from}&to=${periodParams.to}&resolution=${resolution}`,
    ).then((response) => {
      response
        .json()
        .then((data) => {
          if (data.t.length === 0) {
            onHistoryCallback([], { noData: true });
            return;
          }

          const bars = [];

          for (let i = 0; i < data.t.length; ++i) {
            bars.push({
              time: data.t[i] * 1000,
              low: data.l[i],
              high: data.h[i],
              open: data.o[i],
              close: data.c[i],
            });
          }

          if (firstDataRequest) {
            lastBarsCache.set(symbolInfo.ticker, {
              ...bars[bars.length - 1],
            });
          }

          onHistoryCallback(bars, { noData: false });
        })
        .catch((error) => {
          console.log('[getBars]: Get error', error);
          onErrorCallback(error);
        });
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
