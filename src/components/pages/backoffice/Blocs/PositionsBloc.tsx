import { twMerge } from 'tailwind-merge';

import { useSelector } from '@/store/store';
import { CustodyExtended, PoolExtended } from '@/types';
import { nativeToUi } from '@/utils';

import Bloc from '../Bloc';
import ComingSoonInfo from '../ComingSoonInfo';
import LongShortBarChart from '../LongShortBarChart';
import NumberInfo from '../NumberInfo';
import Table from '../Table';

export default function PositionsBloc({
  className,
  mainPool,
  custodies,
}: {
  className?: string;
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  return (
    <Bloc title="Positions" className={twMerge('min-w-[20em]', className)}>
      <Table
        className="pb-0"
        rowTitleWidth="35%"
        columnsTitles={['Long', 'Short']}
        data={[
          {
            rowTitle: 'Nb Open Positions',
            values: [
              mainPool.nbOpenLongPositions,
              mainPool.nbOpenShortPositions,
            ],
          },
          {
            rowTitle: 'Open Interest',
            values: [
              <NumberInfo key="long" value={mainPool.oiLongUsd} />,
              <NumberInfo key="short" value={mainPool.oiShortUsd} />,
            ],
          },
        ]}
      />

      <div className="w-full h-[35px] pl-2 pr-2 flex">
        <LongShortBarChart
          className=""
          oiLongUsd={mainPool.oiLongUsd}
          oiShortUsd={mainPool.oiShortUsd}
        />
      </div>

      <Table
        rowTitleWidth="35%"
        className="pt-0"
        columnsTitles={['', '']}
        data={[
          {
            rowTitle: 'Nb Open Positions',
            values: [
              mainPool.nbOpenLongPositions,
              mainPool.nbOpenShortPositions,
            ],
          },
          {
            rowTitle: 'Open Interest',
            values: [
              <NumberInfo key="long" value={mainPool.oiLongUsd} />,
              <NumberInfo key="short" value={mainPool.oiShortUsd} />,
            ],
          },
          {
            rowTitle: 'Average Leverage',
            values: [<ComingSoonInfo key="0" />, <ComingSoonInfo key="1" />],
          },

          ...custodies
            .filter((custody) => !custody.isStable)
            .map((custody) => ({
              rowTitle: `${custody.tokenInfo.symbol} Open Interest`,
              values: [
                <div key="long" className="flex flex-col">
                  <NumberInfo
                    value={nativeToUi(
                      custody.nativeObject.tradeStats.oiLongUsd,
                      custody.decimals,
                    )}
                    denomination={custody.tokenInfo.symbol}
                    precision={custody.decimals}
                  />

                  {tokenPrices[custody.tokenInfo.symbol] ? (
                    <NumberInfo
                      value={
                        nativeToUi(
                          custody.nativeObject.tradeStats.oiLongUsd,
                          custody.decimals,
                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        ) * tokenPrices[custody.tokenInfo.symbol]!
                      }
                    />
                  ) : null}
                </div>,

                <div key="short" className="flex flex-col">
                  <NumberInfo
                    value={nativeToUi(
                      custody.nativeObject.tradeStats.oiShortUsd,
                      custody.decimals,
                    )}
                    denomination={custody.tokenInfo.symbol}
                    precision={custody.decimals}
                  />

                  {tokenPrices[custody.tokenInfo.symbol] ? (
                    <NumberInfo
                      value={
                        nativeToUi(
                          custody.nativeObject.tradeStats.oiShortUsd,
                          custody.decimals,
                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        ) * tokenPrices[custody.tokenInfo.symbol]!
                      }
                    />
                  ) : null}
                </div>,
              ],
            })),
        ]}
      />
    </Bloc>
  );
}
