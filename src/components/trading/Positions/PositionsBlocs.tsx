import { twMerge } from "tailwind-merge";
import Button from "@/components/Button/Button";
import { useSelector } from "@/store/store";
import { formatNumber, formatPriceInfo, nativeToUi } from "@/utils";
import { PositionExtended } from "@/types";

export default function PositionsBlocs({
  className,
  positions,
  triggerClosePosition,
}: {
  className?: string;
  positions: PositionExtended[] | null;
  triggerClosePosition: (p: PositionExtended) => void;
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
          className="flex flex-col pb-4 border-b border-grey bg-secondary w-full p-4"
        >
          <div className="border-b border-grey pb-4">{position.token.name}</div>

          <div className="flex flex-col pt-2 pb-2">
            <div className={columnStyle}>
              <div>Leverage</div>
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
              <div>Size</div>
              <div>{formatPriceInfo(nativeToUi(position.sizeUsd, 6))}</div>
            </div>

            <div className={columnStyle}>
              <div>Collateral</div>
              <div>
                {formatPriceInfo(nativeToUi(position.collateralUsd, 6))}
              </div>
            </div>

            <div className={columnStyle}>
              <div>PnL</div>
              <div>
                {!position.pnl ? "-" : null}

                {position.pnl && !position.pnl.profit.isZero() ? (
                  <span className="text-green-400">
                    {formatPriceInfo(nativeToUi(position.pnl.profit, 6))}
                  </span>
                ) : null}

                {position.pnl && !position.pnl.loss.isZero() ? (
                  <span className="text-red-400">
                    {formatPriceInfo(nativeToUi(position.pnl.loss, 6) * -1)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={columnStyle}>
              <div>Entry Price</div>
              <div>{formatPriceInfo(nativeToUi(position.price, 6))}</div>
            </div>

            <div className={columnStyle}>
              <div>Mark Price</div>
              <div>
                {tokenPrices[position.token.name]
                  ? formatPriceInfo(tokenPrices[position.token.name]!)
                  : "-"}
              </div>
            </div>

            <div className={columnStyle}>
              <div>Liquidation Price</div>
              <div>
                {position.liquidationPrice
                  ? formatPriceInfo(nativeToUi(position.liquidationPrice, 6))
                  : "-"}
              </div>
            </div>
          </div>

          <div className="border-t border-grey pt-2">
            <Button
              className="w-24 bg-blue"
              title="Close"
              onClick={() => {
                triggerClosePosition(position);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
