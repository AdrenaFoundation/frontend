import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';

import lockIcon from '../../../../../public/images/Icons/lock.svg';

export default function StakeTimerAnimation({
  initial,
  countdown,
  setCountdown,
  setUsdcBalance,
  usdcBalance,
  adxBalance,
  setAdxBalance,
  isADX,
}: {
  initial: {
    amount: number;
    daysLocked: number;
    countdown: number;
    remaining: string;
    isADX?: boolean;
  };
  countdown: number;
  setCountdown: (countdown: number) => void;
  setUsdcBalance: (balance: number) => void;
  usdcBalance: number;
  adxBalance: number;
  setAdxBalance: (balance: number) => void;
  isADX?: boolean;
}) {
  const [cooldown, setCooldown] = useState(false);
  const [randomCountdown, setRandomCountdown] = useState(0);

  const usdcToken = window.adrena.client.tokens.find(
    (token) => token.symbol === 'USDC',
  );

  const USDC_PATHS = [
    { x: [0, 10], y: [0, -10], token: usdcToken?.image },
    { x: [0, 50], y: [0, -30], token: usdcToken?.image },
    {
      x: [0, 60],
      y: [0, -50],
      token: window.adrena.client.adxToken.image,
    },
    { x: [0, -30], y: [0, -20], token: usdcToken?.image },
    {
      x: [0, 10],
      y: [0, -10],
      token: window.adrena.client.adxToken.image,
    },
    {
      x: [0, 5],
      y: [0, -30],
      token: window.adrena.client.adxToken.image,
    },
  ];

  const reset = () => {
    const random = Math.floor(Math.random() * 11) + 5;

    setCooldown(true);
    setUsdcBalance(usdcBalance + 100 * random);
    setAdxBalance(adxBalance + 50 * random);

    setTimeout(() => {
      setCooldown(false);
    }, 1000);

    setTimeout(() => {
      setCountdown(initial.countdown);
      setRandomCountdown(random);
    }, 5000);
  };

  useEffect(() => {
    if (randomCountdown === 0) {
      reset();
      return;
    }

    const interval = setInterval(() => {
      setRandomCountdown(randomCountdown - 1);
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [randomCountdown]);

  return (
    <div className="flex flex-row gap-3 items-center">
      <div className="flex flex-row items-center">
        <div className="w-[20px] h-[1px] bg-bcolor" />
        <div className="w-[12px] h-[12px] bg-bcolor rounded-full" />
      </div>
      <div
        className={twMerge(
          'relative flex flex-row items-center border border-bcolor bg-third justify-between  w-full p-2 md:p-4 rounded-md transition duration-300',
        )}
      >
        <div className="flex flex-row items-center gap-3">
          <Image
            src={
              isADX
                ? window.adrena.client.adxToken.image
                : window.adrena.client.alpToken.image
            }
            className="w-6 h-6"
            alt={isADX ? 'adx logo' : 'alp logo'}
            width={24}
            height={24}
          />
          <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3">
            <FormatNumber
              nb={initial.amount}
              className="text-sm lg:text-lg font-bold"
              suffix={isADX ? ' ADX' : ' ALP'}
            />
            <div className="flex flex-row gap-1 items-center opacity-50">
              <Image
                src={lockIcon}
                className="w-3 h-3"
                alt="lock icon"
                width={12}
                height={12}
              />
              <FormatNumber
                nb={initial.daysLocked}
                className="text-sm lg:text-base"
                suffix="Days"
              />
            </div>
          </div>
        </div>

        <p className="font-mono text-sm">
          {initial.remaining} {countdown}s left
        </p>

        {USDC_PATHS.map(({ x, y, token }, index) => (
          <motion.span
            initial={{ opacity: 0 }}
            animate={
              cooldown
                ? {
                    translateX: x,
                    translateY: y,
                    opacity: 1,
                  }
                : {
                    translateX: x[1] + 10,
                    translateY: y[1] - 100,
                    opacity: 0,
                  }
            }
            transition={{
              duration: 0.5,
              // delay: (index / 2) * 0.5,
              type: 'tween',
            }}
            className="absolute flex-none"
            key={index}
          >
            {token && (
              <Image
                src={token}
                className="w-4 h-4"
                alt="lock icon"
                width={16}
                height={16}
              />
            )}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
