import { TokenPricesState } from "@/reducers/tokenPricesReducer";
import { useSelector } from "@/store/store";
import { Token } from "@/types";
import { useEffect, useState } from "react";
import Button from "../Button/Button";
import InputNumber from "../InputNumber/InputNumber";
import LeverageSlider from "../LeverageSlider/LeverageSlider";
import Select from "../Select/Select";
import styles from "./TradingInputs.module.scss";

const DISPLAYED_PRICE_PRECISION = 6;
const INPUT_PRECISION = 8;

function getDisplayedUsdPrice(price: number): string {
  return `${Number(
    price.toFixed(DISPLAYED_PRICE_PRECISION)
  ).toLocaleString()} USD`;
}

function recalculateInputs<T extends Token, U extends Token>({
  mainInput,
  secondaryInput,
  tokenPrices,
  leverage,
}: {
  mainInput: {
    value: number | null;
    token: T;
    setPrice: (p: number | null) => void;
    setInput: (v: number | null) => void;
  };
  secondaryInput: {
    value: number | null;
    token: U;
    setPrice: (p: number | null) => void;
    setInput: (v: number | null) => void;
  };
  tokenPrices: TokenPricesState;
  leverage: number;
}) {
  const nb = Number(mainInput.value);

  // Price cannot be calculated if input is empty or not a number
  if (mainInput.value === null || isNaN(nb)) {
    mainInput.setPrice(null);
    secondaryInput.setPrice(null);
    secondaryInput.setInput(null);
    return;
  }

  const mainTokenPrice = tokenPrices[mainInput.token];

  // No price available yet
  if (mainTokenPrice === null) {
    mainInput.setPrice(null);
    secondaryInput.setPrice(null);
    secondaryInput.setInput(null);
    return;
  }

  const mainPrice = nb * mainTokenPrice;

  mainInput.setPrice(mainPrice);

  const secondaryTokenPrice = tokenPrices[secondaryInput.token];

  if (secondaryTokenPrice === null) {
    secondaryInput.setPrice(null);
    secondaryInput.setInput(null);
    return;
  }

  // TODO: take into account the fees to be paid by the user
  const secondaryPrice = mainPrice * leverage;

  secondaryInput.setPrice(secondaryPrice);
  secondaryInput.setInput(
    Number((secondaryPrice / secondaryTokenPrice).toFixed(INPUT_PRECISION))
  );
}

export default function TradingInputs<T extends Token, U extends Token>({
  actionType,
  className,
  allowedTokenA,
  allowedTokenB,
  onChangeInputA,
  onChangeInputB,
  onChangeTokenA,
  onChangeTokenB,
  onChangeLeverage,
}: {
  actionType: "short" | "long" | "swap";
  className?: string;
  allowedTokenA: T[];
  allowedTokenB: U[];
  onChangeInputA: (v: number | null) => void;
  onChangeInputB: (v: number | null) => void;
  onChangeTokenA: (t: T) => void;
  onChangeTokenB: (t: U) => void;
  onChangeLeverage: (v: number) => void;
}) {
  const wallet = useSelector((s) => s.wallet);
  const connected = !!wallet;

  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  // Keep track of the last input modified by the user
  // We consider it as the reference value
  const [manualUserInput, setManualUserInput] = useState<null | "A" | "B">(
    null
  );

  const [inputA, setInputA] = useState<number | null>(null);
  const [inputB, setInputB] = useState<number | null>(null);

  const [priceA, setPriceA] = useState<number | null>(null);
  const [priceB, setPriceB] = useState<number | null>(null);

  // Pick first token as default value
  const [tokenA, setTokenA] = useState<T>(allowedTokenA[0]);
  const [tokenB, setTokenB] = useState<U>(allowedTokenB[0]);

  const [leverage, setLeverage] = useState<number>(1);

  // Propagate changes to upper component
  {
    useEffect(() => {
      const nb = Number(inputA);
      onChangeInputA(isNaN(nb) || inputA === null ? null : nb);
    }, [inputA, onChangeInputA]);

    useEffect(() => {
      const nb = Number(inputB);
      onChangeInputB(isNaN(nb) || inputB === null ? null : nb);
    }, [inputB, onChangeInputB]);

    useEffect(() => {
      onChangeTokenA(tokenA);
    }, [onChangeTokenA, tokenA]);

    useEffect(() => {
      onChangeTokenB(tokenB);
    }, [onChangeTokenB, tokenB]);

    useEffect(() => {
      onChangeLeverage(leverage);
    }, [onChangeLeverage, leverage]);
  }

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

  const handleInputAChange = (v: number | null) => {
    setManualUserInput("A");
    setInputA(v);
  };

  const handleInputBChange = (v: number | null) => {
    setManualUserInput("B");
    setInputB(v);
  };

  return (
    <div className={`${styles.tradingInputs} ${className ?? ""}`}>
      {/* Input A */}
      <div className={styles.tradingInputs__container}>
        <div className={styles.tradingInputs__container_labels}>
          <div>
            Pay{priceA !== null ? `: ${getDisplayedUsdPrice(priceA)}` : null}
          </div>
          <div>
            {connected
              ? `Balance: ${walletTokenBalances?.[tokenA] ?? "0"}`
              : null}
          </div>
        </div>
        <div className={styles.tradingInputs__container_infos}>
          <InputNumber
            value={inputA ?? undefined}
            placeholder="0.00"
            className={styles.tradingInputs__container_infos_input}
            onChange={handleInputAChange}
          />

          {connected ? (
            <Button
              title="MAX"
              className={styles.tradingInputs__container_infos_max}
              onClick={() => {
                if (!walletTokenBalances) return;

                const amount = walletTokenBalances[tokenA];

                handleInputAChange(amount);
              }}
            />
          ) : null}

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
      <div className={styles.tradingInputs__container}>
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
              {connected
                ? `Balance: ${walletTokenBalances?.[tokenA] ?? "0"}`
                : null}
            </>
          )}
        </div>
        <div className={styles.tradingInputs__container_infos}>
          <InputNumber
            value={inputB ?? undefined}
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
        <>
          <div className={styles.tradingInputs__leverage_slider_title}>
            Leverage Slider
          </div>
          <div className={styles.tradingInputs__leverage_slider}>
            <LeverageSlider
              className={styles.tradingInputs__leverage_slider_obj}
              onChange={(v: number) => setLeverage(v)}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
