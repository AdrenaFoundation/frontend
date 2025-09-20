import { setIsAuthModalOpen } from '@/actions/supabaseAuthActions';
import ErrorReport from '@/components/Admin/ErrorReport';
import MaintenanceAlert from '@/components/Admin/MaintenanceAlert';
import Button from '@/components/common/Button/Button';
import Loader from '@/components/Loader/Loader';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import useAdminStatus from '@/hooks/useAdminStatus';
import { useDispatch, useSelector } from '@/store/store';

export default function Admin() {
  const dispatch = useDispatch();

  const walletAddress = useSelector(
    (state) => state.walletState.wallet?.walletAddress,
  );

  const { verifiedWalletAddresses } = useSelector((s) => s.supabaseAuth);

  const { isAdmin, isLoading } = useAdminStatus(walletAddress ?? null);

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
          <p className="text-sm font-semibold">
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
