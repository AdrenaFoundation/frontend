import { useEffect, useState } from "react";
import { BN } from "@project-serum/anchor";
import useGetPositionEntryPriceAndFee from "@/hooks/useGetPositionEntryPriceAndFee";
import { TokenPricesState } from "@/reducers/tokenPricesReducer";
import { useSelector } from "@/store/store";
import { Token } from "@/types";
import {
  DISPLAY_NUMBER_PRECISION,
  formatNumber,
  formatPriceInfo,
  INPUT_PRECISION,
  nativeToUi,
  uiToNative,
} from "@/utils";
import Button from "../../Button/Button";
import InputNumber from "../../InputNumber/InputNumber";
import LeverageSlider from "../../LeverageSlider/LeverageSlider";
import Select from "../../Select/Select";
import styles from "./TradingInputs.module.scss";

function recalculateInputs({
  mainInput,
  secondaryInput,
  tokenPrices,
  leverage,
}: {
  mainInput: {
    value: number | null;
    mint: Token | null;
    setPrice: (p: number | null) => void;
    setInput: (v: number | null) => void;
  };
  secondaryInput: {
    value: number | null;
    mint: Token | null;
    setPrice: (p: number | null) => void;
    setInput: (v: number | null) => void;
  };
  tokenPrices: TokenPricesState;
  leverage: number;
}) {
  const nb = Number(mainInput.value);

  // Price cannot be calculated if input is empty or not a number
  if (
    mainInput.value === null ||
    isNaN(nb) ||
    !mainInput.mint ||
    !secondaryInput.mint
  ) {
    mainInput.setPrice(null);
    secondaryInput.setPrice(null);
    secondaryInput.setInput(null);
    return;
  }

  const mainTokenPrice = tokenPrices[mainInput.mint.name];

  // No price available yet
  if (!mainTokenPrice) {
    mainInput.setPrice(null);
    secondaryInput.setPrice(null);
    secondaryInput.setInput(null);
    return;
  }

  const mainPrice = nb * mainTokenPrice;

  mainInput.setPrice(mainPrice);

  const secondaryTokenPrice = tokenPrices[secondaryInput.mint.name];

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

export default function TradingInputs({
  actionType,
  className,
  tokenA,
  tokenB,
  allowedTokenA,
  allowedTokenB,
  onChangeInputA,
  onChangeInputB,
  setTokenA,
  setTokenB,
  onChangeLeverage,
}: {
  actionType: "short" | "long" | "swap";
  className?: string;
  tokenA: Token;
  tokenB: Token;
  allowedTokenA: Token[];
  allowedTokenB: Token[];
  onChangeInputA: (v: number | null) => void;
  onChangeInputB: (v: number | null) => void;
  setTokenA: (t: Token | null) => void;
  setTokenB: (t: Token | null) => void;
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

  const [leverage, setLeverage] = useState<number>(1);

  const entryPriceAndFee = useGetPositionEntryPriceAndFee(
    (actionType === "short" || actionType === "long") &&
      tokenB &&
      inputB &&
      inputB > 0
      ? {
          token: tokenB,
          collateral: uiToNative(inputB, 6).div(new BN(leverage)),
          size: uiToNative(inputB, 6),
          side: actionType,
        }
      : null
  );

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
      onChangeLeverage(leverage);
    }, [onChangeLeverage, leverage]);
  }

  // Switch inputs values and tokens
  const switchAB = () => {
    if (!tokenA || !tokenB) return;

    setInputA(inputB);
    setInputB(inputA);

    // Because we switch sides, the manual user input is the opposite one
    setManualUserInput(manualUserInput === "A" ? "B" : "A");

    // if tokenB is not allowed, use default value
    setTokenA(
      allowedTokenA.find((token) => token.mint.equals(tokenB.mint))
        ? tokenB
        : allowedTokenA[0]
    );

    // if tokenA is not allowed, use default value
    setTokenB(
      allowedTokenB.find((token) => token.mint.equals(tokenA.mint))
        ? tokenA
        : allowedTokenB[0]
    );
  };

  // When price change, recalculate displayed price
  useEffect(() => {
    const inputAInfos = {
      value: inputA,
      mint: tokenA,
      setPrice: setPriceA,
      setInput: setInputA,
    };

    const inputBInfos = {
      value: inputB,
      mint: tokenB,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputA,
    inputB,
    manualUserInput,
    leverage,
    // Don't target tokenPrices directly otherwise it refreshes even when unrelated prices changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    tokenA && tokenPrices[tokenA.name],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    tokenB && tokenPrices[tokenB.name],
  ]);

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
            Pay
            {priceA !== null
              ? `: ${formatNumber(priceA, DISPLAY_NUMBER_PRECISION)} USD`
              : null}
          </div>
          <div>
            {connected && tokenA
              ? `Balance: ${(
                  walletTokenBalances?.[tokenA.name] ?? "0"
                ).toLocaleString()}`
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
                if (!walletTokenBalances || !tokenA) return;

                const amount = walletTokenBalances[tokenA.name];

                handleInputAChange(amount);
              }}
            />
          ) : null}

          <Select
            className={styles.tradingInputs__container_infos_select}
            selected={tokenA?.name ?? ""}
            options={allowedTokenA.map((v) => v.name)}
            onSelect={(name) =>
              setTokenA(allowedTokenA.find((mint) => mint.name === name)!)
            }
          />
        </div>
      </div>

      {/* Switch AB */}
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
            {priceB !== null
              ? `: ${formatNumber(priceB, DISPLAY_NUMBER_PRECISION)} USD`
              : null}
          </div>

          {/* Display leverage if short/long, otherwise display wallet balance */}
          {actionType === "short" || actionType === "long" ? (
            <div>Leverage{`: ${leverage.toFixed(2)}x`}</div>
          ) : (
            <>
              {connected && tokenA
                ? `Balance: ${(
                    walletTokenBalances?.[tokenA.name] ?? "0"
                  ).toLocaleString()}`
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
            selected={tokenB?.name ?? ""}
            options={allowedTokenB.map((v) => v.name)}
            onSelect={(name) =>
              setTokenB(allowedTokenB.find((mint) => mint.name === name)!)
            }
          />
        </div>
      </div>

      {actionType === "short" || actionType === "long" ? (
        <>
          {/* Leverage (only in short/long) */}
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

          {/* Position basic infos */}
          <>
            <div className={styles.tradingInputs__infos}>
              <div className={styles.tradingInputs__infos_row}>
                <span>Collateral In</span>
                <span>{actionType === "long" ? "USD" : "USDC"}</span>
              </div>

              <div className={styles.tradingInputs__infos_row}>
                <span>Leverage</span>
                <span>
                  {leverage !== null ? `${formatNumber(leverage, 2)}x` : "-"}
                </span>
              </div>

              <div className={styles.tradingInputs__infos_row}>
                <span>Entry Price</span>
                <span>
                  {entryPriceAndFee
                    ? formatPriceInfo(
                        nativeToUi(entryPriceAndFee.entryPrice, 6)
                      )
                    : "-"}
                </span>
              </div>

              <div className={styles.tradingInputs__infos_row}>
                <span>Liq. Price</span>
                <span>TODO</span>
              </div>

              <div className={styles.tradingInputs__infos_row}>
                <span>Fees</span>
                <span>
                  {entryPriceAndFee
                    ? formatPriceInfo(nativeToUi(entryPriceAndFee.fee, 6))
                    : "-"}
                </span>
              </div>
            </div>
          </>
        </>
      ) : null}
    </div>
  );
}
