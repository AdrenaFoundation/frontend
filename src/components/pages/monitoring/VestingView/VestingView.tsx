import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { VEST_BUCKETS } from '@/constant';
import { VestExtended, VestRegistry } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';

import abbreviateWords from '../abbreviateWords';
import DateInfo from '../DateInfo';
import NumberInfo from '../NumberInfo';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../Table';

export default function VestingView({
  vestRegistry,
  vests,
}: {
  vestRegistry: VestRegistry;
  vests: VestExtended[] | null;
}) {
  return (
    <>
      <StyledContainer
        headerClassName="text-center justify-center"
        title="VESTED TOKENS"
        className="min-w-[20em] w-[20em] grow"
      >
        <StyledSubSubContainer className="mt-2 justify-center items-center">
          <h2>
            {formatNumber(
              nativeToUi(
                vestRegistry.vestedTokenAmount,
                window.adrena.client.adxToken.decimals,
              ),
              2,
            )}
          </h2>
          <h2 className="ml-1">ADX</h2>
        </StyledSubSubContainer>
      </StyledContainer>

      <StyledContainer
        headerClassName="text-center justify-center"
        title="VESTS COUNT"
        className="min-w-[20em] w-[20em] grow"
      >
        <StyledSubSubContainer className="mt-2 justify-center items-center">
          <h2>{formatNumber(vestRegistry.vests.length, 2)}</h2>
        </StyledSubSubContainer>
      </StyledContainer>

      {vests?.length ? (
        <StyledContainer title="VESTS BREAKDOWN" className="w-full">
          <Table
            rowTitleWidth="0px"
            columnsTitles={[
              'vest',
              'amount',
              'bucket',
              'start',
              'end',
              'claimed',
              'owner',
            ]}
            data={vests.map((vest, i) => ({
              rowTitle: ``,
              values: [
                <OnchainAccountInfo
                  key={`vest${i}-id`}
                  address={vest.pubkey}
                  shorten={true}
                />,

                <NumberInfo
                  key={`vest${i}-amount`}
                  value={nativeToUi(
                    vest.amount,
                    window.adrena.client.adxToken.decimals,
                  )}
                  precision={window.adrena.client.adxToken.decimals}
                  denomination="ADX"
                />,

                <div key={`vest${i}-bucket`} className="text-md">
                  {abbreviateWords(
                    VEST_BUCKETS[vest.originBucket] ?? 'Unknown',
                  ).toUpperCase()}
                </div>,

                <DateInfo
                  key={`vest${i}-unlock-start`}
                  timestamp={vest.unlockStartTimestamp}
                  shorten={true}
                />,

                <DateInfo
                  key={`vest${i}-unlock-end`}
                  timestamp={vest.unlockEndTimestamp}
                  shorten={true}
                />,

                <NumberInfo
                  key={`vest${i}-claimed-amount`}
                  value={nativeToUi(
                    vest.claimedAmount,
                    window.adrena.client.adxToken.decimals,
                  )}
                  precision={window.adrena.client.adxToken.decimals}
                  denomination="ADX"
                />,

                <OnchainAccountInfo
                  key={`vest${i}-owner`}
                  address={vest.owner}
                  shorten={true}
                />,
              ],
            }))}
          />
        </StyledContainer>
      ) : null}
    </>
  );
}
