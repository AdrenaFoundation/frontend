
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import DataApiClient from '@/DataApiClient';

import chevronDown from '../../../../public/images/chevron-down.svg';

function NumberDisplayBoilerplate({
  key,
  title,
  nb,
  precision = 2,
}: {
  key?: string | number;
  title?: string;
  nb: number | null;
  precision?: number;
}) {
  return <NumberDisplay
    key={key}
    title={title}
    nb={nb}
    format="percentage"
    precision={precision}
    className="border-0 p-1 justify-center items-center"
    isDecimalDimmed={false}
    bodyClassName="text-xs sm:text-sm"
    headerClassName="pb-0"
    titleClassName="text-xs sm:text-xs"
  />
}

const periods = [90, 180, 360, 540] as const;

const titleClassName = 'text-xxs sm:text-sm w-[6em] sm:w-[10em] shrink-0 flex items-center justify-center text-txtfade text-center whitespace-nowrap';

export default function StakeApr({
  token,
  className,
}: {
  token: 'ADX' | 'ALP';
  className?: string;
}) {
  const [apr, setApr] = useState<Awaited<ReturnType<typeof DataApiClient.getRolling7dAprsInfo> | null>>(null);

  const [moreInfo, setMoreInfo] = useState(false);

  const loadData = useCallback(async () => {
    setApr(await DataApiClient.getRolling7dAprsInfo(token === 'ALP' ? 'lp' : 'lm'));
  }, [token]);

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 60 * 1000);

    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className={twMerge("flex flex-col bg-main rounded-2xl border h-18", className)}>
      <div className={twMerge("flex flex-wrap p-2")}>
        {token === 'ALP' ? <NumberDisplayBoilerplate
          title="LIQUID APR"
          nb={apr !== null ? apr.aprs[0].liquid_apr : null}
          precision={4}
        /> : null}

        {
          periods.map((lockPeriod) => (
            <NumberDisplayBoilerplate
              key={lockPeriod}
              title={`${lockPeriod}d APR`}
              nb={apr !== null ? apr.aprs.find(({
                lock_period,
              }) => lock_period === lockPeriod)?.locked_apr ?? null : null}
            />
          ))
        }
      </div>

      <div className={twMerge('flex flex-col w-full gap-4 border-t border-bcolor overflow-hidden transition-all duration-3000 ease-in-out', moreInfo ? 'max-h-[100em]' : 'max-h-0')}>
        <div className='flex flex-col ml-8 mr-8 mt-4'>
          <p className='opacity-75 text-base bg-third p-4 w-full text-justify border border-bcolor rounded flex flex-col gap-2 min-h-[8em]'>
            {token === "ALP" ? <span className='text-sm'>
              The displayed APR are projected values based on the last 7 days rolling. The liquid USDC rewards is given to each ALP, staked or not.
              To give the most accurate estimate, the APR calculation uses the price of ADX at the time the staking round is resolved.
              The APR does not include Genesis ADX rewards.
            </span> : <span className='text-sm'>
              The displayed APR are projected values based on the last 7 days rolling.
              To give the most accurate estimate, the APR calculation uses the price of ADX at the time the staking round is resolved.
            </span>}
          </p>
        </div>

        <div className='flex flex-col w-full sm:w-[90%] ml-auto mr-auto mb-4 border pt-2 pl-2 pr-2'>
          <div className='flex w-full border-b pb-2'>
            <div className={titleClassName}>YIELD</div>

            <div className='grid grid-cols-4 grow'>
              {periods.map((lockPeriod) => <div key={lockPeriod} className='text-txtfade text-xs sm:text-sm items-center justify-center flex'>{`${lockPeriod}D APR`}</div>)}
            </div>
          </div>

          <div className='flex w-full'>
            <div className={titleClassName}>FEES (USDC)</div>

            <div className='grid grid-cols-4 grow'>
              {periods.map((lockPeriod) => {
                const a = apr !== null ? apr.aprs.find(({
                  lock_period,
                }) => lock_period === lockPeriod) ?? null : null;

                return <NumberDisplayBoilerplate
                  key={lockPeriod}
                  nb={a !== null ? a.locked_usdc_apr + a.liquid_apr : null} />
              })}
            </div>
          </div>

          <div className='flex w-full'>
            <div className={titleClassName}>LM (ADX)</div>

            <div className='grid grid-cols-4 grow'>
              {periods.map((lockPeriod) => (
                <NumberDisplayBoilerplate
                  key={lockPeriod}
                  nb={apr !== null ? apr.aprs.find(({
                    lock_period,
                  }) => lock_period === lockPeriod)?.locked_adx_apr ?? null : null}
                />
              ))}
            </div>
          </div>

          <div className='w-full border-b'></div>

          <div className='flex w-full'>
            <div className={titleClassName}>TOTAL</div>

            <div className='grid grid-cols-4 grow'>
              {periods.map((lockPeriod) => (
                <NumberDisplayBoilerplate
                  key={lockPeriod}
                  nb={apr !== null ? apr.aprs.find(({
                    lock_period,
                  }) => lock_period === lockPeriod)?.total_apr ?? null : null}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='w-full flex items-center justify-center h-6 border-t border-bcolor hover:opacity-100 opacity-80 cursor-pointer' onClick={() => {
        setMoreInfo(!moreInfo);
      }}>
        <Image
          className={twMerge(
            `h-6 w-6`,
            moreInfo ? 'transform rotate-180 transition-all duration-1000 ease-in-out' : '',
          )}
          src={chevronDown}
          height={60}
          width={60}
          alt="Chevron down"
        />
      </div>
    </div>
  );
}
