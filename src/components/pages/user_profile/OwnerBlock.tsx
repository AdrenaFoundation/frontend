import { PublicKey } from '@solana/web3.js';
import { kv } from '@vercel/kv';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import { UserProfileExtended } from '@/types';

import editIcon from '../../../../public/images/edit-icon.png';
import pfp from '../../../../public/images/monster-pfp.png';
import walletIcon from '../../../../public/images/wallet-icon.svg';
import Referral from '../my_dashboard/Referral';
import DateInfo from '../monitoring/DateInfo';

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

      await window.adrena.client.editUserProfile({
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

  return (
    <div className={twMerge("items-center justify-center flex relative backdrop-blur-lg rounded-tl-xl rounded-tr-xl min-h-[10em] sm:min-h-auto", className)}>
      <div className='flex min-w-[12em] w-[11.5em] h-[10em] relative'>
        <div className='border-2 border-[#0000005A] rounded-full w-[10em] h-[10em] left-[1.5em] top-[-0.8em] flex shrink-0 absolute overflow-hidden z-30'>
          <Image
            src={pfp}
            alt="Profile picture"
            className='w-full h-full'
            width={250}
            height={130}
          />
        </div>
      </div>

      <div className="flex flex-col w-full h-full justify-center z-20 pl-6">
        <div className='flex'>
          {nicknameUpdating ? (
            <div className="flex flex-col items-center w-full justify-center">
              <InputString
                className="flex w-full max-w-[24em] border rounded-lg bg-inputcolor text-center justify-center font-boldy"
                value={updatedNickname ?? ''}
                onChange={setUpdatedNickname}
                placeholder="The Great Trader"
                inputFontSize="1.2em"
                maxLength={24}
              />

              <div className="flex w-full items-center justify-evenly">
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
            <div className="flex items-center">
              <div className="font-archivo uppercase text-3xl relative">
                {userProfile.nickname}
              </div>

              {canUpdateNickname ? (
                <Image
                  className="flex ml-4 shrink-0 max-w-[20px] max-h-[20px] opacity-20 hover:opacity-100 cursor-pointer"
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

        <div className='flex'>
          {walletPubkey ? <div className='z-20 flex gap-1'>
            <Image
              src={walletIcon}
              className="w-4 h-4 opacity-100"
              alt="alp logo"
            />

            <OnchainAccountInfo
              address={walletPubkey}
              className="text-md text-sm opacity-90"
              addressClassName="text-xs tracking-[0.12em]"
              iconClassName='ml-1'
              shorten={true}
              shortenSize={10}
            />
          </div> : null}
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

      <DateInfo
        className="text-xs absolute top-2 right-4 z-20 font-regular text-txtfade tracking-wider"
        timestamp={userProfile.nativeObject.createdAt}
        shorten={true}
      />
    </div>
  );
}
