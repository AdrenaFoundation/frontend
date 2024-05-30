import Image from 'next/image';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { SablierThreadExtended } from '@/types';

import warningImg from '../../../../../public/images/Icons/warning.png';
import DateInfo from '../DateInfo';
import InfoAnnotation from '../InfoAnnotation';
import NumberInfo from '../NumberInfo';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../Table';

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
        <StyledSubSubContainer className="items-center justify-center w-full">
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
                    className="ml-auto"
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
                  <div className="ml-auto flex">
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
                  <div className="ml-auto">
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
                  <div className="ml-auto flex">
                    {stakingResolveRoundCron.nextTheoreticalExecutionDate &&
                    stakingResolveRoundCron.nextTheoreticalExecutionDate <
                      Date.now() ? (
                      <Image
                        className="w-auto h-[1.5em] mr-1"
                        src={warningImg}
                        alt="Error icon"
                      />
                    ) : null}

                    {stakingResolveRoundCron.nextTheoreticalExecutionDate ? (
                      <DateInfo
                        timestamp={
                          stakingResolveRoundCron.nextTheoreticalExecutionDate
                        }
                        shorten={false}
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
                  <div className="ml-auto">
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
    </>
  );
}
