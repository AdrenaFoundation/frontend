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
import { twMerge } from "tailwind-merge";

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

  const infoRowStyle = "w-full flex justify-between items-center mt-1";

  return (
    <div className={twMerge("relative", "flex", "flex-col", className)}>
      {/* Input A */}
      <div
        className={twMerge(
          "h-32",
          "w-32",
          "p-8",
          "bg-secondary",
          "flex",
          "items-center",
          "w-full",
          "justify-between",
          "flex-col"
        )}
      >
        <div
          className={twMerge(
            "shrink-0",
            "flex",
            "items-center",
            "w-full",
            "justify-between"
          )}
        >
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

        <div className="flex w-full items-center">
          <InputNumber
            value={inputA ?? undefined}
            placeholder="0.00"
            className={twMerge(
              "bg-secondary",
              "border-0",
              "text-lg",
              "outline-none",
              "w-full",
              "font-bold"
            )}
            onChange={handleInputAChange}
          />

          {connected ? (
            <Button
              title="MAX"
              className={twMerge(
                "bg-blue",
                "border-grey",
                "mr-1",
                "text-sm",
                "h-4"
              )}
              onClick={() => {
                if (!walletTokenBalances || !tokenA) return;

                const amount = walletTokenBalances[tokenA.name];

                handleInputAChange(amount);
              }}
            />
          ) : null}

          <Select
            selected={tokenA?.name ?? ""}
            options={allowedTokenA.map((v) => v.name)}
            onSelect={(name) =>
              setTokenA(allowedTokenA.find((mint) => mint.name === name)!)
            }
          />
        </div>
      </div>

      {/* Switch AB */}
      <div
        className={twMerge(
          "w-full",
          "h-4",
          "overflow-visible",
          "flex",
          "justify-center",
          "items-center",
          "z-[2]"
        )}
      >
        <div
          className={twMerge(
            "bg-blue",
            "flex",
            "rounded-full",
            "p-1",
            "w-7",
            "h-7",
            "cursor-pointer",
            "items-center",
            "justify-center"
          )}
          onClick={() => switchAB()}
        >
          {
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/swap.svg" alt="swap icon" />
          }
        </div>
      </div>

      {/* Input B */}
      <div
        className={twMerge(
          "h-32",
          "w-32",
          "p-8",
          "bg-secondary",
          "flex",
          "items-center",
          "w-full",
          "justify-between",
          "flex-col"
        )}
      >
        <div
          className={twMerge(
            "shrink-0",
            "flex",
            "items-center",
            "w-full",
            "justify-between"
          )}
        >
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

        <div className="flex w-full items-center">
          <InputNumber
            value={inputB ?? undefined}
            placeholder="0.00"
            className={twMerge(
              "bg-secondary",
              "border-0",
              "text-lg",
              "outline-none",
              "w-full",
              "font-bold"
            )}
            onChange={handleInputBChange}
          />

          <Select
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
            <div className="w-full mt-6 mb-2">Leverage Slider</div>
            <div className="w-full flex flex-col justify-center items-center">
              <LeverageSlider
                className="w-[90%] m-auto"
                onChange={(v: number) => setLeverage(v)}
              />
            </div>
          </>

          {/* Position basic infos */}
          <>
            <div className="p-1 mt-8">
              <div className={infoRowStyle}>
                <span>Collateral In</span>
                <span>{actionType === "long" ? "USD" : "USDC"}</span>
              </div>

              <div className={infoRowStyle}>
                <span>Leverage</span>
                <span>
                  {leverage !== null ? `${formatNumber(leverage, 2)}x` : "-"}
                </span>
              </div>

              <div className={infoRowStyle}>
                <span>Entry Price</span>
                <span>
                  {entryPriceAndFee
                    ? formatPriceInfo(
                        nativeToUi(entryPriceAndFee.entryPrice, 6)
                      )
                    : "-"}
                </span>
              </div>

              <div className={infoRowStyle}>
                <span>Liq. Price</span>
                <span>TODO</span>
              </div>

              <div className={infoRowStyle}>
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
