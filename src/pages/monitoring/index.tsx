import { Alignment, Fit, Layout } from '@rive-app/react-canvas';

import AccountsBloc from '@/components/pages/monitoring/Blocs/AccountsBloc';
import AssetsUnderManagementBloc from '@/components/pages/monitoring/Blocs/AssetsUnderManagementBloc';
import BucketsBloc from '@/components/pages/monitoring/Blocs/BucketsBloc';
import FeeCustodyBreakdownBloc from '@/components/pages/monitoring/Blocs/FeeCustodyBreakdownBloc';
import GlobalOverviewBloc from '@/components/pages/monitoring/Blocs/GlobalOverviewBloc';
import PoolBloc from '@/components/pages/monitoring/Blocs/PoolBloc';
import PositionsBloc from '@/components/pages/monitoring/Blocs/PositionsBloc';
import StakingBloc from '@/components/pages/monitoring/Blocs/StakingBloc';
import VestingBloc from '@/components/pages/monitoring/Blocs/VestingBloc';
import VolumeCustodyBreakdownBloc from '@/components/pages/monitoring/Blocs/VolumeCustodyBreakdownBloc';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import useCortex from '@/hooks/useCortex';
import usePerpetuals from '@/hooks/usePerpetuals';
import useStakingAccount from '@/hooks/useStakingAccount';
import useVests from '@/hooks/useVests';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function Monitoring({ mainPool, custodies }: PageProps) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const cortex = useCortex();
  const perpetuals = usePerpetuals();
  const alpStakingAccount = useStakingAccount(window.adrena.client.lpTokenMint);
  const adxStakingAccount = useStakingAccount(window.adrena.client.lmTokenMint);
  const adxTotalSupply = useADXTotalSupply();
  const alpTotalSupply = useALPTotalSupply();
  const vests = useVests();
  const composition = useALPIndexComposition(custodies);

  if (
    !mainPool ||
    !custodies ||
    !tokenPrices ||
    !cortex ||
    !adxTotalSupply ||
    !alpTotalSupply ||
    !perpetuals ||
    !alpStakingAccount ||
    !adxStakingAccount ||
    !composition ||
    composition.some((c) => c === null)
  )
    return <></>;

  console.log('Cortex', cortex);

  return (
    <>
      <RiveAnimation
        animation="mid-monster"
        layout={new Layout({ fit: Fit.Contain, alignment: Alignment.TopRight })}
        className={
          'fixed lg:absolute top-[50px] md:top-[-50px] right-0 w-full h-full'
        }
      />

      <div className="flex flex-wrap z-10 min-w-40 gap-4 overflow-auto p-4 justify-center">
        <AccountsBloc
          className="min-w-[25em] max-w-[40em]"
          perpetuals={perpetuals}
          cortex={cortex}
          mainPool={mainPool}
          custodies={custodies}
        />

        <GlobalOverviewBloc
          className="min-w-[25em] max-w-[40em]"
          cortex={cortex}
          mainPool={mainPool}
          custodies={custodies}
          adxTotalSupply={adxTotalSupply}
          alpTotalSupply={alpTotalSupply}
        />

        <StakingBloc
          className="min-w-[25em] max-w-[40em]"
          stakedTokenName={'ADX'}
          stakedTokenDecimals={window.adrena.client.adxToken.decimals}
          staking={adxStakingAccount}
        />

        <StakingBloc
          className="min-w-[25em] max-w-[40em]"
          stakedTokenName={'ALP'}
          stakedTokenDecimals={window.adrena.client.alpToken.decimals}
          staking={alpStakingAccount}
        />

        <AssetsUnderManagementBloc
          className="min-w-[25em] max-w-[40em]"
          mainPool={mainPool}
          custodies={custodies}
        />

        <PositionsBloc
          className="min-w-[30em] max-w-[40em]"
          mainPool={mainPool}
          custodies={custodies}
        />

        <VestingBloc
          className="min-w-[40em] max-w-[80em]"
          cortex={cortex}
          vests={vests}
        />

        <PoolBloc
          className="min-w-[40em] max-w-[80em]"
          mainPool={mainPool}
          custodies={custodies}
          alpComposition={composition}
        />

        <BucketsBloc className="min-w-[40em] max-w-[80em]" cortex={cortex} />

        <FeeCustodyBreakdownBloc
          className="min-w-[40em] max-w-[80em]"
          custodies={custodies}
        />

        <VolumeCustodyBreakdownBloc
          className="min-w-[40em] max-w-[80em]"
          custodies={custodies}
        />
      </div>
    </>
  );
}
