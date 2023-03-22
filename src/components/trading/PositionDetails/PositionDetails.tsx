import useCustodies from "@/hooks/useCustodies";
import { useSelector } from "@/store/store";
import { Token } from "@/types";
import { formatNumber, formatPriceInfo, getCustodyLiquidity } from "@/utils";
import { BN } from "@project-serum/anchor";
import styles from "./PositionDetails.module.scss";

export default function PositionDetails({
  tokenB,
  entryPrice,
  exitPrice,
}: {
  tokenB: Token;
  entryPrice: number | null;
  exitPrice: number | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const custodies = useCustodies();

  return (
    <div className={styles.positionDetails}>
      <div className={styles.positionDetails__row}>
        <span>Entry Price</span>
        <span>{entryPrice !== null ? formatPriceInfo(entryPrice) : "-"}</span>
      </div>

      <div className={styles.positionDetails__row}>
        <span>Exit Price</span>
        <span>{exitPrice !== null ? formatPriceInfo(exitPrice) : "-"}</span>
      </div>

      <div className={styles.positionDetails__row}>
        <span>Borrow Fee</span>
        <span>
          {custodies && tokenB
            ? `${formatNumber(
                custodies[tokenB].borrowRateState.currentRate
                  .mul(new BN(100))
                  .toNumber(),
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
