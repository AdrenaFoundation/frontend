import { useSelector } from "@/store/store";
import { PositionExtended, Token } from "@/types";
import {
  DISPLAY_NUMBER_PRECISION,
  formatNumber,
  formatPriceInfo,
  nativeToUi,
} from "@/utils";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import TradingInput from "../TradingInput/TradingInput";

export default function ClosePosition({
  className,
  position,
}: {
  className?: string;
  position: PositionExtended;
}) {
  const [input, setInput] = useState<number | null>(null);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const price: number | null = tokenPrices[position.token.name];

  return (
    <div
      className={twMerge(
        "bg-secondary",
        "border",
        "border-grey",
        "flex",
        "flex-col",
        className
      )}
    >
      <TradingInput
        textTopLeft={
          <>
            Close
            {input && price
              ? `: ${formatNumber(input / price, DISPLAY_NUMBER_PRECISION)} ${
                  position.token.name
                }`
              : null}
          </>
        }
        textTopRight={
          <>
            {`Max: ${formatNumber(nativeToUi(position.collateralUsd, 6), 2)}`}
          </>
        }
        value={input}
        maxButton={true}
        selectedToken={
          {
            name: "USD",
          } as Token
        }
        tokenList={[]}
        onTokenSelect={() => {
          // One token only
        }}
        onChange={setInput}
        onMaxButtonClick={() => {
          setInput(nativeToUi(position.collateralUsd, 6));
        }}
      />
    </div>
  );
}
