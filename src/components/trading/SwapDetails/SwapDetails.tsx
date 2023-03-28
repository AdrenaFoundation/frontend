import useAdrenaClient from "@/hooks/useAdrenaClient";
import { useSelector } from "@/store/store";
import { Token } from "@/types";
import { formatPriceInfo, getCustodyLiquidity } from "@/utils";

export default function SwapDetails({
  tokenA,
  tokenB,
}: {
  tokenA: Token;
  tokenB: Token;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const client = useAdrenaClient();

  const rowStyle = "w-full flex justify-between items-center mt-2";

  return (
    <div className="flex flex-col p-1 mt-4">
      <div className={rowStyle}>
        <span>{tokenA.name} Price</span>
        <span>
          {tokenPrices[tokenA.name]
            ? formatPriceInfo(tokenPrices[tokenA.name]!)
            : "-"}
        </span>
      </div>

      <div className={rowStyle}>
        <span>{tokenB.name} Price</span>
        <span>
          {tokenPrices[tokenB.name]
            ? formatPriceInfo(tokenPrices[tokenB.name]!)
            : "-"}
        </span>
      </div>

      <div className={rowStyle}>
        <span>Available Liquidity</span>
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
