import { setStreamingTokenPrice } from '@/actions/streamingTokenPrices';
import store from '@/store/store';

import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../../../../public/charting_library/charting_library';
import { read } from 'fs';
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
  } else {
    bar = {
      ...lastDailyBar,
      high: Math.max(lastDailyBar.high, tradePrice),
      low: Math.min(lastDailyBar.low, tradePrice),
      close: tradePrice,
    };
  }

  store.dispatch(
    setStreamingTokenPrice(
      getTokenSymbolFromPythStreamingFormat(channelString),
      tradePrice,
    ),
  );

  subscriptionItem.lastDailyBar = bar;

  // Send data to every subscriber of that symbol
  subscriptionItem.handlers.forEach((handler) => handler.callback(bar));

  channelToSubscription.set(channelString, subscriptionItem);
}

(() => {
  if (typeof window === 'undefined') return;

  window.addEventListener('offline', (e) => {
    console.log('[page] Page went offline!');
  });

  window.addEventListener('online', (e) => {
    console.log('[page] Page came back online!');
    startStreaming(5000);
  });
})();

let readerId = 0;
let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

function startStreaming(delay = 5000) {
  let localId = Math.random();

  if (reader) {
    console.log('[stream] Cancel streaming to avoid double stream.');
    reader.cancel();
    reader = null;
    readerId = localId;
  }

  console.log('[stream] Fetch streaming data');

  fetch(streamingUrl)
    .then((response) => {
      if (response.body == null) {
        throw new Error('Error starting streaming');
      }

      reader = response.body.getReader();

      function streamData() {
        if (!reader) {
          console.log('no more reader');
          return;
        }

        reader
          .read()
          .then(({ value, done }) => {
            if (done) {
              console.error('[stream] Streaming ended.');

              // We are closing the reader willingly
              if (readerId !== localId) {
                console.log(
                  '[stream] Reader closed and that is ok.',
                  readerId,
                  localId,
                );
                return;
              }

              console.log(
                '[stream] Reader closed and that is not ok.',
                localId,
              );

              // We have not chosen to close the reader, so we will attempt to reconnect
              attemptReconnect(delay);

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
                  // streaming data is not always clean, we don't need to catch this error
                  /* console.error(
                    'Error parsing JSON:',
                    e instanceof Error ? e.message : String(e),
                  ); */
                }
              }
            });

            streamData(); // Continue processing the stream
          })
          .catch((error) => {
            console.error('[stream] Error reading from stream:', error);
            attemptReconnect(delay);
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

  function attemptReconnect(delay: number) {
    console.log(`[stream] Attempting to reconnect in ${delay}ms...`);

    setTimeout(() => {
      startStreaming(delay);
    }, delay);
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
  for (const channelString of channelToSubscription.keys()) {
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
