import { twMerge } from 'tailwind-merge';

import { UserProfileExtended } from '@/types';

import NumberInfo from '../monitoring/NumberInfo';
import ProfitsAndLossesChart from './ProfitsAndLossesChart';

export default function PositionsStatsBloc({
  userProfile,
  className,
}: {
  userProfile: UserProfileExtended;
  className?: string;
}) {
  return (
    <div className={twMerge('flex flex-col pr-4', className)}>
      <div className="flex w-full justify-center items-center">
        <div className="flex h-[1px] grow bg-bcolor"></div>
        <div className="font-special text-2xl pl-6 pr-6">Positions Stats</div>
        <div className="flex h-[1px] grow bg-bcolor"></div>
      </div>

      <div className="flex w-full grow justify-around items-center flex-wrap self-center">
        <div className="flex flex-col items-center m-4 p-4 grow">
          <div className="text-2xl text-txtfade font-special">Count</div>

          <NumberInfo
            className="text-4xl font-special"
            value={
              userProfile.longStats.openedPositionCount +
              userProfile.shortStats.openedPositionCount
            }
            precision={1}
            denomination=""
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4 grow">
          <div className="text-2xl text-txtfade font-special">
            Liquidated Count
          </div>

          <NumberInfo
            className="text-4xl font-special"
            value={
              userProfile.longStats.liquidatedPositionCount +
              userProfile.shortStats.liquidatedPositionCount
            }
            precision={1}
            denomination=""
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4 grow">
          <div className="text-2xl text-txtfade font-special text-center">
            Average Leverage
          </div>

          <div className="flex items-center font-special">
            x
            <NumberInfo
              className="text-4xl font-special"
              value={
                (userProfile.longStats.openingAverageLeverage +
                  userProfile.shortStats.openingAverageLeverage) /
                2
              }
              precision={1}
              denomination=""
            />
          </div>
        </div>

        <div className="flex flex-col items-center m-4 p-4 grow">
          <div className="text-2xl text-txtfade font-special text-center">
            Volume with leverage
          </div>

          <NumberInfo
            className="text-4xl font-special"
            value={
              userProfile.longStats.openingSizeUsd +
              userProfile.shortStats.openingSizeUsd
            }
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4 grow">
          <div className="text-2xl text-txtfade font-special text-center">
            Fee paid
          </div>

          <NumberInfo
            className="text-4xl font-special"
            value={
              userProfile.longStats.feePaidUsd +
              userProfile.shortStats.feePaidUsd
            }
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4 grow">
          <div className="text-2xl text-txtfade font-special">
            Profits and Losses
          </div>

          <div className="flex flex-col items-center mt-2">
            {userProfile.longStats.profitsUsd ||
            userProfile.longStats.lossesUsd ||
            userProfile.shortStats.profitsUsd ||
            userProfile.shortStats.lossesUsd ? (
              <ProfitsAndLossesChart
                className="mt-4"
                longProfitsUsd={userProfile.longStats.profitsUsd}
                longLossesUsd={userProfile.longStats.lossesUsd}
                shortProfitsUsd={userProfile.shortStats.profitsUsd}
                shortLossesUsd={userProfile.shortStats.lossesUsd}
              />
            ) : (
              <NumberInfo className="text-4xl font-special" value={0} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
