import { twMerge } from 'tailwind-merge';

import { useSelector } from '@/store/store';
import { Cortex, CustodyExtended, PoolExtended } from '@/types';
import { nativeToUi } from '@/utils';

import Bloc from '../Bloc/Bloc';
import NumberInfo from '../Table/formatting/NumberInfo';
import Table from '../Table/Table';
import TitleAnnotation from '../TitleAnnotation/TitleAnnotation';

const CANNOT_CALCULATE = -1;

export default function GlobalOverviewBloc({
  className,
  cortex,
  mainPool,
  custodies,
  adxTotalSupply,
  alpTotalSupply,
}: {
  className?: string;
  cortex: Cortex;
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
  adxTotalSupply: number;
  alpTotalSupply: number;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  // Value of all assets owned by the pool
  // Which doesn't take into account opened positions and stuff
  const totalPoolAssetHardValue = custodies.reduce((acc, custody) => {
    const price = tokenPrices[custody.tokenInfo.symbol];

    if (!price) return CANNOT_CALCULATE;
    return acc + custody.owned * price;
  }, 0);

  return (
    <Bloc
      title="Global Overview"
      className={twMerge('min-w-[20em]', className)}
    >
      <Table
        rowTitleWidth="50%"
        data={[
          {
            rowTitle: 'Total Value',
            value: <NumberInfo value={mainPool.aumUsd} />,
          },

          ...(totalPoolAssetHardValue !== CANNOT_CALCULATE
            ? [
                {
                  rowTitle: 'Raw Total Assets Value',
                  value: <NumberInfo value={totalPoolAssetHardValue} />,
                },
              ]
            : []),

          {
            rowTitle: 'Total Volume',
            value: <NumberInfo value={mainPool.totalVolume} />,
          },

          {
            rowTitle: 'Total Fee Collected',
            value: <NumberInfo value={mainPool.totalFeeCollected} />,
          },

          {
            rowTitle: 'ADX total supply',
            value: (
              <NumberInfo
                value={adxTotalSupply}
                precision={window.adrena.client.adxToken.decimals}
                denomination="ADX"
              />
            ),
          },

          {
            rowTitle: 'ALP total supply',
            value: (
              <NumberInfo
                value={alpTotalSupply}
                precision={window.adrena.client.alpToken.decimals}
                denomination="ALP"
              />
            ),
          },

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
