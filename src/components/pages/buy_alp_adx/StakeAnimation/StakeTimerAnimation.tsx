import { AnimatePresence, motion } from 'framer-motion';
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
}: {
  initial: {
    daysLocked: number;
    countdown: number;
  };
  countdown: number;
  setCountdown: (countdown: number) => void;
  setUsdcBalance: (balance: number) => void;
}) {
  const [cooldown, setCooldown] = useState(false);
  const usdcToken = window.adrena.client.tokens.find(
    (token) => token.symbol === 'USDC',
  );

  const USDC_PATHS = [
    { x: [0, 10], y: [0, -10], token: usdcToken?.image },
    { x: [0, 50], y: [0, -30], token: usdcToken?.image },
    {
      x: [0, 30],
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

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (cooldown) return;

  //     setCountdown((prevSeconds) => {
  //       if (prevSeconds === 0) {
  //         setUsdcBalance((prev) => prev + 20);
  //         setCooldown(true);
  //         setTimeout(() => {
  //           setCooldown(false);
  //           setCountdown(initial.countdown);
  //         }, 5000);
  //         return 0;
  //       } else {
  //         return prevSeconds - 1;
  //       }
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [cooldown]);

  console.log('countdown', countdown);
  return (
    <div className="flex flex-row gap-3 items-center">
      <div className="flex flex-row items-center">
        <div className="w-[20px] h-[1px] bg-bcolor" />
        <div className="w-[12px] h-[12px] bg-bcolor rounded-full" />
      </div>
      <div
        className={twMerge(
          'relative flex flex-row items-center border border-bcolor bg-third justify-between  w-full p-4 rounded-lg transition duration-300',
        )}
      >
        <div className="flex flex-row items-center gap-3">
          <Image
            src={window.adrena.client.alpToken.image}
            className="w-6 h-6"
            alt="alp logo"
          />
          <FormatNumber nb={1200} className="text-xl font-bold" suffix=" ALP" />
          <div className="flex flex-row gap-1 items-center opacity-50">
            <Image src={lockIcon} className="w-3 h-3" alt="lock icon" />
            <FormatNumber
              nb={initial.daysLocked}
              className="text-base"
              suffix=" Days"
            />
          </div>
        </div>

        <p className="font-mono text-lg">
          {initial.daysLocked}d 22h 23m {countdown}s left
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
                    transitionEnd: { opacity: 0 },
                  }
                : {}
            }
            transition={{
              duration: index * 0.5 + 1,
              delay: index * 0.5,
              times: [0, 0.5, 1],
            }}
            className="absolute flex-none"
            key={index}
          >
            {token && <Image src={token} className="w-4 h-4" alt="lock icon" />}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
