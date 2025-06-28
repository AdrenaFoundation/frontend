import React, { memo } from 'react';

import Button from '@/components/common/Button/Button';
import useFriendReq from '@/hooks/useFriendReq';
import { useSelector } from '@/store/store';

function AddTrader({
  receiverWalletAddress,
}: {
  receiverWalletAddress: string | null;
}) {
  const wallet = useSelector((state) => state.walletState.wallet);
  const walletAddress = wallet?.walletAddress ?? null;

  const {
    loading,
    acceptFriendRequest,
    rejectFriendRequest,
    sendFriendRequest,
    currentFriendRequest,
  } = useFriendReq({ walletAddress, receiverWalletAddress });

  if (
    walletAddress === receiverWalletAddress ||
    !receiverWalletAddress ||
    !walletAddress
  ) {
    return null;
  }

  const requestStatus = currentFriendRequest?.status || 'none';

  if (requestStatus === 'accepted') {
    return (
      <div className="mt-1">
        <Button
          title="Added"
          variant="outline"
          size="xs"
          disabled={true}
          className="px-3"
        />
      </div>
    );
  }

  if (
    requestStatus === 'pending' &&
    currentFriendRequest?.sender_pubkey === walletAddress
  ) {
    return (
      <div className="mt-1">
        <Button
          title="Request Sent"
          variant="outline"
          size="xs"
          disabled={true}
          className="px-3"
        />
      </div>
    );
  }

  if (
    requestStatus === 'pending' &&
    currentFriendRequest?.sender_pubkey === receiverWalletAddress
  ) {
    return (
      <div className="mt-1 flex flex-row items-center">
        <Button
          title="Accept"
          variant="lightbg"
          size="xs"
          disabled={loading}
          className="px-3 rounded-r-none hover:bg-secondary"
          onClick={() => acceptFriendRequest(currentFriendRequest.id)}
        />
        <Button
          title="Reject"
          variant="lightbg"
          size="xs"
          disabled={loading}
          className="px-3 rounded-l-none hover:bg-secondary"
          onClick={() => rejectFriendRequest(currentFriendRequest.id)}
        />
      </div>
    );
  }

  return (
    <div className="mt-1">
      <Button
        title="Add Trader"
        variant="lightbg"
        size="xs"
        disabled={loading}
        className="px-3"
        onClick={() => sendFriendRequest(receiverWalletAddress)}
      />
    </div>
  );
}

export default memo(AddTrader);
