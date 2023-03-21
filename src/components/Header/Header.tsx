import Link from "next/link";
import Button from "../Button/Button";
import WalletAdapter from "../WalletAdapter/WalletAdapter";
import styles from "./Header.module.scss";

export default function Header() {
  return (
    <div className={styles.header}>
      <Link className={styles.header__title} href="/">
        Adrena
      </Link>

      <>
        <Link className={styles.header__pagelink} href="/dashboard">
          Dashboard
        </Link>
        <Link className={styles.header__pagelink} href="/earn">
          Earn
        </Link>
        <Link className={styles.header__pagelink} href="/buy">
          Buy
        </Link>
      </>

      <Button
        className={styles.header__tradepage}
        title={
          <Link className={styles.header__tradepage_link} href="/trade">
            Trade
          </Link>
        }
        onClick={() => {}}
      />

      <WalletAdapter className={styles.header__walletAdapter} />
    </div>
  );
}
