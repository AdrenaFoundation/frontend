import { ConnectWalletAction, connectWalletAction } from '@/actions/walletActions';
import { useDispatch } from 'react-redux';
import styles from './index.module.scss'

export default function Trade() {
    const dispatch = useDispatch();

    return (
        <div className={styles.trade}>
        </div>
    );
}
