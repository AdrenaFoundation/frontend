import { AnimatePresence } from 'framer-motion';
import React from 'react';

import {
  refreshVerifiedWalletAddresses,
  setIsAuthModalOpen,
} from '@/actions/supabaseAuthActions';
import { useDispatch, useSelector } from '@/store/store';
import supabaseAnonClient from '@/supabaseAnonClient';
import { WalletAdapterExtended } from '@/types';

import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';


export default function SignMessageModal({
  adapters,
}: {
  adapters: WalletAdapterExtended[];
}) {
  const dispatch = useDispatch();
  const { isAuthModalOpen } = useSelector((s) => s.supabaseAuth);
  const wallet = useSelector((s) => s.walletState.wallet);
  const walletAddress = wallet?.walletAddress;
  const adapterName = wallet?.adapterName;

  const signMessage = async () => {
    const {
      data: { session },
    } = await supabaseAnonClient.auth.getSession();

    if (!session) {
      console.error('No session found. Please log in first.');
      return;
    }

    const adapter = adapters.find((a) => a.name === adapterName);

    if (!adapter) {
      console.error(`No adapter found for ${adapterName}`);
      return;
    }

    try {
      const nonce = crypto.getRandomValues(new Uint32Array(1))[0];
      const timestamp = Date.now();

      const message = `Please sign this message to verify your wallet address.
Wallet: ${walletAddress}
Timestamp: ${timestamp}
Nonce: ${nonce}`;

      const encodedMessage = new TextEncoder().encode(message);

      let signatureBytes;
      try {
        // @ts-expect-error adapter.signMessage to be a function
        signatureBytes = await adapter.signMessage(encodedMessage);
      } catch (walletError) {
        console.error('Wallet signing error:', walletError);
        return;
      }

      const signature = Buffer.from(signatureBytes).toString('base64');

      const result = await fetch('/api/verify_signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message,
          signature,
          walletAddress,
          nonce,
          timestamp,
        }),
      });

      const data = await result.json();

      if (!data.success) {
        console.error('Signature verification failed:', data?.error);
        return;
      }

      dispatch(refreshVerifiedWalletAddresses());

      handleClose();
    } catch (error) {
      console.error('Error signing message:', error);
    }
  };

  const handleClose = () => {
    dispatch(setIsAuthModalOpen(false));
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <Modal
          close={handleClose}
          className="p-3 max-w-md"
          title="Verify Wallet Address"
        >
          <div className="flex flex-col gap-2 pb-3">
            <p className="text-sm font-boldy">
              Please verify your wallet address by signing a message to prove ownership.
            </p>
          </div>

          <Button
            title="Sign Message"
            className="w-full"
            onClick={signMessage}
          />
        </Modal>
      )}
    </AnimatePresence>
  );
}
