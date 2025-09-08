import React, { useEffect, useState } from 'react';

import { setIsAuthModalOpen } from '@/actions/supabaseAuthActions';
import ErrorReport from '@/components/Admin/ErrorReport';
import MaintenanceAlert from '@/components/Admin/MaintenanceAlert';
import Button from '@/components/common/Button/Button';
import Loader from '@/components/Loader/Loader';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { useDispatch, useSelector } from '@/store/store';
import supabaseAnonClient from '@/supabaseAnonClient';

export default function Admin() {
  const dispatch = useDispatch();

  const walletAddress = useSelector(
    (state) => state.walletState.wallet?.walletAddress,
  );

  const { verifiedWalletAddresses } = useSelector((s) => s.supabaseAuth);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsAdmin(false);

    if (!walletAddress || !verifiedWalletAddresses.includes(walletAddress)) {
      return;
    }

    setIsLoading(true);

    const checkAdminStatus = async () => {
      const {
        data: { session },
      } = await supabaseAnonClient.auth.getSession();
      try {
        const response = await fetch(
          `/api/verify_signature?walletAddress=${walletAddress}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(session
                ? { Authorization: `Bearer ${session.access_token}` }
                : {}),
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          console.error('Failed to verify admin status');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [walletAddress, verifiedWalletAddresses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center mx-auto max-w-4xl h-full">
        <Loader />
      </div>
    );
  }

  if (!walletAddress) {
    return <WalletConnection />;
  }

  if (!verifiedWalletAddresses.includes(walletAddress)) {
    return (
      <div className="flex flex-col items-center justify-center mx-auto max-w-4xl h-full">
        <div className="flex flex-col gap-3 border bg-third rounded-lg p-3">
          <p className="text-sm font-interSemibold">
            Sign in with a verified wallet to access the admin panel.
          </p>

          <Button
            title="Verify Wallet"
            onClick={() => dispatch(setIsAuthModalOpen(true))}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center mx-auto max-w-4xl h-full">
        <p className="text-center">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <MaintenanceAlert />
      <ErrorReport />
    </div>
  );
}
