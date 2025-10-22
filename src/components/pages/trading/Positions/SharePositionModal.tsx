import { AnimatePresence, motion } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { PositionExtended, UserProfileExtended } from '@/types';
import {
  addNotification,
  formatNumber,
  formatPriceInfo,
  getTokenImage,
  getTokenSymbol,
} from '@/utils';

import dialectLogo from '../../../../../public/images/dialect-logo.svg';
import adrenaLogo from '../../../../../public/images/logo.svg';
import monster1 from '../../../../../public/images/monster_1.png';
import monster2 from '../../../../../public/images/monster_2.png';
import monster3 from '../../../../../public/images/monster_3.png';
import monster4 from '../../../../../public/images/monster_4.png';
import xLogo from '../../../../../public/images/x-black-bg.png';

const MONSTER_OPTIONS = [
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
] as const;

const IMAGE_OPTIONS = {
  quality: 1,
  pixelRatio: 4,
  cacheBust: true,
  includeQueryParams: true,
} as const;

const isCorsError = (error: unknown): boolean => {
  const message = error?.toString() || '';
  return (
    message.includes('cssRules') ||
    message.includes('CSS rules') ||
    message.includes('SecurityError') ||
    message.includes('Failed to read') ||
    message.includes('Error while reading CSS') ||
    message.includes('Error inlining remote css file')
  );
};

export default function SharePositionModal({
  position,
  userProfile,
}: {
  position: PositionExtended & { exitPrice?: number };
  userProfile: UserProfileExtended | false | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [isPnlUsd, setIsPnlUsd] = useState(false);
  const [isPnlWFees, setIsPnlWFees] = useState(false);
  const [option, setOption] = useState(0);

  const fees = -((position.exitFeeUsd ?? 0) + (position.borrowFeeUsd ?? 0));
  const adjustedPnl = position.pnl
    ? position.pnl - (!isPnlWFees ? fees : 0)
    : 0;
  const pnlPercentage = position.pnl
    ? (adjustedPnl / position.collateralUsd) * 100
    : undefined;
  const pnlUsd = adjustedPnl;

  const openedOn = new Date(
    Number(position.nativeObject.openTime) * 1000,
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    minute: 'numeric',
    hour: 'numeric',
  });

  const referralLink = useMemo(
    () =>
      userProfile && userProfile.nickname
        ? `https://adrena.trade/trade?referral=${encodeURIComponent(userProfile.nickname)}`
        : null,
    [userProfile],
  );

  const blinkParams = useMemo(() => {
    if (position?.exitPrice) return null;

    const params: Record<string, string | number | boolean> = {
      tokenSymbolB: position.token.symbol,
      tokenSymbolA: position.collateralToken.symbol,
      collateralAmount: position.collateralAmount,
      symbol: getTokenSymbol(position.token.symbol),
      price: position.price,
      leverage: formatNumber(position.sizeUsd / position.collateralUsd, 2),
      side: position.side,
      referrer: position.owner.toBase58(),
      mark: formatNumber(
        tokenPrices[getTokenSymbol(position.token.symbol)] ?? 0,
        2,
      ),
      opened: Number(position.nativeObject.openTime) * 1000,
      size: position.sizeUsd,
      opt: option,
      pnl: formatNumber(pnlPercentage ?? 0, 2),
      pnlUsd: pnlUsd,
      isPnlUsd: isPnlUsd,
      exitPrice: position?.exitPrice ?? 0,
      collateralUsd: position.collateralUsd,
    };

    return new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString();
  }, [position, tokenPrices, option, pnlPercentage, pnlUsd, isPnlUsd]);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;

    const originalError = console.error;
    console.error = (...args) => {
      if (!isCorsError(args[0])) originalError(...args);
    };

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, IMAGE_OPTIONS);
      const link = document.createElement('a');
      link.download = `adrena-pnl-${position.token.symbol}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      if (!isCorsError(error)) {
        console.error('Failed to download image:', error);
        addNotification({
          title: 'Failed to download image',
          message: 'Please try again',
          type: 'error',
          duration: 'regular',
        });
      }
    } finally {
      console.error = originalError;
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;

    const originalError = console.error;
    console.error = (...args) => {
      if (!isCorsError(args[0])) originalError(...args);
    };

    try {
      const blob = await htmlToImage.toBlob(cardRef.current, IMAGE_OPTIONS);
      if (!blob) throw new Error('Failed to create image blob');

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);

      addNotification({
        title: 'Image copied to clipboard',
        message: 'Ready to share on social media!',
        type: 'success',
        duration: 'regular',
      });
    } catch (error) {
      if (isCorsError(error)) {
        addNotification({
          title: 'Image copied to clipboard',
          message: 'Ready to share on social media!',
          type: 'success',
          duration: 'regular',
        });
        return;
      }

      console.error('Failed to copy to clipboard:', error);
      addNotification({
        title: 'Failed to copy image',
        message: 'Please try downloading instead',
        type: 'error',
        duration: 'regular',
      });
      throw error;
    } finally {
      console.error = originalError;
    }
  };

  const handleShareTwitter = async () => {
    try {
      await handleCopyImage();
    } catch (error) {
      console.error('Failed to copy image, opening Twitter anyway:', error);
    }

    const baseText = `I just made ${
      isPnlUsd ? `$${pnlUsd?.toFixed(2)}` : `${pnlPercentage?.toFixed(2)}%`
    } on ${position.side} position on $${position.token.symbol}!`;

    const tweetContent = referralLink
      ? `${baseText}\n\nCome trade with me on @AdrenaProtocol:\n${referralLink}`
      : `${baseText}\n\nCome trade with me on @AdrenaProtocol`;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`,
      '_blank',
    );
  };

  return (
    <div className="max-w-[37.5rem] p-5">
      <div
        className="relative p-5 h-[14.375rem] sm:h-[18.75rem] border border-bcolor overflow-hidden rounded-lg bg bg-secondary"
        ref={cardRef}
        data-card-ref
      >
        <Image src={adrenaLogo} alt="Adrena Logo" width={0} height={0} style={{ width: 'auto', height: '8px' }} className="mb-3" />
        <div className="flex flex-row gap-3 items-center relative z-10">
          <div className="flex flex-row items-center gap-2">
            <Image
              src={getTokenImage(position.token)}
              alt="Adrena Logo"
              width={0}
              height={0}
              style={{ width: 'auto', height: '20px' }}
            />
            <h2 className="font-archivoblack">
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
                'text-sm font-archivoblack capitalize',
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
            'text-[3.75rem] sm:text-[4.375rem] font-archivoblack relative z-10',
            pnlPercentage && pnlPercentage < 99 && 'sm:text-[5.3125rem]',
            pnlPercentage && pnlPercentage < 0
              ? 'bg-gradient-to-r from-[#F2485F]  to-red inline-block text-transparent bg-clip-text'
              : 'bg-gradient-to-r from-[#14d198]  to-green inline-block text-transparent bg-clip-text',
          )}
          isDecimalDimmed={false}
          data-gradient-text
          data-negative={pnlPercentage ? pnlPercentage < 0 : false}
        />
        <ul className="flex flex-row gap-6 mt-[0.625rem] sm:mt-7 relative z-10">
          <li className="flex flex-col gap-1">
            <span className="text-txtfade text-xs sm:text-sm font-semibold">
              Entry Price
            </span>
            <span className="font-archivoblack text-sm sm:text-lg">
              {formatPriceInfo(
                position.price,
                position.token.displayPriceDecimalsPrecision,
              )}
            </span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-txtfade text-xs sm:text-sm font-semibold">
              {position?.exitPrice ? 'Exit Price' : 'Mark Price'}
            </span>
            <span className="font-archivoblack text-sm sm:text-lg">
              {position?.exitPrice
                ? formatPriceInfo(
                  position.exitPrice,
                  position.token.displayPriceDecimalsPrecision,
                )
                : formatPriceInfo(
                  tokenPrices[getTokenSymbol(position.token.symbol)],
                )}
            </span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-txtfade text-xs sm:text-sm font-semibold">
              Opened on
            </span>
            <span className="font-archivoblack text-sm sm:text-lg">
              {openedOn}
            </span>
          </li>
        </ul>

        <div className="absolute top-0 left-0 bg-[url('https://as2.ftcdn.net/v2/jpg/01/22/79/11/1000_F_122791110_aGlDtSjVieyAN8qbXl5q7M5SkSm2doV4.jpg')] w-full h-full opacity-5" />

        <motion.div
          animate={{
            opacity: 0.2,
            backgroundColor: MONSTER_OPTIONS[option].gradient[0],
          }}
          className="absolute bottom-[-5rem] left-[-1.875rem] w-[18.75rem] h-[18.75rem] blur-[1.875rem] rounded-full"
        />
        <motion.div
          animate={{
            opacity: 0.2,
            backgroundColor: MONSTER_OPTIONS[option].gradient[1],
          }}
          className="absolute top-[-5rem] right-[-1.875rem] w-[18.75rem] h-[18.75rem] blur-[1.875rem] rounded-full"
        />
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: 50 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 right-0 -scale-[-1]"
            key={MONSTER_OPTIONS[option].id}
          >
            <Image
              src={MONSTER_OPTIONS[option].img}
              alt="Monster"
              loading="eager"
              className="select-none w-[6.25rem] sm:w-[12.5rem] opacity-100"
              draggable="false"
              key={MONSTER_OPTIONS[option].id}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="opacity-50 mb-3 mt-6">Customize</p>

      <div className="flex flex-row gap-3">
        {MONSTER_OPTIONS.map((opt) => (
          <div
            className={twMerge(
              'border rounded-lg h-[3.125rem] flex-1 cursor-pointer p-2 transition duration-300',
              opt.id === option ? 'border-white' : 'border-bcolor',
            )}
            onClick={() => setOption(opt.id)}
            key={`monster-${opt.id}`}
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
                height={200}
                loading="eager"
                draggable="false"
                className="opacity-50 ml-auto mt-[1.875rem] hover:translate-y-[-0.625rem] transition duration-300"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-3">
        <div
          className="flex flex-row justify-between gap-3 bg-secondary border border-bcolor p-3 rounded-md cursor-pointer select-none"
          onClick={() => setIsPnlUsd(!isPnlUsd)}
        >
          <p className="font-semibold text-base">Display PnL in USD</p>
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

        <div
          className="flex flex-row justify-between gap-3 bg-secondary border border-bcolor p-3 rounded-md cursor-pointer select-none"
          onClick={() => setIsPnlWFees(!isPnlWFees)}
        >
          <p className="font-semibold text-base">Display PnL with fees</p>
          <label className="flex items-center ml-1 cursor-pointer">
            <Switch
              className="mr-0.5"
              checked={isPnlWFees}
              onChange={() => {
                // Handle the click on the level above
              }}
              size="large"
            />
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-3 mt-3">
        <div className="flex flex-row items-center gap-3">
          <Button
            size="lg"
            title="Download Image"
            className="w-full py-3 text-base flex-1"
            onClick={handleDownloadImage}
          />

          <Button
            size="lg"
            title="Copy Image"
            className="w-full py-3 text-base flex-1"
            onClick={handleCopyImage}
          />
        </div>

        <Button
          size="lg"
          title="Share on X (just paste your PnL image)"
          className="w-full py-3 text-base"
          onClick={handleShareTwitter}
          leftIcon={xLogo}
          leftIconClassName="w-4 h-4"
        />

        {blinkParams && (
          <Button
            size="lg"
            title="Share a Blink"
            className="w-full py-3 text-base"
            leftIcon={dialectLogo}
            leftIconClassName="w-4 h-4"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `Copy my position on $${position.token.symbol}! @AdrenaProtocol`,
            )}&url=${encodeURIComponent(
              `https://dial.to/?action=${encodeURIComponent(
                `solana-action:https://${window.location.hostname}/api/blink/openPosition?${blinkParams}`,
              )}`,
            )}`}
            isOpenLinkInNewTab
          />
        )}
      </div>
    </div>
  );
}
