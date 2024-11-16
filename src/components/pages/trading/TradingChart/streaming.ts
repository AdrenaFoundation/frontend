import {
  getPythProgramKeyForCluster,
  PythConnection,
} from '@pythnetwork/client';
import { PublicKey } from '@solana/web3.js';

import { setStreamingTokenPrice } from '@/actions/streamingTokenPrices';
import { PYTH_CONNECTION } from '@/pages/_app';
import store from '@/store/store';

import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../../../../public/charting_library/charting_library';

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

function getNextDailyBarTime(barTime: number) {
  const date = new Date(barTime * 1000);

  date.setDate(date.getDate() + 1);

  return date.getTime() / 1000;
}

function getTokenSymbolFromPythStreamingFormat(pythStreamingFormat: string) {
  return pythStreamingFormat.split('/')[0].split('.')[1];
}

// Only null in server side
const pythConnection =
  PYTH_CONNECTION &&
  new PythConnection(PYTH_CONNECTION, getPythProgramKeyForCluster('pythnet'));

let pythConnectionStarted = false;

function startStreaming() {
  if (pythConnectionStarted || !pythConnection) return;

  pythConnectionStarted = true;

  pythConnection.feedIds = [
    // new PublicKey('Eavb8FKNoYPbHnSS8kMi4tnUh8qK8bqxTjCojer4pZrr'), // WBTC
    new PublicKey('GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU'), // BTC
    new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'), // SOL
    // new PublicKey('7yyaeuJ1GGtVBLT2z2xub5ZWYKaNhF28mj1RdV4VDFVk'), // JITOSOL
    new PublicKey('Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD'), // USDC
    new PublicKey('8ihFLu5FimgTQ1Unh4dVyEHUGodJ5gJQCrQf4KUVB9bN'), // BONK
  ];

  pythConnection.onPriceChange((product, price) => {
    // sample output:
    // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
    const subscriptionItem = channelToSubscription.get(product.symbol);

    if (!subscriptionItem || !price.price) {
      return;
    }

    const lastDailyBar = subscriptionItem.lastDailyBar;
    const nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time);

    let bar: Bar;

    const tradeTime = Number(price.timestamp.toString()) * 1000; // Multiplying by 1000 to get milliseconds

    if (tradeTime >= nextDailyBarTime) {
      bar = {
        time: nextDailyBarTime,
        open: price.price,
        high: price.price,
        low: price.price,
        close: price.price,
      };
    } else {
      bar = {
        ...lastDailyBar,
        high: Math.max(lastDailyBar.high, price.price),
        low: Math.min(lastDailyBar.low, price.price),
        close: price.price,
      };
    }

    store.dispatch(
      setStreamingTokenPrice(
        getTokenSymbolFromPythStreamingFormat(product.symbol),
        price.price,
      ),
    );

    subscriptionItem.lastDailyBar = bar;

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));

    channelToSubscription.set(product.symbol, subscriptionItem);
  });

  // Start listening for price change events.
  pythConnection.start();
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

  if (subscriptionItem) {
    subscriptionItem.handlers.push(handler);
  } else {
    subscriptionItem = {
      subscriberUID,
      resolution,
      lastDailyBar,
      handlers: [handler],
    };
  }

  channelToSubscription.set(channelString, subscriptionItem);

  if (!pythConnectionStarted) startStreaming();

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
    } else {
      // No change
    }
  }

  if (channelToSubscription.size === 0 && pythConnection) {
    console.log('[Chart] No one subscribed to the streaming. Stopping...');
    pythConnection.stop();
    pythConnectionStarted = false;
  }
}
