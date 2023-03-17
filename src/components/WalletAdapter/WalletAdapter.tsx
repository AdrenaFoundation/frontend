import { connectWalletAction, disconnectWalletAction } from '@/actions/walletActions';
import { WalletAdapterName } from '@/adapters/walletAdapters';
import { useSelector, useDispatch } from '@/store/store';
import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import styles from './WalletAdapter.module.scss'

// Type to be expected when phantom wallet is connected
type PhantomProvider = {
    publicKey: PublicKey | null;
};

export default function WalletAdapter() {
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
        <div className={styles.walletAdapter}>
            {!connected ? <button onClick={() => setOpenModal(true)}>Connect</button> : null}

            {connected ? <button onClick={() => {
                dispatch(disconnectWalletAction(wallet));
                setOpenModal(false);
            }}>{connectedWalletAddress} Disconnect</button> : null}

            {openModal ? <Modal title='Select wallet' close={() => setOpenModal(false)}>
                <div onClick={() => {
                    dispatch(connectWalletAction('phantom'));
                    setOpenModal(false);
                }}>Phantom</div>
            </Modal> : null}
        </div>
    );
}
