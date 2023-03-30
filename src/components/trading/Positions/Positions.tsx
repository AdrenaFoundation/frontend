import Button from "@/components/Button/Button";
import { useSelector } from "@/store/store";
import { formatNumber, formatPriceInfo, nativeToUi, uiToNative } from "@/utils";
import { PositionExtended } from "@/types";
import { twMerge } from "tailwind-merge";
import useAdrenaClient from "@/hooks/useAdrenaClient";

export default function Positions({
  className,
  positions,
}: {
  className?: string;
  positions: PositionExtended[] | null;
}) {
  const client = useAdrenaClient();
  const tokenPrices = useSelector((s) => s.tokenPrices);

  // TODO
  // Change compeltely how the positions are displayed if the screen is small

  const columnStyle = "flex min-w-[5em] w-20 grow shrink-0 items-center";

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
      {/* Header */}
      <div className="flex pb-4 border-b border-grey w-full p-4">
        {[
          "Position",
          "Net Value",
          "Size",
          "Collateral",
          "Entry Price",
          "Mark Price",
          "Liq. Price",
          "", // close action
        ].map((text) => (
          <div key={text} className={columnStyle}>
            {text}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col w-full bg-secondary">
        {!positions?.length ? (
          <div className="mt-5 mb-5 ml-auto mr-auto">No opened position</div>
        ) : null}

        {positions?.map((position) => (
          <div
            key={position.pubkey.toBase58()}
            className="flex pb-4 border-b border-grey w-full p-4"
          >
            <div
              className={twMerge(
                columnStyle,
                "flex-col",
                "justify-start",
                "items-start"
              )}
            >
              <div>{position.token?.name ?? "Unknown Token"}</div>

              <div className="flex">
                <div>{formatNumber(position.leverage, 2)}x</div>
                <div
                  className={twMerge(
                    "ml-1",
                    "capitalize",
                    position.side === "long" ? "text-green-400" : "bg-red-400"
                  )}
                >
                  {position.side}
                </div>
              </div>
            </div>

            <div className={columnStyle}>{/*Net Value*/}TODO</div>

            <div className={columnStyle}>
              {formatPriceInfo(nativeToUi(position.sizeUsd, 6))}
            </div>

            <div className={columnStyle}>
              {formatPriceInfo(nativeToUi(position.collateralUsd, 6))}
            </div>

            <div className={columnStyle}>
              {formatPriceInfo(nativeToUi(position.price, 6))}
            </div>

            <div className={columnStyle}>
              {position.token && tokenPrices[position.token.name]
                ? formatPriceInfo(tokenPrices[position.token.name]!)
                : "-"}
            </div>

            <div className={columnStyle}>{/*Liq. Price*/}TODO</div>

            <Button
              className={columnStyle}
              title="Close"
              onClick={() => {
                // TODO: Open ClosePosition window
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
