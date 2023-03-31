import { twMerge } from "tailwind-merge";
import Button from "@/components/Button/Button";
import { useSelector } from "@/store/store";
import { formatNumber, formatPriceInfo, nativeToUi } from "@/utils";
import { PositionExtended } from "@/types";

export default function PositionsBlocs({
  className,
  positions,
  triggerReduceOrClosePosition,
}: {
  className?: string;
  positions: PositionExtended[] | null;
  triggerReduceOrClosePosition: (p: PositionExtended) => void;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const columnStyle = "flex w-full justify-between";

  return (
    <div className={twMerge("w-full", "flex", "flex-wrap", className)}>
      {!positions?.length ? (
        <div className="mt-5 mb-5 ml-auto mr-auto">No opened position</div>
      ) : null}

      {positions?.map((position) => (
        <div
          key={position.pubkey.toBase58()}
          className="flex flex-col border border-grey bg-secondary w-[26em] ml-auto mr-auto"
        >
          <div className="border-b border-grey p-4">{position.token.name}</div>

          <div className="flex flex-col p-4">
            <div className={columnStyle}>
              <div className="text-txtfade">Leverage</div>
              <div className="flex">
                <div>{formatNumber(position.leverage, 2)}x</div>
                <div
                  className={twMerge(
                    "ml-1",
                    "capitalize",
                    position.side === "long" ? "text-green-400" : "text-red-400"
                  )}
                >
                  {position.side}
                </div>
              </div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">Size</div>
              <div>{formatPriceInfo(position.uiSizeUsd)}</div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">Collateral</div>
              <div>{formatPriceInfo(position.uiCollateralUsd)}</div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">PnL</div>
              <div>
                {position.uiPnl ? (
                  <span
                    className={`text-${
                      position.uiPnl > 0 ? "green" : "red"
                    }-400`}
                  >
                    {formatPriceInfo(position.uiPnl)}
                  </span>
                ) : (
                  "-"
                )}
              </div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">Entry Price</div>
              <div>{formatPriceInfo(position.uiPrice)}</div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">Mark Price</div>
              <div>
                {tokenPrices[position.token.name]
                  ? formatPriceInfo(tokenPrices[position.token.name]!)
                  : "-"}
              </div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">Liquidation Price</div>
              <div>
                {position.uiLiquidationPrice
                  ? formatPriceInfo(position.uiLiquidationPrice)
                  : "-"}
              </div>
            </div>
          </div>

          <div className="border-t border-grey p-4">
            <Button
              className="w-36 bg-highlight"
              title="Reduce or Close"
              onClick={() => {
                triggerReduceOrClosePosition(position);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
