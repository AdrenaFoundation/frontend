import { TokenPricesState } from "@/reducers/tokenPricesReducer";
import { useSelector } from "@/store/store";
import { Token } from "@/types";
import { SetStateAction, useEffect, useState } from "react";
import Input from "../Input/Input";
import Select from "../Select/Select";
import styles from "./longPositionInputs.module.scss";

const DISPLAYED_PRICE_PRECISION = 6;
const INPUT_PRECISION = 8;

function getDisplayedUsdPrice(price: number): string {
  return `${Number(price.toFixed(DISPLAYED_PRICE_PRECISION)).toString()} USD`;
}

function recalculateInputs<T extends Token, U extends Token>({
  mainInput,
  secondaryInput,
  tokenPrices,
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

  const secondaryPrice = tokenPrices[secondaryInput.token];

  if (secondaryPrice === null) {
    secondaryInput.setPrice(null);
    secondaryInput.setInput("");
    return;
  }

  secondaryInput.setPrice(mainPrice);
  secondaryInput.setInput(
    Number((mainPrice / secondaryPrice).toFixed(INPUT_PRECISION)).toString()
  );
}

export default function longPositionInputs<T extends Token, U extends Token>({
  className,
  allowedTokenA,
  allowedTokenB,
}: {
  className?: string;
  allowedTokenA: T[];
  allowedTokenB: U[];
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

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
      });
    }

    // inputB is the reference
    if (manualUserInput === "B") {
      return recalculateInputs({
        mainInput: inputBInfos,
        secondaryInput: inputAInfos,
        tokenPrices,
      });
    }
  }, [
    inputA,
    inputB,
    tokenPrices[tokenA],
    tokenPrices[tokenB],
    tokenA,
    manualUserInput,
  ]);

  const handleInputAChange = (v: SetStateAction<string>) => {
    setManualUserInput("A");
    setInputA(v);
  };

  const handleInputBChange = (v: SetStateAction<string>) => {
    setManualUserInput("B");
    setInputB(v);
  };

  return (
    <div className={`${styles.longPositionInputs} ${className ?? ""}`}>
      {/* Input A */}
      <div
        className={`${styles.longPositionInputs__container} ${className ?? ""}`}
      >
        <div className={styles.longPositionInputs__container_labels}>
          <div>
            Pay{priceA !== null ? `: ${getDisplayedUsdPrice(priceA)}` : null}
          </div>
          <div>Balance</div>
        </div>
        <div className={styles.longPositionInputs__container_infos}>
          <Input
            value={inputA}
            placeholder="0.00"
            className={styles.longPositionInputs__container_infos_input}
            onChange={handleInputAChange}
          />

          <Select
            className={styles.longPositionInputs__container_infos_select}
            selected={tokenA}
            options={allowedTokenA}
            onSelect={(token) => setTokenA(token)}
          />
        </div>
      </div>

      <div
        className={styles.longPositionInputs__switch}
        onClick={() => switchAB()}
      >
        <img src="/images/swap.svg" />
      </div>

      {/* Input B */}
      <div
        className={`${styles.longPositionInputs__container} ${className ?? ""}`}
      >
        <div className={styles.longPositionInputs__container_labels}>
          <div>
            Long{priceB !== null ? `: ${getDisplayedUsdPrice(priceB)}` : null}
          </div>
          <div>Leverage</div>
        </div>
        <div className={styles.longPositionInputs__container_infos}>
          <Input
            value={inputB}
            placeholder="0.00"
            className={styles.longPositionInputs__container_infos_input}
            onChange={handleInputBChange}
          />

          <Select
            className={styles.longPositionInputs__container_infos_select}
            selected={tokenB}
            options={allowedTokenB}
            onSelect={(token) => setTokenB(token)}
          />
        </div>
      </div>
    </div>
  );
}
