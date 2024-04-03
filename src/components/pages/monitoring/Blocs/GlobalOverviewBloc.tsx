import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { useSelector } from '@/store/store';
import { Cortex, CustodyExtended, PoolExtended } from '@/types';
import { nativeToUi } from '@/utils';

import InfoAnnotation from '../InfoAnnotation';
import NumberInfo from '../NumberInfo';
import Table from '../Table';
import TitleAnnotation from '../TitleAnnotation';

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
    <StyledContainer title={<h1>Global Overview</h1>} className={className}>
      <Table
        rowTitleWidth="50%"
        data={[
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Sum of all assets owned by the protocol, adjusted for the current value of traders' positions."
                  className="mr-1"
                />
                Total Value
              </div>
            ),

            value: <NumberInfo value={mainPool.aumUsd} />,
          },

          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Sum of all assets owned by the protocol."
                  className="mr-1"
                />
                Raw Total Assets Value
              </div>
            ),

            value:
              totalPoolAssetHardValue !== CANNOT_CALCULATE ? (
                <NumberInfo value={totalPoolAssetHardValue} />
              ) : (
                '-'
              ),
          },

          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="The cumulative value of all assets traded or swapped within the protocol."
                  className="mr-1"
                />
                Total Volume
              </div>
            ),

            value: <NumberInfo value={mainPool.totalVolume} />,
          },

          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="The aggregate amount of fees the protocol has earned from trades and swaps."
                  className="mr-1"
                />
                Total Fee Collected
              </div>
            ),

            value: <NumberInfo value={mainPool.totalFeeCollected} />,
          },

          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Total amount of ADX tokens that have been minted."
                  className="mr-1"
                />
                ADX Total Supply
              </div>
            ),

            value: (
              <NumberInfo
                value={adxTotalSupply}
                precision={window.adrena.client.adxToken.decimals}
                denomination="ADX"
              />
            ),
          },

          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Total amount of ALP tokens that have been minted."
                  className="mr-1"
                />
                ALP Total Supply
              </div>
            ),

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
              <div className="flex items-center">
                <InfoAnnotation
                  text="The quantity of ADX tokens assigned for gradual release to specific recipients over a predetermined period."
                  className="mr-1"
                />
                Total Vested <TitleAnnotation text="Unrealized" />
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
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="The count of individuals or entities designated to receive ADX tokens via a vesting schedule."
                  className="mr-1"
                />
                Number of Vest
              </div>
            ),

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
    </StyledContainer>
  );
}
