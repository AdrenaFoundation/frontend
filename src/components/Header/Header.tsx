import WalletAdapter from '../WalletAdapter/WalletAdapter';
import styles from './Header.module.scss'

export default function Header() {
    return (
        <div className={styles.header}>
            <div className={styles.header__title}>Adrena</div>
            <WalletAdapter className={styles.header__walletAdapter} />
        </div>
    );
}
