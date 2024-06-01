import BN from 'bn.js';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { Vest } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  getDaysBetween,
  getLockedStakeRemainingTime,
  getYearsBetween,
  nativeToUi,
} from '@/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function VestStats({ userVest }: { userVest: Vest }) {
  const vestPeriod = getYearsBetween(
    userVest.unlockStartTimestamp,
    userVest.unlockEndTimestamp,
  );

  const yearsBetween = getYearsBetween(
    new BN(Date.now() / 1000),
    userVest.unlockEndTimestamp,
  );

  const daysBetween = getDaysBetween(
    new BN(Date.now() / 1000),
    userVest.unlockEndTimestamp,
  );

  const claimVest = async () => {
    try {
      const txHash = await window.adrena.client.claimUserVest();

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
      <div className="flex flex-col gap-2 w-full p-5 order-2 sm:order-1 sm:border-r sm:border-third">
        <h2>My Vest</h2>
        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Vesting period</p>

          <p className="font-mono">
            {vestPeriod} year{vestPeriod > 1 && 's'}{' '}
            <span className="opacity-50">
              ({yearsBetween} year and {daysBetween} days left)
            </span>
          </p>
        </div>

        <div className="w-full h-[1px] bg-third my-3" />

        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Total amount vested</p>

          <FormatNumber
            nb={
              userVest
                ? nativeToUi(
                    userVest.amount,
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
              userVest
                ? nativeToUi(
                    userVest.claimedAmount,
                    window.adrena.client.adxToken.decimals,
                  )
                : null
            }
            placeholder="0"
            suffix=" ADX"
            precision={3}
          />
        </div>

        <div className="w-full h-[1px] bg-third my-3" />

        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Claimable amount</p>

          <FormatNumber
            nb={
              userVest
                ? nativeToUi(
                    userVest.claimedAmount,
                    window.adrena.client.adxToken.decimals,
                  )
                : null
            }
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
      <div className="relative flex flex-col justify-center items-center w-[300px] sm:w-[400px] p-3 order-1 sm:order-2">
        <Doughnut
          height={100}
          width={100}
          options={{
            cutout: '90%',
            plugins: {
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

              tooltip: {
                enabled: true,
              },
            },
          }}
          data={{
            labels: ['Claimed ADX', 'Unclaimed ADX'],
            datasets: [
              {
                label: 'Total',
                data: [
                  nativeToUi(
                    userVest.claimedAmount,
                    window.adrena.client.adxToken.decimals,
                  ),
                  nativeToUi(
                    userVest.amount,
                    window.adrena.client.adxToken.decimals,
                  ) -
                    nativeToUi(
                      userVest.claimedAmount,
                      window.adrena.client.adxToken.decimals,
                    ),
                  nativeToUi(
                    userVest.amount,
                    window.adrena.client.adxToken.decimals,
                  ),
                ],
                borderWidth: 0,
                backgroundColor: ['#4BB756', '#314633', '#192128'],
              },
            ],
          }}
          className="w-full h-full"
        />
        <div className="absolute top-1/2">
          <FormatNumber
            nb={nativeToUi(
              userVest.claimedAmount,
              window.adrena.client.adxToken.decimals,
            )}
            suffix=" ADX"
            className="text-lg text-center"
          />
          <FormatNumber
            nb={nativeToUi(
              userVest.amount,
              window.adrena.client.adxToken.decimals,
            )}
            suffix=" ADX"
            className="text-center block opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
