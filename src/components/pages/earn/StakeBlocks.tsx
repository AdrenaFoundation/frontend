import Button from '@/components/common/Button/Button';
import { formatNumber, formatPriceInfo } from '@/utils';

export default function StakeBlocks({
  stakePositions,
}: {
  stakePositions:
    | {
        pubkey: string; // change to pubkey
        amount: number;
        multiplier: number;
        rewards: number;
        duration: number;
        yield: number;
      }[]
    | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {stakePositions?.map((position) => (
        <div
          key={position.pubkey}
          className="bg-[#242424] p-3 rounded-lg border border-gray-300"
        >
          <ul>
            <li className="flex flex-row gap-3 justify-between">
              <p className="text-sm opacity-50">Amount</p>
              <p className="font-mono text-sm">
                {formatNumber(position.amount, 2)} ADX
              </p>
            </li>

            <li className="flex flex-row gap-3 justify-between">
              <p className="text-sm opacity-50">Multiplier</p>
              <p className="font-mono text-sm">
                {formatNumber(position.multiplier, 2)}
              </p>
            </li>

            <li className="flex flex-row gap-3 justify-between">
              <p className="text-sm opacity-50">Rewards</p>
              <p className="font-mono text-sm">
                {formatPriceInfo(position.rewards)}
              </p>
            </li>

            <li className="flex flex-row gap-3 justify-between">
              <p className="text-sm opacity-50">Duration</p>
              <p className="font-mono text-sm">
                {position.duration} <span className="opacity-50">days</span>
              </p>
            </li>

            <li className="flex flex-row gap-3 justify-between">
              <p className="text-sm opacity-50">Yield</p>
              <p className="font-mono text-sm">
                {formatPriceInfo(position.yield)}
              </p>
            </li>

            <li>
              <Button
                className="w-full mt-3"
                variant="secondary"
                rightIcon={
                  position.duration !== 0 ? '/images/Icons/lock.svg' : undefined
                }
                disabled={position.duration > 0}
                title={
                  position.duration > 0
                    ? `${position.duration} days remaining`
                    : 'Redeem'
                }
                size="sm"
              />
            </li>
          </ul>
        </div>
      ))}
    </div>
  );
}
