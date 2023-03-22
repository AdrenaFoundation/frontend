import useCustodies from "@/hooks/useCustodies";
import { useSelector } from "@/store/store";
import { Token } from "@/types";
import { formatNumber, formatPriceInfo, getCustodyLiquidity } from "@/utils";
import styles from "./PositionDetails.module.scss";

export default function PositionDetails({ tokenB }: { tokenB: Token }) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const custodies = useCustodies();

  return (
    <div className={styles.positionDetails}>
      <div className={styles.positionDetails__row}>
        <span>Entry Price</span>
        <span>TODO</span>
      </div>

      <div className={styles.positionDetails__row}>
        <span>Exit Price</span>
        <span>TODO</span>
      </div>

      <div className={styles.positionDetails__row}>
        <span>Borrow Fee</span>
        <span>
          {custodies && tokenB
            ? `${formatNumber(
                100 * custodies[tokenB].borrowRateState.currentRate,
                4
              )}% / hr`
            : "-"}
        </span>
      </div>

      <div className={styles.positionDetails__row}>
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
