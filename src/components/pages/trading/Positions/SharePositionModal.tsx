import Image from 'next/image';
import React, { useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { formatNumber, formatPriceInfo, getTokenSymbol } from '@/utils';

import adxLogo from '../../../../../public/images/adx.svg';
import alpMonster from '../../../../../public/images/ALP_monster.png';
import adrenaLogo from '../../../../../public/images/logo.svg';
import TradingviewLight from '../TradingChart/TradingviewLight';

export default function SharePositionModal({
  position,
}: {
  position: PositionExtended;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  //   const takeScreenshot = () => {
  //     const element = cardRef.current;

  //     html2canvas(element).then((canvas) => {
  //       const imgData = canvas.toDataURL('image/png');
  //       const link = document.createElement('a');
  //       link.href = imgData;
  //       link.download = 'screenshot.png';
  //       link.click();
  //     });
  //   };

  const tokenPrices = useSelector((s) => s.tokenPrices);
  const fees = (position.exitFeeUsd ?? 0) + (position.borrowFeeUsd ?? 0);
  const pnlPercentage = position.pnl
    ? (position.pnl / position.collateralUsd) * 100
    : undefined;

  return (
    <div className="relative w-[400px]" ref={cardRef}>
      <div className="p-5">
        <div className="flex flex-row gap-2 mb-3">
          <Image src={adxLogo} alt="Adrena Logo" width={16} height={16} />
          <Image src={adrenaLogo} alt="Adrena Logo" height={8} />
        </div>
        <div className="flex flex-row gap-3 items-center">
          <h2 className="font-boldy">{position.token.symbol}</h2>

          <div
            className={twMerge(
              'rounded-md  px-2',
              position.side === 'long' ? 'bg-green/20' : 'bg-red/20',
            )}
          >
            <p
              className={twMerge(
                'text-sm font-mono font-semibold capitalize',
                position.side === 'long' ? 'text-green' : 'text-red',
              )}
            >
              {position.side} {formatNumber(position.leverage, 2)}x
            </p>
          </div>
        </div>
        <FormatNumber
          nb={pnlPercentage}
          format="percentage"
          className={twMerge(
            'text-[46px] font-mono',
            pnlPercentage && pnlPercentage < 0 ? 'text-red' : 'text-green',
          )}
          isDecimalDimmed={false}
        />
        <ul className="flex flex-row gap-6 mt-3">
          <li className="flex flex-col gap-1">
            <span className="text-txtfade text-sm font-semibold">
              Entry Price
            </span>
            <span className="font-mono">{formatPriceInfo(position.price)}</span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-txtfade text-sm font-semibold">
              Mark Price
            </span>
            <span className="font-mono">
              {formatPriceInfo(
                tokenPrices[getTokenSymbol(position.token.symbol)],
              )}
            </span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-txtfade text-sm font-semibold">
              Opened on
            </span>
            <span className="font-mono">
              {new Date('07/09/2024').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',

                minute: 'numeric',
                hour: 'numeric',
              })}
            </span>
          </li>
        </ul>

        <Image
          src={alpMonster}
          alt="ALP Monster"
          className="absolute top-0 right-0 -scale-[-1] -z-10 grayscale-[100%] opacity-40"
          width={200}
        />
      </div>

      <div className="relative h-[200px] mt-3">
        <div className="absolute w-full h-[50px] bg-gradient-to-b from-secondary to-transparent" />
        <TradingviewLight token={position.token} positions={[position]} />
        <div className="absolute bottom-0 w-full h-[50px] bg-gradient-to-t from-secondary to-transparent" />
      </div>
      <div className="p-5 mt-3">
        <Button title="Share" className="w-full h-[40px]" />
      </div>
    </div>
  );
}
