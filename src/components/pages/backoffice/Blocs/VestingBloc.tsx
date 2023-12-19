import { twMerge } from 'tailwind-merge';

import { Cortex, VestExtended } from '@/types';
import { nativeToUi } from '@/utils';

import abbreviateWords from '../abbreviateWords';
import Bloc from '../Bloc/Bloc';
import DateInfo from '../Table/formatting/DateInfo';
import NumberInfo from '../Table/formatting/NumberInfo';
import OnchainAccountInfo from '../Table/formatting/OnchainAccountInfo';
import Table from '../Table/Table';
import TitleAnnotation from '../TitleAnnotation/TitleAnnotation';

export default function VestingBloc({
  className,
  cortex,
  vests,
}: {
  className?: string;
  cortex: Cortex;
  vests: VestExtended[] | null;
}) {
  return (
    <Bloc title="Vesting" className={twMerge('min-w-[44em]', className)}>
      <Table
        rowTitleWidth="15em"
        data={[
          {
            rowTitle: (
              <div>
                Total Vested
                <TitleAnnotation text="Unrealized" />
              </div>
            ),
            value: (
              <NumberInfo
                value={nativeToUi(
                  cortex.vestedTokenAmount,
                  window.adrena.client.adxToken.decimals,
                )}
                precision={window.adrena.client.adxToken.decimals}
                denomination="ADX"
              />
            ),
          },

          {
            rowTitle: 'Number of Vest',
            value: (
              <NumberInfo
                value={cortex.vests.length}
                precision={0}
                denomination=""
              />
            ),
          },
        ]}
      />

      {vests?.length ? (
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
                  Object.keys(vest.originBucket)[0],
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
      ) : null}
    </Bloc>
  );
}
