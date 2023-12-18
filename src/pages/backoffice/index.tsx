import { DotLottiePlayer, PlayerEvents } from '@dotlottie/react-player';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import AccountsBloc from '@/components/pages/backoffice/Blocs/AccountsBloc';
import AssetsUnderManagementBloc from '@/components/pages/backoffice/Blocs/AssetsUnderManagementBloc';
import BucketsBloc from '@/components/pages/backoffice/Blocs/BucketsBloc';
import FeeCustodyBreakdownBloc from '@/components/pages/backoffice/Blocs/FeeCustodyBreakdownBloc';
import GlobalOverviewBloc from '@/components/pages/backoffice/Blocs/GlobalOverviewBloc';
import PositionsBloc from '@/components/pages/backoffice/Blocs/PositionsBloc';
import VestingBloc from '@/components/pages/backoffice/Blocs/VestingBloc';
import VolumeCustodyBreakdownBloc from '@/components/pages/backoffice/Blocs/VolumeCustodyBreakdownBloc';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import useCortex from '@/hooks/useCortex';
import usePerpetuals from '@/hooks/usePerpetuals';
import useStakingAccount from '@/hooks/useStakingAccount';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function Backoffice({ mainPool, custodies }: PageProps) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const cortex = useCortex();
  const perpetuals = usePerpetuals();
  const lpStakingAccount = useStakingAccount(window.adrena.client.lpTokenMint);
  const lmStakingAccount = useStakingAccount(window.adrena.client.lmTokenMint);
  const adxTotalSupply = useADXTotalSupply();
  const alpTotalSupply = useALPTotalSupply();

  if (
    !mainPool ||
    !custodies ||
    !tokenPrices ||
    !cortex ||
    !adxTotalSupply ||
    !alpTotalSupply ||
    !perpetuals ||
    !lpStakingAccount ||
    !lmStakingAccount
  )
    return <></>;

  // full animation
  // https://lottie.host/37e1ec5d-b487-44e1-b4e9-ac7f51500eee/ydhCjShFMH.lottie
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  console.log('Cortex', cortex);

  return (
    <>
      <DotLottiePlayer
        src="https://lottie.host/f7973135-c929-4978-b0cb-df671f50d021/eGqcR9lFei.lottie"
        autoplay={!isSafari}
        loop={!isSafari}
        className={twMerge(
          isAnimationLoaded ? 'opacity-100' : 'opacity-0',
          'fixed lg:absolute top-[50px] md:top-[-50px] right-0 transition-opacity duration-300 w-[80%] z-0',
        )}
        onEvent={(event: PlayerEvents) => {
          if (event === PlayerEvents.Ready) {
            setIsAnimationLoaded(true);
          }
        }}
      />

      <div className="flex flex-wrap z-10 min-w-40 overflow-auto">
        <AccountsBloc
          className="m-2 grow"
          perpetuals={perpetuals}
          cortex={cortex}
          mainPool={mainPool}
          custodies={custodies}
        />

        <GlobalOverviewBloc
          className="m-2 grow"
          cortex={cortex}
          mainPool={mainPool}
          custodies={custodies}
          adxTotalSupply={adxTotalSupply}
          alpTotalSupply={alpTotalSupply}
        />

        <AssetsUnderManagementBloc
          className="m-2 grow"
          mainPool={mainPool}
          custodies={custodies}
        />

        <VestingBloc className="m-2 grow" cortex={cortex} />

        <BucketsBloc className="m-2 grow" cortex={cortex} />

        <PositionsBloc
          className="m-2 grow"
          mainPool={mainPool}
          custodies={custodies}
        />

        <FeeCustodyBreakdownBloc className="m-2 grow" custodies={custodies} />

        <VolumeCustodyBreakdownBloc
          className="m-2 grow"
          custodies={custodies}
        />
      </div>
    </>
  );
}
