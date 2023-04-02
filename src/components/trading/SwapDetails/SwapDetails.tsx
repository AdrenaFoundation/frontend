import { AdrenaClient } from "@/AdrenaClient";
import { useSelector } from "@/store/store";
import { Token } from "@/types";
import { formatPriceInfo, getCustodyLiquidity } from "@/utils";

export default function SwapDetails({
  tokenA,
  tokenB,
  client,
}: {
  tokenA: Token;
  tokenB: Token;
  client: AdrenaClient | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const rowStyle = "w-full flex justify-between items-center mt-2";

  return (
    <div className="flex flex-col pl-4 pr-4 pb-4 mt-4 text-sm">
      <div className={rowStyle}>
        <span className="text-txtfade">{tokenA.name} Price</span>
        <span>
          {tokenPrices[tokenA.name]
            ? formatPriceInfo(tokenPrices[tokenA.name]!)
            : "-"}
        </span>
      </div>

      <div className={rowStyle}>
        <span className="text-txtfade">{tokenB.name} Price</span>
        <span>
          {tokenPrices[tokenB.name]
            ? formatPriceInfo(tokenPrices[tokenB.name]!)
            : "-"}
        </span>
      </div>

      <div className={rowStyle}>
        <span className="text-txtfade">Available Liquidity</span>
        <span>
          {client && tokenPrices && tokenPrices[tokenB.name]
            ? formatPriceInfo(
                getCustodyLiquidity(
                  client.getCustodyByMint(tokenB.mint),
                  tokenPrices[tokenB.name]!
                )
              )
            : "-"}
        </span>
      </div>
    </div>
  );
}
