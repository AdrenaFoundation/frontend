import { useEffect, useRef, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

import TabSelect from "@/components/TabSelect/TabSelect";
import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import { Token } from "@/types";
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
import Positions from "@/components/trading/Positions/Positions";
import TradingChartHeader from "@/components/trading/TradingChartHeader/TradingChartHeader";
import usePositions from "@/hooks/usePositions";
import { twMerge } from "tailwind-merge";

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
  const positions = usePositions();

  const [inputAValue, setInputAValue] = useState<number | null>(null);
  const [inputBValue, setInputBValue] = useState<number | null>(null);
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);

  // Unused for now
  const [leverage, setLeverage] = useState<number | null>(null);

  // Setup
  useEffect(() => {
    if (!client) return;

    if (!tokenA) {
      setTokenA(client.tokens[0]);
    }

    if (!tokenB) {
      setTokenB(
        selectedAction === "swap"
          ? client.tokens[0]
          : client.tokens.filter((t) => !t.isStable)[0]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only call when the user get initialized or we change of action
    client,
    selectedAction,
  ]);

  const handleExecuteButton = async () => {
    if (!connected || !client) {
      walletAdapterRef.current?.click();
      return;
    }

    if (
      !tokenA ||
      !tokenB ||
      !tokenPrices[tokenB.name] ||
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
        minAmountOut: new BN(0),
        mintA: tokenA.mint,
        mintB: tokenB.mint,
      });
    }

    return client.openPositionWithSwap({
      owner: new PublicKey(wallet.walletAddress),
      mintA: tokenA.mint,
      mintB: tokenA.mint,
      amountA: uiToNative(inputAValue, 6),
      price: uiToNative(tokenPrices[tokenB.name]!, 6),
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

    const walletTokenABalance = walletTokenBalances?.[tokenA.name];

    // Loading, should happens quickly
    if (typeof walletTokenABalance === "undefined") {
      return "...";
    }

    // If user wallet balance doesn't have enough tokens, tell user
    if (!walletTokenABalance || inputAValue > walletTokenABalance) {
      return `Insufficient ${tokenA.name} balance`;
    }

    return "Execute";
  })();

  return (
    <div
      className={twMerge(
        "w-full",
        "h-full",
        "flex",
        "bg-main",
        "p-4",
        "overflow-auto",
        "flex-col",
        "items-center",
        "xl:flex-row",
        "xl:justify-center",
        "xl:items-start"
      )}
    >
      <div
        className={twMerge(
          "flex",
          "flex-col",
          "w-full",
          "xl:w-[60%]",
          "xl:max-w-[60em]"
        )}
      >
        {/* Trading chart header */}
        {client && tokenB ? (
          <TradingChartHeader
            className="mb-4 pl-4 pr-4"
            tokenList={
              selectedAction === "short" || selectedAction === "long"
                ? client.tokens.filter((t) => !t.isStable)
                : client.tokens
            }
            selected={tokenB}
            onChange={(t: Token) => {
              console.log("SetTokenB", t);
              setTokenB(t);
            }}
          />
        ) : null}

        <div
          className={twMerge(
            "h-[60em]",
            "shrink-1",
            "grow",
            "bg-main",
            "flex",
            "max-w-full",
            "max-h-[30em]"
          )}
        >
          {/* Display trading chart for appropriate token */}
          {tokenA && tokenB ? (
            <>
              {selectedAction === "short" || selectedAction === "long" ? (
                <TradingChart token={tokenB} />
              ) : null}

              {selectedAction === "swap" ? (
                <TradingChart token={tokenA.isStable ? tokenB : tokenA} />
              ) : null}
            </>
          ) : null}
        </div>

        <>
          {positions ? (
            <>
              <div className="mb-4">Positions ({positions.length})</div>

              <Positions positions={positions} />
            </>
          ) : null}
        </>
      </div>

      <div className="flex flex-col mt-4 xl:ml-4 xl:mt-0">
        <div
          className={twMerge(
            "w-[26em]",
            "bg-secondary",
            "p-4",
            "border",
            "border-grey"
          )}
        >
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

          {client && client.tokens.length && tokenA && tokenB && (
            <>
              <TradingInputs
                className="mt-4"
                actionType={selectedAction}
                allowedTokenA={client.tokens}
                allowedTokenB={
                  selectedAction === "swap"
                    ? client.tokens
                    : client.tokens.filter((t) => !t.isStable)
                }
                tokenA={tokenA}
                tokenB={tokenB}
                onChangeInputA={setInputAValue}
                onChangeInputB={setInputBValue}
                setTokenA={setTokenA}
                setTokenB={setTokenB}
                onChangeLeverage={setLeverage}
              />
            </>
          )}

          {/* Button to execute action */}
          <>
            <Button
              className="mt-4 bg-highlight"
              title={buttonTitle}
              onClick={handleExecuteButton}
            />

            {/* to handle wallet connection, create an hidden wallet adapter */}
            <WalletAdapter className="hidden" ref={walletAdapterRef} />
          </>
        </div>

        {/* Position details */}
        <div
          className={twMerge(
            "w-[26em]",
            "mt-4",
            "bg-secondary",
            "border",
            "border-grey"
          )}
        >
          <div className="flex items-center border-b border-grey p-3">
            <span className="capitalize">{selectedAction}</span>

            {selectedAction === "short" || selectedAction === "long" ? (
              <span className="ml-1">{tokenB?.name ?? "-"}</span>
            ) : null}
          </div>

          {tokenA && tokenB ? (
            <>
              {selectedAction === "short" || selectedAction === "long" ? (
                <PositionDetails
                  className="p-4"
                  tokenB={tokenB}
                  entryPrice={
                    tokenB &&
                    inputBValue &&
                    tokenPrices &&
                    tokenPrices[tokenB.name]
                      ? tokenPrices[tokenB.name]
                      : null
                  }
                  exitPrice={
                    tokenB &&
                    inputBValue &&
                    tokenPrices &&
                    tokenPrices[tokenB.name]
                      ? tokenPrices[tokenB.name]
                      : null
                  }
                />
              ) : (
                <SwapDetails tokenA={tokenA} tokenB={tokenB} />
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
