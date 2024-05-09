import { animate } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { formatNumber } from '@/utils';

import walletIcon from '../../../../../public/images/wallet-icon.svg';
import StakeTimerAnimation from './StakeTimerAnimation';

export default function StakeAnimation() {
  const c1Initial = { daysLocked: 90, countdown: 15 };
  const c2Initial = { daysLocked: 720, countdown: 15 };
  const c3Initial = { daysLocked: 360, countdown: 15 };

  const [countdown1, setCountdown1] = useState(c1Initial.countdown);
  const [countdown2, setCountdown2] = useState(c2Initial.countdown);
  const [countdown3, setCountdown3] = useState(c3Initial.countdown);

  const nodeRef = useRef(null);
  const [usdcBalance, setUsdcBalance] = useState(2001932);

  const usdcToken = window.adrena.client.tokens.find(
    (token) => token.symbol === 'USDC',
  );

  return (
    <div className="flex flex-col sm:flex-row gap-[30px] justify-between items-center mb-[200px]">
      <div className="w-full">
        <h1 className="text-[36px] mb-1">LOCK YOUR ALP</h1>
        <p className="text-[24px]">
          Optionally, amplify the revenues by lock staking: the longer the lock,
          the higher the multiplier.
        </p>
      </div>

      <div className="w-full">
        <div className="w-[600px] m-auto">
          <div className="flex flex-row gap-6 p-3 rounded-lg mb-[50px]">
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
              {/* <FormatNumber nb={2001932} className="text-base" suffix=" USDC" /> */}
              <p ref={nodeRef} className="text-base">
                <FormatNumber nb={usdcBalance} suffix=" USDC" />
              </p>
            </div>

            <div className="flex flex-row items-center gap-1">
              <Image
                src={window.adrena.client.adxToken.image}
                className="w-4 h-4"
                alt="alp logo"
              />
              <FormatNumber nb={1200} className="text-base" suffix=" ADX" />
            </div>
          </div>

          <div className="relative py-1 border-l flex flex-col gap-9 justify-between">
            <StakeTimerAnimation
              initial={c1Initial}
              countdown={countdown1}
              setCountdown={setCountdown1}
              setUsdcBalance={setUsdcBalance}
            />

            <StakeTimerAnimation
              initial={c2Initial}
              countdown={countdown2}
              setCountdown={setCountdown2}
              setUsdcBalance={setUsdcBalance}
            />

            <StakeTimerAnimation
              initial={c3Initial}
              countdown={countdown3}
              setCountdown={setCountdown3}
              setUsdcBalance={setUsdcBalance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
