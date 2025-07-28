import React, { memo } from 'react';

import addFriendIcon from '@/../public/images/Icons/add-friend.svg';
import Button from '@/components/common/Button/Button';
import useFriendReq from '@/hooks/useFriendReq';
import { useSelector } from '@/store/store';

function AddTrader({
  receiverWalletAddress,
}: {
  receiverWalletAddress: string | null;
}) {
  const isFriendReqDisabled = useSelector((state) => state.settings.disableFriendReq);

  const wallet = useSelector((state) => state.walletState.wallet);
  const walletAddress = wallet?.walletAddress ?? null;

  const {
    loading,
    acceptFriendRequest,
    rejectFriendRequest,
    sendFriendRequest,
    currentFriendRequest,
    isDisabled,
  } = useFriendReq({ walletAddress, receiverWalletAddress });

  if (
    isFriendReqDisabled ||
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
          title="Added as friend"
          variant="text"
          size="xs"
          leftIcon={addFriendIcon}
          disabled={true}
          className="px-0"
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
          title="Friend Request Sent"
          variant="outline"
          size="xs"
          disabled={true}
          className="px-3 rounded-md"
        />
      </div>
    );
  }

  if (
    requestStatus === 'pending' &&
    currentFriendRequest?.sender_pubkey === receiverWalletAddress
  ) {
    return (
      <div className="mt-1 flex flex-row gap-2 items-center">
        <Button
          title="Accept"
          variant="outline"
          size="xs"
          disabled={loading}
          className="px-3 rounded-md hover:bg-secondary/30"
          onClick={() => acceptFriendRequest(currentFriendRequest.id)}
        />
        <Button
          title="Reject"
          variant="lightbg"
          size="xs"
          disabled={loading}
          className="px-3 rounded-md hover:bg-secondary"
          onClick={() => rejectFriendRequest(currentFriendRequest.id)}
        />
      </div>
    );
  }

  return (
    <div className="mt-1">
      <Button
        title="Add Friend"
        variant="text"
        leftIcon={addFriendIcon}
        size="xs"
        disabled={loading || isDisabled}
        className="px-0 gap-1"
        onClick={() => sendFriendRequest(receiverWalletAddress)}
      />
    </div>
  );
}

export default memo(AddTrader);
