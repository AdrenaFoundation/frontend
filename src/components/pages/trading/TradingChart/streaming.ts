import {
  setStreamingTokenPrice,
  stopStreamingTokenPrices,
} from '@/actions/streamingTokenPrices';
import store from '@/store/store';

import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../../../../public/charting_library/charting_library';

interface OracleSecurityPriceMessage {
  a: 'price';
  b: string; // Base currency (e.g., "SOL")
  q: string; // Quote currency (e.g., "USD")
  p: string; // Price as string
  e: number; // Exponent
  t: number; // Timestamp in milliseconds
  v: number; // Volume
}

interface SubscriptionMessage {
  a: 'subscribe' | 'unsubscribe';
  ch: string[]; // Array of trading pair symbols
}

const channelToSubscription = new Map<
  string,
  {
    subscriberUID: string;
    resolution: ResolutionString;
    handlers: {
      id: string;
      callback: SubscribeBarsCallback;
      lastBar: Bar;
    }[];
  }
>();

// Essential tokens that should always be available for streaming
// This ensures JITOSOL (uses SOL price) and WBTC (uses BTC price) positions work
const FEEDS_TO_SUBSCRIBE_TO = [
  'SOLUSD',
  'BTCUSD',
  'USDCUSD',
  'BONKUSD',
  'JITOSOLUSD',
  'WBTCUSD',
];

let websocket: WebSocket | null = null;
let streamingStarted = false;
let id: number = 0;

function getNextBarTime(barTime: number, resolution: ResolutionString): number {
  const date = new Date(barTime);

  switch (resolution) {
    case '1':
      date.setMinutes(date.getMinutes() + 1);
      break;
    case '5':
      date.setMinutes(date.getMinutes() + 5);
      break;
    case '15':
      date.setMinutes(date.getMinutes() + 15);
      break;
    case '30':
      date.setMinutes(date.getMinutes() + 30);
      break;
    case '60':
      date.setHours(date.getHours() + 1);
      break;
    case '240':
      date.setHours(date.getHours() + 4);
      break;
    case 'D':
    case '1D':
      date.setDate(date.getDate() + 1);
      break;
    default:
      date.setMinutes(date.getMinutes() + 1);
  }

  return date.getTime();
}

function handlePriceUpdate(message: OracleSecurityPriceMessage) {
  const price = parseFloat(message.p) * Math.pow(10, message.e);
  const timestamp = message.t;

  // Dispatch price update to store - this makes it available for all position calculations
  store.dispatch(setStreamingTokenPrice(message.b, price));

  // Find subscription for this symbol (for chart updates)
  const subscriptionItem = channelToSubscription.get(
    `Crypto.${message.b}/${message.q}`,
  );

  if (!subscriptionItem) {
    return;
  }

  subscriptionItem.handlers.forEach((handler) => {
    const lastBar = handler.lastBar;
    const nextBarTime = getNextBarTime(
      lastBar.time,
      subscriptionItem.resolution,
    );

    let bar: Bar;

    if (timestamp >= nextBarTime) {
      // Create new bar
      bar = {
        time: nextBarTime,
        open: price,
        high: price,
        low: price,
        close: price,
      };
    } else {
      // Update current bar
      bar = {
        ...lastBar,
        high: Math.max(lastBar.high, price),
        low: Math.min(lastBar.low, price),
        close: price,
      };
    }

    handler.lastBar = bar;
    handler.callback(bar);
  });
}

async function startStreaming() {
  if (streamingStarted) return;

  streamingStarted = true;
  const localId = ++id;

  // Close existing connection if any
  if (websocket) {
    websocket.close();
    websocket = null;
  }

  return new Promise<void>((resolve, reject) => {
    websocket = new WebSocket(
      'wss://history.oraclesecurity.org/trading-view/stream',
    );

    websocket.onopen = () => {
      console.log('[Streaming]: WebSocket connected, subscribing');

      const subscribeMessage: SubscriptionMessage = {
        a: 'subscribe',
        ch: FEEDS_TO_SUBSCRIBE_TO,
      };

      websocket?.send(JSON.stringify(subscribeMessage));

      resolve();
    };

    websocket.onmessage = (event) => {
      try {
        const message: OracleSecurityPriceMessage = JSON.parse(event.data);

        if (localId !== id) {
          console.log("Triggered price changes that shouldn't have happened");
          return;
        }

        if (message.a === 'price') {
          handlePriceUpdate(message);
        }
      } catch (error) {
        console.error('[WebSocket]: Error parsing message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('[Streaming]: WebSocket disconnected');
      websocket = null;
      streamingStarted = false;

      // Attempt to reconnect after 3 seconds if there are still subscriptions
      if (channelToSubscription.size > 0) {
        setTimeout(() => {
          startStreaming().catch(console.error);
        }, 3000);
      }
    };

    websocket.onerror = (error) => {
      console.error('[WebSocket]: Connection error:', error);
      streamingStarted = false;
      reject(error);
    };
  });
}

export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastBar: Bar,
) {
  const channelString = symbolInfo.ticker;
  if (!channelString) return;

  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
    lastBar,
  };

  let subscriptionItem = channelToSubscription.get(channelString);

  if (subscriptionItem) {
    subscriptionItem.handlers.push(handler);
  } else {
    subscriptionItem = {
      subscriberUID,
      resolution,
      handlers: [handler],
    };
  }

  channelToSubscription.set(channelString, subscriptionItem);

  // Start streaming if not already started (this will subscribe to all essential tokens)
  if (!streamingStarted) {
    startStreaming().catch((error) => {
      console.error('[Streaming]: Failed to start streaming:', error);
    });
  }

  console.log(
    '[subscribeBars]: Subscribe to streaming. Channel:',
    channelString,
    subscriberUID,
  );
}

export function unsubscribeFromStream(subscriberUID: string) {
  // Find a subscription with id === subscriberUID
  for (const channelString of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(channelString);

    if (!subscriptionItem) continue;

    const before = subscriptionItem.handlers.length;

    // Remove handler with id === subscriberUID
    subscriptionItem.handlers = subscriptionItem.handlers.filter(
      (handler) => handler.id !== subscriberUID,
    );

    if (subscriptionItem.handlers.length < before) {
      console.log(
        '[unsubscribeBars]: Unsubscribe from streaming. Channel:',
        channelString,
        subscriberUID,
      );

      if (subscriptionItem.handlers.length === 0) {
        console.log(
          '[unsubscribeBars]: Delete the channel string:',
          channelString,
        );
        channelToSubscription.delete(channelString);
      } else {
        console.log(
          '[unsubscribeBars]: Update the channel string:',
          channelString,
          subscriptionItem,
        );
        channelToSubscription.set(channelString, subscriptionItem);
      }
    }
  }

  // Stop streaming if no one is subscribed anymore
  if (channelToSubscription.size === 0 && websocket) {
    console.log('[Chart] No one subscribed to the streaming. Stopping...');
    websocket.close();
    websocket = null;
    streamingStarted = false;
    store.dispatch(stopStreamingTokenPrices());
  }
}
