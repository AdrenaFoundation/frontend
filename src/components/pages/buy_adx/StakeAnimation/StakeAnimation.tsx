import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';

import walletIcon from '../../../../../public/images/wallet-icon.svg';
import StakeTimerAnimation from './StakeTimerAnimation';

export default function StakeAnimation({
  isADX = false,
  title,
  subtitle,
}: {
  isADX?: boolean;
  title: string;
  subtitle: string;
}) {
  const c1Initial = {
    amount: 1200,
    daysLocked: 90,
    remaining: '12d 22h 02m',
    countdown: 45,
  };
  const c2Initial = {
    amount: 600,
    daysLocked: 720,
    remaining: '702d 09h 23m',
    countdown: 55,
  };
  const c3Initial = {
    amount: 500,
    daysLocked: 360,
    remaining: '122d 12h 41m',
    countdown: 25,
  };

  const [countdown1, setCountdown1] = useState(c1Initial.countdown);
  const [countdown2, setCountdown2] = useState(c2Initial.countdown);
  const [countdown3, setCountdown3] = useState(c3Initial.countdown);

  const [usdcBalance, setUsdcBalance] = useState(1200);
  const [adxBalance, setAdxBalance] = useState(500);

  const usdcToken = window.adrena.client.tokens.find(
    (token) => token.symbol === 'USDC',
  );

  const countUsdc = useMotionValue(0);
  const roundedUsdc = useTransform(countUsdc, (latest) => Math.round(latest));

  const countAdx = useMotionValue(0);
  const roundedAdx = useTransform(countAdx, (latest) => Math.round(latest));

  useEffect(() => {
    const controlsUsdc = animate(countUsdc, usdcBalance);
    const controlsAdx = animate(countAdx, adxBalance);

    return () => {
      controlsUsdc.stop();
      controlsAdx.stop();
    };
  }, [adxBalance, countAdx, countUsdc, usdcBalance]);

  return (
    <div className="flex flex-col md:flex-row gap-[30px] justify-between items-center mb-[200px]">

      <div className="w-full">
        <div className="max-w-[600px] md:ml-auto">
          <div className="flex flex-row gap-3 lg:gap-6 p-3 rounded-lg mb-[50px]">
            <div className="opacity-50">
              <Image
                src={walletIcon}
                className="w-5 h-5 inline-block mr-1"
                alt="alp logo"
              />
              <p className="inline-block text-base">Wallet</p>
            </div>

            <div className="flex flex-row items-center gap-1">
              {usdcToken && (
                <Image
                  src={usdcToken.image}
                  className="w-4 h-4"
                  alt="alp logo"
                />
              )}
              <div className="font-mono text-sm md:text-base">
                <motion.div className="inline-block font-mono">
                  {roundedUsdc}
                </motion.div>{' '}
                USDC
              </div>
            </div>

            <div className="flex flex-row items-center gap-1">
              <Image
                src={window.adrena.client.adxToken.image}
                className="w-4 h-4"
                alt="alp logo"
              />

              <div className="font-mono text-sm md:text-base">
                <motion.div className="inline-block font-mono">
                  {roundedAdx}
                </motion.div>{' '}
                ADX
              </div>
            </div>
          </div>

          <div className="relative py-1 border-l flex flex-col gap-9 justify-between">
            <StakeTimerAnimation
              isADX={isADX}
              initial={c1Initial}
              countdown={countdown1}
              setCountdown={setCountdown1}
              setUsdcBalance={setUsdcBalance}
              usdcBalance={usdcBalance}
              adxBalance={adxBalance}
              setAdxBalance={setAdxBalance}
            />

            <StakeTimerAnimation
              isADX={isADX}
              initial={c2Initial}
              countdown={countdown2}
              setCountdown={setCountdown2}
              setUsdcBalance={setUsdcBalance}
              usdcBalance={usdcBalance}
              adxBalance={adxBalance}
              setAdxBalance={setAdxBalance}
            />

            <StakeTimerAnimation
              isADX={isADX}
              initial={c3Initial}
              countdown={countdown3}
              setCountdown={setCountdown3}
              setUsdcBalance={setUsdcBalance}
              usdcBalance={usdcBalance}
              adxBalance={adxBalance}
              setAdxBalance={setAdxBalance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
