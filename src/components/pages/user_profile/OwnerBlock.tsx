import { PublicKey } from '@solana/web3.js';
import { kv } from '@vercel/kv';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import DateInfo from '@/components/pages/monitoring/DateInfo';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import { UserProfileExtended } from '@/types';

import editIcon from '../../../../public/images/edit-icon.png';
import pfp from '../../../../public/images/monster-pfp.png';
import pfw from '../../../../public/images/pfw.png';
import walletIcon from '../../../../public/images/wallet-icon.svg';
import Referral from '../my_dashboard/Referral';

export default function OwnerBloc({
  userProfile,
  className,
  triggerUserProfileReload,
  canUpdateNickname = true,
  walletPubkey,
  redisProfile,
  setRedisProfile,
  duplicatedRedis,
}: {
  userProfile: UserProfileExtended;
  className?: string;
  triggerUserProfileReload: () => void;
  canUpdateNickname?: boolean;
  walletPubkey?: PublicKey;
  redisProfile: Record<string, string>;
  setRedisProfile: (redisProfile: Record<string, string>) => void;
  duplicatedRedis: boolean;
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
      await kv.del(redisProfile.nickname);

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
    <div className={twMerge("items-center justify-center flex flex-col relative pt-[5em] rounded-tl-xl rounded-tr-xl min-h-[12em] sm:min-h-auto", className)}>
      {walletPubkey ? <div className='z-20 absolute top-[-1.4em] right-0 flex gap-1'>
        <Image
          src={walletIcon}
          className="w-4 h-4 inline-block opacity-50"
          alt="alp logo"
        />

        <OnchainAccountInfo
          address={walletPubkey}
          className="text-md text-xs font-white font-boldy"
          iconClassName='ml-1'
          shorten={true}
        />
      </div> : null}

      <div className='border-2 border-[#0000005A] rounded-full w-[10em] h-[10em] flex shrink-0 top-[-5em] absolute overflow-hidden z-30'>
        <Image
          src={pfp}
          alt="Profile picture"
          className='w-full h-full'
          width={250}
          height={130}
        />
      </div>

      <div className='w-full h-full absolute opacity-40 top-0 rounded-tl-xl rounded-tr-xl z-10 overflow-hidden'>
        <Image
          src={pfw}
          alt="Profile wallpaper"
          className='min-w-full min-h-full'
          width={800}
          height={400}
        />
      </div>

      <div className="flex flex-col w-full h-full items-center justify-center pb-4 z-20">
        {nicknameUpdating ? (
          <div className="flex flex-col items-center w-full justify-center pb-4">
            <InputString
              className="flex w-full max-w-[24em] border rounded-lg bg-inputcolor text-center justify-center mt-4 font-boldy"
              value={updatedNickname ?? ''}
              onChange={setUpdatedNickname}
              placeholder="The Great Trader"
              inputFontSize="1.2em"
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
          <div className="flex items-center mb-4">
            <div className="font-boldy text-4xl ml-2 relative">
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

      <Referral
        className='h-auto w-auto flex absolute left-0 bottom-0 z-20'
        userProfile={userProfile}
        redisProfile={redisProfile}
        duplicatedRedis={duplicatedRedis}
      />

      <DateInfo
        className="text-sm absolute bottom-2 right-4 z-20 font-boldy"
        timestamp={userProfile.nativeObject.createdAt}
        shorten={true}
      />
    </div>
  );
}
