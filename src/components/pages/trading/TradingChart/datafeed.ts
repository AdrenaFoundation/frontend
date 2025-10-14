import { SUPPORTED_RESOLUTIONS } from '@/constant';

import {
  DatafeedErrorCallback,
  HistoryCallback,
  IBasicDataFeed,
  IDatafeedChartApi,
  LibrarySymbolInfo,
  Mark,
  OnReadyCallback,
  PeriodParams,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
} from '../../../../../public/charting_library/charting_library.js';
import { subscribeOnStream, unsubscribeFromStream } from './streaming';

export const CHAOS_API_ENDPOINT = 'https://history.oraclesecurity.org';

export default function datafeed({
  getMarksCallback,
}: {
  getMarksCallback: IDatafeedChartApi['getMarks'];
}): IBasicDataFeed {
  // Use it to keep a record of the most recent bar on the chart
  const lastBarsCache = new Map();

  const datafeed: IBasicDataFeed = {
    onReady: (callback: OnReadyCallback) => {
      console.log('[onReady]: Method call');

      // Hardcode the configuration data since we're not using the API anymore for this
      const configurationData = {
        supported_resolutions: SUPPORTED_RESOLUTIONS,
        supports_group_request: false,
        supports_marks: true,
        supports_search: true,
        supports_timescale_marks: false,
      };

      setTimeout(() => callback(configurationData));
    },
    getMarks: (
      symbolInfo: LibrarySymbolInfo,
      from: number,
      endDate: number,
      onDataCallback: (data: Mark[]) => void,
      resolution: ResolutionString,
    ) => {
      getMarksCallback?.(symbolInfo, from, endDate, onDataCallback, resolution);
    },
    searchSymbols: (
      userInput: string,
      exchange: string,
      symbolType: string,
      onResultReadyCallback: SearchSymbolsCallback,
    ) => {
      console.log('[searchSymbols]: Method call', userInput);

      // Return empty array or predefined symbols if needed
      setTimeout(() => onResultReadyCallback([]));
    },
    resolveSymbol: (
      symbolName: string,
      onSymbolResolvedCallback: ResolveCallback,
      onResolveErrorCallback: DatafeedErrorCallback,
    ) => {
      console.log('[resolveSymbol]: Method call', symbolName);

      // Define symbol information directly with the same structure as the previous API
      const symbolMap = {
        SOLUSD: {
          name: 'SOLUSD',
          description: 'SOLANA / US DOLLAR',
          full_name: 'Crypto.SOL/USD',
          ticker: 'Crypto.SOL/USD',
          exchange: 'ORACLE',
          session: '24x7',
          timezone: 'Etc/UTC',
          minmov: 1,
          pricescale: 100000000,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          intraday_multipliers: [
            '1',
            '2',
            '5',
            '15',
            '30',
            '60',
            '120',
            '240',
            '360',
            '720',
          ],
          supported_resolutions: SUPPORTED_RESOLUTIONS,
          data_status: 'streaming',
          supports_marks: true,
          type: 'crypto',
          listed_exchange: 'ORACLE',
          format: 'price',
        },
        'Crypto.SOL/USD': {
          name: 'SOLUSD',
          description: 'SOLANA / US DOLLAR',
          full_name: 'Crypto.SOL/USD',
          ticker: 'Crypto.SOL/USD',
          exchange: 'ORACLE',
          session: '24x7',
          timezone: 'Etc/UTC',
          minmov: 1,
          pricescale: 100000000,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          intraday_multipliers: [
            '1',
            '2',
            '5',
            '15',
            '30',
            '60',
            '120',
            '240',
            '360',
            '720',
          ],
          supported_resolutions: SUPPORTED_RESOLUTIONS,
          data_status: 'streaming',
          supports_marks: true,
          type: 'crypto',
          listed_exchange: 'ORACLE',
          format: 'price',
        },
        BTCUSD: {
          name: 'BTCUSD',
          description: 'BITCOIN / US DOLLAR',
          full_name: 'Crypto.BTC/USD',
          ticker: 'Crypto.BTC/USD',
          exchange: 'ORACLE',
          session: '24x7',
          timezone: 'Etc/UTC',
          minmov: 1,
          pricescale: 100000000,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          intraday_multipliers: [
            '1',
            '2',
            '5',
            '15',
            '30',
            '60',
            '120',
            '240',
            '360',
            '720',
          ],
          supported_resolutions: SUPPORTED_RESOLUTIONS,
          data_status: 'streaming',
          supports_marks: true,
          type: 'crypto',
          listed_exchange: 'ORACLE',
          format: 'price',
        },
        'Crypto.BTC/USD': {
          name: 'BTCUSD',
          description: 'BITCOIN / US DOLLAR',
          full_name: 'Crypto.BTC/USD',
          ticker: 'Crypto.BTC/USD',
          exchange: 'ORACLE',
          session: '24x7',
          timezone: 'Etc/UTC',
          minmov: 1,
          pricescale: 100000000,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          intraday_multipliers: [
            '1',
            '2',
            '5',
            '15',
            '30',
            '60',
            '120',
            '240',
            '360',
            '720',
          ],
          supported_resolutions: SUPPORTED_RESOLUTIONS,
          data_status: 'streaming',
          supports_marks: true,
          type: 'crypto',
          listed_exchange: 'ORACLE',
          format: 'price',
        },
        BONKUSD: {
          name: 'BONKUSD',
          description: 'BONK / US DOLLAR',
          full_name: 'Crypto.BONK/USD',
          ticker: 'Crypto.BONK/USD',
          exchange: 'ORACLE',
          session: '24x7',
          timezone: 'Etc/UTC',
          minmov: 1,
          pricescale: 1000000000000, // Higher pricescale for BONK as it's a low-value token
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          intraday_multipliers: [
            '1',
            '2',
            '5',
            '15',
            '30',
            '60',
            '120',
            '240',
            '360',
            '720',
          ],
          supported_resolutions: SUPPORTED_RESOLUTIONS,
          data_status: 'streaming',
          supports_marks: true,
          type: 'crypto',
          listed_exchange: 'ORACLE',
          format: 'price',
        },
        'Crypto.BONK/USD': {
          name: 'BONKUSD',
          description: 'BONK / US DOLLAR',
          full_name: 'Crypto.BONK/USD',
          ticker: 'Crypto.BONK/USD',
          exchange: 'ORACLE',
          session: '24x7',
          timezone: 'Etc/UTC',
          minmov: 1,
          pricescale: 1000000000000, // Higher pricescale for BONK as it's a low-value token
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          intraday_multipliers: [
            '1',
            '2',
            '5',
            '15',
            '30',
            '60',
            '120',
            '240',
            '360',
            '720',
          ],
          supported_resolutions: SUPPORTED_RESOLUTIONS,
          data_status: 'streaming',
          supports_marks: true,
          type: 'crypto',
          listed_exchange: 'ORACLE',
          format: 'price',
        },
      };

      const symbolInfo = symbolMap[symbolName as keyof typeof symbolMap];

      if (symbolInfo) {
        setTimeout(() =>
          onSymbolResolvedCallback(symbolInfo as LibrarySymbolInfo),
        );
      } else {
        setTimeout(() => onResolveErrorCallback('Cannot resolve symbol'));
      }
    },
    getBars: (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      periodParams: PeriodParams,
      onHistoryCallback: HistoryCallback,
      onErrorCallback: DatafeedErrorCallback,
    ) => {
      const { from, to, firstDataRequest } = periodParams;

      // Map TradingView resolution to Oracle Security API type
      let type;
      switch (resolution) {
        case '1':
        case '5':
        case '15':
        case '30':
          type = resolution;
          break;
        case '60':
          type = '1H';
          break;
        case '120':
          type = '2H';
          break;
        case '240':
          type = '4H';
          break;
        case 'D':
        case '1D':
          type = '1D';
          break;
        case 'W':
        case '1W':
          type = '1W';
          break;
        case 'M':
        case '1M':
          type = '1M';
          break;
        default:
          type = '1';
      }

      console.log('[getBars]: Method call', {
        symbol: symbolInfo.ticker,
        resolution,
        from: new Date(from * 1000).toISOString(),
        to: new Date(to * 1000).toISOString(),
        firstDataRequest,
      });

      // Extract feed name from ticker (e.g., "Crypto.SOL/USD" -> "SOLUSD")
      const feed = symbolInfo.name;

      fetch(
        `${CHAOS_API_ENDPOINT}/trading-view/data?feed=${feed}&type=${type}&from=${from * 1000}&till=${to * 1000}`,
      )
        .then((response) => {
          response
            .json()
            .then((data) => {
              if (!data || !data.result || !Array.isArray(data.result)) {
                console.log(
                  '[getBars]: Invalid data structure received:',
                  data,
                );
                onHistoryCallback([], { noData: true });
                return;
              }

              if (data.result.length === 0) {
                onHistoryCallback([], { noData: true });
                return;
              }

              interface BarData {
                time: number;
                open: number;
                high: number;
                low: number;
                close: number;
                avg: number;
                volume?: number;
              }

              // Filter bars to only include those within the requested time range
              const filteredBars = data.result.filter((bar: BarData) => {
                const barTime = bar.time / 1000; // Convert to seconds
                return barTime >= from && barTime <= to;
              });

              const bars = filteredBars.map((bar: BarData) => ({
                time: bar.time,
                low: bar.low,
                high: bar.high,
                open: bar.open,
                close: bar.close,
                volume: bar.volume || 0,
              }));

              console.log(
                `[getBars]: Requested ${from}-${to}, got ${data.result.length} total bars, ${bars.length} in range`,
              );

              // If no bars in the requested range, tell TradingView there's no data
              if (bars.length === 0) {
                console.log('[getBars]: No data in requested time range');
                onHistoryCallback([], { noData: true });
                return;
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

  return datafeed;
}
