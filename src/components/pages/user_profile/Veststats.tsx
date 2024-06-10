import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from 'date-fns';
import { Doughnut } from 'react-chartjs-2';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { Vest } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  nativeToUi,
} from '@/utils';

ChartJS.register(annotationPlugin, ArcElement, Tooltip, Legend);

export default function VestStats({
  vest,
  getUserVesting,
}: {
  vest: Vest;
  getUserVesting: () => void;
}) {
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

  const vestPeriod =
    new Date(vest.unlockEndTimestamp.toNumber() * 1000).getFullYear() -
    new Date(vest.unlockStartTimestamp.toNumber() * 1000).getFullYear();

  // Calculate how many seconds happened since last claim
  const nbSecondsSinceLastClaim =
    Date.now() -
    (vest.lastClaimTimestamp.toNumber() === 0
      ? vest.unlockStartTimestamp.toNumber() * 1000
      : vest.lastClaimTimestamp.toNumber()) *
      1000;

  const claimableAmount = nbSecondsSinceLastClaim * amountPerSecond;

  const unlockEndDate = new Date(vest.unlockEndTimestamp.toNumber() * 1000);
  const now = new Date();

  const yearsLeft = differenceInYears(unlockEndDate, now);
  const monthsLeft = differenceInMonths(unlockEndDate, now) % 12;
  const daysLeft = (differenceInDays(unlockEndDate, now) % 365) % 30;
  const timeLeft = `${yearsLeft}y ${monthsLeft}m ${daysLeft}d left`;

  const claimVest = async () => {
    try {
      const txHash = await window.adrena.client.claimUserVest();

      getUserVesting();
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
    <div className="flex flex-col sm:flex-row items-center bg-secondary  w-full border rounded-lg z-20">
      <div className="flex flex-col gap-2 w-full px-5 order-2 sm:order-1">
        <h2>My Vest</h2>

        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Vest period</p>

          <p className="font-mono">
            {vestPeriod.toLocaleString()} years{' '}
            <span className="font-mono opacity-50"> ({timeLeft})</span>
          </p>
        </div>
        <div className="w-full h-[1px] bg-third my-1" />

        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Total amount vested</p>

          <FormatNumber
            nb={
              vest
                ? nativeToUi(
                    vest.amount,
                    window.adrena.client.adxToken.decimals,
                  )
                : null
            }
            placeholder="0"
            suffix=" ADX"
            precision={3}
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Claimed Amount</p>

          <FormatNumber
            nb={
              vest
                ? nativeToUi(
                    vest.claimedAmount,
                    window.adrena.client.adxToken.decimals,
                  )
                : null
            }
            placeholder="0"
            suffix=" ADX"
            precision={3}
          />
        </div>

        <div className="w-full h-[1px] bg-third my-1" />

        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Claimable amount</p>

          <FormatNumber
            nb={claimableAmount}
            placeholder="0"
            suffix=" ADX"
            precision={3}
          />
        </div>

        <Button
          title="Claim ADX"
          className="w-full mt-3"
          size="lg"
          onClick={() => claimVest()}
        />
      </div>
      <div className="flex flex-col justify-center items-center w-[300px] sm:w-[400px] p-3 order-1 sm:order-2 sm:border-l sm:border-third">
        <Doughnut
          height={100}
          width={100}
          options={{
            cutout: '0%',
            plugins: {
              datalabels: {
                display: false,
              },
              legend: {
                display: true,
                position: 'top',
                align: 'center',
                fullSize: true,
                maxWidth: 20,

                labels: {
                  boxWidth: 5,
                  boxHeight: 5,
                  usePointStyle: true,
                },
              },
            },
          }}
          data={{
            labels: ['Claimed ADX', 'Unclaimed ADX', 'Total Vested ADX'],
            datasets: [
              {
                data: [claimedAmount, claimableAmount, amount],
                type: 'doughnut',
                borderWidth: 0,
                backgroundColor: ['#4BB756', '#314633', '#192128'],
              },
            ],
          }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
