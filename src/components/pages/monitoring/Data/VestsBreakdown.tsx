import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { VEST_BUCKETS } from '@/constant';
import { VestExtended } from '@/types';
import { nativeToUi } from '@/utils';

import abbreviateWords from '../abbreviateWords';
import DateInfo from '../DateInfo';
import NumberInfo from '../NumberInfo';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../Table';

export default function VestsBreakdown({
  vests,
  titleClassName,
}: {
  vests: VestExtended[] | null;
  titleClassName?: string;
}) {
  return vests?.length ? (
    <StyledContainer
      title="VESTS BREAKDOWN"
      className="w-full grow"
      titleClassName={titleClassName}
    >
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
              precision={0}
              denomination="ADX"
            />,

            <OnchainAccountInfo
              key={`vest${i}-owner`}
              address={vest.owner}
              shorten={true}
            />,
          ],
        }))}
        pagination={true}
      />
    </StyledContainer>
  ) : null;
}
