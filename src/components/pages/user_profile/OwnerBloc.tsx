import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import YesOrNoModal from '@/components/common/YesOrNoModal/YesOrNoModal';
import DateInfo from '@/components/pages/backoffice/DateInfo';
import OnchainAccountInfo from '@/components/pages/backoffice/OnchainAccountInfo';
import { UserProfileExtended } from '@/types';
import { addFailedTxNotification, addSuccessTxNotification } from '@/utils';

import monsterImage from '../../../../public/images/monster-1.png';
import EmphasizedTitle from './EmphasizedTitle';

export default function OwnerBloc({
  userProfile,
  className,
  triggerUserProfileReload,
  canDeleteProfile = true,
}: {
  userProfile: UserProfileExtended;
  className?: string;
  triggerUserProfileReload: () => void;
  canDeleteProfile?: boolean;
}) {
  const [isDeleteProfileModalOpen, setIsDeleteProfileModalOpen] =
    useState<boolean>(false);

  const deleteProfile = async () => {
    try {
      const txHash = await window.adrena.client.deleteUserProfile();

      triggerUserProfileReload();

      return addSuccessTxNotification({
        title: 'Successfully Deleted Profile',
        txHash,
      });
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Deleting Profile',
        error,
      });
    }
  };

  return (
    <div
      className={twMerge(
        'flex items-center justify-center w-full relative',
        className,
      )}
    >
      <div className="flex flex-col items-center z-20">
        <Image
          className="rounded-full bg-white overflow-hidden shadow-lg shadow-[#ffffff50]"
          src={monsterImage}
          alt="profile picture"
          width={250}
          height={250}
        />

        <div className="flex flex-col mt-6">
          <div className="flex flex-col m-auto w-full items-center">
            <EmphasizedTitle title="Nickname" />

            <div className="font-specialmonster text-4xl ml-2 relative">
              {userProfile.nickname}
            </div>
          </div>

          <div className="flex flex-col m-auto w-full items-center mt-4">
            <EmphasizedTitle title="Profile Creation date" />

            <DateInfo
              className="text-txtfade text-xs ml-1"
              timestamp={userProfile.nativeObject.createdAt}
              shorten={true}
            />
          </div>

          <div className="flex flex-col m-auto w-full items-center mt-8">
            <div className="flex items-center w-full justify-between">
              <div className=" text-txtfade text-xs opacity-70">
                owner&apos;s wallet
              </div>

              <OnchainAccountInfo
                className="text-[0.7em] ml-1"
                address={userProfile.owner}
                shorten={true}
              />
            </div>

            <div className="flex items-center w-full justify-between">
              <div className="text-txtfade text-xs opacity-70">
                onchain profile account
              </div>

              <OnchainAccountInfo
                className="text-[0.7em] ml-1"
                address={userProfile.pubkey}
                shorten={true}
              />
            </div>
          </div>

          {canDeleteProfile ? (
            <Button
              className="opacity-30 hover:opacity-100 mt-8 text-red-500 border-red-500"
              title="Delete Profile"
              alt="delete icon"
              variant="outline"
              onClick={() => {
                setIsDeleteProfileModalOpen(true);
              }}
            />
          ) : null}
        </div>
      </div>

      <YesOrNoModal
        isOpen={isDeleteProfileModalOpen}
        title="Profile Deletion"
        onYesClick={() => deleteProfile()}
        onNoClick={() => {
          setIsDeleteProfileModalOpen(false);
        }}
        yesVariant="danger"
        noVariant="outline"
        body={
          <div className="flex flex-col w-[25em]">
            <span className="font-specialmonster text-4xl self-center">
              Warning
            </span>

            <span className="mt-8 text-center">
              All informations stored in your user profile will be lost, this
              action is irreversible.
            </span>

            <span className="mt-4 text-center">
              Trades and stakes will not be affected. Having a profile is not
              mandatory to use Adrena.
            </span>
          </div>
        }
        onClose={() => {
          setIsDeleteProfileModalOpen(false);
        }}
        yesTitle="Delete My Profile"
        noTitle="Cancel"
      />
    </div>
  );
}
