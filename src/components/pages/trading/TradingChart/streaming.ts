import {
  getPythProgramKeyForCluster,
  PriceData,
  Product,
  PythConnection,
} from "@pythnetwork/client";
import { PublicKey } from "@solana/web3.js";

import {
  setStreamingTokenPrice,
  stopStreamingTokenPrices,
} from "@/actions/streamingTokenPrices";
import { PYTH_CONNECTION } from "@/pages/_app";
import store from "@/store/store";

import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from "../../../../../public/charting_library/charting_library";

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

function getNextDailyBarTime(barTime: number) {
  const date = new Date(barTime * 1000);

  date.setDate(date.getDate() + 1);

  return date.getTime() / 1000;
}

function getTokenSymbolFromPythStreamingFormat(pythStreamingFormat: string) {
  return pythStreamingFormat.split("/")[0].split(".")[1];
}

// Only null in server side
const pythConnection =
  PYTH_CONNECTION &&
  new PythConnection(
    PYTH_CONNECTION,
    getPythProgramKeyForCluster("pythnet"),
    "finalized",
    [
      new PublicKey("Eavb8FKNoYPbHnSS8kMi4tnUh8qK8bqxTjCojer4pZrr"), // WBTC
      new PublicKey("GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU"), // BTC
      new PublicKey("H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG"), // SOL
      new PublicKey("7yyaeuJ1GGtVBLT2z2xub5ZWYKaNhF28mj1RdV4VDFVk"), // JITOSOL
      new PublicKey("Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD"), // USDC
      new PublicKey("8ihFLu5FimgTQ1Unh4dVyEHUGodJ5gJQCrQf4KUVB9bN"), // BONK
    ],
    [
      // When adding more prices, need to find the associated products keys
      new PublicKey("F8EzAa4p8bu4RjfQpRxuD18odVPyYFT8F1dSEZdET9QX"),
      new PublicKey("4aDoSXJ5o3AuvL7QFeR6h44jALQfTmUUCTVGDD6aoJTM"),
      new PublicKey("ALP8SdU9oARYVLgLR7LrqMNCYBnhtnQz1cj6bwgwQmgj"),
      new PublicKey("AEXiPjykV35xw8oqqpBRfEs1mfXQdkgKvm5BaHmGLFki"),
      new PublicKey("8GWTTbNiXdmyZREXbjsZBmCRuzdPrW55dnZGDkTRjWvb"),
      new PublicKey("FerFD54J6RgmQVCR5oNgpzXmz8BW2eBNhhirb1d5oifo"),
    ],
  );

let pythConnectionStarted = false;
let id: number = 0;

async function startStreaming() {
  if (pythConnectionStarted || !pythConnection) return;

  pythConnectionStarted = true;

  const localId = ++id;

  // Erase possible registered callbacks
  await pythConnection.stop().catch((e) => {
    console.log("Error stopping pyth connection", e);
  });

  pythConnection.onPriceChange((product: Product, price: PriceData) => {
    if (localId !== id) {
      console.log("Triggered price changes that shouldn't have happened");
      return;
    }

    // sample output:
    // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
    const subscriptionItem = channelToSubscription.get(product.symbol);

    if (!price.price) {
      return;
    }

    store.dispatch(
      setStreamingTokenPrice(
        getTokenSymbolFromPythStreamingFormat(product.symbol),
        price.price,
      ),
    );

    if (!subscriptionItem) {
      return;
    }

    subscriptionItem.handlers.forEach((handler) => {
      if (!price.price) return;

      const lastBar = handler.lastBar;
      const nextBarTime = getNextDailyBarTime(lastBar.time);

      let bar: Bar;

      const tradeTime = Number(price.timestamp.toString()) * 1000; // Multiplying by 1000 to get milliseconds

      if (tradeTime >= nextBarTime) {
        bar = {
          time: nextBarTime,
          open: price.price,
          high: price.price,
          low: price.price,
          close: price.price,
        };
      } else {
        bar = {
          ...lastBar,
          high: Math.max(lastBar.high, price.price),
          low: Math.min(lastBar.low, price.price),
          close: price.price,
        };
      }

      handler.lastBar = bar;

      handler.callback(bar);
    });

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
  lastBar: Bar,
) {
  const channelString = symbolInfo.ticker;
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
    paused: false,
    lastBar,
  };

  if (!channelString) return;

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

  if (!pythConnectionStarted) startStreaming();

  console.log(
    "[subscribeBars]: Subscribe to streaming. Channel:",
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
        "[unsubscribeBars]: Unsubscribe from streaming. Channel:",
        channelString,
        subscriberUID,
      );

      if (subscriptionItem.handlers.length === 0) {
        console.log(
          "[unsubscribeBars]: Delete the channel string:",
          channelString,
        );
        channelToSubscription.delete(channelString);
      } else {
        console.log(
          "[unsubscribeBars]: Update the channel string:",
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
    console.log("[Chart] No one subscribed to the streaming. Stopping...");
    pythConnection.stop();
    pythConnectionStarted = false;
    store.dispatch(stopStreamingTokenPrices());
  }
}
