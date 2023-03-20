import { TokenPricesState } from "@/reducers/tokenPricesReducer";
import { useSelector } from "@/store/store";
import { Token } from "@/types";
import { SetStateAction, useEffect, useState } from "react";
import Input from "../Input/Input";
import LeverageSlider from "../LeverageSlider/LeverageSlider";
import Select from "../Select/Select";
import styles from "./tradingInputs.module.scss";

const DISPLAYED_PRICE_PRECISION = 6;
const INPUT_PRECISION = 8;

function getDisplayedUsdPrice(price: number): string {
  return `${Number(price.toFixed(DISPLAYED_PRICE_PRECISION)).toString()} USD`;
}

function recalculateInputs<T extends Token, U extends Token>({
  mainInput,
  secondaryInput,
  tokenPrices,
  leverage,
}: {
  mainInput: {
    value: string;
    token: T;
    setPrice: (p: number | null) => void;
    setInput: (v: string) => void;
  };
  secondaryInput: {
    value: string;
    token: U;
    setPrice: (p: number | null) => void;
    setInput: (v: string) => void;
  };
  tokenPrices: TokenPricesState;
  leverage: number;
}) {
  const nb = Number(mainInput.value);

  // Price cannot be calculated if input is empty or not a number
  if (!mainInput.value.length || isNaN(nb)) {
    mainInput.setPrice(null);
    secondaryInput.setPrice(null);
    secondaryInput.setInput("");
    return;
  }

  const mainTokenPrice = tokenPrices[mainInput.token];

  // No price available yet
  if (mainTokenPrice === null) {
    mainInput.setPrice(null);
    secondaryInput.setPrice(null);
    secondaryInput.setInput("");
    return;
  }

  const mainPrice = nb * mainTokenPrice;

  mainInput.setPrice(mainPrice);

  const secondaryTokenPrice = tokenPrices[secondaryInput.token];

  if (secondaryTokenPrice === null) {
    secondaryInput.setPrice(null);
    secondaryInput.setInput("");
    return;
  }

  // TODO: take into account the fees to be paid by the user
  const secondaryPrice = mainPrice * leverage;

  secondaryInput.setPrice(secondaryPrice);
  secondaryInput.setInput(
    Number(
      (secondaryPrice / secondaryTokenPrice).toFixed(INPUT_PRECISION)
    ).toString()
  );
}

export default function TradingInputs<T extends Token, U extends Token>({
  actionType,
  className,
  allowedTokenA,
  allowedTokenB,
}: {
  actionType: "short" | "long" | "swap";
  className?: string;
  allowedTokenA: T[];
  allowedTokenB: U[];
}) {
  const wallet = useSelector((s) => s.wallet);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  // Keep track of the last input modified by the user
  // We consider it as the reference value
  const [manualUserInput, setManualUserInput] = useState<null | "A" | "B">(
    null
  );

  const [inputA, setInputA] = useState<string>("");
  const [inputB, setInputB] = useState<string>("");

  const [priceA, setPriceA] = useState<number | null>(null);
  const [priceB, setPriceB] = useState<number | null>(null);

  // Pick first token as default value
  const [tokenA, setTokenA] = useState<T>(allowedTokenA[0]);
  const [tokenB, setTokenB] = useState<U>(allowedTokenB[0]);

  const [leverage, setLeverage] = useState<number>(1);

  // Switch inputs values and tokens
  const switchAB = () => {
    setInputA(inputB);
    setInputB(inputA);

    // Because we switch sides, the manual user input is the opposite one
    setManualUserInput(manualUserInput === "A" ? "B" : "A");

    // if tokenB is not allowed, use default value
    setTokenA(
      allowedTokenA.includes(tokenB as any)
        ? (tokenB as unknown as T)
        : allowedTokenA[0]
    );

    // if tokenA is not allowed, use default value
    setTokenB(
      allowedTokenB.includes(tokenA as any)
        ? (tokenA as unknown as U)
        : allowedTokenB[0]
    );
  };

  // When price change, recalculate displayed price
  useEffect(() => {
    const inputAInfos = {
      value: inputA,
      token: tokenA,
      setPrice: setPriceA,
      setInput: setInputA,
    };

    const inputBInfos = {
      value: inputB,
      token: tokenB,
      setPrice: setPriceB,
      setInput: setInputB,
    };

    // inputA is the reference
    if (manualUserInput === "A") {
      return recalculateInputs({
        mainInput: inputAInfos,
        secondaryInput: inputBInfos,
        tokenPrices,
        leverage,
      });
    }

    // inputB is the reference
    if (manualUserInput === "B") {
      return recalculateInputs({
        mainInput: inputBInfos,
        secondaryInput: inputAInfos,
        tokenPrices,
        leverage,
      });
    }
  }, [inputA, inputB, tokenA, manualUserInput, leverage, tokenB, tokenPrices]);

  const handleInputAChange = (v: SetStateAction<string>) => {
    setManualUserInput("A");
    setInputA(v);
  };

  const handleInputBChange = (v: SetStateAction<string>) => {
    setManualUserInput("B");
    setInputB(v);
  };

  return (
    <div className={`${styles.tradingInputs} ${className ?? ""}`}>
      {/* Input A */}
      <div className={`${styles.tradingInputs__container} ${className ?? ""}`}>
        <div className={styles.tradingInputs__container_labels}>
          <div>
            Pay{priceA !== null ? `: ${getDisplayedUsdPrice(priceA)}` : null}
          </div>
          <div>
            {wallet ? `Balance: ${walletTokenBalances?.[tokenA] ?? "0"}` : null}
          </div>
        </div>
        <div className={styles.tradingInputs__container_infos}>
          <Input
            value={inputA}
            placeholder="0.00"
            className={styles.tradingInputs__container_infos_input}
            onChange={handleInputAChange}
          />

          <Select
            className={styles.tradingInputs__container_infos_select}
            selected={tokenA}
            options={allowedTokenA}
            onSelect={(token) => setTokenA(token)}
          />
        </div>
      </div>

      <div className={styles.tradingInputs__switch}>
        <div
          className={styles.tradingInputs__switch_inner}
          onClick={() => switchAB()}
        >
          {
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/swap.svg" alt="swap icon" />
          }
        </div>
      </div>

      {/* Input B */}
      <div className={`${styles.tradingInputs__container} ${className ?? ""}`}>
        <div className={styles.tradingInputs__container_labels}>
          <div>
            {
              {
                long: "Long",
                short: "Short",
                swap: "Receive",
              }[actionType]
            }
            {priceB !== null ? `: ${getDisplayedUsdPrice(priceB)}` : null}
          </div>

          {/* Display leverage if short/long, otherwise display wallet balance */}
          {actionType === "short" || actionType === "long" ? (
            <div>Leverage{`: x${leverage.toFixed(2)}`}</div>
          ) : (
            <>
              {wallet
                ? `Balance: ${walletTokenBalances?.[tokenA] ?? "0"}`
                : null}
            </>
          )}
        </div>
        <div className={styles.tradingInputs__container_infos}>
          <Input
            value={inputB}
            placeholder="0.00"
            className={styles.tradingInputs__container_infos_input}
            onChange={handleInputBChange}
          />

          <Select
            className={styles.tradingInputs__container_infos_select}
            selected={tokenB}
            options={allowedTokenB}
            onSelect={(token) => setTokenB(token)}
          />
        </div>
      </div>

      {/* Leverage (only in short/long) */}
      {actionType === "short" || actionType === "long" ? (
        <div className={styles.tradingInputs__leverage_slider}>
          <LeverageSlider
            className={styles.tradingInputs__leverage_slider_obj}
            onChange={(v: number) => setLeverage(v)}
          />
        </div>
      ) : null}
    </div>
  );
}
