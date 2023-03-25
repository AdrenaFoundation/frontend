import useAdrenaClient from "@/hooks/useAdrenaClient";
import { useSelector } from "@/store/store";
import { Mint } from "@/types";
import { formatNumber, formatPriceInfo, getCustodyLiquidity } from "@/utils";
import { BN } from "@project-serum/anchor";
import styles from "./PositionDetails.module.scss";

export default function PositionDetails({
  mintB,
  entryPrice,
  exitPrice,
}: {
  mintB: Mint;
  entryPrice: number | null;
  exitPrice: number | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const client = useAdrenaClient();

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
          {client && mintB
            ? `${formatNumber(
                client
                  .getCustodyByMint(mintB.pubkey)
                  .borrowRateState.currentRate.mul(new BN(100))
                  .toNumber(),
                4
              )}% / hr`
            : "-"}
        </span>
      </div>

      <div className={styles.positionDetails__row}>
        <span>Available Liquidity</span>
        <span>
          {client && mintB && tokenPrices && tokenPrices[mintB.name]
            ? formatPriceInfo(
                getCustodyLiquidity(
                  client.getCustodyByMint(mintB.pubkey),
                  tokenPrices[mintB.name]!
                )
              )
            : "-"}
        </span>
      </div>
    </div>
  );
}
