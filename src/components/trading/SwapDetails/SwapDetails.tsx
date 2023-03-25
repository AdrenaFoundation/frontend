import useAdrenaClient from "@/hooks/useAdrenaClient";
import { useSelector } from "@/store/store";
import { Token } from "@/types";
import { formatPriceInfo, getCustodyLiquidity } from "@/utils";
import styles from "./SwapDetails.module.scss";

export default function SwapDetails({
  tokenA,
  tokenB,
}: {
  tokenA: Token;
  tokenB: Token;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const client = useAdrenaClient();

  return (
    <div className={styles.swapDetails}>
      <div className={styles.swapDetails__row}>
        <span>{tokenA.name} Price</span>
        <span>
          {tokenPrices[tokenA.name]
            ? formatPriceInfo(tokenPrices[tokenA.name]!)
            : "-"}
        </span>
      </div>

      <div className={styles.swapDetails__row}>
        <span>{tokenB.name} Price</span>
        <span>
          {tokenPrices[tokenB.name]
            ? formatPriceInfo(tokenPrices[tokenB.name]!)
            : "-"}
        </span>
      </div>

      <div className={styles.swapDetails__row}>
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
