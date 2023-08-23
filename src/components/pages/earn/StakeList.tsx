import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import { formatNumber, formatPriceInfo } from '@/utils';

export default function StakeList({
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
  const columnStyle = 'text-sm py-5';

  return (
    <table className="w-full">
      <thead>
        <tr>
          {[
            'Amount',
            'Multiplier',
            'Rewards',
            'Duration',
            'Yield',
            'Actions',
          ].map((header) => (
            <th className="text-xs text-left opacity-50 pb-3" key={header}>
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {stakePositions?.map((position, i) => (
          <tr
            key={position.pubkey}
            className={twMerge(
              i !== stakePositions.length - 1 && 'border-b border-b-gray-300',
            )}
          >
            <td
              className={twMerge(
                !!i ? columnStyle : 'text-sm pb-5',
                'font-mono',
              )}
            >
              {formatNumber(position.amount, 2)} ADX
            </td>

            <td
              className={twMerge(
                !!i ? columnStyle : 'text-sm pb-5',
                'font-mono',
              )}
            >
              {formatNumber(position.multiplier, 2)}
            </td>

            <td
              className={twMerge(
                !!i ? columnStyle : 'text-sm pb-5',
                'font-mono',
              )}
            >
              {formatPriceInfo(position.rewards)}
            </td>

            <td
              className={twMerge(
                !!i ? columnStyle : 'text-sm pb-5',
                'font-mono',
              )}
            >
              {position.duration} <span className="opacity-50">days</span>
            </td>

            <td
              className={twMerge(
                !!i ? columnStyle : 'text-sm pb-5',
                'font-mono',
              )}
            >
              {formatPriceInfo(position.yield)}
            </td>

            <td className={twMerge(!!i ? columnStyle : 'text-sm pb-5')}>
              <Button
                className="w-full"
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
              {/* <Image
                src="/images/Icons/lock.svg"
                width={16}
                height={16}
                alt={'lock icon'}
              /> */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
