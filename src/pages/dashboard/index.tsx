import useListenToPythTokenPricesChange from "@/hooks/useListenToPythTokenPricesChange";
import useWatchWalletBalance from "@/hooks/useWatchWalletBalance";
import { useSelector } from "@/store/store";
import useAdrenaClient from "@/hooks/useAdrenaClient";

import styles from "./index.module.scss";
import ALPIndexComposition from "@/components/ALPIndexComposition/ALPIndexComposition";

export default function Trade() {
  useListenToPythTokenPricesChange();
  useWatchWalletBalance();

  const client = useAdrenaClient();
  const wallet = useSelector((s) => s.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  return (
    <div className={styles.dashboard}>
      <ALPIndexComposition className={styles.dashboard__composition} />
    </div>
  );
}
