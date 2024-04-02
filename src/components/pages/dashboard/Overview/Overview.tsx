import FormatNumber from '@/components/Number/FormatNumber';

export default function Overview({
  aumUsd,
  longPositions,
  shortPositions,
  nbOpenLongPositions,
  nbOpenShortPositions,
  averageLongLeverage,
  averageShortLeverage,
  totalCollectedFees,
  totalVolume,
}: {
  aumUsd: number | null;
  longPositions: number | null;
  shortPositions: number | null;
  nbOpenLongPositions: number | null;
  nbOpenShortPositions: number | null;
  averageLongLeverage: number | null;
  averageShortLeverage: number | null;
  totalCollectedFees: number | null;
  totalVolume: number | null;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-5 border border-gray-200 bg-gray-300/85 backdrop-blur-md w-full rounded-2xl">
      <div className="w-full p-3 px-5">
        <h2 className="text-lg font-normal border-b border-b-gray-200 pb-3 mb-3">
          Long Overview
        </h2>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between">
            <p className="opacity-50">Open Interest</p>
            <FormatNumber nb={longPositions} format="currency" />
          </div>
          <div className="flex flex-row justify-between">
            <p className="opacity-50">Active Positions</p>

            <FormatNumber nb={nbOpenLongPositions} />
          </div>
          <div className="flex flex-row justify-between">
            <p className="opacity-50">Average Leverage</p>
            {/* <p className="text-sm opacity-25 italic">
              {averageLongLeverage
                ? `${formatNumber(averageLongLeverage, 2)}x`
                : 'Coming soon'}
            </p> */}

            <FormatNumber
              nb={averageLongLeverage !== 0 ? averageLongLeverage : null} // TODO: to be changed
              placeholder="Coming soon"
              placeholderClassName="italic opacity-25 text-sm"
              unit="x"
            />
          </div>
        </div>
      </div>

      <div className="w-full md:border-l md:border-l-gray-200 p-3 px-5">
        <h2 className="text-lg font-normal border-b border-b-gray-200 pb-3 mb-3">
          Short Overview
        </h2>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between">
            <p className="opacity-50">Open Interest</p>
            <FormatNumber nb={shortPositions} format="currency" />
          </div>
          <div className="flex flex-row justify-between">
            <p className="opacity-50">Active Positions</p>
            <FormatNumber nb={nbOpenShortPositions} />
          </div>
          <div className="flex flex-row justify-between">
            <p className="opacity-50">Average Leverage</p>
            <FormatNumber
              nb={averageShortLeverage !== 0 ? averageShortLeverage : null} // TODO: to be changed
              placeholder="Coming soon"
              placeholderClassName="italic opacity-25 text-sm"
              unit="x"
            />
          </div>
        </div>
      </div>

      <div className="w-full md:border-l md:border-l-gray-200 p-3 px-5">
        <h2 className="text-lg font-normal border-b border-b-gray-200 pb-3 mb-3">
          Total Stats
        </h2>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between">
            <p className="opacity-50">AUM</p>
            <FormatNumber nb={aumUsd} format="currency" />
          </div>
          <div className="flex flex-row justify-between">
            <p className="opacity-50">Total Volume</p>
            <FormatNumber nb={totalVolume} format="currency" />
          </div>
          <div className="flex flex-row justify-between">
            <p className="opacity-50">Total fees</p>
            <FormatNumber nb={totalCollectedFees} format="currency" />
          </div>
        </div>
      </div>
    </div>
  );
}
