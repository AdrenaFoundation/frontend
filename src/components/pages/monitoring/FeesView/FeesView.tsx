import Image from 'next/image';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { USD_DECIMALS } from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { CustodyExtended, PoolExtended } from '@/types';
import { formatPriceInfo, nativeToUi } from '@/utils';

import abbreviateWords from '../abbreviateWords';
import NumberInfo from '../NumberInfo';
import Table from '../Table';

export default function FeesView({
  mainPool,
  custodies,
  alpStakingCurrentRoundRewards,
  adxStakingCurrentRoundRewards,
}: {
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
  alpStakingCurrentRoundRewards: number | null;
  adxStakingCurrentRoundRewards: number | null;
}) {
  const attributes = Object.keys(custodies[0].nativeObject.collectedFees);
  const isBigScreen = useBetterMediaQuery('(min-width: 800px)');

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <StyledContainer
          headerClassName="text-center justify-center"
          title="ALL TIME FEES"
        >
          <StyledSubSubContainer className="mt-2 justify-center">
            <h2>{formatPriceInfo(mainPool.totalFeeCollected)}</h2>
          </StyledSubSubContainer>
        </StyledContainer>

        <StyledContainer
          headerClassName="text-center justify-center"
          title="CURRENT STAKING ROUND FEES"
          subTitle="Accumulating fees to be redistributed to stakers at the end of the current staking round."
        >
          <StyledSubSubContainer className="mt-2 justify-center">
            <h2>
              {alpStakingCurrentRoundRewards !== null &&
              adxStakingCurrentRoundRewards !== null
                ? formatPriceInfo(
                    alpStakingCurrentRoundRewards +
                      adxStakingCurrentRoundRewards,
                  )
                : '-'}
            </h2>
          </StyledSubSubContainer>
        </StyledContainer>
      </div>
      <StyledContainer
        title="All time Fees Breakdown"
        subTitle="Fees per custody per action."
        className="w-full grow"
      >
        <Table
          isBreakpoint={isBigScreen}
          rowTitleWidth="90px"
          columnsTitles={attributes.map(abbreviateWords)}
          data={[
            ...custodies.map((custody) => ({
              rowTitle: (
                <div className="flex items-center">
                  <Image
                    src={custody.tokenInfo.image}
                    alt="token icon"
                    width="16"
                    height="16"
                  />
                  <span className="ml-1 text-base">
                    {custody.tokenInfo.name}
                  </span>
                </div>
              ),

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
    </>
  );
}
