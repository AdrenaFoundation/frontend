import { setStreamingTokenPrice } from '@/actions/streamingTokenPrices';
import store from '@/store/store';

import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../../../../public/charting_library/charting_library';

type PythStreamingData = {
  id: string; // i.e, "Crypto.SOL/USD"
  p: number; // i.e, 172.70134218
  t: number; // i.e, 1710418210
  f: string; // i.e, "t"
  s: number; // i.e, 0
};

const PYTH_STREAMING_ENDPOINT =
  'https://benchmarks.pyth.network/v1/shims/tradingview/streaming';

const CHANNEL_TO_SUBSCRIPTION_MAP = new Map<
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
const TEXT_DECODER = new TextDecoder();

function getTokenSymbolFromPythStreamingFormat(pythStreamingFormat: string) {
  return pythStreamingFormat.split('/')[0].split('.')[1];
}

function handleStreamingData(data: PythStreamingData) {
  const { id, p, t } = data;

  const channelString = id;
  const subscriptionItem = CHANNEL_TO_SUBSCRIPTION_MAP.get(channelString);

  if (subscriptionItem === undefined) {
    // no active subscription for this data, let's skip it.
    return;
  }

  const tradePrice = p;
  const tradeTime = t * 1000; // Multiplying by 1000 to get milliseconds

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

  CHANNEL_TO_SUBSCRIPTION_MAP.set(channelString, subscriptionItem);
}

function onOfflineChange() {
  console.log('[page] Page went offline!');
  _abortController?.abort();
}

function onOnlineChange() {
  console.log('[page] Page came back online!');
  startStreaming(5000);
}

let _reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
let _abortController: AbortController | null = null;

function setupStreaming() {
  console.log('[stream] Setup.');
  window.addEventListener('offline', onOfflineChange);
  window.addEventListener('online', onOnlineChange);
  _abortController = new AbortController();
  return _abortController;
}

function cleanupStreaming() {
  console.log('[stream] Clean up.');
  window.removeEventListener('offline', onOfflineChange);
  window.removeEventListener('online', onOnlineChange);
  _reader?.cancel();
  _reader = null;
  _abortController?.abort();
  _abortController = null;
}

function startStreaming(reconnectAttemptDelayMs = 5_000) {
  if (_reader) {
    console.log('[stream] Cancel streaming to avoid double stream.');
    cleanupStreaming();
  }

  const abortController = setupStreaming();
  console.log('[stream] Fetch streaming data');

  fetch(PYTH_STREAMING_ENDPOINT, { signal: abortController.signal })
    .then((response) => {
      if (response.body === null) {
        throw new Error('Unexpected null response body');
      }

      const reader = response.body.getReader();
      _reader = reader;

      function streamData() {
        if (!reader) {
          // Unexpected race condition. this fetch +
          // let's log, ignore, stop this stale callback execution here.
          console.error('[stream] no more reader');
          return;
        }

        reader
          .read()
          .then(({ value, done }) => {
            if (done) {
              throw new Error('Stream abruptly closed');
            }

            // Assuming the streaming data is separated by line breaks
            const dataStrings = TEXT_DECODER.decode(value).split('\n');

            for (const dataString of dataStrings) {
              const trimmed = dataString.trim();

              if (trimmed) {
                try {
                  const parsed = JSON.parse(trimmed);
                  handleStreamingData(parsed);
                } catch (e: unknown) {
                  // streaming data is not always clean, we catch but ignore this error
                  /* console.error(
                      'Error parsing JSON:',
                      e instanceof Error ? e.message : String(e),
                    ); */
                }
              }
            }

            // Continue processing the stream
            streamData();
          })
          .catch((error) => {
            console.error('[stream] Error reading from stream:', error);
            // We have not chosen to close the reader, so we will attempt to reconnect
            cleanupStreaming();
            scheduleReconnectAttempt(reconnectAttemptDelayMs);
          });
      }

      streamData();
    })
    .catch((error) => {
      console.error(
        '[stream] Error fetching from the streaming endpoint:',
        error,
      );
      cleanupStreaming();
    });
}

function scheduleReconnectAttempt(reconnectAttemptDelayMs: number) {
  console.log(
    `[stream] Attempting to reconnect in ${reconnectAttemptDelayMs}ms...`,
  );

  setTimeout(() => {
    startStreaming(reconnectAttemptDelayMs);
  }, reconnectAttemptDelayMs);
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
  console.log('[stream] new subscription request', {
    channelString,
    subscriberUID,
  });

  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
  };

  if (!channelString) return;

  // FIXNE: we're not doing anything with the current subscription item at the moment.
  const subscriptionItem = CHANNEL_TO_SUBSCRIPTION_MAP.get(channelString);
  const newSubscriptionItem = {
    subscriberUID,
    resolution,
    lastDailyBar,
    handlers: [handler],
  };

  CHANNEL_TO_SUBSCRIPTION_MAP.set(channelString, newSubscriptionItem);

  console.log(
    '[subscribeBars]: Subscribe to streaming. Channel:',
    channelString,
  );

  // Start streaming when the first subscription is made
  startStreaming();
}

export function unsubscribeFromStream(subscriberUID: string) {
  // Find a subscription with id === subscriberUID
  for (const channelString of CHANNEL_TO_SUBSCRIPTION_MAP.keys()) {
    const subscriptionItem = CHANNEL_TO_SUBSCRIPTION_MAP.get(channelString);

    // impossible case
    if (subscriptionItem === undefined) {
      throw new Error('Unexpected undefined subscriptionItem');
    }

    const subscriptionItemHandler = subscriptionItem.handlers.find(
      (handler) => handler.id === subscriberUID,
    );

    if (subscriptionItemHandler) {
      // Unsubscribe from the channel if it is the last handler
      // FIXME: we can only have one handler right now.
      // we're not checking if this handler is the last.
      console.log(
        '[unsubscribeBars]: Unsubscribe from streaming. Channel:',
        channelString,
      );

      CHANNEL_TO_SUBSCRIPTION_MAP.delete(channelString);
    }

    // No remaining subscriptions,
    if (CHANNEL_TO_SUBSCRIPTION_MAP.size === 0) {
      cleanupStreaming();
    }
  }
}
