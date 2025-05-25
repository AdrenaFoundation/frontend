import { setStreamingTokenPrice } from '@/actions/streamingTokenPrices';
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

let websocket: WebSocket | null = null;
let isConnecting = false;
const subscribedChannels = new Set<string>();

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

function connectWebSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      resolve(websocket);
      return;
    }

    if (isConnecting) {
      // Wait for existing connection attempt
      const checkConnection = () => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          resolve(websocket);
        } else if (!isConnecting) {
          reject(new Error('Connection failed'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };
      checkConnection();
      return;
    }

    isConnecting = true;
    websocket = new WebSocket(
      'wss://history.oraclesecurity.org/trading-view/stream',
    );

    websocket.onopen = () => {
      isConnecting = false;

      // Resubscribe to existing channels
      if (subscribedChannels.size > 0) {
        const subscribeMessage: SubscriptionMessage = {
          a: 'subscribe',
          ch: Array.from(subscribedChannels),
        };
        websocket?.send(JSON.stringify(subscribeMessage));
      }

      resolve(websocket!);
    };

    websocket.onmessage = (event) => {
      try {
        const message: OracleSecurityPriceMessage = JSON.parse(event.data);

        if (message.a === 'price') {
          handlePriceUpdate(message);
        }
      } catch (error) {
        console.error('[WebSocket]: Error parsing message:', error);
      }
    };

    websocket.onclose = () => {
      websocket = null;
      isConnecting = false;

      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (subscribedChannels.size > 0) {
          connectWebSocket().catch(console.error);
        }
      }, 3000);
    };

    websocket.onerror = (error) => {
      console.error('[WebSocket]: Connection error:', error);
      isConnecting = false;
      reject(error);
    };
  });
}

function handlePriceUpdate(message: OracleSecurityPriceMessage) {
  const price = parseFloat(message.p) * Math.pow(10, message.e);
  const timestamp = message.t;

  // Dispatch price update to store
  store.dispatch(
    setStreamingTokenPrice(
      message.b, // Base currency (e.g., "SOL")
      price,
    ),
  );

  // Find subscription for this symbol
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

  const feedSymbol = symbolInfo.name;

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
    channelToSubscription.set(channelString, subscriptionItem);
  }

  // Add to subscribed channels and connect
  subscribedChannels.add(feedSymbol);

  connectWebSocket()
    .then((ws) => {
      const subscribeMessage: SubscriptionMessage = {
        a: 'subscribe',
        ch: [feedSymbol],
      };
      ws.send(JSON.stringify(subscribeMessage));
    })
    .catch((error) => {
      console.error('[WebSocket]: Failed to subscribe:', error);
    });
}

export function unsubscribeFromStream(subscriberUID: string) {
  console.log(
    '[unsubscribeBars]: Unsubscribe from streaming. UID:',
    subscriberUID,
  );

  // Find and remove the handler
  for (const [
    channelString,
    subscriptionItem,
  ] of channelToSubscription.entries()) {
    if (!subscriptionItem) continue;

    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler) => handler.id === subscriberUID,
    );

    if (handlerIndex !== -1) {
      subscriptionItem.handlers.splice(handlerIndex, 1);

      if (subscriptionItem.handlers.length === 0) {
        // No more handlers for this channel, unsubscribe
        channelToSubscription.delete(channelString);

        // Extract feed symbol from channel (e.g., "Crypto.SOL/USD" -> "SOLUSD")
        const feedSymbolPart = channelString.split('.')[1];
        if (feedSymbolPart) {
          const feedSymbol = feedSymbolPart.replace('/', '');
          subscribedChannels.delete(feedSymbol);

          if (websocket && websocket.readyState === WebSocket.OPEN) {
            const unsubscribeMessage: SubscriptionMessage = {
              a: 'unsubscribe',
              ch: [feedSymbol],
            };
            websocket.send(JSON.stringify(unsubscribeMessage));
          }
        }
      }
      break;
    }
  }

  // Close WebSocket if no more subscriptions
  if (subscribedChannels.size === 0 && websocket) {
    websocket.close();
    websocket = null;
  }
}
