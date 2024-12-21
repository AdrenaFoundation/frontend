import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from 'date-fns';
import { Cell, Legend, Pie, PieChart } from 'recharts';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { useDispatch } from '@/store/store';
import { Vest } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  nativeToUi,
} from '@/utils';

export default function VestStats({
  vest,
  readonly = false,
  getUserVesting,
}: {
  vest: Vest;
  readonly?: boolean;
  getUserVesting?: () => void;
}) {
  const dispatch = useDispatch();
  const amount = nativeToUi(
    vest.amount,
    window.adrena.client.adxToken.decimals,
  );

  const claimedAmount = nativeToUi(
    vest.claimedAmount,
    window.adrena.client.adxToken.decimals,
  );

  // Calculate how much tokens per seconds are getting accrued for the vest
  const amountPerSecond =
    amount /
    (vest.unlockEndTimestamp.toNumber() * 1000 -
      vest.unlockStartTimestamp.toNumber() * 1000);

  const hasVestStarted =
    new Date(vest.unlockStartTimestamp.toNumber() * 1000) <= new Date();

  const vestStartDate = new Date(vest.unlockStartTimestamp.toNumber() * 1000);

  const vestPeriod =
    new Date(vest.unlockEndTimestamp.toNumber() * 1000).getFullYear() -
    new Date(vest.unlockStartTimestamp.toNumber() * 1000).getFullYear();

  // Calculate how many seconds has passed since the last claim
  const nbSecondsSinceLastClaim =
    Date.now() -
    (vest.lastClaimTimestamp.toNumber() === 0
      ? vest.unlockStartTimestamp.toNumber()
      : vest.lastClaimTimestamp.toNumber()) *
    1000;

  const claimableAmount = hasVestStarted
    ? nbSecondsSinceLastClaim * amountPerSecond
    : 0;

  const unlockEndDate = new Date(vest.unlockEndTimestamp.toNumber() * 1000);
  const now = new Date();
  const yearsLeft = differenceInYears(unlockEndDate, now);
  const monthsLeft = differenceInMonths(unlockEndDate, now) % 12;
  const daysLeft = (differenceInDays(unlockEndDate, now) % 365) % 30;
  const timeLeft = `${yearsLeft}y ${monthsLeft}m ${daysLeft}d left`;

  const data = [
    { name: 'Claimed ADX', value: claimedAmount },
    { name: 'Unclaimed ADX', value: claimableAmount },
    { name: 'Total Vested ADX', value: amount },
  ];

  const COLORS = ['#9F8CAE', '#5C576B', '#15202C'];

  const claimVest = async () => {
    try {
      const txHash = await window.adrena.client.claimUserVest();

      if (getUserVesting)
        getUserVesting();
      dispatch(fetchWalletTokenBalances());

      return addSuccessTxNotification({
        title: 'Successfully Claimed ADX',
        txHash,
      });
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Claiming ADX',
        error,
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center z-20">
      <div className="flex flex-col gap-2 w-full p-5 sm:py-0 order-2 sm:order-1">
        <h2 className="hidden sm:block">Ongoing Vests</h2>

        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Vest period</p>

          <p className="font-mono">
            {vestPeriod.toLocaleString()} years{' '}
            {hasVestStarted ? (
              <span className="font-mono opacity-50"> ({timeLeft})</span>
            ) : (
              <span className="font-mono opacity-50">
                {' '}
                (vest starts {vestStartDate.toLocaleDateString()})
              </span>
            )}
          </p>
        </div>
        <div className="w-full h-[1px] bg-third my-1" />

        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Vested</p>

          <FormatNumber
            nb={amount}
            placeholder="0"
            suffix="ADX"
            precision={3}
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Claimed</p>

          <FormatNumber
            nb={claimedAmount}
            placeholder="0"
            suffix="ADX"
            precision={3}
          />
        </div>

        <div className="w-full h-[1px] bg-third my-1" />

        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Claimable</p>

          <FormatNumber
            nb={claimableAmount}
            placeholder="0"
            suffix="ADX"
            precision={3}
          />
        </div>

        {!readonly ? <Button
          title="Claim ADX"
          className="w-full mt-3 h-8"
          size="lg"
          disabled={claimableAmount === 0}
          onClick={() => claimVest()}
        /> : null}
      </div>

      <div className="py-5 sm:py-0 w-[300px] sm:w-[400px] order-1 sm:order-2">
        <h2 className="text-left mb-3 sm:hidden">Ongoing Vests</h2>
        <div className="flex flex-col justify-center items-center sm:border-l sm:border-third sm:p-3">
          <PieChart width={300} height={300}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="top"
              align="center"
              iconSize={5}
              iconType="circle"
              formatter={(value: string) => {
                return <span className="opacity-50">{value}</span>;
              }}
            />
          </PieChart>
        </div>
      </div>
    </div>
  );
}
