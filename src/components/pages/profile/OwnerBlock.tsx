import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import adxLogo from '@/../../public/images/adx.svg';
import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import { PROFILE_PICTURES, WALLPAPER } from '@/constant';
import { ProfilePicture, UserProfileExtended, Wallpaper } from '@/types';

import walletIcon from '../../../../public/images/wallet-icon.svg';

export default function OwnerBloc({
  userProfile,
  className,
  triggerUserProfileReload,
  canUpdateNickname = true,
  walletPubkey,
  readonly = false,
}: {
  userProfile: UserProfileExtended;
  className?: string;
  triggerUserProfileReload: () => void;
  canUpdateNickname?: boolean;
  walletPubkey?: PublicKey;
  readonly?: boolean;
}) {
  const [alreadyTakenNicknames, setAlreadyTakenNicknames] = useState<Record<string, boolean>>({});
  const [nicknameUpdating, setNicknameUpdating] = useState<boolean>(false);
  const [updatedNickname, setUpdatedNickname] = useState<string | null>(userProfile.nickname);
  const [trimmedUpdatedNickname, setTrimmedUpdatedNickname] = useState<string>(updatedNickname ?? '');
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState<boolean>(false);
  const [updatingMetadata, setUpdatingMetadata] = useState<{
    profilePicture: ProfilePicture;
    wallpaper: Wallpaper;
  }>({
    profilePicture: userProfile.profilePicture,
    wallpaper: userProfile.wallpaper,
  });

  useEffect(() => {
    setTrimmedUpdatedNickname((updatedNickname ?? '').trim());
  }, [updatedNickname]);

  const editNickname = useCallback(async () => {
    const notification =
      MultiStepNotification.newForRegularTransaction('Edit Nickname').fire();

    if (trimmedUpdatedNickname.length < 3 || trimmedUpdatedNickname.length > 24) {
      return notification.currentStepErrored(
        'Nickname must be between 3 to 24 characters long',
      );
    }

    if (!walletPubkey) return notification.currentStepErrored(
      'You must be connected to edit your nickname',
    );

    if (trimmedUpdatedNickname === userProfile.nickname) {
      return notification.currentStepErrored(
        'Nickname is already set',
      );
    }

    try {
      if (!walletPubkey) return notification.currentStepErrored('Wallet not connected');

      await window.adrena.client.editUserProfileNickname({
        nickname: trimmedUpdatedNickname,
        notification,
      });

      triggerUserProfileReload();

      // pre-shot the onchain change as we know it's coming
      userProfile.nickname = trimmedUpdatedNickname;

      setNicknameUpdating(false);
    } catch (error) {
      console.error('error', error);
    }
  }, [triggerUserProfileReload, trimmedUpdatedNickname, userProfile, walletPubkey]);

  const updateProfile = useCallback(async () => {
    const notification =
      MultiStepNotification.newForRegularTransaction('Update Profile').fire();

    if (!walletPubkey) return notification.currentStepErrored(
      'You must be connected to update your profile',
    );

    try {
      await window.adrena.client.editUserProfile({
        profilePicture: updatingMetadata.profilePicture,
        wallpaper: updatingMetadata.wallpaper,
        notification,
      });

      // pre-shot the onchain change as we know it's coming
      userProfile.profilePicture = updatingMetadata.profilePicture;
      userProfile.wallpaper = updatingMetadata.wallpaper;

      triggerUserProfileReload();

      setIsUpdatingMetadata(false);
    } catch (error) {
      console.error('error', error);
    }
  }, [triggerUserProfileReload, updatingMetadata.profilePicture, updatingMetadata.wallpaper, userProfile, walletPubkey]);

  const [profilePictureHovering, setProfilePictureHovering] = useState<boolean>(false);

  useEffect(() => {
    if (trimmedUpdatedNickname.length < 3 || trimmedUpdatedNickname.length > 24 || !window.adrena.client.readonlyConnection) {
      return;
    }

    const userNicknamePda = window.adrena.client.getUserNicknamePda(trimmedUpdatedNickname);

    window.adrena.client.readonlyConnection.getAccountInfo(userNicknamePda)
      .then((acc) => {
        setAlreadyTakenNicknames((prev) => ({
          ...prev,
          [trimmedUpdatedNickname]: !!(acc && acc.lamports > 0),
        }));
      }).catch(() => {
        //Ignore
      });
  }, [trimmedUpdatedNickname]);

  return (
    <>
      <div className={twMerge("items-center justify-center flex flex-col sm:flex-row relative backdrop-blur-lg bg-[#211a1a99]/50 rounded-tl-xl rounded-tr-xl min-h-[10em] sm:min-h-auto", className)}>
        <div className='flex min-w-[12em] w-[11.5em] h-[10em] relative'>
          <div className='border-2 border-[#ffffff50] rounded-full w-[10em] h-[10em] left-[1.5em] top-[-0.8em] flex shrink-0 absolute overflow-hidden z-30 cursor-pointer'
            onMouseEnter={() => setProfilePictureHovering(true)}
            onMouseLeave={() => setProfilePictureHovering(false)}
            onClick={() => setIsUpdatingMetadata(true)}
          >
            <Image
              src={PROFILE_PICTURES[userProfile.profilePicture]}
              alt="Profile picture"
              className='w-full h-full'
              width={250}
              height={130}
            />

            {profilePictureHovering && !readonly ? <>
              <div className='h-full w-full absolute z-10 backdrop-blur-2xl'></div>
              <div className='h-full w-full absolute z-20 items-center justify-center flex flex-col'>
                <div className='font-archivoblack tracking-widest opacity-70 text-sm text-center'>Change Profile Picture</div>
              </div>
            </> : null}
          </div>
        </div>

        <div className="flex flex-col items-center mt-12 mb-4 sm:mb-0 sm:mt-0 sm:items-start w-full h-full justify-center z-20 pl-6">
          <div className='flex'>
            {walletPubkey ? <div className='z-20 flex gap-1'>
              <Image
                src={walletIcon}
                className="w-4 h-4 opacity-100"
                alt="alp logo"
              />

              <OnchainAccountInfo
                address={walletPubkey}
                className="text-sm opacity-90"
                addressClassName="text-xs tracking-[0.12em]"
                iconClassName='ml-1'
                shorten={true}
              />
            </div> : null}
          </div>

          <div className='flex mt-1'>
            <div className="flex items-end">
              <div className="font-archivoblack uppercase text-3xl relative">
                {userProfile.nickname}
              </div>

              {canUpdateNickname && userProfile.version > 1 ? (<div onClick={() => {
                setNicknameUpdating(true);
              }} className='text-xs opacity-70 relative bottom-1 left-2 cursor-pointer hover:opacity-100'>Edit</div>) : null}
            </div>
          </div>

          <div className='flex gap-x-2 items-end relative bottom-1'>
            <span className='text-lg font-cursive relative top-1'>&quot;</span>
            <span className='text-sm font-archivoblack'>Nameless One</span>
            <span className='text-lg font-cursive relative bottom-1 -scale-x-100 -scale-y-100'>&quot;</span>

            {canUpdateNickname && userProfile.version > 1 ? (
              <Tippy
                content={
                  <div className="text-sm">Coming soon</div>
                }
                placement="auto"
              >
                <div className='text-xs opacity-70 cursor-not-allowed hover:opacity-100 relative'>Edit</div>
              </Tippy>
            ) : null}
          </div>

          {!readonly && userProfile.version > 1 ? <div className="absolute top-2 right-4 z-20 ">
            <div
              className='text-xs opacity-70 cursor-pointer flex hover:opacity-100'
              onClick={() => setIsUpdatingMetadata(true)}
            >
              Edit wallpaper
            </div>
          </div> : null}
        </div>
      </div>

      <AnimatePresence>
        {nicknameUpdating ? <Modal
          title="Update Nickname"
          close={() => {
            setNicknameUpdating(false);
          }}
          className="max-w-[100%] w-[30em] pl-8 pr-8 pt-5"
        >
          <div className="flex flex-col gap-3">
            <div className="text-sm flex w-full items-center justify-between">
              <div className='font-thin text-base'>Cost </div>

              <div className='flex items-center gap-2 text-base'>
                <Image
                  src={adxLogo}
                  alt="ADX logo"
                  className="w-[1.2em] h-[1.2em]"
                />

                500 ADX
              </div>
            </div>

            <InputString
              className="font-boldy text-xl relative p-3 border rounded-lg text-center"
              value={updatedNickname ?? ''}
              onChange={setUpdatedNickname}
              placeholder="The Great Trader"
              inputFontSize="1em"
              maxLength={24}
            />

            <div className='h-[1em]'>
              {(trimmedUpdatedNickname && trimmedUpdatedNickname.length < 3) || !trimmedUpdatedNickname ?
                <div className="text-red-500 text-xs text-center mb-4 text-txtfade font-boldy">Nickname must be at least 3 characters</div> :
                null}

              {trimmedUpdatedNickname && typeof alreadyTakenNicknames[trimmedUpdatedNickname] === 'undefined' && trimmedUpdatedNickname.length > 3 ?
                <div className="text-red-500 text-xs text-center mb-4 text-txtfade font-boldy">Checking nickname availability...</div> :
                null}

              {trimmedUpdatedNickname && alreadyTakenNicknames[trimmedUpdatedNickname] === true ?
                <div className="text-red-500 text-xs text-center mb-4 text-yellow-400 font-boldy">Nickname is already taken</div> :
                null}

              {trimmedUpdatedNickname && alreadyTakenNicknames[trimmedUpdatedNickname] === false ?
                <div className="text-red-500 text-xs text-center mb-4 text-green font-boldy">Nickname is available</div> :
                null}
            </div>

            <div className='w-full h-[1px] bg-bcolor mt-1' />

            <div className='flex items-center justify-center gap-8 pb-6 pt-2'>
              <Button
                title="Cancel"
                variant='outline'
                onClick={() => {
                  setNicknameUpdating(false);
                }}
                className="w-60"
              />

              <Button
                title={"Pay and Update"}
                variant='primary'
                onClick={() => editNickname()}
                className="w-60"
              />
            </div>
          </div>
        </Modal> : null}

        {isUpdatingMetadata ? <Modal
          title="Update Profile"
          close={() => {
            setIsUpdatingMetadata(false);
          }}
          className="max-w-[90%] w-[60em]"
        >
          <div className='mt-4 font-archivoblack w-full items-center flex justify-center text-white/80'>
            Select Profile Picture
          </div>

          <div className='flex pt-6 pb-6 items-center justify-evenly flex-wrap gap-4'>
            {Object.entries(PROFILE_PICTURES).map(([v, path]) => {
              return <div
                key={v}
                className={twMerge(
                  'border-4 rounded-full w-[8em] h-[8em] left-[1.5em] top-[-0.8em] flex shrink-0 overflow-hidden z-30 cursor-pointer',
                  updatingMetadata.profilePicture === (Number(v) as unknown as ProfilePicture) ? 'border-yellow-400/80' : 'border-[#ffffff20] grayscale hover:grayscale-0'
                )}
                onClick={() => {
                  setUpdatingMetadata({
                    profilePicture: (Number(v) as unknown as ProfilePicture),
                    wallpaper: updatingMetadata.wallpaper,
                  });
                }}
              >
                <Image
                  src={path}
                  alt="Profile picture"
                  className='w-full h-full'
                  width={250}
                  height={130}
                />
              </div>;
            })}
          </div>

          <div className='w-full h-[1px] bg-bcolor mt-2 mb-4' />

          <div className='mt-4 font-archivoblack w-full items-center flex justify-center text-white/80'>
            Select Wallpaper
          </div>

          <div className='flex pt-6 pb-6 items-center justify-evenly flex-wrap gap-4'>
            {Object.entries(WALLPAPER).map(([v, path]) => {
              return <div
                key={v}
                className={twMerge(
                  'border-4 border-[#ffffff50] rounded-lg w-[15em] h-[7em] left-[1.5em] top-[-0.8em] flex shrink-0 overflow-hidden z-30 cursor-pointer',
                  updatingMetadata.wallpaper === (Number(v) as unknown as Wallpaper) ? 'border-yellow-400/80' : 'border-[#ffffff20] grayscale hover:grayscale-0'
                )}
                onClick={() => {
                  setUpdatingMetadata({
                    profilePicture: updatingMetadata.profilePicture,
                    wallpaper: (Number(v) as unknown as Wallpaper),
                  });
                }}
              >
                <Image
                  src={path}
                  alt="Wallpaper"
                  className='w-full h-full'
                  width={250}
                  height={130}
                />
              </div>;
            })}
          </div>

          <div className='w-full h-[1px] bg-bcolor mt-2 mb-4' />

          <div className='flex items-center justify-center gap-8 pb-8 pt-4'>
            <Button
              title="Cancel"
              variant='outline'
              onClick={() => {
                setIsUpdatingMetadata(false);
              }}
              className="w-60"
            />

            <Button
              title="Save"
              variant='primary'
              onClick={() => updateProfile()}
              className="w-60"
            />
          </div>
        </Modal> : null}
      </AnimatePresence >
    </>
  );
}
