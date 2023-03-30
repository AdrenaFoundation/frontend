import Button from "@/components/Button/Button";
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
  onClose,
}: {
  className?: string;
  position: PositionExtended;
  onClose: () => void;
}) {
  const [allowedIncreasedSlippage, setAllowedIncreasedSlippage] =
    useState<boolean>(false);
  const [input, setInput] = useState<number | null>(null);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const markPrice: number | null = tokenPrices[position.token.name];

  const entryPrice: number =
    nativeToUi(position.collateralUsd, 6) /
    nativeToUi(position.collateralAmount, position.token.decimals);

  const rowStyle = "w-full flex justify-between mt-2";

  const pnl = position.pnl
    ? !position.pnl.profit.isZero()
      ? nativeToUi(position.pnl.profit, 6)
      : nativeToUi(position.pnl.loss, 6) * -1
    : null;

  return (
    <div className={twMerge("flex", "flex-col", "h-full", className)}>
      <TradingInput
        textTopLeft={
          <>
            Close
            {input && markPrice
              ? `: ${formatNumber(
                  input / markPrice,
                  DISPLAY_NUMBER_PRECISION
                )} ${position.token.name}`
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

      <div className={`${rowStyle} mt-4`}>
        <div>Allow up to 1% slippage</div>
        <div>
          <input
            className="cursor-pointer"
            type="checkbox"
            checked={allowedIncreasedSlippage}
            onChange={(v) => {
              setAllowedIncreasedSlippage(v.currentTarget.checked);
            }}
          />
        </div>
      </div>

      <div className={rowStyle}>
        <div>Allowed slippage</div>
        <div>{allowedIncreasedSlippage ? "1.00%" : "0.30%"}</div>
      </div>

      <div className="mt-2 h-[1px] w-full bg-grey" />

      <div className={rowStyle}>
        <div>Mark Price</div>
        <div>{markPrice ? formatPriceInfo(markPrice) : "-"}</div>
      </div>

      <div className={rowStyle}>
        <div>Entry Price</div>
        <div>{entryPrice ? formatPriceInfo(entryPrice) : "-"}</div>
      </div>

      <div className={rowStyle}>
        <div>Liq. Price</div>
        <div>
          {position.liquidationPrice
            ? formatPriceInfo(nativeToUi(position.liquidationPrice, 6))
            : "-"}
        </div>
      </div>

      <div className="mt-2 h-[1px] w-full bg-grey" />

      <div className={rowStyle}>
        <div>Size</div>
        <div className="flex">
          {input ? (
            <>
              {formatPriceInfo(nativeToUi(position.collateralUsd, 6))}
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img src="images/arrow-right.svg" alt="arrow right" />
              }
              {formatPriceInfo(nativeToUi(position.collateralUsd, 6) - input)}
            </>
          ) : null}
        </div>
      </div>

      <div className={rowStyle}>
        <div>Collateral ({position.token.name})</div>
        <div className="flex">
          {input && markPrice ? (
            <>
              {formatNumber(
                nativeToUi(position.collateralUsd, 6) / markPrice,
                6
              )}
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img src="images/arrow-right.svg" alt="arrow right" />
              }
              {formatNumber(
                (nativeToUi(position.collateralUsd, 6) - input) / markPrice,
                6
              )}
            </>
          ) : null}
        </div>
      </div>

      <div className={rowStyle}>
        <div>PnL</div>
        <div>{pnl && markPrice ? formatPriceInfo(pnl, true) : null}</div>
      </div>

      <div className={rowStyle}>
        <div>Fees</div>
        <div>TODO</div>
      </div>

      <Button
        className="mt-4 bg-blue"
        title="Close"
        onClick={() => {
          onClose();
        }}
      />
    </div>
  );
}
