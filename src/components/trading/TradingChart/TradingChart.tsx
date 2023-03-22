import { NonStableToken, Token } from "@/types";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";

import styles from "./TradingChart.module.scss";

let tvScriptLoadingPromise: Promise<unknown>;

// We don't have access to proper type
type Widget = any;
type TradingView = any;

const symbol = {
  ETH: "PYTH:ETHUSD",
  BTC: "PYTH:BTCUSD",
  SOL: "PYTH:SOLUSD",
  USDC: "PYTH:USDCUSD",
} as Record<Token, string>;

export default function TradingChart({ token }: { token: Token }) {
  const onLoadScriptRef: MutableRefObject<(() => void) | null> = useRef(null);
  const [widget, setWidget] = useState<Widget | null>(null);

  useEffect(() => {
    function createWidget() {
      if (document.getElementById("chart-area") && "TradingView" in window) {
        setWidget(
          new (window.TradingView as any).widget({
            container_id: "chart-area",
            width: "100%",
            height: "100%",
            autosize: true,
            symbol: symbol[token],
            interval: "D",
            timezone: "UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            save_image: true,
            allow_symbol_change: false,
            editablewatchlist: false,
            hotlist: false,
            hidevolume: true,
            disabled_features: [
              "symbol_search_hot_key",
              "header_compare",
              "compare_symbol",
              "border_around_the_chart",
              "add_to_watchlist",
            ],
            enabled_features: [
              "header_fullscreen_button",
              "hide_left_toolbar_by_default",
            ],
          })
        );
      }
    }

    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current?.());

    return () => {
      onLoadScriptRef.current = null;
    };

    // Only trigger it onces when the chart load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!widget) return;

    widget.options.symbol = symbol[token];
    widget.reload();
  }, [token, widget]);

  return (
    <div className={styles.tradingChart}>
      <div id="chart-area" />
      <div className="tradingview-widget-copyright">by TradingView</div>
    </div>
  );
}
