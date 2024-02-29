import { Alignment, Fit, Layout } from '@rive-app/react-canvas';

import AccountsBloc from '@/components/pages/backoffice/Blocs/AccountsBloc';
import AssetsUnderManagementBloc from '@/components/pages/backoffice/Blocs/AssetsUnderManagementBloc';
import BucketsBloc from '@/components/pages/backoffice/Blocs/BucketsBloc';
import FeeCustodyBreakdownBloc from '@/components/pages/backoffice/Blocs/FeeCustodyBreakdownBloc';
import GlobalOverviewBloc from '@/components/pages/backoffice/Blocs/GlobalOverviewBloc';
import PoolBloc from '@/components/pages/backoffice/Blocs/PoolBloc';
import PositionsBloc from '@/components/pages/backoffice/Blocs/PositionsBloc';
import StakingBloc from '@/components/pages/backoffice/Blocs/StakingBloc';
import VestingBloc from '@/components/pages/backoffice/Blocs/VestingBloc';
import VolumeCustodyBreakdownBloc from '@/components/pages/backoffice/Blocs/VolumeCustodyBreakdownBloc';
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
export default function Backoffice({ mainPool, custodies }: PageProps) {
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

        <StakingBloc
          className="m-2 grow"
          stakedTokenName={'ADX'}
          stakedTokenDecimals={window.adrena.client.adxToken.decimals}
          staking={adxStakingAccount}
        />

        <StakingBloc
          className="m-2 grow"
          stakedTokenName={'ALP'}
          stakedTokenDecimals={window.adrena.client.alpToken.decimals}
          staking={alpStakingAccount}
        />

        <AssetsUnderManagementBloc
          className="m-2 grow"
          mainPool={mainPool}
          custodies={custodies}
        />

        <VestingBloc className="m-2 grow" cortex={cortex} vests={vests} />

        <PoolBloc
          className="m-2 grow"
          mainPool={mainPool}
          custodies={custodies}
          alpComposition={composition}
        />

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
