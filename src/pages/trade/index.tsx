import TabSelect from "@/components/TabSelect/TabSelect";
import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import { NonStableToken, Token } from "@/types";
import { useState } from "react";
import useWatchWalletBalance from "@/hooks/useWatchWalletBalance";
import PositionInputs from "@/components/PositionInputs/PositionInputs";

import styles from "./index.module.scss";

type State = "long" | "short" | "swap";

export default function Trade() {
  useListenToPythTokenPricesChange();
  useWatchWalletBalance();

  const [selectedTab, setSelectedTab] = useState<State>("long");

  return (
    <div className={styles.trade}>
      <div className={styles.trade__tradingview}></div>

      <div className={styles.trade__panel}>
        <TabSelect
          selected={selectedTab}
          tabs={[
            { title: "long", icon: "/images/long.svg" },
            { title: "short", icon: "/images/short.svg" },
            { title: "swap", icon: "/images/swap.svg" },
          ]}
          onClick={(title, _: number) => {
            setSelectedTab(title);
          }}
        />

        {selectedTab === "long" ? (
          <PositionInputs
            positionType="Long"
            allowedTokenA={["ETH", "BTC", "SOL"] as NonStableToken[]}
            allowedTokenB={["ETH", "BTC", "SOL", "USDC"] as Token[]}
          />
        ) : null}

        {selectedTab === "short" ? (
          <PositionInputs
            positionType="Short"
            allowedTokenA={["ETH", "BTC", "SOL"] as NonStableToken[]}
            allowedTokenB={["ETH", "BTC", "SOL", "USDC"] as Token[]}
          />
        ) : null}

        {selectedTab === "swap" ? <></> : null}
      </div>
    </div>
  );
}
