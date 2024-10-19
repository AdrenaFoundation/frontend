import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import DateInfo from '@/components/pages/monitoring/DateInfo';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import { UserProfileExtended } from '@/types';

import editIcon from '../.../../../../../public/images/edit-icon.png';

export default function OwnerBloc({
  userProfile,
  className,
  triggerUserProfileReload,
  canUpdateNickname = true,

}: {
  userProfile: UserProfileExtended;
  className?: string;
  triggerUserProfileReload: () => void;
  canUpdateNickname?: boolean;
}) {
  const [nicknameUpdating, setNicknameUpdating] = useState<boolean>(false);
  const [updatedNickname, setUpdatedNickname] = useState<string | null>(null);

  const editNickname = async () => {
    const trimmedNickname = (updatedNickname ?? '').trim();

    const notification =
      MultiStepNotification.newForRegularTransaction('Edit Nickname').fire();

    if (trimmedNickname.length < 3 || trimmedNickname.length > 24) {
      return notification.currentStepErrored(
        'Nickname must be between 3 to 24 characters long',
      );
    }

    try {
      await window.adrena.client.editUserProfile({
        nickname: trimmedNickname,
        notification,

      });

      triggerUserProfileReload();

      // pre-shot the onchain change as we know it's coming
      userProfile.nickname = trimmedNickname;

      setNicknameUpdating(false);
    } catch (error) {
      console.error('error', error);
    }
  };

  return (
    <StyledContainer className={twMerge(className)}>
      <div className="flex w-full h-full items-center justify-center pb-4">
        {nicknameUpdating ? (
          <div className="flex flex-col items-center w-full justify-center">
            <InputString
              className="flex w-full border rounded-lg bg-inputcolor text-center justify-center mt-4"
              value={updatedNickname ?? ''}
              onChange={setUpdatedNickname}
              placeholder="The Great Trader"
              inputFontSize="2em"
              maxLength={24}
            />

            <div className="flex w-full items-center justify-evenly mt-4">
              <Button
                disabled={
                  updatedNickname
                    ? !(
                      updatedNickname.length >= 3 &&
                      updatedNickname.length <= 24
                    )
                    : true
                }
                className="text-sm pl-8 pr-8 w-24"
                title="Update"
                onClick={() => editNickname()}
              />

              <Button
                className="text-sm pl-8 pr-8 w-24"
                title="Cancel"
                variant="outline"
                onClick={() => {
                  setNicknameUpdating(false);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex mt-4">
            <div className="font-special text-4xl ml-2 relative">
              {userProfile.nickname}
            </div>

            {canUpdateNickname ? (
              <Image
                className="flex ml-4 mt-2 shrink-0 max-w-[20px] max-h-[20px] opacity-20 hover:opacity-100 cursor-pointer"
                src={editIcon}
                alt="edit icon"
                width={20}
                height={20}
                onClick={() => {
                  // init with actual nickname
                  setUpdatedNickname(userProfile.nickname);
                  setNicknameUpdating(true);
                }}
              />
            ) : null}
          </div>
        )}
      </div>
      <OnchainAccountInfo
        address={userProfile.pubkey}
        className="text-md absolute top-2 right-4"
        iconClassName="h-4 w-4"
        noAddress={true}
      />
      <DateInfo
        className="text-txtfade text-sm absolute bottom-2 right-4"
        timestamp={userProfile.nativeObject.createdAt}
        shorten={true}
      />
    </StyledContainer>
  );
}
