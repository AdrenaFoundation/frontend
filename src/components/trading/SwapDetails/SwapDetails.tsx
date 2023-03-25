import useAdrenaClient from "@/hooks/useAdrenaClient";
import { useSelector } from "@/store/store";
import { Mint } from "@/types";
import { formatPriceInfo, getCustodyLiquidity } from "@/utils";
import styles from "./SwapDetails.module.scss";

export default function SwapDetails({
  mintA,
  mintB,
}: {
  mintA: Mint;
  mintB: Mint;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const client = useAdrenaClient();

  return (
    <div className={styles.swapDetails}>
      <div className={styles.swapDetails__row}>
        <span>{mintA.name} Price</span>
        <span>
          {tokenPrices[mintA.name]
            ? formatPriceInfo(tokenPrices[mintA.name]!)
            : "-"}
        </span>
      </div>

      <div className={styles.swapDetails__row}>
        <span>{mintB.name} Price</span>
        <span>
          {tokenPrices[mintB.name]
            ? formatPriceInfo(tokenPrices[mintB.name]!)
            : "-"}
        </span>
      </div>

      <div className={styles.swapDetails__row}>
        <span>Available Liquidity</span>
        <span>
          {client && tokenPrices && tokenPrices[mintB.name]
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
