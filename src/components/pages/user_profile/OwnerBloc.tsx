import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import DateInfo from '@/components/pages/backoffice/DateInfo';
import OnchainAccountInfo from '@/components/pages/backoffice/OnchainAccountInfo';
import { UserProfileExtended } from '@/types';

import monsterImage from '../../../../public/images/monster-1.png';
import EmphasizedTitle from './EmphasizedTitle';

export default function OwnerBloc({
  userProfile,
  className,
}: {
  userProfile: UserProfileExtended;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        'flex pr-4 items-center justify-center w-full relative',
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
            <div className="flex items-center">
              <div className="text-txtfade text-xs opacity-70">
                owner {'->'}
              </div>

              <OnchainAccountInfo
                className="text-[0.7em] ml-2"
                address={userProfile.owner}
              />
            </div>

            <div className="flex items-center">
              <div className="text-txtfade text-xs opacity-70">
                profile {'->'}
              </div>

              <OnchainAccountInfo
                className="text-[0.7em] ml-2"
                address={userProfile.pubkey}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
