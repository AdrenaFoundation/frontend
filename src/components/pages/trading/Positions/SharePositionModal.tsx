import { createHash, randomBytes } from 'crypto';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import {
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

  const createShortHash = () => {
    const randomValue = randomBytes(16).toString('hex');
    let hash = createHash('sha256').update(randomValue).digest('base64');
    hash = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return hash.substring(0, 8);
  };

  const fees = -((position.exitFeeUsd ?? 0) + (position.borrowFeeUsd ?? 0));

  const pnlPercentage = position.pnl
    ? ((position.pnl - fees) / position.collateralUsd) * 100
    : undefined;

  const openedOn = new Date(
    Number(position.nativeObject.openTime) * 1000,
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    minute: 'numeric',
    hour: 'numeric',
  });

  const twitterText = `I just made ${formatNumber(pnlPercentage ?? 0, 2)}% on ${position.side
    } position on ${position.token.symbol}!`;

  const twitterUrl = `https://frontend-devnet-git-pnlshare-adrena.vercel.app/position?opt=${option}&pnl=${formatNumber(
    pnlPercentage ?? 0,
    2,
  )}&side=${position.side}&symbol=${getTokenSymbol(
    position.token.symbol,
  )}&collateral=${position.collateralUsd}&mark=${formatNumber(
    tokenPrices[getTokenSymbol(position.token.symbol)] ?? 0,
    2,
  )}&price=${position.price}&size=${position.sizeUsd}&opened=${Number(position.nativeObject.openTime) * 1000
    }`;

  const getTinyUrl = async (url: string) => {
    const params = {
      url,
      domain: 'tinyurl.com',
      alias: 'adrena-' + createShortHash(),
      description: 'Adrena Protocol',
    };

    try {
      const key = process.env.NEXT_PUBLIC_URL_KEY;
      const response = await fetch('https://api.tinyurl.com/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(params),
      });

      const { data } = await response.json();

      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          twitterText,
        )}&url=${encodeURIComponent(data.tiny_url)}`,
        '_blank',
      );
    } catch (error) {
      console.log(error);
    }
  };

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
                position.side === 'long' ? 'text-green' : 'text-red',
              )}
            >
              {position.side}{' '}
              {formatNumber(position.sizeUsd / position.collateralUsd, 2)}x
            </p>
          </div>
        </div>
        <FormatNumber
          nb={pnlPercentage}
          format="percentage"
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
            <span className="text-txtfade text-sm font-semibold">
              Entry Price
            </span>
            <span className="archivo-black text-base sm:text-lg">
              {formatPriceInfo(position.price)}
            </span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-txtfade text-sm font-semibold">
              Mark Price
            </span>
            <span className="archivo-black text-base sm:text-lg">
              {formatPriceInfo(
                tokenPrices[getTokenSymbol(position.token.symbol)],
              )}
            </span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-txtfade text-sm font-semibold">
              Opened on
            </span>
            <span className="archivo-black text-base sm:text-lg">
              {openedOn}
            </span>
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
            className="absolute bottom-0 right-0 -scale-[-1]"
            key={OPTIONS[option].id}
          >
            <Image
              src={OPTIONS[option].img}
              alt="Monster"
              loading="eager"
              className="select-none w-[500px] sm:w-[200px] opacity-10 sm:opacity-100"
              draggable="false"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-row gap-3 mt-3">
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
                className="opacity-50 ml-auto mt-[30px] hover:translate-y-[-10px] transition duration-300"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Button
          size="lg"
          title="Share on"
          className="w-full mt-6 py-3 text-base"
          onClick={() => getTinyUrl(twitterUrl)}
          isOpenLinkInNewTab
          rightIcon={xIcon}
          rightIconClassName="w-4 h-4"
        />
      </div>
    </div>
  );
}
