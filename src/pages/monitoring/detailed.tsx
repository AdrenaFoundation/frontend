import AccountsView from '@/components/pages/monitoring/AccountsView/AccountsView';
import ADXTokenomicsView from '@/components/pages/monitoring/ADXTokenomicsView/ADXTokenomicsView';
import FeesView from '@/components/pages/monitoring/FeesView/FeesView';
import PoolView from '@/components/pages/monitoring/PoolView/PoolView';
import StakingView from '@/components/pages/monitoring/StakingView/StakingView';
import TradingView from '@/components/pages/monitoring/TradingView/TradingView';
import VestingView from '@/components/pages/monitoring/VestingView/VestingView';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import useCortex from '@/hooks/useCortex';
import useStakingAccount from '@/hooks/useStakingAccount';
import useStakingAccountCurrentRoundRewards from '@/hooks/useStakingAccountCurrentRoundRewards';
import useVestRegistry from '@/hooks/useVestRegistry';
import useVests from '@/hooks/useVests';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function DetailedMonitoring({
  mainPool,
  custodies,
  selectedTab,
}: PageProps & {
  selectedTab: string;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const cortex = useCortex();
  const vestRegistry = useVestRegistry();
  const alpStakingAccount = useStakingAccount(window.adrena.client.lpTokenMint);
  const adxStakingAccount = useStakingAccount(window.adrena.client.lmTokenMint);
  const alpStakingCurrentRoundRewards = useStakingAccountCurrentRoundRewards(
    window.adrena.client.lpTokenMint,
  );
  const adxStakingCurrentRoundRewards = useStakingAccountCurrentRoundRewards(
    window.adrena.client.lmTokenMint,
  );
  const adxTotalSupply = useADXTotalSupply();
  const alpTotalSupply = useALPTotalSupply();
  const vests = useVests();
  const composition = useALPIndexComposition(custodies);

  if (
    !mainPool ||
    !custodies ||
    !tokenPrices ||
    !cortex ||
    !vestRegistry ||
    !adxTotalSupply ||
    !alpTotalSupply ||
    !alpStakingAccount ||
    !adxStakingAccount ||
    !composition ||
    composition.some((c) => c === null)
  )
    return <></>;

  return (
    <>
      <div className="w-full max-w-full overflow-x-auto flex z-10">
        <div className="flex gap-4 pb-4 pt-2 pl-4 pr-4 flex-wrap w-full max-w-[60em] ml-auto mr-auto justify-center">
          {selectedTab === 'All' ? (
            <div className="w-full z-10 text-center">
              <h1 className="text-white">ACCOUNTS</h1>
            </div>
          ) : null}

          {selectedTab === 'ADX tokenomics' || selectedTab === 'All' ? (
            <ADXTokenomicsView
              vestRegistry={vestRegistry}
              cortex={cortex}
              adxTotalSupply={adxTotalSupply}
              adxStakingAccount={adxStakingAccount}
            />
          ) : null}

          {selectedTab === 'All' ? (
            <div className="w-full z-10 text-center">
              <h1 className="text-white">POOL</h1>
            </div>
          ) : null}

          {selectedTab === 'Pool' || selectedTab === 'All' ? (
            <PoolView mainPool={mainPool} custodies={custodies} />
          ) : null}

          {selectedTab === 'All' ? (
            <div className="w-full z-10 text-center">
              <h1 className="text-white">FEES</h1>
            </div>
          ) : null}

          {selectedTab === 'Fees' || selectedTab === 'All' ? (
            <FeesView
              mainPool={mainPool}
              custodies={custodies}
              alpStakingCurrentRoundRewards={alpStakingCurrentRoundRewards}
              adxStakingCurrentRoundRewards={adxStakingCurrentRoundRewards}
            />
          ) : null}

          {selectedTab === 'All' ? (
            <div className="w-full z-10 text-center">
              <h1 className="text-white">STAKING</h1>
            </div>
          ) : null}

          {selectedTab === 'Staking' || selectedTab === 'All' ? (
            <StakingView
              alpStakingAccount={alpStakingAccount}
              adxStakingAccount={adxStakingAccount}
              alpStakingCurrentRoundRewards={alpStakingCurrentRoundRewards}
              adxStakingCurrentRoundRewards={adxStakingCurrentRoundRewards}
            />
          ) : null}

          {selectedTab === 'All' ? (
            <div className="w-full z-10 text-center">
              <h1 className="text-white">TRADING</h1>
            </div>
          ) : null}

          {selectedTab === 'Trading' || selectedTab === 'All' ? (
            <TradingView mainPool={mainPool} custodies={custodies} />
          ) : null}

          {selectedTab === 'All' ? (
            <div className="w-full z-10 text-center">
              <h1 className="text-white">VESTING</h1>
            </div>
          ) : null}

          {selectedTab === 'Vesting' || selectedTab === 'All' ? (
            <VestingView vestRegistry={vestRegistry} vests={vests} />
          ) : null}

          {selectedTab === 'All' ? (
            <div className="w-full z-10 text-center">
              <h1 className="text-white">ADX TOKENOMICS</h1>
            </div>
          ) : null}

          {selectedTab === 'Accounts' || selectedTab === 'All' ? (
            <AccountsView
              cortex={cortex}
              mainPool={mainPool}
              custodies={custodies}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
