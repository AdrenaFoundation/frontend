import { BN } from "@project-serum/anchor";
import Image from "next/image";
import useGetPositionEntryPriceAndFee from "@/hooks/useGetPositionEntryPriceAndFee";
import { PositionExtended, Token } from "@/types";
import { formatNumber, formatPriceInfo, nativeToUi, uiToNative } from "@/utils";
import { twMerge } from "tailwind-merge";
import { PRICE_DECIMALS } from "@/constant";
import { AdrenaClient } from "@/AdrenaClient";

export default function PositionInfos({
  className,
  side,
  tokenB,
  inputB,
  leverage,
  openedPosition,
  client,
}: {
  side: "short" | "long";
  className?: string;
  tokenB: Token;
  inputB: number | null;
  leverage: number;
  openedPosition: PositionExtended | null;
  client: AdrenaClient | null;
}) {
  const entryPriceAndFee = useGetPositionEntryPriceAndFee(
    tokenB && inputB && inputB > 0
      ? {
          token: tokenB,
          collateral: uiToNative(inputB, tokenB.decimals).div(new BN(leverage)),
          size: uiToNative(inputB, tokenB.decimals),
          side,
        }
      : null,
    client
  );

  const infoRowStyle = "w-full flex justify-between items-center mt-1";

  return (
    <div className={twMerge("relative", "flex", "flex-col", className)}>
      <div className={infoRowStyle}>
        <span className="text-txtfade">Collateral In</span>
        <span>{side === "long" ? "USD" : "USDC"}</span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade">Leverage</span>
        <span>{leverage !== null ? `${formatNumber(leverage, 2)}x` : "-"}</span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade">Entry Price</span>
        <span className="flex">
          {(() => {
            if (!entryPriceAndFee || !inputB) return "-";

            const newEntryPrice = nativeToUi(
              entryPriceAndFee.entryPrice,
              PRICE_DECIMALS
            );

            if (openedPosition) {
              return (
                <>
                  {/* Opened position entry price */}
                  <div>{formatPriceInfo(openedPosition.uiPrice)}</div>

                  <Image
                    src="images/arrow-right.svg"
                    height={16}
                    width={16}
                    alt="Arrow"
                  />

                  {/* New position entry price */}
                  <div>{formatPriceInfo(newEntryPrice)}</div>
                </>
              );
            }

            return formatPriceInfo(newEntryPrice);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade">Liq. Price</span>
        <span className="flex">
          {(() => {
            if (!entryPriceAndFee || !inputB) return "-";

            const newLiquidationPrice = nativeToUi(
              entryPriceAndFee.liquidationPrice,
              PRICE_DECIMALS
            );

            if (openedPosition) {
              if (!openedPosition.uiLiquidationPrice) return "-";

              return (
                <>
                  {/* Opened position liquidation price */}
                  <div>
                    {formatPriceInfo(openedPosition.uiLiquidationPrice)}
                  </div>

                  <Image
                    src="images/arrow-right.svg"
                    height={16}
                    width={16}
                    alt="Arrow"
                  />

                  {/* New position entry price */}
                  <div>{formatPriceInfo(newLiquidationPrice)}</div>
                </>
              );
            }

            return formatPriceInfo(newLiquidationPrice);
          })()}
        </span>
      </div>

      <div className={infoRowStyle}>
        <span className="text-txtfade">Fees</span>
        <span>
          {entryPriceAndFee
            ? formatPriceInfo(nativeToUi(entryPriceAndFee.fee, 6))
            : "-"}
        </span>
      </div>
    </div>
  );
}
