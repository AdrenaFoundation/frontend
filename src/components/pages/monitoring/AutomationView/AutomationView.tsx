import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { SablierThreadExtended } from '@/types';

import warningImg from '../../../../../public/images/Icons/warning.png';
import DateInfo from '../DateInfo';
import InfoAnnotation from '../InfoAnnotation';
import NumberInfo from '../NumberInfo';
import OnchainAccountInfo from '../OnchainAccountInfo';
import RemainingTimeToDate from '../RemainingTimeToDate';
import Table from '../Table';
import FinalizeLockedStakedThreads from './FinalizeLockedStakedThreads';

export default function AutomationView({
  sablierStakingResolveStakingRoundCronThreads: {
    lmStakingResolveRoundCron,
    lpStakingResolveRoundCron,
  },
}: {
  sablierStakingResolveStakingRoundCronThreads: {
    lmStakingResolveRoundCron: SablierThreadExtended;
    lpStakingResolveRoundCron: SablierThreadExtended;
  };
}) {
  const [loadFinalizeLockedStakedThreads, setLoadFinalizeLockedStakedThreads] =
    useState<boolean>(false);

  const isBreakpoint = useBetterMediaQuery('(min-width: 800px)');

  const stakingResolveRoundCron = (
    title: string,
    stakingResolveRoundCron: SablierThreadExtended,
  ) => {
    return (
      <StyledContainer
        titleClassName="flex"
        title={
          <>
            {title}

            <InfoAnnotation
              text="This is a cron configured on Sablier protocol which is is responsible for resolving staking rounds automatically, so users can get theirs staking rewards."
              className="mr-1 w-4 h-4"
            />
          </>
        }
        className="w-full"
      >
        <StyledSubSubContainer
          className={twMerge(
            'items-center justify-center w-full',
            !isBreakpoint && 'bg-transparent',
          )}
        >
          <Table
            rowTitleWidth="30%"
            data={[
              {
                rowTitle: (
                  <div className="flex items-center">
                    Onchain thread account
                    <InfoAnnotation
                      text="Onchain account of the sablier thread responsible of resolving staking rounds automatically."
                      className="mr-1"
                    />
                  </div>
                ),
                value: (
                  <OnchainAccountInfo
                    className="md:ml-auto"
                    address={stakingResolveRoundCron.pubkey}
                  />
                ),
              },
              {
                rowTitle: (
                  <div className="flex items-center">
                    Funding
                    <InfoAnnotation
                      text="The funding available to pay for cron execution fees. If too low, cron will not be able to execute. Monitor this value and top up if needed."
                      className="mr-1"
                    />
                  </div>
                ),
                value: (
                  <div className="md:ml-auto flex">
                    {stakingResolveRoundCron.funding !== null &&
                    stakingResolveRoundCron.funding < 1 ? (
                      <Image
                        className="w-auto h-[1.5em] mr-1"
                        src={warningImg}
                        alt="Error icon"
                      />
                    ) : null}

                    <NumberInfo
                      denomination="SOL"
                      value={stakingResolveRoundCron.funding}
                    />
                  </div>
                ),
              },
              {
                rowTitle: (
                  <div className="flex items-center">
                    Last call
                    <InfoAnnotation
                      text="Last time the cron job has been executed."
                      className="mr-1"
                    />
                  </div>
                ),
                value: (
                  <div className="md:ml-auto">
                    {stakingResolveRoundCron.lastExecutionDate ? (
                      <DateInfo
                        timestamp={stakingResolveRoundCron.lastExecutionDate}
                        shorten={false}
                      />
                    ) : (
                      'Never'
                    )}
                  </div>
                ),
              },
              {
                rowTitle: (
                  <div className="flex items-center">
                    Next call
                    <InfoAnnotation
                      text="Next time the cron should be triggered. If it is in the past, it means the cron is not working properly."
                      className="mr-1"
                    />
                  </div>
                ),
                value: (
                  <div className="md:ml-auto flex">
                    {stakingResolveRoundCron.nextTheoreticalExecutionDate ? (
                      <RemainingTimeToDate
                        timestamp={
                          stakingResolveRoundCron.nextTheoreticalExecutionDate
                        }
                        tippyText="The call is overdue, please check the thread."
                      />
                    ) : (
                      'Cannot be calculated'
                    )}
                  </div>
                ),
              },
              {
                rowTitle: (
                  <div className="flex items-center">
                    Paused
                    <InfoAnnotation
                      text="Is the thread paused? It should not be paused to work properly."
                      className="mr-1"
                    />
                  </div>
                ),
                value: (
                  <div className="md:ml-auto">
                    {stakingResolveRoundCron.nativeObject.paused ? (
                      <div className="flex">
                        <Image
                          className="w-auto h-[1.5em] mr-1"
                          src={warningImg}
                          alt="Error icon"
                        />
                        <span>Yes</span>
                      </div>
                    ) : (
                      'No'
                    )}
                  </div>
                ),
              },
            ]}
          />
        </StyledSubSubContainer>
      </StyledContainer>
    );
  };

  return (
    <>
      {stakingResolveRoundCron(
        'ADX Staking Resolve Round Thread',
        lmStakingResolveRoundCron,
      )}

      {stakingResolveRoundCron(
        'ALP Staking Resolve Round Thread',
        lpStakingResolveRoundCron,
      )}

      <StyledContainer
        titleClassName="flex"
        title={
          <>
            FINALIZE LOCKED STAKE THREADS
            <InfoAnnotation
              text="Theses are crons which are responsible for wrapping up user locked staked. Example an user stake ADX for 6 months, at the end of the staking period, this cron triggers and wrap things up."
              className="mr-1 w-4 h-4"
            />
          </>
        }
        className="w-full relative"
      >
        <div
          className={twMerge(
            'flex w-full items-center justify-center',
            !loadFinalizeLockedStakedThreads && 'pt-8 pb-8',
          )}
        >
          {!loadFinalizeLockedStakedThreads ? (
            <>
              <Button
                title="Load"
                className="w-80"
                onClick={() => {
                  setLoadFinalizeLockedStakedThreads(true);
                }}
              />

              <InfoAnnotation
                text="As there are many crons, it requires a manual action to load them."
                className="mr-1 w-4 h-4"
              />
            </>
          ) : (
            <FinalizeLockedStakedThreads />
          )}
        </div>
      </StyledContainer>
    </>
  );
}
