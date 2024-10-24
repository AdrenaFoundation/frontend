import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import {
  encodeBase64Url,
  formatNumber,
  formatPriceInfo,
  getTokenImage,
  getTokenSymbol,
} from '@/utils';

import adrenaLogo from '../../../../../public/images/logo.svg';
import monster1 from '../../../../../public/images/monster_1.png';
import monster2 from '../../../../../public/images/monster_2.png';
import monster3 from '../../../../../public/images/monster_3.png';
import monster4 from '../../../../../public/images/monster_4.png';
import xIcon from '../../../../../public/images/x-black-bg.png';

export default function SharePositionModal({
  position,
}: {
  position: PositionExtended;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const [isPnlUsd, setIsPnlUsd] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [option, setOption] = useState(0);

  const OPTIONS = [
    {
      id: 0,
      img: monster1,
      gradient: ['#625320', '#625320'],
    },
    {
      id: 1,
      img: monster2,
      gradient: ['#84194C', '#D40E27'],
    },
    {
      id: 2,
      img: monster3,
      gradient: ['#376624', '#8FCA77'],
    },
    {
      id: 3,
      img: monster4,
      gradient: ['#1F6773', '#6F2474'],
    },
  ];

  const fees = -((position.exitFeeUsd ?? 0) + (position.borrowFeeUsd ?? 0));

  const pnlPercentage = position.pnl
    ? ((position.pnl - fees) / position.collateralUsd) * 100
    : undefined;

  const pnlUsd = position.pnl ? position.pnl - fees : undefined;

  const openedOn = new Date(
    Number(position.nativeObject.openTime) * 1000,
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    minute: 'numeric',
    hour: 'numeric',
  });

  const params = {
    opt: option,
    pnl: formatNumber(pnlPercentage ?? 0, 2),
    pnlUsd: pnlUsd ?? 0,
    isPnlUsd: isPnlUsd,
    side: position.side,
    symbol: getTokenSymbol(position.token.symbol),
    collateral: position.collateralUsd,
    mark: formatNumber(
      tokenPrices[getTokenSymbol(position.token.symbol)] ?? 0,
      2,
    ),
    price: position.price,
    size: position.sizeUsd,
    opened: Number(position.nativeObject.openTime) * 1000,
  };

  const encodedParams = encodeBase64Url(params);

  const shortenedUrl = `/position?data=${encodedParams}`;

  const twitterText = `I just made ${isPnlUsd ? `$${pnlUsd?.toFixed(2)}` : `${pnlPercentage?.toFixed(2)}%`
    } on ${position.side} position on ${position.token.symbol}!`;

  return (
    <div className="max-w-[600px] p-5">
      <div
        className="relative p-5 h-[230px] sm:h-[300px] border border-bcolor overflow-hidden rounded-lg bg bg-secondary"
        ref={cardRef}
      >
        <Image src={adrenaLogo} alt="Adrena Logo" height={8} className="mb-3" />
        <div className="flex flex-row gap-3 items-center relative z-10">
          <div className="flex flex-row items-center gap-2">
            <Image
              src={getTokenImage(position.token)}
              alt="Adrena Logo"
              height={20}
            />
            <h2 className="archivo-black">
              {getTokenSymbol(position.token.symbol)}
            </h2>
          </div>

          <div
            className={twMerge(
              'rounded-md  px-2',
              position.side === 'long' ? 'bg-green/20' : 'bg-red/20',
            )}
          >
            <p
              className={twMerge(
                'text-sm archivo-black capitalize',
                position.side === 'long' ? 'text-[#49d7ad]' : 'text-red',
              )}
            >
              {position.side}{' '}
              {formatNumber(position.sizeUsd / position.collateralUsd, 2)}x
            </p>
          </div>
        </div>
        <FormatNumber
          nb={isPnlUsd ? pnlUsd : pnlPercentage}
          format={isPnlUsd ? 'currency' : 'percentage'}
          className={twMerge(
            'text-[60px] sm:text-[70px] archivo-black relative z-10',
            pnlPercentage && pnlPercentage < 99 && 'sm:text-[85px]',
            pnlPercentage && pnlPercentage < 0
              ? 'bg-gradient-to-r from-[#F2485F]  to-red inline-block text-transparent bg-clip-text'
              : 'bg-gradient-to-r from-[#14d198]  to-green inline-block text-transparent bg-clip-text',
          )}
          isDecimalDimmed={false}
        />
        <ul className="flex flex-row gap-6 mt-[10px] sm:mt-7 relative z-10">
          <li className="flex flex-col gap-1">
            <span className="text-txtfade text-xs sm:text-sm font-semibold">
              Entry Price
            </span>
            <span className="archivo-black text-sm sm:text-lg">
              {formatPriceInfo(
                position.price,
                position.token.displayPriceDecimalsPrecision,
              )}
            </span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-txtfade text-xs sm:text-sm font-semibold">
              Mark Price
            </span>
            <span className="archivo-black text-sm sm:text-lg">
              {formatPriceInfo(
                tokenPrices[getTokenSymbol(position.token.symbol)],
              )}
            </span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-txtfade text-xs sm:text-sm font-semibold">
              Opened on
            </span>
            <span className="archivo-black text-sm sm:text-lg">{openedOn}</span>
          </li>
        </ul>

        <div className="absolute top-0 left-0 bg-[url('https://as2.ftcdn.net/v2/jpg/01/22/79/11/1000_F_122791110_aGlDtSjVieyAN8qbXl5q7M5SkSm2doV4.jpg')] w-full h-full opacity-5" />

        <motion.div
          animate={{
            opacity: 0.2,
            backgroundColor: OPTIONS[option].gradient[0],
          }}
          className="absolute bottom-[-80px] left-[-30px] w-[300px] h-[300px] blur-[30px] rounded-full"
        />
        <motion.div
          animate={{
            opacity: 0.2,
            backgroundColor: OPTIONS[option].gradient[1],
          }}
          className="absolute top-[-80px] right-[-30px] w-[300px] h-[300px] blur-[30px] rounded-full"
        />
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: 50 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 right-0 -scale-[-1]"
            key={OPTIONS[option].id}
          >
            <Image
              src={OPTIONS[option].img}
              alt="Monster"
              loading="eager"
              className="select-none w-[100px] sm:w-[200px] opacity-100"
              draggable="false"
              key={OPTIONS[option].id}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="opacity-50 mb-3 mt-6">Customize</p>

      <div className="flex flex-row gap-3">
        {OPTIONS.map((opt) => (
          <div
            className={twMerge(
              'border rounded-lg h-[50px] flex-1 cursor-pointer p-2 transition duration-300',
              opt.id === option ? 'border-white' : 'border-bcolor',
            )}
            onClick={() => setOption(opt.id)}
            key={`color-${opt.id}`}
          >
            <div
              className="flex items-center justify-center w-full h-full rounded-lg overflow-hidden"
              style={{
                background: `linear-gradient(90deg, ${opt.gradient[0]} 0%, ${opt.gradient[1]} 60%)`,
              }}
            >
              <Image
                src={opt.img}
                alt="Monster"
                width={200}
                loading="eager"
                draggable="false"
                className="opacity-50 ml-auto mt-[30px] hover:translate-y-[-10px] transition duration-300"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <div
          className="flex flex-row justify-between gap-3 bg-secondary border border-bcolor p-3 rounded-md cursor-pointer select-none"
          onClick={() => setIsPnlUsd(!isPnlUsd)}
        >
          <p className="font-boldy text-base">Display PnL in USD</p>
          <label className="flex items-center ml-1 cursor-pointer">
            <Switch
              className="mr-0.5"
              checked={isPnlUsd}
              onChange={() => {
                // Handle the click on the level above
              }}
              size="large"
            />
          </label>
        </div>
      </div>
      <div className="mt-3">
        <Button
          size="lg"
          title="Share on"
          className="w-full mt-6 py-3 text-base"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            twitterText,
          )}&url=${encodeURIComponent(
            `https://${window.location.hostname}/${shortenedUrl}`,
          )}`}
          isOpenLinkInNewTab
          rightIcon={xIcon}
          rightIconClassName="w-4 h-4"
        />
      </div>
    </div>
  );
}
