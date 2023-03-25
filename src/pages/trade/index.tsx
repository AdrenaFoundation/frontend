import { useRef, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

import TabSelect from "@/components/TabSelect/TabSelect";
import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import { NonStableToken, Token } from "@/types";
import useWatchWalletBalance from "@/hooks/useWatchWalletBalance";
import TradingInputs from "@/components/trading/TradingInputs/TradingInputs";
import Button from "@/components/Button/Button";
import WalletAdapter from "@/components/WalletAdapter/WalletAdapter";
import { useSelector } from "@/store/store";
import { nonStableTokenList, stableTokenList, tokenList } from "@/constant";
import TradingChart from "@/components/trading/TradingChart/TradingChart";
import SwapDetails from "@/components/trading/SwapDetails/SwapDetails";
import PositionDetails from "@/components/trading/PositionDetails/PositionDetails";
import useAdrenaClient from "@/hooks/useAdrenaClient";
import useCustodies from "@/hooks/useCustodies";
import { uiToNative } from "@/utils";

import styles from "./index.module.scss";

type Action = "long" | "short" | "swap";

export default function Trade() {
  useListenToPythTokenPricesChange();
  useWatchWalletBalance();

  const client = useAdrenaClient();
  const custodies = useCustodies();
  const [selectedAction, setSelectedAction] = useState<Action>("long");
  const walletAdapterRef = useRef<HTMLDivElement>(null);
  const wallet = useSelector((s) => s.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [inputAValue, setInputAValue] = useState<number | null>(null);
  const [inputBValue, setInputBValue] = useState<number | null>(null);
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);

  // Unused for now
  const [leverage, setLeverage] = useState<number | null>(null);

  const handleExecuteButton = async () => {
    if (selectedAction === "swap") {
      // Should never happens
      return;
    }

    if (!connected || !client) {
      walletAdapterRef.current?.click();
      return;
    }

    if (
      !custodies ||
      !tokenA ||
      !tokenB ||
      !tokenPrices[tokenB] ||
      !inputAValue ||
      !inputBValue ||
      !leverage
    ) {
      console.log("Missing data to open position");
      return;
    }

    await client.openPositionWithSwap({
      owner: new PublicKey(wallet.walletAddress),
      tokenA,
      tokenB: tokenB as NonStableToken,
      custodyA: custodies[tokenA],
      custodyB: custodies[tokenB],
      amountA: uiToNative(inputAValue, 6),
      price: uiToNative(tokenPrices[tokenB]!, 6),
      collateral: uiToNative(inputBValue, 6).div(new BN(leverage)),
      size: uiToNative(inputBValue, 6),
      side: selectedAction,
    });
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
            {selectedAction === "short" || selectedAction === "long" ? (
              <TradingChart token={tokenB} />
            ) : null}

            {selectedAction === "swap" ? (
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
          selected={selectedAction}
          tabs={[
            { title: "long", icon: "/images/long.svg" },
            { title: "short", icon: "/images/short.svg" },
            { title: "swap", icon: "/images/swap.svg" },
          ]}
          onClick={(title, _: number) => {
            setSelectedAction(title);
          }}
        />

        <TradingInputs
          className={styles.trade__panel_trading_inputs}
          actionType={selectedAction}
          allowedTokenA={tokenList}
          allowedTokenB={
            selectedAction === "swap" ? tokenList : nonStableTokenList
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
              <span>{selectedAction}</span>

              {selectedAction === "short" || selectedAction === "long" ? (
                <span>{tokenB ?? "-"}</span>
              ) : null}
            </div>

            {tokenB && tokenA ? (
              <>
                {selectedAction === "short" || selectedAction === "long" ? (
                  <PositionDetails
                    tokenB={tokenB}
                    entryPrice={
                      tokenB &&
                      inputBValue &&
                      tokenPrices &&
                      tokenPrices[tokenB]
                        ? tokenPrices[tokenB]
                        : null
                    }
                    exitPrice={
                      tokenB &&
                      inputBValue &&
                      tokenPrices &&
                      tokenPrices[tokenB]
                        ? tokenPrices[tokenB]
                        : null
                    }
                  />
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
