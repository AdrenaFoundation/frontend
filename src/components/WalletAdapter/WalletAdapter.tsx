import { PublicKey } from '@solana/web3.js';
import React, { useEffect } from 'react';

import {
  autoConnectWalletAction,
  disconnectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { walletAdapters } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import { getAbbrevWalletAddress } from '@/utils';

import disconnectIcon from '../../../public/images/disconnect.png';
import walletIcon from '../../../public/images/wallet-icon.svg';
import Button from '../common/Button/Button';
import WalletSelectionModal from './WalletSelectionModal';

function WalletAdapter({ className }: { className?: string }) {
  const dispatch = useDispatch();
  const { wallet } = useSelector((s) => s.walletState);

  const connected = !!wallet;

  // Load local storage state to auto-connect if needed
  const autoConnectAuthorized: boolean =
    JSON.parse(localStorage.getItem('autoConnectAuthorized') ?? 'false') ??
    true;

  // When component gets created, try to auto-connect to wallet
  useEffect(() => {
    if (autoConnectAuthorized) {
      dispatch(autoConnectWalletAction('phantom'));
      return;
    }

    // Only once when page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect change of account
  useEffect(() => {
    if (!wallet) return;

    const adapter = walletAdapters[wallet.adapterName];

    adapter.on('connect', (walletPubkey: PublicKey) => {
      dispatch({
        type: 'connect',
        payload: {
          adapterName: wallet.adapterName,
          walletAddress: walletPubkey.toBase58(),
        },
      });
    });

    return () => {
      adapter.removeAllListeners('connect');
    };
  }, [dispatch, wallet]);

  const handleClick = () => {
    if (!connected) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    console.log('Disconnect wallet');
    dispatch(disconnectWalletAction(wallet.adapterName));
    dispatch(openCloseConnectionModalAction(false));
  };

  return (
    <div>
      <Button
        className={className}
        title={
          connected
            ? getAbbrevWalletAddress(wallet.walletAddress)
            : 'Connect wallet'
        }
        rightIcon={connected ? disconnectIcon : walletIcon}
        alt="wallet icon"
        variant="outline"
        onClick={handleClick}
      />

      <WalletSelectionModal />
    </div>
  );
}

export default WalletAdapter;
