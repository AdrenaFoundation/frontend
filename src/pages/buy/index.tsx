import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import useWatchWalletBalance from "@/hooks/useWatchWalletBalance";
import { useSelector } from "@/store/store";
import useAdrenaClient from "@/hooks/useAdrenaClient";

import styles from "./index.module.scss";

export default function Buy() {
  useListenToPythTokenPricesChange();
  useWatchWalletBalance();

  const client = useAdrenaClient();
  const wallet = useSelector((s) => s.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  return (
    <div className={styles.buy}>
      <div className={styles.buy__title}>Buy / Sell ALP</div>
      <div className={styles.buy__description}>
        Purchase ALP tokens to earn fees from swaps and leverages trading.
      </div>
    </div>
  );
}
