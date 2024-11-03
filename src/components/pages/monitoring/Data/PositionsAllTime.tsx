import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { PoolExtended } from '@/types';

export default function PositionsAllTime({
  mainPool,
  titleClassName,
}: {
  mainPool: PoolExtended;
  titleClassName?: string;
}) {
  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>Positions All Time</p>
      </div>

      <div className="grid sm:grid-cols-2">
        <NumberDisplay
          title="Trading Volume"
          nb={mainPool.totalTradingVolume}
          precision={0}
          className='rounded-none border-t-0 border-l-0 border-r-0 border-b sm:border-r'
          format='currency'
        />
        <NumberDisplay
          title="Liquidation Volume"
          nb={mainPool.totalLiquidationVolume}
          precision={0}
          className='rounded-none border-t-0 border-l-0 border-r-0 border-b'
          format='currency'
        />
        <NumberDisplay
          title="Profits"
          nb={mainPool.profitsUsd}
          precision={0}
          className='rounded-none border-t-0 border-l-0 border-r-0 border-b-0 sm:border-r'
          format='currency'
        />
        <NumberDisplay
          title="Losses"
          nb={mainPool.lossUsd}
          precision={0}
          className='rounded-none border-t border-l-0 border-r-0 border-b-0 sm:border-t-0'
          format='currency'
        />
      </div>
    </div>
  );
}
