import WalletAdapter from '../WalletAdapter/WalletAdapter';
import styles from './Header.module.scss'

export default function Header() {
    return (
        <div className={styles.header}>
            <WalletAdapter />
        </div>
    );
}
