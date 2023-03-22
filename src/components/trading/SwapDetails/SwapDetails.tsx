import useCustodies from "@/hooks/useCustodies";
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
  const custodies = useCustodies();

  return (
    <div className={styles.swapDetails}>
      <div className={styles.swapDetails__row}>
        <span>{tokenA} Price</span>
        <span>
          {tokenA && tokenPrices[tokenA]
            ? formatPriceInfo(tokenPrices[tokenA]!)
            : "-"}
        </span>
      </div>

      <div className={styles.swapDetails__row}>
        <span>{tokenB} Price</span>
        <span>
          {tokenB && tokenPrices[tokenB]
            ? formatPriceInfo(tokenPrices[tokenB]!)
            : "-"}
        </span>
      </div>

      <div className={styles.swapDetails__row}>
        <span>Available Liquidity</span>
        <span>
          {custodies && tokenB && tokenPrices && tokenPrices[tokenB]
            ? formatPriceInfo(
                getCustodyLiquidity(custodies[tokenB], tokenPrices[tokenB]!)
              )
            : "-"}
        </span>
      </div>
    </div>
  );
}
