import TabSelect from "@/components/TabSelect/TabSelect";
import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import { NonStableToken, Token } from "@/types";
import { LegacyRef, useRef, useState } from "react";
import useWatchWalletBalance from "@/hooks/useWatchWalletBalance";
import TradingInputs from "@/components/TradingInputs/TradingInputs";

import styles from "./index.module.scss";
import Button from "@/components/Button/Button";
import WalletAdapter from "@/components/WalletAdapter/WalletAdapter";
import { useSelector } from "@/store/store";
import { nonStableTokenList, stableTokenList, tokenList } from "@/constant";
import TradingChart from "@/components/TradingChart/TradingChart";
import { formatNumber } from "@/utils";

type State = "long" | "short" | "swap";

function formatPriceInfo(price: number) {
  return `$${formatNumber(price, 2)}`;
}

export default function Trade() {
  useListenToPythTokenPricesChange();
  useWatchWalletBalance();

  const [selectedTab, setSelectedTab] = useState<State>("long");
  const walletAdapterRef = useRef<HTMLDivElement>(null);
  const wallet = useSelector((s) => s.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);

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
    if (!walletTokenABalance || inputAValue < walletTokenABalance) {
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

        <>
          {selectedTab === "long" ? (
            <TradingInputs
              className={styles.trade__panel_trading_inputs}
              actionType="long"
              allowedTokenA={tokenList}
              allowedTokenB={nonStableTokenList}
              onChangeInputA={setInputAValue}
              onChangeInputB={setInputBValue}
              onChangeTokenA={setTokenA}
              onChangeTokenB={setTokenB}
              onChangeLeverage={setLeverage}
            />
          ) : null}

          {selectedTab === "short" ? (
            <TradingInputs
              className={styles.trade__panel_trading_inputs}
              actionType="short"
              allowedTokenA={tokenList}
              allowedTokenB={nonStableTokenList}
              onChangeInputA={setInputAValue}
              onChangeInputB={setInputBValue}
              onChangeTokenA={setTokenA}
              onChangeTokenB={setTokenB}
              onChangeLeverage={setLeverage}
            />
          ) : null}

          {selectedTab === "swap" ? (
            <TradingInputs
              className={styles.trade__panel_trading_inputs}
              actionType="swap"
              allowedTokenA={tokenList}
              allowedTokenB={tokenList}
              onChangeInputA={setInputAValue}
              onChangeInputB={setInputBValue}
              onChangeTokenA={setTokenA}
              onChangeTokenB={setTokenB}
              onChangeLeverage={setLeverage}
            />
          ) : null}
        </>

        {/* Position basic infos */}
        {selectedTab === "short" || selectedTab === "long" ? (
          <>
            <div className={styles.trade__panel_infos}>
              <div className={styles.trade__panel_infos_row}>
                <span>Collateral In</span>
                <span>{selectedTab === "long" ? "USD" : "USDC"}</span>
              </div>

              <div className={styles.trade__panel_infos_row}>
                <span>Leverage</span>
                <span>
                  {leverage !== null ? `${formatNumber(leverage, 2)}x` : "-"}
                </span>
              </div>

              <div className={styles.trade__panel_infos_row}>
                <span>Entry Price</span>
                <span>
                  {tokenB && tokenPrices[tokenB] !== null
                    ? formatPriceInfo(tokenPrices[tokenB]!)
                    : "-"}
                </span>
              </div>

              <div className={styles.trade__panel_infos_row}>
                <span>Liq. Price</span>
                <span>TODO</span>
              </div>

              <div className={styles.trade__panel_infos_row}>
                <span>Fees</span>
                <span>TODO</span>
              </div>
            </div>
          </>
        ) : null}

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

        {/* Position extended infos */}
        <>
          {selectedTab === "short" || selectedTab === "long" ? (
            <>
              <div className={styles.trade__panel_extended_infos}>
                <div className={styles.trade__panel_extended_infos_title}>
                  {selectedTab === "short" ? "Short" : "Long"} {tokenB ?? "-"}
                </div>

                <div className={styles.trade__panel_extended_infos_row}>
                  <span>Entry Price</span>
                  <span>
                    {tokenB && tokenPrices[tokenB]
                      ? formatPriceInfo(tokenPrices[tokenB]!)
                      : "-"}
                  </span>
                </div>

                <div className={styles.trade__panel_extended_infos_row}>
                  <span>Exit Price</span>
                  <span>TODO</span>
                </div>

                <div className={styles.trade__panel_extended_infos_row}>
                  <span>Borrow Fee</span>
                  <span>TODO</span>
                </div>

                <div className={styles.trade__panel_extended_infos_row}>
                  <span>Available Liquidity</span>
                  <span>TODO</span>
                </div>
              </div>
            </>
          ) : null}

          {selectedTab === "swap" ? (
            <>
              <div className={styles.trade__panel_extended_infos}>
                <div className={styles.trade__panel_extended_infos_title}>
                  Swap
                </div>

                <div className={styles.trade__panel_extended_infos_row}>
                  <span>{tokenA} Price</span>
                  <span>
                    {tokenA && tokenPrices[tokenA]
                      ? formatPriceInfo(tokenPrices[tokenA]!)
                      : "-"}
                  </span>
                </div>

                <div className={styles.trade__panel_extended_infos_row}>
                  <span>{tokenB} Price</span>
                  <span>
                    {tokenB && tokenPrices[tokenB]
                      ? formatPriceInfo(tokenPrices[tokenB]!)
                      : "-"}
                  </span>
                </div>

                <div className={styles.trade__panel_extended_infos_row}>
                  <span>Available Liquidity</span>
                  <span>TODO</span>
                </div>
              </div>
            </>
          ) : null}
        </>
      </div>
    </div>
  );
}
