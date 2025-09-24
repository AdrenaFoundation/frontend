import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Menu from '@/components/common/Menu/Menu';
import MenuItem from '@/components/common/Menu/MenuItem';
import MenuItems from '@/components/common/Menu/MenuItems';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import AdrenaAccounts from '@/components/pages/monitoring/Data/AdrenaAccounts';
import AllTimeFeesBreakdownPerToken from '@/components/pages/monitoring/Data/AllTimeFeesBreakdownPerToken';
import AUM from '@/components/pages/monitoring/Data/AUM';
import AUMBreakdown from '@/components/pages/monitoring/Data/AUMBreakdown';
import CurrentStakingRoundTime from '@/components/pages/monitoring/Data/CurrentStakingRoundTime';
import GovernanceAccounts from '@/components/pages/monitoring/Data/GovernanceAccounts';
import MintAccounts from '@/components/pages/monitoring/Data/MintsAccounts';
import OracleAccounts from '@/components/pages/monitoring/Data/OracleAccounts';
import PoolRatios from '@/components/pages/monitoring/Data/PoolRatios';
import PositionsAllTime from '@/components/pages/monitoring/Data/PositionsAllTime';
import PositionsNow from '@/components/pages/monitoring/Data/PositionsNow';
import PositionsNowBreakdown from '@/components/pages/monitoring/Data/PositionsNowBreakdown';
import StakingLockedTokens from '@/components/pages/monitoring/Data/StakingLockedTokens';
import StakingRewardsWaitingToBeClaimed from '@/components/pages/monitoring/Data/StakingRewardsWaitingToBeClaimed';
import StakingRewardVaults from '@/components/pages/monitoring/Data/StakingRewardVaults';
import VolumeBreakdownPerToken from '@/components/pages/monitoring/Data/VolumeBreakdownPerToken';
import useCortex from '@/hooks/useCortex';
import { PoolInfo } from '@/hooks/usePoolInfo';
import useStakingAccount from '@/hooks/useStakingAccount';
import useStakingAccountRewardsAccumulated from '@/hooks/useStakingAccountRewardsAccumulated';
import { PageProps } from '@/types';
import { nativeToUi } from '@/utils';

import arrowDownIcon from '../../../public/images/Icons/arrow-down.svg';

// Display all sorts of interesting data used to make sure everything works as intended
// Created this page here so anyone can follow - open source maxi
export default function DetailedMonitoring({
  mainPool,
  custodies,
  poolInfo,
  connected,
  view,
}: PageProps & {
  poolInfo: PoolInfo | null;
  view: string;
}) {
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>('All');

  const cortex = useCortex();

  const {
    stakingAccount: alpStakingAccount,
    triggerReload: triggerAlpStakingAccountReload,
  } = useStakingAccount(window.adrena.client.lpTokenMint);
  const {
    stakingAccount: adxStakingAccount,
    triggerReload: triggerAdxStakingAccountReload,
  } = useStakingAccount(window.adrena.client.lmTokenMint);

  const alpStakingRewardsAccumulated = useStakingAccountRewardsAccumulated(
    window.adrena.client.lpTokenMint,
  );
  const adxStakingRewardsAccumulated = useStakingAccountRewardsAccumulated(
    window.adrena.client.lmTokenMint,
  );

  //
  // I know the following is not the best naming convention, but it allow tweaking the styles easily
  //
  const titleClassName = 'text-lg opacity-50 font-boldy';

  const handleTabChange = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
  };

  const tabs = [
    'All',
    'Pool',
    'Fees',
    'Staking',
    'Trading',
    'Accounts',
  ] as const;

  const tabsFormatted = tabs.map((x) => ({
    title: x,
    activeColor: 'border-white',
  }));

  return (
    <div className="border bg-secondary rounded-md overflow-hidden">
      <TabSelect
        wrapperClassName="hidden md:flex gap-6 border-b p-3 pb-0 select-none mb-3"
        titleClassName="whitespace-nowrap text-sm"
        selected={selectedTab}
        initialSelectedIndex={tabsFormatted.findIndex(
          (tab) => tab.title === selectedTab,
        )}
        tabs={tabsFormatted}
        onClick={(tab) => {
          handleTabChange(tab);
        }}
      />

      <Menu
        trigger={
          <div className="flex flex-row justify-between bg-secondary border w-full p-3 rounded-md cursor-pointer text-lg font-boldy select-none">
            {selectedTab}

            <Image
              src={arrowDownIcon}
              height={12}
              width={12}
              alt="arrow down"
            />
          </div>
        }
        className="block md:hidden mx-5 mt-5"
        openMenuClassName="w-full bg-secondary shadow-lg"
      >
        <MenuItems className="">
          {tabs.map((tab) => (
            <MenuItem
              key={tab}
              onClick={() => handleTabChange(tab)}
              selected={selectedTab === tab}
              className="p-2 text-lg"
            >
              {tab}
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>

      <div className="flex flex-col gap-3 p-5 pt-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={twMerge(
              'gap-3',
              selectedTab === 'All'
                ? 'grid sm:grid-cols-2 lg:grid-cols-4'
                : 'flex flex-row',
            )}
          >
            {selectedTab === 'All' || selectedTab === 'Pool' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <AUM connected={connected} />
              </motion.div>
            ) : null}

            {selectedTab === 'All' || selectedTab === 'Staking' ? (
              <AnimatePresence mode="wait">
                {adxStakingAccount ? (
                  <motion.div
                    key="adx-staking-data"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <NumberDisplay
                      title="LOCKED STAKED ADX"
                      nb={nativeToUi(
                        adxStakingAccount.nbLockedTokens,
                        adxStakingAccount.stakedTokenDecimals,
                      )}
                      precision={0}
                      suffix=" ADX"
                      className="bg-[#050D14]"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="adx-staking-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#050D14] h-[5.4375rem] animate-loader rounded-md"
                  />
                )}
              </AnimatePresence>
            ) : null}

            {selectedTab === 'All' || selectedTab === 'Fees' ? (
              <AnimatePresence mode="wait">
                {mainPool ? (
                  <motion.div
                    key="fees-data"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <NumberDisplay
                      title="ALL TIME FEES"
                      nb={mainPool.totalFeeCollected}
                      format="currency"
                      precision={0}
                      className="bg-[#050D14]"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="fees-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#050D14] h-[5.4375rem] animate-loader rounded-md"
                  />
                )}
              </AnimatePresence>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {selectedTab === 'All' ||
          (selectedTab === 'Trading' && view === 'full') ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col lg:flex-row gap-3"
          >
            <AnimatePresence mode="wait">
              {mainPool ? (
                <motion.div
                  key="positions-now-data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1"
                >
                  <PositionsNow
                    titleClassName={titleClassName}
                    mainPool={mainPool}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="positions-now-loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#050D14] h-32 animate-loader rounded-md flex-1"
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {mainPool ? (
                <motion.div
                  key="positions-alltime-data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex-1"
                >
                  <PositionsAllTime
                    titleClassName={titleClassName}
                    mainPool={mainPool}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="positions-alltime-loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#050D14] h-32 animate-loader rounded-md flex-1"
                />
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}

        {selectedTab === 'All' ||
          (selectedTab === 'Staking' && view === 'full') ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col gap-3"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col lg:flex-row gap-3"
            >
              <AnimatePresence mode="wait">
                {alpStakingAccount && adxStakingAccount ? (
                  <motion.div
                    key="staking-rewards-data"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                  >
                    <StakingRewardVaults
                      titleClassName={titleClassName}
                      alpStakingAccount={alpStakingAccount}
                      adxStakingAccount={adxStakingAccount}
                      alpStakingRewardsAccumulated={
                        alpStakingRewardsAccumulated
                      }
                      adxStakingRewardsAccumulated={
                        adxStakingRewardsAccumulated
                      }
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="staking-rewards-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#050D14] h-[9.161875rem] animate-loader rounded-md flex-1"
                  />
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {adxStakingAccount ? (
                  <motion.div
                    key="staking-waiting-data"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex-1"
                  >
                    <StakingRewardsWaitingToBeClaimed
                      titleClassName={titleClassName}
                      adxStakingAccount={adxStakingAccount}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="staking-waiting-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#050D14] h-[9.161875rem] animate-loader rounded-md flex-1"
                  />
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col lg:flex-row gap-3"
            >
              <AnimatePresence mode="wait">
                {alpStakingAccount && adxStakingAccount ? (
                  <motion.div
                    key="staking-round-data"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                  >
                    <CurrentStakingRoundTime
                      titleClassName={titleClassName}
                      alpStakingAccount={alpStakingAccount}
                      adxStakingAccount={adxStakingAccount}
                      triggerAlpStakingAccountReload={
                        triggerAlpStakingAccountReload
                      }
                      triggerAdxStakingAccountReload={
                        triggerAdxStakingAccountReload
                      }
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="staking-round-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#050D14] h-[9.161875rem] animate-loader rounded-md flex-1"
                  />
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {alpStakingAccount && adxStakingAccount ? (
                  <motion.div
                    key="staking-locked-data"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex-1"
                  >
                    <StakingLockedTokens
                      titleClassName={titleClassName}
                      alpStakingAccount={alpStakingAccount}
                      adxStakingAccount={adxStakingAccount}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="staking-locked-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#050D14] h-[9.161875rem] animate-loader rounded-md flex-1"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : null}

        {selectedTab === 'All' ||
          (selectedTab === 'Trading' && view === 'full') ? (
          <AnimatePresence mode="wait">
            {custodies ? (
              <motion.div
                key="positions-breakdown-data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <PositionsNowBreakdown
                  titleClassName={titleClassName}
                  custodies={custodies}
                />
              </motion.div>
            ) : (
              <motion.div
                key="positions-breakdown-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#050D14] h-32 animate-loader rounded-md"
              />
            )}
          </AnimatePresence>
        ) : null}

        {selectedTab === 'All' ||
          (selectedTab === 'Pool' && view === 'full') ? (
          <AnimatePresence mode="wait">
            {custodies ? (
              <motion.div
                key="volume-breakdown-data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <VolumeBreakdownPerToken
                  titleClassName={titleClassName}
                  custodies={custodies}
                />
              </motion.div>
            ) : (
              <motion.div
                key="volume-breakdown-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#050D14] h-32 animate-loader rounded-md"
              />
            )}
          </AnimatePresence>
        ) : null}

        {selectedTab === 'All' || selectedTab === 'Fees' ? (
          <AnimatePresence mode="wait">
            {custodies ? (
              <motion.div
                key="fees-breakdown-data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <AllTimeFeesBreakdownPerToken
                  titleClassName={titleClassName}
                  custodies={custodies}
                />
              </motion.div>
            ) : (
              <motion.div
                key="fees-breakdown-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#050D14] h-32 animate-loader rounded-md"
              />
            )}
          </AnimatePresence>
        ) : null}

        {selectedTab === 'All' ||
          (selectedTab === 'Pool' && view === 'full') ? (
          <AnimatePresence mode="wait">
            {custodies ? (
              <motion.div
                key="aum-breakdown-data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <AUMBreakdown
                  titleClassName={titleClassName}
                  custodies={custodies}
                />
              </motion.div>
            ) : (
              <motion.div
                key="aum-breakdown-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#050D14] h-32 animate-loader rounded-md"
              />
            )}
          </AnimatePresence>
        ) : null}

        {selectedTab === 'All' ||
          (selectedTab === 'Pool' && view === 'full') ? (
          <AnimatePresence mode="wait">
            {poolInfo ? (
              <motion.div
                key="pool-ratios-data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <PoolRatios
                  titleClassName={titleClassName}
                  poolInfo={poolInfo}
                />
              </motion.div>
            ) : (
              <motion.div
                key="pool-ratios-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#050D14] h-32 animate-loader rounded-md"
              />
            )}
          </AnimatePresence>
        ) : null}

        {selectedTab === 'All' ||
          (selectedTab === 'Accounts' && view === 'full') ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="space-y-3"
          >
            <AnimatePresence mode="wait">
              {cortex && mainPool && custodies ? (
                <motion.div
                  key="adrena-accounts-data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AdrenaAccounts
                    titleClassName={titleClassName}
                    cortex={cortex}
                    mainPool={mainPool}
                    custodies={custodies}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="adrena-accounts-loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#050D14] h-32 animate-loader rounded-md"
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {custodies ? (
                <motion.div
                  key="oracle-accounts-data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <OracleAccounts
                    titleClassName={titleClassName}
                    custodies={custodies}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="oracle-accounts-loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#050D14] h-32 animate-loader rounded-md"
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {custodies ? (
                <motion.div
                  key="mint-accounts-data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <MintAccounts
                    titleClassName={titleClassName}
                    custodies={custodies}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="mint-accounts-loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#050D14] h-32 animate-loader rounded-md"
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {cortex ? (
                <motion.div
                  key="governance-accounts-data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <GovernanceAccounts
                    titleClassName={titleClassName}
                    cortex={cortex}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="governance-accounts-loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#050D14] h-32 animate-loader rounded-md"
                />
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
