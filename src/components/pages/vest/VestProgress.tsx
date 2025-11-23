import { twMerge } from 'tailwind-merge';

export default function VestProgress({
  className,
  amount,
  claimedAmount,
  claimableAmount,
}: {
  className?: string;
  amount: number;
  claimedAmount: number;
  claimableAmount: number;
}) {
  const claimedAmountPercentage =
    amount > 0 ? (claimedAmount * 100) / amount : 0;
  const claimableAmountPercentage =
    amount > 0 ? (claimableAmount * 100) / amount : 0;

  return (
    <div className="flex flex-col w-full">
      <div
        className={twMerge(
          'w-full bg-third h-[1em] rounded items-center flex',
          className,
        )}
      >
        <div
          className={twMerge('h-full bg-[#bd84cc] z-20')}
          style={{
            width: `${claimedAmountPercentage}%`,
          }}
        />

        <div
          className={twMerge('h-full bg-[#cec161] z-10')}
          style={{
            width: `${claimableAmountPercentage}%`,
          }}
        />
      </div>

      <div className="w-full mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center justify-center gap-1">
          <div className="h-3 w-3 bg-[#bd84cc]" />
          <div className="text-sm">Claimed ADX</div>
        </div>

        <div className="flex items-center justify-center gap-1">
          <div className="h-3 w-3 bg-[#cec161]" />
          <div className="text-sm">Claimable ADX</div>
        </div>
      </div>
    </div>
  );
}
