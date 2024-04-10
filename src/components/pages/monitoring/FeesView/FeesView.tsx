import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { USD_DECIMALS } from '@/constant';
import {
  Cortex,
  CustodyExtended,
  Perpetuals,
  PoolExtended,
  Staking,
} from '@/types';
import { formatPriceInfo, nativeToUi } from '@/utils';

import abbreviateWords from '../abbreviateWords';
import InfoAnnotation from '../InfoAnnotation';
import NumberInfo from '../NumberInfo';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../Table';
import TitleAnnotation from '../TitleAnnotation';

export default function FeesView({
  className,
  perpetuals,
  cortex,
  mainPool,
  custodies,
  alpStakingAccount,
  adxStakingAccount,
  alpStakingCurrentRoundRewards,
  adxStakingCurrentRoundRewards,
}: {
  className?: string;
  perpetuals: Perpetuals;
  cortex: Cortex;
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
  alpStakingAccount: Staking;
  adxStakingAccount: Staking;
  alpStakingCurrentRoundRewards: number | null;
  adxStakingCurrentRoundRewards: number | null;
}) {
  const attributes = Object.keys(custodies[0].nativeObject.collectedFees);

  return (
    <div
      className={twMerge(
        'flex flex-wrap gap-4 justify-center max-w-[60em] ml-auto mr-auto',
        className,
      )}
    >
      <StyledContainer
        headerClassName="text-center justify-center"
        title="ALL TIME FEES"
        className="min-w-[24em] w-[24em] grow"
      >
        <StyledSubSubContainer className="mt-2 justify-center">
          <h1>{formatPriceInfo(mainPool.totalFeeCollected)}</h1>
        </StyledSubSubContainer>
      </StyledContainer>

      <StyledContainer
        headerClassName="text-center justify-center"
        title="CURRENT STAKING ROUND FEES"
        subTitle="Accumulating fees to be redistributed to stakers at the end of the current staking round."
        className="min-w-[30em] w-[30em] grow"
      >
        <StyledSubSubContainer className="mt-2 justify-center">
          <h1>
            {alpStakingCurrentRoundRewards !== null &&
            adxStakingCurrentRoundRewards !== null
              ? formatPriceInfo(
                  alpStakingCurrentRoundRewards + adxStakingCurrentRoundRewards,
                )
              : '-'}
          </h1>
        </StyledSubSubContainer>
      </StyledContainer>

      <StyledContainer
        title="All time Fees Breakdown"
        subTitle="Fees per custody per action."
        className="min-w-[45em] w-[45em] grow"
      >
        <Table
          rowTitleWidth="90px"
          columnsTitles={attributes.map(abbreviateWords)}
          data={[
            ...custodies.map((custody) => ({
              rowTitle: custody.tokenInfo.name,
              values: attributes.map((attribute) => (
                <NumberInfo
                  key={attribute}
                  value={nativeToUi(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (custody.nativeObject.collectedFees as any)[attribute],
                    USD_DECIMALS,
                  )}
                />
              )),
            })),

            {
              rowTitle: <div className="font-semibold">Total</div>,
              values: attributes.map((param, i) => (
                <NumberInfo
                  key={i}
                  value={custodies.reduce(
                    (total, custody) =>
                      total +
                      nativeToUi(
                        // Force typing as we know the keys are matching the collectedFees field
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (custody.nativeObject.collectedFees as any)[param],
                        USD_DECIMALS,
                      ),
                    0,
                  )}
                />
              )),
            },
          ]}
        />
      </StyledContainer>
    </div>
  );
}
