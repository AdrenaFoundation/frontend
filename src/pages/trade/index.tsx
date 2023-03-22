import TabSelect from "@/components/TabSelect/TabSelect";
import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import { NonStableToken, Token } from "@/types";
import { LegacyRef, useRef, useState } from "react";
import useWatchWalletBalance from "@/hooks/useWatchWalletBalance";
import TradingInputs from "@/components/trading/TradingInputs/TradingInputs";

import styles from "./index.module.scss";
import Button from "@/components/Button/Button";
import WalletAdapter from "@/components/WalletAdapter/WalletAdapter";
import { useSelector } from "@/store/store";
import { nonStableTokenList, stableTokenList, tokenList } from "@/constant";
import TradingChart from "@/components/trading/TradingChart/TradingChart";
import { formatNumber, formatPriceInfo, getCustodyLiquidity } from "@/utils";
import useAdrenaProgram from "@/hooks/useAdrenaProgram";
import useCustodies from "@/hooks/useCustodies";
import SwapDetails from "@/components/trading/SwapDetails/SwapDetails";
import PositionDetails from "@/components/trading/PositionDetails/PositionDetails";

type State = "long" | "short" | "swap";

export default function Trade() {
  useListenToPythTokenPricesChange();
  useWatchWalletBalance();
  const [selectedTab, setSelectedTab] = useState<State>("long");
  const walletAdapterRef = useRef<HTMLDivElement>(null);
  const wallet = useSelector((s) => s.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const [inputAValue, setInputAValue] = useState<number | null>(null);
  const [inputBValue, setInputBValue] = useState<number | null>(null);
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [leverage, setLeverage] = useState<number | null>(null);

  const handleExecuteButton = () => {
    if (!connected) {
      walletAdapterRef.current?.click();
      return;
    }

    return;
  };

  const buttonTitle = (() => {
    // If wallet not connected, then user need to connect wallet
    if (!connected) {
      return "Connect wallet";
    }

    if (inputAValue === null || inputBValue === null) {
      return "Enter an amount";
    }

    // Loading, should happens quickly
    if (!tokenA) {
      return "...";
    }

    const walletTokenABalance = walletTokenBalances?.[tokenA];

    // Loading, should happens quickly
    if (typeof walletTokenABalance === "undefined") {
      return "...";
    }

    // If user wallet balance doesn't have enough tokens, tell user
    if (!walletTokenABalance || inputAValue > walletTokenABalance) {
      return `Insufficient ${tokenA} balance`;
    }

    return "Execute";
  })();

  return (
    <div className={styles.trade}>
      <div className={styles.trade__tradingview}>
        {/* Display trading chart for appropriate token */}
        {tokenA && tokenB ? (
          <>
            {selectedTab === "short" || selectedTab === "long" ? (
              <TradingChart token={tokenB} />
            ) : null}

            {selectedTab === "swap" ? (
              <TradingChart
                token={
                  stableTokenList.includes(tokenA as any) ? tokenB : tokenA
                }
              />
            ) : null}
          </>
        ) : null}
      </div>

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

        <TradingInputs
          className={styles.trade__panel_trading_inputs}
          actionType={selectedTab}
          allowedTokenA={tokenList}
          allowedTokenB={
            selectedTab === "swap" ? tokenList : nonStableTokenList
          }
          onChangeInputA={setInputAValue}
          onChangeInputB={setInputBValue}
          onChangeTokenA={setTokenA}
          onChangeTokenB={setTokenB}
          onChangeLeverage={setLeverage}
        />

        {/* Button to execute action */}
        <>
          <Button
            className={styles.trade__panel_execute_btn}
            title={buttonTitle}
            onClick={handleExecuteButton}
          />

          {/* to handle wallet connection, create an hidden wallet adapter */}
          <WalletAdapter
            className={styles.trade__panel_wallet_adapter}
            ref={walletAdapterRef}
          />
        </>

        {/* Position details */}
        <>
          <div className={styles.trade__panel_details}>
            <div className={styles.trade__panel_details_title}>
              <span>{selectedTab}</span>

              {selectedTab === "short" || selectedTab === "long" ? (
                <span>{tokenB ?? "-"}</span>
              ) : null}
            </div>

            {tokenB && tokenA ? (
              <>
                {selectedTab === "short" || selectedTab === "long" ? (
                  <PositionDetails tokenB={tokenB} />
                ) : (
                  <SwapDetails tokenA={tokenA} tokenB={tokenB} />
                )}
              </>
            ) : null}
          </div>
        </>
      </div>
    </div>
  );
}
