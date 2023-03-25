import { useRef, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

import TabSelect from "@/components/TabSelect/TabSelect";
import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import { Mint } from "@/types";
import useWatchWalletBalance from "@/hooks/useWatchWalletBalance";
import TradingInputs from "@/components/trading/TradingInputs/TradingInputs";
import Button from "@/components/Button/Button";
import WalletAdapter from "@/components/WalletAdapter/WalletAdapter";
import { useSelector } from "@/store/store";
import TradingChart from "@/components/trading/TradingChart/TradingChart";
import SwapDetails from "@/components/trading/SwapDetails/SwapDetails";
import PositionDetails from "@/components/trading/PositionDetails/PositionDetails";
import useAdrenaClient from "@/hooks/useAdrenaClient";
import { uiToNative } from "@/utils";

import styles from "./index.module.scss";

type Action = "long" | "short" | "swap";

export default function Trade() {
  useListenToPythTokenPricesChange();
  useWatchWalletBalance();

  const client = useAdrenaClient();
  const [selectedAction, setSelectedAction] = useState<Action>("long");
  const walletAdapterRef = useRef<HTMLDivElement>(null);
  const wallet = useSelector((s) => s.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [inputAValue, setInputAValue] = useState<number | null>(null);
  const [inputBValue, setInputBValue] = useState<number | null>(null);
  const [mintA, setMintA] = useState<Mint | null>(null);
  const [mintB, setMintB] = useState<Mint | null>(null);

  // Unused for now
  const [leverage, setLeverage] = useState<number | null>(null);

  const handleExecuteButton = async () => {
    if (!connected || !client) {
      walletAdapterRef.current?.click();
      return;
    }

    if (
      !mintA ||
      !mintB ||
      !tokenPrices[mintB.pubkey.toBase58()] ||
      !inputAValue ||
      !inputBValue ||
      !leverage
    ) {
      console.log("Missing data to open position");
      return;
    }

    if (selectedAction === "swap") {
      return client.swap({
        owner: new PublicKey(wallet.walletAddress),
        amountIn: uiToNative(inputAValue, 6),

        // TODO
        // How to handle slippage?
        // the inputBValue should take fees into account, for now it doesn't.
        // use high slippage here so we can do swaps
        minAmountOut: uiToNative(inputBValue, 6)
          .mul(new BN(9_000))
          .div(new BN(10_000)),
        mintA: mintA.pubkey,
        mintB: mintB.pubkey,
      });
    }

    return client.openPositionWithSwap({
      owner: new PublicKey(wallet.walletAddress),
      mintA: mintA.pubkey,
      mintB: mintA.pubkey,
      amountA: uiToNative(inputAValue, 6),
      price: uiToNative(tokenPrices[mintB.pubkey.toBase58()]!, 6),
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
    if (!mintA) {
      return "...";
    }

    const walletTokenABalance = walletTokenBalances?.[mintA.pubkey.toBase58()];

    // Loading, should happens quickly
    if (typeof walletTokenABalance === "undefined") {
      return "...";
    }

    // If user wallet balance doesn't have enough tokens, tell user
    if (!walletTokenABalance || inputAValue > walletTokenABalance) {
      return `Insufficient ${mintA.name} balance`;
    }

    return "Execute";
  })();

  return (
    <div className={styles.trade}>
      <div className={styles.trade__tradingview}>
        {/* Display trading chart for appropriate token */}
        {mintA && mintB ? (
          <>
            {selectedAction === "short" || selectedAction === "long" ? (
              <TradingChart mint={mintB} />
            ) : null}

            {selectedAction === "swap" ? (
              <TradingChart mint={mintA.isStable ? mintB : mintA} />
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

        {client && client.mints.length && (
          <TradingInputs
            className={styles.trade__panel_trading_inputs}
            actionType={selectedAction}
            allowedMintA={client.mints}
            allowedMintB={
              selectedAction === "swap"
                ? client.mints
                : client.mints.filter((m) => !m.isStable)
            }
            onChangeInputA={setInputAValue}
            onChangeInputB={setInputBValue}
            onChangeMintA={setMintA}
            onChangeMintB={setMintB}
            onChangeLeverage={setLeverage}
          />
        )}

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
                <span>{mintB?.name ?? "-"}</span>
              ) : null}
            </div>

            {mintA && mintB ? (
              <>
                {selectedAction === "short" || selectedAction === "long" ? (
                  <PositionDetails
                    mintB={mintB}
                    entryPrice={
                      mintB &&
                      inputBValue &&
                      tokenPrices &&
                      tokenPrices[mintB.name]
                        ? tokenPrices[mintB.name]
                        : null
                    }
                    exitPrice={
                      mintB &&
                      inputBValue &&
                      tokenPrices &&
                      tokenPrices[mintB.name]
                        ? tokenPrices[mintB.name]
                        : null
                    }
                  />
                ) : (
                  <SwapDetails mintA={mintA} mintB={mintB} />
                )}
              </>
            ) : null}
          </div>
        </>
      </div>
    </div>
  );
}
