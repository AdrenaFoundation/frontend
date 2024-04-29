import { setStreamingTokenPriceAction } from '@/actions/streamingTokenPricesActions';
import store from '@/store/store';

import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../../../../public/charting_library/charting_library';
const streamingUrl =
  'https://benchmarks.pyth.network/v1/shims/tradingview/streaming';

type PythStreamingData = {
  id: string; // i.e, "Crypto.SOL/USD"
  p: number; // i.e, 172.70134218
  t: number; // i.e, 1710418210
  f: string; // i.e, "t"
  s: number; // i.e, 0
};

const channelToSubscription = new Map<
  string,
  {
    subscriberUID: string;
    resolution: ResolutionString;
    lastDailyBar: Bar;
    handlers: {
      id: string;
      callback: SubscribeBarsCallback;
    }[];
  }
>();

function getTokenSymbolFromPythStreamingFormat(pythStreamingFormat: string) {
  return pythStreamingFormat.split('/')[0].split('.')[1];
}

function handleStreamingData(data: PythStreamingData) {
  const { id, p, t } = data;

  const tradePrice = p;
  const tradeTime = t * 1000; // Multiplying by 1000 to get milliseconds

  const channelString = id;
  const subscriptionItem = channelToSubscription.get(channelString);

  if (!subscriptionItem) {
    return;
  }

  const lastDailyBar = subscriptionItem.lastDailyBar;
  const nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time);

  let bar: Bar;

  if (tradeTime >= nextDailyBarTime) {
    bar = {
      time: nextDailyBarTime,
      open: tradePrice,
      high: tradePrice,
      low: tradePrice,
      close: tradePrice,
    };

    store.dispatch(
      setStreamingTokenPriceAction(
        getTokenSymbolFromPythStreamingFormat(channelString),
        tradePrice,
      ),
    );
  } else {
    bar = {
      ...lastDailyBar,
      high: Math.max(lastDailyBar.high, tradePrice),
      low: Math.min(lastDailyBar.low, tradePrice),
      close: tradePrice,
    };

    console.log('[stream] Update the latest bar by price', tradePrice);
  }

  subscriptionItem.lastDailyBar = bar;

  // Send data to every subscriber of that symbol
  subscriptionItem.handlers.forEach((handler) => handler.callback(bar));

  channelToSubscription.set(channelString, subscriptionItem);
}

function startStreaming(retries = 3, delay = 3000) {
  fetch(streamingUrl)
    .then((response) => {
      if (response.body == null) {
        throw new Error('Error starting streaming');
      }

      const reader = response.body.getReader();

      function streamData() {
        reader
          .read()
          .then(({ value, done }) => {
            if (done) {
              console.error('[stream] Streaming ended.');
              return;
            }

            // Assuming the streaming data is separated by line breaks
            const dataStrings = new TextDecoder().decode(value).split('\n');

            dataStrings.forEach((dataString) => {
              const trimmedDataString = dataString.trim();

              if (trimmedDataString) {
                try {
                  const jsonData = JSON.parse(trimmedDataString);

                  handleStreamingData(jsonData);
                } catch (e: unknown) {
                  console.error(
                    'Error parsing JSON:',
                    e instanceof Error ? e.message : String(e),
                  );
                }
              }
            });

            streamData(); // Continue processing the stream
          })
          .catch((error) => {
            console.error('[stream] Error reading from stream:', error);
            attemptReconnect(retries, delay);
          });
      }

      streamData();
    })
    .catch((error) => {
      console.error(
        '[stream] Error fetching from the streaming endpoint:',
        error,
      );
    });

  function attemptReconnect(retriesLeft: number, delay: number) {
    if (retriesLeft > 0) {
      console.log(`[stream] Attempting to reconnect in ${delay}ms...`);

      setTimeout(() => {
        startStreaming(retriesLeft - 1, delay);
      }, delay);
    } else {
      console.error('[stream] Maximum reconnection attempts reached.');
    }
  }
}

function getNextDailyBarTime(barTime: number) {
  const date = new Date(barTime * 1000);

  date.setDate(date.getDate() + 1);

  return date.getTime() / 1000;
}

export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastDailyBar: Bar,
) {
  const channelString = symbolInfo.ticker;
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
  };

  if (!channelString) return;

  let subscriptionItem = channelToSubscription.get(channelString);

  subscriptionItem = {
    subscriberUID,
    resolution,
    lastDailyBar,
    handlers: [handler],
  };

  channelToSubscription.set(channelString, subscriptionItem);

  console.log(
    '[subscribeBars]: Subscribe to streaming. Channel:',
    channelString,
  );

  // Start streaming when the first subscription is made
  startStreaming();
}

export function unsubscribeFromStream(subscriberUID: string) {
  // Find a subscription with id === subscriberUID
  for (const channelString of Object.keys(channelToSubscription)) {
    const subscriptionItem = channelToSubscription.get(channelString);

    if (!subscriptionItem) continue;

    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler) => handler.id === subscriberUID,
    );

    if (handlerIndex !== -1) {
      // Unsubscribe from the channel if it is the last handler
      console.log(
        '[unsubscribeBars]: Unsubscribe from streaming. Channel:',
        channelString,
      );

      channelToSubscription.delete(channelString);
      break;
    }
  }
}
