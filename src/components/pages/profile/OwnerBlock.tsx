import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import adxLogo from '@/../../public/images/adx.svg';
import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import { ACHIEVEMENTS, PROFILE_PICTURES, USER_PROFILE_TITLES, WALLPAPERS } from '@/constant';
import { ProfilePicture, UserProfileExtended, UserProfileTitle, Wallpaper } from '@/types';

import lockIcon from '../../../../public/images/Icons/lock.svg';
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
    title: UserProfileTitle;
  }>({
    profilePicture: userProfile.profilePicture,
    wallpaper: userProfile.wallpaper,
    title: userProfile.title,
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
        title: updatingMetadata.title,
        notification,
      });

      // pre-shot the onchain change as we know it's coming
      userProfile.profilePicture = updatingMetadata.profilePicture;
      userProfile.wallpaper = updatingMetadata.wallpaper;
      userProfile.title = updatingMetadata.title;

      triggerUserProfileReload();

      setIsUpdatingMetadata(false);
    } catch (error) {
      console.error('error', error);
    }
  }, [triggerUserProfileReload, updatingMetadata.profilePicture, updatingMetadata.wallpaper, updatingMetadata.title, userProfile, walletPubkey]);

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

  const wallpapersDOM = useMemo(() => {
    const unlockedWallpapers = Object.keys(WALLPAPERS).reduce((unlocked, i) => {
      const index = Number(i);
      // Look if there is an achievement that unlocks this wallpaper
      const achievement = ACHIEVEMENTS.find((achievement) => achievement.wallpaperUnlock === index);

      if (!achievement) {
        // No requirement for the wallpaper
        return [...unlocked, index];
      }

      // Check if the user have the Achievement
      if (userProfile.achievements?.[achievement.index]) {
        return [...unlocked, index];
      }

      return unlocked;
    }, [] as number[]);

    return Object.entries(WALLPAPERS).map(([v, path]) => {
      const unlocked = unlockedWallpapers.includes(Number(v));

      return <Tippy
        content={`Unlocked by the achievement "${ACHIEVEMENTS.find(achievement => achievement.wallpaperUnlock === Number(v))?.title ?? ''}"`}
        key={`wallpaper-${v}`}
        disabled={unlocked}
      >
        <div
          className={twMerge(
            'h-auto flex z-30 relative aspect-[21/9]',
            updatingMetadata.wallpaper === (Number(v) as unknown as ProfilePicture) ? 'border-4 border-yellow-400/80' : 'border-[#ffffff20] grayscale',
            unlocked ? 'grayscale-0 hover:grayscale-0 cursor-pointer' : 'grayscale cursor-disabled',
          )}
          onClick={() => {
            if (!unlocked) return;

            setUpdatingMetadata((u) => ({
              profilePicture: u.profilePicture,
              wallpaper: (Number(v) as unknown as Wallpaper),
              title: u.title,
            }));
          }}
        >
          {!unlocked ? <Image
            className="absolute bottom-2 right-2 opacity-60 h-5 w-5"
            src={lockIcon}
            width={18}
            height={20}
            alt="lock icon"
          /> : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={path}
            alt="Wallpaper"
            className='h-full w-full'
            width={900}
            height={600}
          />
        </div>
      </Tippy>;
    });
  }, [updatingMetadata, userProfile.achievements]);

  const profilePictureDOM = useMemo(() => {
    const unlockedPfpIndexes = Object.keys(PROFILE_PICTURES).reduce((unlocked, i) => {
      const index = Number(i);
      // Look if there is an achievement that unlocks this profile picture
      const achievement = ACHIEVEMENTS.find((achievement) => typeof achievement.pfpUnlock !== 'undefined' ? achievement.pfpUnlock === index : false);

      if (!achievement) {
        // No requirement for the PFP
        return [...unlocked, index];
      }

      // Check if the user have the Achievement
      if (userProfile.achievements?.[achievement.index]) {
        return [...unlocked, index];
      }

      return unlocked;
    }, [] as number[]);

    return Object.entries(PROFILE_PICTURES).map(([v, path]) => {
      const unlocked = unlockedPfpIndexes.includes(Number(v));

      return <Tippy
        content={`Unlocked by the achievement "${ACHIEVEMENTS.find(achievement => achievement.pfpUnlock === Number(v))?.title ?? ''}"`}
        key={`pfp-${v}`}
        disabled={unlocked}
      >
        <div
          className={twMerge(
            'h-auto flex z-30 relative aspect-square',
            updatingMetadata.profilePicture === (Number(v) as unknown as ProfilePicture) ? 'border-4 border-yellow-400/80' : 'border-[#ffffff20] grayscale',
            unlocked ? 'grayscale-0 hover:grayscale-0 cursor-pointer' : 'grayscale cursor-disabled',
          )}
          onClick={() => {
            if (!unlocked) return;

            setUpdatingMetadata((u) => ({
              profilePicture: (Number(v) as unknown as ProfilePicture),
              wallpaper: u.wallpaper,
              title: u.title,
            }));
          }}
        >
          {!unlocked ? <Image
            className="absolute bottom-2 right-2 opacity-60 h-5 w-5"
            src={lockIcon}
            width={18}
            height={20}
            alt="lock icon"
          /> : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={path}
            alt="Profile picture"
            className='h-full w-full'
            width={250}
            height={250}
          />
        </div>
      </Tippy>;
    });
  }, [updatingMetadata, userProfile.achievements]);

  const titlesDOM = useMemo(() => {
    const unlockedTitles = Object.keys(USER_PROFILE_TITLES).reduce((unlocked, i) => {
      const index = Number(i);
      // Look if there is an achievement that unlocks this title
      const achievement = ACHIEVEMENTS.find((achievement) => achievement.titleUnlock === index);

      if (!achievement) {
        // No requirement for the title
        return [...unlocked, index];
      }

      // Check if the user have the Achievement
      if (userProfile.achievements?.[achievement.index]) {
        return [...unlocked, index];
      }

      return unlocked;
    }, [] as number[]);

    return Object.entries(USER_PROFILE_TITLES).map(([v, title]) => {
      const unlocked = unlockedTitles.includes(Number(v));

      return <Tippy
        content={`Unlocked by the achievement "${ACHIEVEMENTS.find(achievement => achievement.titleUnlock === Number(v))?.title ?? ''}"`}
        key={`title-${v}`}
        disabled={unlocked}
      >
        <div
          className={twMerge(
            'h-auto flex z-30 relative border-b-4 ml-auto mr-auto text-base',
            updatingMetadata.title === (Number(v) as unknown as ProfilePicture) ? 'border-yellow-400/80' : 'border-transparent grayscale',
            unlocked ? 'grayscale-0 hover:grayscale-0 cursor-pointer' : 'text-txtfade cursor-disabled',
          )}
          onClick={() => {
            if (!unlocked) return;

            setUpdatingMetadata((u) => ({
              profilePicture: u.profilePicture,
              wallpaper: u.wallpaper,
              title: (Number(v) as unknown as UserProfileTitle),
            }));
          }}
        >
          {title}
        </div>
      </Tippy>;
    });
  }, [updatingMetadata, userProfile.achievements]);

  return (
    <>
      <div className={twMerge("items-center justify-center flex flex-col sm:flex-row relative backdrop-blur-lg bg-[#211a1a99]/50 rounded-tl-xl rounded-tr-xl min-h-[10em] sm:min-h-auto", className)}>
        <div className='flex min-w-[12em] w-[11.5em] h-[10em] relative'>
          <div
            onMouseEnter={() => !readonly && setProfilePictureHovering(true)}
            onMouseLeave={() => !readonly && setProfilePictureHovering(false)}
            onClick={() => !readonly && setIsUpdatingMetadata(true)}
            className={twMerge(
              'border-2 border-[#ffffff50] rounded-full w-[10em] h-[10em] left-[1.5em] top-[-0.8em] flex shrink-0 absolute overflow-hidden z-30',
              !readonly && 'cursor-pointer'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PROFILE_PICTURES[userProfile.profilePicture]}
              alt="Profile picture"
              className='w-full h-full'
              width={250}
              height={250}
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
            <span className='text-sm font-archivoblack'>{USER_PROFILE_TITLES[userProfile.title]}</span>
            <span className='text-lg font-cursive relative bottom-1 -scale-x-100 -scale-y-100'>&quot;</span>

            {canUpdateNickname && userProfile.version > 1 ? (
              <div
                className='text-xs opacity-70 cursor-pointer hover:opacity-100 relative'
                onClick={() => setIsUpdatingMetadata(true)}
              >Edit</div>
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
          className="max-w-[100%] w-[30em] pl-8 pr-8 pt-5 overflow-y-none"
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
          className="max-w-[90%] w-[90em] h-full flex flex-col"
        >
          <div className='flex w-full h-full max-h-[35em] overflow-auto flex-col'>
            <div className='flex flex-col w-full'>
              <div className='mt-4 mb-3 tracking-widest w-full items-center flex justify-center text-white/80'>
                Select Profile Picture
              </div>

              <div className='w-full h-[1px] bg-bcolor flex mt-2' />

              <div className="grid grid-cols-[repeat(auto-fit,minmax(7em,1fr))]">
                {profilePictureDOM}
              </div>

            </div>

            <div className='flex flex-col w-full mt-6'>
              <div className='mt-4 mb-3 tracking-widest w-full items-center flex justify-center text-white/80'>
                Select Wallpaper
              </div>

              <div className='w-full h-[1px] bg-bcolor flex mt-2' />

              <div className="grid grid-cols-[repeat(auto-fit,minmax(12em,1fr))]">
                {wallpapersDOM}
              </div>
            </div>

            <div className='flex flex-col w-full mt-6'>
              <div className='mt-4 mb-3 tracking-widest w-full items-center flex justify-center text-white/80'>
                Select Title
              </div>

              <div className='w-full h-[1px] bg-bcolor flex mt-2' />

              <div className="grid grid-cols-[repeat(auto-fit,minmax(15em,1fr))] gap-2 pt-6 pb-6">
                {titlesDOM}
              </div>
            </div>
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
