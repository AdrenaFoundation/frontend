import { DotLottiePlayer, PlayerEvents } from '@dotlottie/react-player';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import Loader from '@/components/Loader/Loader';
import OwnerBloc from '@/components/pages/user_profile/OwnerBloc';
import PositionsStatsBloc from '@/components/pages/user_profile/PositionsStatsBloc';
import SwapStatsBloc from '@/components/pages/user_profile/SwapStatsBloc';
import { PageProps } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
} from '@/utils';

export default function UserProfile({
  userProfile,
  triggerUserProfileReload,
  readonly = false,
}: PageProps & {
  readonly?: boolean;
}) {
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const [isAnimationLoaded2, setIsAnimationLoaded2] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);

  // When the profile page loads, update the profile so it's up to date with latests
  // user actions
  useEffect(() => {
    triggerUserProfileReload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (userProfile === null) {
    return <Loader className="mt-[20%]" />;
  }

  if (userProfile === false) {
    const initUserProfile = async () => {
      const trimmedNickname = (nickname ?? '').trim();

      if (trimmedNickname.length < 3 || trimmedNickname.length > 24) {
        return addNotification({
          title: 'Cannot create profile',
          type: 'info',
          message: 'Nickname must be between 3 to 24 characters long',
        });
      }

      try {
        const txHash = await window.adrena.client.initUserProfile({
          nickname: trimmedNickname,
        });

        triggerUserProfileReload();

        return addSuccessTxNotification({
          title: 'Successfully Created Profile',
          txHash,
        });
      } catch (error) {
        return addFailedTxNotification({
          title: 'Error Creating Profile',
          error,
        });
      }
    };

    // full animation
    // https://lottie.host/37e1ec5d-b487-44e1-b4e9-ac7f51500eee/ydhCjShFMH.lottie
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    return (
      <>
        <div className="absolute w-full h-full left-0 top-0 bottom-0 overflow-hidden z-10">
          <DotLottiePlayer
            src="https://lottie.host/ff6a0308-76f8-46fc-b6e3-74b1d4251fcd/jr8ibLSo4g.lottie"
            autoplay={!isSafari}
            loop={!isSafari}
            className={twMerge(
              isAnimationLoaded ? 'opacity-100' : 'opacity-0',
              'absolute top-0 right-0 bottom-0 w-[1000px] lg:w-full transition-opacity duration-300',
            )}
            onEvent={(event: PlayerEvents) => {
              if (event === PlayerEvents.Ready) {
                setIsAnimationLoaded(true);
              }
            }}
          />

          <DotLottiePlayer
            src="https://lottie.host/86bfc6ae-7fe8-47ac-90c4-8b1463c76f1d/dUBWvrAw1g.lottie"
            autoplay={!isSafari}
            loop={!isSafari}
            className={twMerge(
              isAnimationLoaded2 ? 'opacity-100' : 'opacity-0',
              'absolute top-0 md:top-[-50px] left-0 w-[800px] lg:w-[1100px] transition-opacity duration-300',
            )}
            onEvent={(event: PlayerEvents) => {
              if (event === PlayerEvents.Ready) {
                setIsAnimationLoaded2(true);
              }
            }}
          />
        </div>

        <div className="flex flex-col items-center justify-center mt-[6%] z-20 bg-[#000000B0] p-4 w-[25em] self-center">
          <div className="font-specialmonster text-5xl">Create my profile</div>

          <span className="mt-6 max-w-[28em] flex text-center text-txtfade italic text-lg">
            Profile&apos;s optional – no need for trading, swapping, or staking.
            Handy for tracking your stats: average leverage, PnL, fees, and
            more.
          </span>

          <div className="w-2/3 h-[1px] bg-gray-300 mt-8"></div>

          <div className="flex flex-col items-center justify-center">
            <div className="font-specialmonster text-3xl mt-12 text-txtfade">
              My Nickname
            </div>

            <InputString
              value={nickname ?? ''}
              onChange={setNickname}
              placeholder="The Great Trader"
              className="mt-4 text-center w-[20em]"
              inputFontSize="1.1em"
              maxLength={24}
            />
          </div>

          <Button
            disabled={
              nickname ? !(nickname.length >= 3 && nickname.length <= 24) : true
            }
            className="mt-8 text-sm pl-8 pr-8"
            title="Create"
            onClick={() => initUserProfile()}
          />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-wrap">
      <div className="flex m-2 w-[26em] min-w-[26em] grow border border-gray-400 shadow-lg shadow-[#ffffff50] pt-8 pb-8 pl-2 pr-2 justify-center">
        <OwnerBloc
          userProfile={userProfile}
          triggerUserProfileReload={triggerUserProfileReload}
          canDeleteProfile={!readonly}
          className="min-w-[24em] w-[24em] max-w-[24em] items-start"
        />
      </div>

      <div className="flex flex-col w-[40em] min-w-[26em] grow m-2 border border-gray-400 shadow-lg shadow-[#ffffff50]">
        <SwapStatsBloc userProfile={userProfile} className="grow p-4" />

        <PositionsStatsBloc userProfile={userProfile} className="grow p-4" />
      </div>
    </div>
  );
}
