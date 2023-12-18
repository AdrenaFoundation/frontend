import { twMerge } from 'tailwind-merge';

import { Cortex } from '@/types';
import { nativeToUi } from '@/utils';

import Bloc from '../Bloc/Bloc';
import NumberInfo from '../Table/formatting/NumberInfo';
import Table from '../Table/Table';
import TitleAnnotation from '../TitleAnnotation/TitleAnnotation';

export default function VestingBloc({
  className,
  cortex,
}: {
  className?: string;
  cortex: Cortex;
}) {
  return (
    <Bloc
      title="Vesting"
      className={twMerge('min-w-[25em] max-w-[35em]', className)}
    >
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
    </Bloc>
  );
}
