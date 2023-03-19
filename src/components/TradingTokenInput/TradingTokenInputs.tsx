import { Token } from "@/types";
import { useState } from "react";
import Input from "../Input/Input";
import Select from "../Select/Select";
import styles from "./TradingTokenInputs.module.scss";

export default function TradingTokenInputs<T extends Token, U extends Token>({
  className,
  inputALabelTopLeft,
  inputALabelTopRight,
  inputBLabelTopLeft,
  inputBLabelTopRight,
  allowedTokenA,
  allowedTokenB,
}: {
  className?: string;
  inputALabelTopLeft?: string;
  inputALabelTopRight?: string;
  inputBLabelTopLeft?: string;
  inputBLabelTopRight?: string;
  allowedTokenA: T[];
  allowedTokenB: U[];
}) {
  const [inputA, setInputA] = useState<string>("");
  const [inputB, setInputB] = useState<string>("");

  // Pick first token as default value
  const [tokenA, setTokenA] = useState<T>(allowedTokenA[0]);
  const [tokenB, setTokenB] = useState<U>(allowedTokenB[0]);

  // Switch inputs values and tokens
  const switchAB = () => {
    setInputA(inputB);
    setInputB(inputA);

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

  return (
    <div className={`${styles.tradingTokenInputs} ${className ?? ""}`}>
      {/* Input A */}
      <div
        className={`${styles.tradingTokenInputs__container} ${className ?? ""}`}
      >
        <div className={styles.tradingTokenInputs__container_labels}>
          <div>{inputALabelTopLeft}</div>
          <div>{inputALabelTopRight}</div>
        </div>
        <div className={styles.tradingTokenInputs__container_infos}>
          <Input
            value={inputA}
            placeholder="0.00"
            className={styles.tradingTokenInputs__container_infos_input}
            onChange={(v) => setInputA(v)}
          />

          <Select
            className={styles.tradingTokenInputs__container_infos_select}
            selected={tokenA}
            options={allowedTokenA}
            onSelect={(token) => setTokenA(token)}
          />
        </div>
      </div>

      <div
        className={styles.tradingTokenInputs__switch}
        onClick={() => switchAB()}
      >
        <img src="/images/swap.svg" />
      </div>

      {/* Input B */}
      <div
        className={`${styles.tradingTokenInputs__container} ${className ?? ""}`}
      >
        <div className={styles.tradingTokenInputs__container_labels}>
          <div>{inputBLabelTopLeft}</div>
          <div>{inputBLabelTopRight}</div>
        </div>
        <div className={styles.tradingTokenInputs__container_infos}>
          <Input
            value={inputB}
            placeholder="0.00"
            className={styles.tradingTokenInputs__container_infos_input}
            onChange={(v) => setInputB(v)}
          />

          <Select
            className={styles.tradingTokenInputs__container_infos_select}
            selected={tokenB}
            options={allowedTokenB}
            onSelect={(token) => setTokenB(token)}
          />
        </div>
      </div>
    </div>
  );
}
