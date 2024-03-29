import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import YesOrNoModal from '@/components/common/YesOrNoModal/YesOrNoModal';
import DateInfo from '@/components/pages/monitoring/DateInfo';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import { UserProfileExtended } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
} from '@/utils';

import editIcon from '../.../../../../../public/images/edit-icon.png';
import monsterImage from '../../../../public/images/monster-1.png';
import EmphasizedTitle from './EmphasizedTitle';

export default function OwnerBloc({
  userProfile,
  className,
  triggerUserProfileReload,
  canDeleteProfile = true,
  canUpdateNickname = true,
}: {
  userProfile: UserProfileExtended;
  className?: string;
  triggerUserProfileReload: () => void;
  canDeleteProfile?: boolean;
  canUpdateNickname?: boolean;
}) {
  const [isDeleteProfileModalOpen, setIsDeleteProfileModalOpen] =
    useState<boolean>(false);
  const [nicknameUpdating, setNicknameUpdating] = useState<boolean>(false);
  const [updatedNickname, setUpdatedNickname] = useState<string | null>(null);

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

  const editNickname = async () => {
    const trimmedNickname = (updatedNickname ?? '').trim();

    if (trimmedNickname.length < 3 || trimmedNickname.length > 24) {
      return addNotification({
        title: 'Cannot update profile',
        type: 'info',
        message: 'Nickname must be between 3 to 24 characters long',
      });
    }

    try {
      const txHash = await window.adrena.client.editUserProfile({
        nickname: trimmedNickname,
      });

      triggerUserProfileReload();

      // pre-shot the onchain change as we know it's coming
      userProfile.nickname = trimmedNickname;

      setNicknameUpdating(false);

      return addSuccessTxNotification({
        title: 'Successfully Edited Profile',
        txHash,
      });
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Editing Profile',
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

            <div className="flex h-[7em] w-[20em] justify-center">
              {nicknameUpdating ? (
                <div className="flex flex-col items-center w-full justify-center">
                  <InputString
                    className="text-center w-full font-special mt-4"
                    value={updatedNickname ?? ''}
                    onChange={setUpdatedNickname}
                    placeholder="The Great Trader"
                    inputFontSize="2.2em"
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
          </div>

          <div className="flex flex-col m-auto w-full items-center mt-4">
            <EmphasizedTitle title="Profile Creation date" />

            <DateInfo
              className="text-txtfade text-sm ml-1"
              timestamp={userProfile.nativeObject.createdAt}
              shorten={true}
            />
          </div>

          <div className="flex flex-col m-auto w-full items-center mt-8">
            <div className="flex items-center w-full justify-between">
              <div className=" text-txtfade text-sm opacity-70">
                owner&apos;s wallet
              </div>

              <OnchainAccountInfo
                className="text-[0.7em] ml-1"
                address={userProfile.owner}
                shorten={true}
              />
            </div>

            <div className="flex items-center w-full justify-between">
              <div className="text-txtfade text-sm opacity-70">
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
              className="opacity-50 hover:opacity-100 mt-8 text-red-500 border-red-500"
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
            <span className="font-special text-4xl self-center">Warning</span>

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
