import { PublicKey } from '@solana/web3.js';
// import Image from 'next/image';
import { useState } from 'react';

import Modal from '@/components/common/Modal/Modal';
// import bonkLogo from '@/../public/images/bonk.png';
//import jtoLogo from '@/../public/images/jito-logo-2.png';
// import FormatNumber from '@/components/Number/FormatNumber';
import MutagenLeaderboardInterseason3 from '@/components/pages/mutagen_leaderboard/MutagenLeaderboardInterseason3';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useMutagenLeaderboardData from '@/hooks/useMutagenLeaderboardData';
// import { useSelector } from '@/store/store';
import { UserProfileExtended } from '@/types';
import { getNonUserProfile } from '@/utils';

export default function Interseason3({
  jtoPrice,
}: {
  jtoPrice: number | null;
}) {
  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
  const leaderboardData = useMutagenLeaderboardData({
    allUserProfilesMetadata,
    seasonName: 'interseason3',
    rankFilter: 'points_trading',
  });
  // const tokenPrices = useSelector((s) => s.tokenPrices);

  const [activeProfile, setActiveProfile] =
    useState<UserProfileExtended | null>(null);
  // const [rewardsAs, setRewardsAs] = useState<'tokens' | 'usd'>('usd');

  return (
    <div className="w-full mx-auto px-4 relative flex flex-col pb-4">
      <div className="flex flex-col gap-2 items-center justify-center text-center px-4 mx-auto max-w-[100em]">
        <span className="text-xs sm:text-sm lg:text-base font-semibold text-white/90 w-full">
          For this Summer Event, the rule is simple: Top 25 traders will share
          the prize pool of 21,200 JTO and 3,160,000,000 BONK.
        </span>
        <span className="text-xs sm:text-sm lg:text-base font-semibold text-white/90 w-full">
          Ready, Set, Trade!
        </span>

        {/* <div className="w-full flex justify-center items-center flex-col gap-6 mt-8">
                    <div className="text-xxs tracking-widest text-txtfade w-1/2 text-center uppercase">PRIZE POOL REWARDS</div>

                    <div className='flex h-[2em] items-center justify-center gap-4 opacity-80'>
                        <div className='flex flex-col'>
                            <div className="text-md flex gap-2 justify-center items-center">
                                <Image
                                    src={jtoLogo}
                                    alt="JTO Token"
                                    width={20}
                                    height={20}
                                    loading="eager"
                                    draggable="false"
                                    className="w-6 h-6"
                                />

                                <FormatNumber
                                    nb={rewardsAs === 'usd' ? (21200 * (jtoPrice || 0)) : 21200}
                                    format={rewardsAs === 'usd' ? "currency" : 'number'}
                                    precision={0}
                                    prefix={rewardsAs === 'usd' ? '$' : ''}
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                    isDecimalDimmed={false}
                                    suffix='JTO'
                                    suffixClassName='text-lg'
                                    className='border-0 text-lg'
                                />
                            </div>
                        </div>

                        <div className='h-full w-[1px] bg-bcolor' />

                        <div className='flex flex-col'>
                            <div className="text-md flex gap-2 justify-center items-center">
                                <Image
                                    src={bonkLogo}
                                    alt="BONK Token"
                                    width={20}
                                    height={20}
                                    loading="eager"
                                    draggable="false"
                                    className="w-4 h-4"
                                />

                                <FormatNumber
                                    nb={rewardsAs === 'usd' ? (3160000000 * (tokenPrices?.BONK || 0)) : 3160000000}
                                    format={rewardsAs === 'usd' ? "currency" : 'number'}
                                    precision={0}
                                    prefix={rewardsAs === 'usd' ? '$' : ''}
                                    isDecimalDimmed={false}
                                    suffix='BONK'
                                    suffixClassName='text-lg'
                                    className='border-0 text-lg'
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col gap-3 items-center'>
                        <div className='w-[20em] h-[1px] bg-bcolor' />

                        <div className='flex gap-2'>
                            <div
                                className={`text-xs cursor-pointer ${rewardsAs === 'tokens' ? 'text-white' : 'text-txtfade'}`}
                                onClick={() => setRewardsAs('tokens')}
                            >
                                in tokens
                            </div>
                            <div className='text-xs text-txtfade'>/</div>
                            <div
                                className={`text-xs cursor-pointer ${rewardsAs === 'usd' ? 'text-white' : 'text-txtfade'}`}
                                onClick={() => setRewardsAs('usd')}
                            >
                                in us dollar
                            </div>
                        </div>
                    </div>
                </div> */}

        {leaderboardData ? (
          <MutagenLeaderboardInterseason3
            data={leaderboardData}
            jtoPrice={jtoPrice}
            onClickUserProfile={async (wallet: PublicKey) => {
              const p = await window.adrena.client.loadUserProfile({
                user: wallet,
              });

              if (p === false) {
                setActiveProfile(getNonUserProfile(wallet.toBase58()));
              } else {
                setActiveProfile(p);
              }
            }}
          />
        ) : (
          <div className="flex w-full items-center justify-center mb-8 mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {activeProfile && (
        <Modal
          className="h-[80vh] w-full overflow-y-auto"
          wrapperClassName="items-start w-full max-w-[70em] sm:mt-0"
          title=""
          close={() => setActiveProfile(null)}
          isWrapped={false}
        >
          <ViewProfileModal
            profile={activeProfile}
            close={() => setActiveProfile(null)}
          />
        </Modal>
      )}
    </div>
  );
}
