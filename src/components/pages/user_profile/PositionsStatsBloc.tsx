import { twMerge } from 'tailwind-merge';

import { UserProfileExtended } from '@/types';

import NumberInfo from '../backoffice/NumberInfo';
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
        <div className="flex h-[1px] grow bg-gray-300"></div>
        <div className="font-specialmonster text-2xl pl-6 pr-6">
          Positions Stats
        </div>
        <div className="flex h-[1px] grow bg-gray-300"></div>
      </div>

      <div className="flex w-full grow justify-around items-center flex-wrap self-center">
        <div className="flex flex-col items-center m-4 p-4 grow">
          <div className="text-2xl text-txtfade font-specialmonster">Count</div>

          <NumberInfo
            className="text-4xl font-specialmonster"
            value={
              userProfile.longStats.openedPositionCount +
              userProfile.shortStats.openedPositionCount
            }
            precision={1}
            denomination=""
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4 grow">
          <div className="text-2xl text-txtfade font-specialmonster">
            Liquidated Count
          </div>

          <NumberInfo
            className="text-4xl font-specialmonster"
            value={
              userProfile.longStats.liquidatedPositionCount +
              userProfile.shortStats.liquidatedPositionCount
            }
            precision={1}
            denomination=""
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4 grow">
          <div className="text-2xl text-txtfade font-specialmonster text-center">
            Average Leverage
          </div>

          <div className="flex items-center font-specialmonster">
            x
            <NumberInfo
              className="text-4xl font-specialmonster"
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
          <div className="text-2xl text-txtfade font-specialmonster text-center">
            Volume with leverage
          </div>

          <NumberInfo
            className="text-4xl font-specialmonster"
            value={
              userProfile.longStats.openingSizeUsd +
              userProfile.shortStats.openingSizeUsd
            }
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4 grow">
          <div className="text-2xl text-txtfade font-specialmonster text-center">
            Fee paid
          </div>

          <NumberInfo
            className="text-4xl font-specialmonster"
            value={
              userProfile.longStats.feePaidUsd +
              userProfile.shortStats.feePaidUsd
            }
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4 grow">
          <div className="text-2xl text-txtfade font-specialmonster">
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
