import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { kv } from '@vercel/kv';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputString from '@/components/common/inputString/InputString';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import { UserProfileExtended } from '@/types';

import pfp from '../../../../public/images/profile-picture-1.jpg';
import walletIcon from '../../../../public/images/wallet-icon.svg';
import Referral from './Referral';

export default function OwnerBloc({
  userProfile,
  className,
  triggerUserProfileReload,
  canUpdateNickname = true,
  walletPubkey,
  redisProfile,
  setRedisProfile,
  duplicatedRedis,
  readonly = false,
}: {
  userProfile: UserProfileExtended;
  className?: string;
  triggerUserProfileReload: () => void;
  canUpdateNickname?: boolean;
  walletPubkey?: PublicKey;
  redisProfile: Record<string, string> | null;
  setRedisProfile: (redisProfile: Record<string, string>) => void;
  duplicatedRedis: boolean;
  readonly?: boolean;
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

    if (!walletPubkey) return notification.currentStepErrored(
      'You must be connected to edit your nickname',
    );

    if (trimmedNickname === userProfile.nickname) {
      return notification.currentStepErrored(
        'Nickname is already set',
      );
    }

    const newRedisProfile = await kv.get(trimmedNickname);

    if (newRedisProfile !== null) {
      return notification.currentStepErrored(
        'Nickname already exists, please choose a different one',
      );
    }

    try {
      if (!walletPubkey) return notification.currentStepErrored('Wallet not connected');

      await window.adrena.client.editUserProfileNickname({
        nickname: trimmedNickname,
        notification,
      });

      await kv.set(trimmedNickname, walletPubkey.toBase58());

      if (redisProfile && redisProfile.nickname !== trimmedNickname) {
        await kv.del(redisProfile.nickname);
      }

      // pre-shot the onchain change as we know it's coming
      setRedisProfile({
        nickname: trimmedNickname,
        owner: walletPubkey.toBase58(),
      });

      triggerUserProfileReload();

      // pre-shot the onchain change as we know it's coming
      userProfile.nickname = trimmedNickname;

      setNicknameUpdating(false);
    } catch (error) {
      console.error('error', error);
    }
  };

  const [profilePictureHovering, setProfilePictureHovering] = useState<boolean>(false);

  return (
    <div className={twMerge("items-center justify-center flex flex-col sm:flex-row relative backdrop-blur-lg bg-[#211a1a99]/50 rounded-tl-xl rounded-tr-xl min-h-[10em] sm:min-h-auto", className)}>
      <div className='flex min-w-[12em] w-[11.5em] h-[10em] relative'>
        <div className='border-2 border-[#ffffff50] rounded-full w-[10em] h-[10em] left-[1.5em] top-[-0.8em] flex shrink-0 absolute overflow-hidden z-30 cursor-not-allowed'
          onMouseEnter={() => setProfilePictureHovering(true)}
          onMouseLeave={() => setProfilePictureHovering(false)}
        >
          <Image
            src={pfp}
            alt="Profile picture"
            className='w-full h-full'
            width={250}
            height={130}
          />

          {profilePictureHovering && !readonly ? <>
            <div className='h-full w-full absolute z-10 backdrop-blur-2xl'></div>
            <div className='h-full w-full absolute z-20 items-center justify-center flex flex-col'>
              <div className='font-archivo tracking-widest opacity-70 text-sm text-center'>Change Profile Picture</div>
              <div className='font-boldy tracking-widest opacity-50 text-xs'>Coming Soon</div>
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
          {nicknameUpdating ? (

            <div className="flex items-center sm:items-end pb-2 flex-col sm:flex-row gap-y-4 sm:gap-y-0">
              <InputString
                className="font-archivo uppercase text-3xl relative p-1 bg-transparent border-b border-white text-center sm:text-start"
                value={updatedNickname ?? ''}
                onChange={setUpdatedNickname}
                placeholder="The Great Trader"
                inputFontSize="1.2em"
                maxLength={24}
              />

              <div className='flex gap-4 ml-0 sm:ml-4'>
                {canUpdateNickname ? (<div
                  onClick={() => editNickname()}
                  className={twMerge(
                    'text-xs opacity-70 relative bottom-1 left-2 hover:opacity-100',
                    updatedNickname && (updatedNickname.length >= 3 &&
                      updatedNickname.length <= 24)
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed'
                  )}>
                  Save
                </div>) : null}

                {canUpdateNickname ? (<div onClick={() => {
                  setNicknameUpdating(false);
                }} className='text-xs opacity-70 relative bottom-1 left-2 cursor-pointer hover:opacity-100'>
                  Cancel
                </div>) : null}
              </div>
            </div>
          ) : (
            <div className="flex items-end">
              <div className="font-archivo uppercase text-3xl relative">
                {userProfile.nickname}
              </div>

              {canUpdateNickname ? (<div onClick={() => {
                setNicknameUpdating(true);
              }} className='text-xs opacity-70 relative bottom-1 left-2 cursor-pointer hover:opacity-100'>Edit</div>) : null}
            </div>
          )}
        </div>

        <div className='flex gap-x-2 items-end relative bottom-1'>
          <span className='text-lg font-cursive relative top-1'>&quot;</span>
          <span className='text-sm font-archivo'>Nameless One</span>
          <span className='text-lg font-cursive relative bottom-1 -scale-x-100 -scale-y-100'>&quot;</span>

          {canUpdateNickname ? (
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
      </div>

      {!readonly ? <>
        <Referral
          className='h-auto w-auto flex absolute right-0 bottom-0 z-20'
          userProfile={userProfile}
          redisProfile={redisProfile}
          duplicatedRedis={duplicatedRedis}
        />
      </> : null}

      {!readonly ? <div className="absolute top-2 right-4 z-20 ">
        <Tippy
          content={
            <div className="text-sm">Coming soon</div>
          }
          placement="auto"
        >
          <div className='text-xs opacity-70 cursor-not-allowed flex hover:opacity-100'>Edit wallpaper</div>
        </Tippy>
      </div> : null}
    </div>
  );
}
