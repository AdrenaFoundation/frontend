import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import Loader from '@/components/Loader/Loader';
import OwnerBloc from '@/components/pages/user_profile/OwnerBloc';
import OwnerBlocReworked from '@/components/pages/user_profile/OwnerBlocReworked';
import PositionsStats from '@/components/pages/user_profile/PositionsStats';
import PositionsStatsBloc from '@/components/pages/user_profile/PositionsStatsBloc';
import SwapStats from '@/components/pages/user_profile/SwapStats';
import SwapStatsBloc from '@/components/pages/user_profile/SwapStatsBloc';
import TradingStats from '@/components/pages/user_profile/TradingStats';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import { PageProps } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
} from '@/utils';

export default function UserProfile({
  connected,
  positions,
  userProfile,
  triggerPositionsReload,
  triggerUserProfileReload,
  readonly = false,
}: PageProps & {
  readonly?: boolean;
}) {
  const [nickname, setNickname] = useState<string | null>(null);

  // When the profile page loads, update the profile so it's up to date with latests
  // user actions
  useEffect(() => {
    triggerUserProfileReload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!connected) {
    addNotification({
      type: 'error',
      title: 'Please connect your wallet',
    });
    return;
  }

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
        console.log('error', error);
        return addFailedTxNotification({
          title: 'Error Creating Profile',
          error,
        });
      }
    };

    return (
      <>
        <div className="absolute w-full h-full left-0 top-0 bottom-0 overflow-hidden">
          <RiveAnimation
            animation="blob-bg"
            layout={
              new Layout({ fit: Fit.FitWidth, alignment: Alignment.TopLeft })
            }
            className={'absolute top-0 md:top-[-50px] left-0 w-[700px] h-full'}
          />

          <RiveAnimation
            animation="fred-bg"
            layout={
              new Layout({ fit: Fit.FitWidth, alignment: Alignment.TopRight })
            }
            className={'absolute right-0 w-[1500px]  h-full'}
          />
        </div>

        <div className="flex flex-col items-center justify-center mt-[6%] z-20 border bg-bcolor/85 backdrop-blur-md p-7 m-4 w-[25em] self-center rounded-lg">
          <div className="font-special text-3xl text-center">
            Create my profile
          </div>

          <span className="mt-6 max-w-[28em] flex text-center opacity-75 italic text-lg">
            Profile&apos;s optional – no need for trading, swapping, or staking.
            Handy for tracking your stats: average leverage, PnL, fees, and
            more.
          </span>

          <div className="w-2/3 h-[1px] bg-bcolor mt-8"></div>

          <div className="flex flex-col items-center justify-center">
            <div className="font-special text-xl mt-10 ">My Nickname</div>

            <InputString
              value={nickname ?? ''}
              onChange={setNickname}
              placeholder="The Great Trader"
              className="mt-4 text-center w-[20em] p-4 bg-third border rounded-xl"
              inputFontSize="1.1em"
              maxLength={24}
            />
          </div>

          <Button
            disabled={
              nickname ? !(nickname.length >= 3 && nickname.length <= 24) : true
            }
            className="mt-4 text-sm w-full"
            size="lg"
            title="Create"
            onClick={() => initUserProfile()}
          />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-wrap w-full items-stretch justify-between">
      <OwnerBlocReworked
        userProfile={userProfile}
        triggerUserProfileReload={triggerUserProfileReload}
        canDeleteProfile={false}
        canUpdateNickname={!readonly}
        className="flex flex-1 m-2 mt-2 w-min-[30em]"
      />

      {userProfile ? (
        <>
          <TradingStats
            userProfile={userProfile}
            className="flex flex-1 m-2 mt-2"
          ></TradingStats>
          <SwapStats
            userProfile={userProfile}
            className="flex flex-1 m-2 mt-2"
          ></SwapStats>
        </>
      ) : null}

      <PositionsStats
        className="flex flex-2 m-2 mt-2"
        positions={positions}
        triggerPositionsReload={triggerPositionsReload}
        title="Opened Positions"
      ></PositionsStats>
    </div>
  );
}
