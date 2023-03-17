import { connectWalletAction, disconnectWalletAction } from '@/actions/walletActions';
import { WalletAdapterName } from '@/adapters/walletAdapters';
import { useSelector, useDispatch } from '@/store/store';
import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import styles from './WalletAdapter.module.scss'

// Type to be expected when phantom wallet is connected
type PhantomProvider = {
    publicKey: PublicKey | null;
};

export default function WalletAdapter({ className }: { className?: string; }) {
    const dispatch = useDispatch();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const wallet = useSelector(s => s.wallet);

    const connected = !!wallet;

    const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);

    const getWalletAddressFromAdapter = useCallback((wallet: WalletAdapterName): PublicKey | null => {
        if (wallet === 'phantom') {
            const phantomProvider = (window as any).solana as PhantomProvider;
            return phantomProvider.publicKey;
        }

        return null;
    }, [wallet]);

    useEffect(() => {
        if (!connected) {
            return;
        }

        const address = getWalletAddressFromAdapter(wallet);

        // Couldn't figure the address out
        if (!address) {
            setConnectedWalletAddress('unknwon');
            return;
        }

        // Transform the full address into a shorter version
        // i.e AE9w1MhvA8OSQQI8DkZEHYLDSbDnWCU12LfLYj3USARn
        // into AE9w..SARn
        const str = address.toBase58();

        setConnectedWalletAddress(`${str.slice(0, 4)}..${str.slice(str.length - 4)}`);
    }, [getWalletAddressFromAdapter]);

    return (
        <div className={`${styles.walletAdapter} ${className ?? ''}`}>
            {!connected ? <Button title="Connect wallet" onClick={() => setOpenModal(true)} /> : null}

            {connected && connectedWalletAddress ? <Button title={connectedWalletAddress} onClick={() => {
                dispatch(disconnectWalletAction(wallet));
                setOpenModal(false);
            }} rightIcon='images/power-off.svg' /> : null}

            {openModal ? <Modal title='Select wallet' close={() => setOpenModal(false)} className={styles.walletAdapter__modal}>
                <div className={styles.walletAdapter__modal_wallet_list} onClick={() => {
                    dispatch(connectWalletAction('phantom'));
                    setOpenModal(false);
                }}>

                    <div className={styles.walletAdapter__modal_wallet_list_item}>
                        <img className={styles.walletAdapter__modal_wallet_list_item_logo} src='/images/phantom.png' />
                        <span className={styles.walletAdapter__modal_wallet_list_item_title}>Phantom</span>
                    </div>

                </div>
            </Modal> : null}
        </div>
    );
}
