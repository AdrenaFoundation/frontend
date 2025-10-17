import NumberFlow from '@number-flow/react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import adxLogo from '@/../public/images/adx.svg';
import alpLogo from '@/../public/images/alp.svg';
import arrowIcon from '@/../public/images/Icons/arrow-sm-45.svg';
import carrotLogo from '@/../public/images/logos/carrot.jpg';
import coingeckoLogo from '@/../public/images/logos/coingecko.jpg';
import dexscreenerLogo from '@/../public/images/logos/dexscreener.jpg';
import exponentLogo from '@/../public/images/logos/exponent.jpg';
import jupiterLogo from '@/../public/images/logos/jupiter.jpg';
import kaminoLogo from '@/../public/images/logos/kamino.jpg';
import loopscaleLogo from '@/../public/images/logos/loopscale.png';
import raydiumLogo from '@/../public/images/logos/raydium.jpg';
import rugcheckLogo from '@/../public/images/logos/rugcheck.jpg';
import sandglassLogo from '@/../public/images/logos/sandglass.jpg';
import useAPR from '@/hooks/useAPR';
import { useSelector } from '@/store/store';
import { ImageRef } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

import CopyButton from '../common/CopyButton/CopyButton';
import LiveIcon from '../common/LiveIcon/LiveIcon';
import GeneratedFlickerEffect from '../FlickeringGrid.tsx/GeneratedFlickerEffect';

const ADX_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA3NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI4LjM0MzEgLTAuMDAyNDQxNDFMMC42Nzc3MzQgNDcuMzQ1MUgxOS4yMTMyTDQ1LjczMTggLTAuMDAyNDQxNDFIMjguMzQzMVoiIGZpbGw9IndoaXRlIiBzdHlsZT0iZmlsbDp3aGl0ZTtmaWxsLW9wYWNpdHk6MTsiLz4KPHBhdGggZD0iTTU0LjQzMjYgMTYuMTYyNkgzNy4wNDM5TDQ4LjEyNTUgMzYuODQ4MkgyNS4wMzYxTDMyLjY2NjQgNDcuMzQ1NEg1NS4yNDg2SDczLjc4NDFMNTQuNDMyNiAxNi4xNjI2WiIgZmlsbD0id2hpdGUiIHN0eWxlPSJmaWxsOndoaXRlO2ZpbGwtb3BhY2l0eToxOyIvPgo8L3N2Zz4K';
const ALP_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTciIGhlaWdodD0iNTgiIHZpZXdCb3g9IjAgMCA1NyA1OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzM5M18yMTgpIj4KPHBhdGggZD0iTTIwLjU2OCA1Ny45OTkyTDkuOTkwNzIgNTEuNjA5NEwxOS42Mjc4IDM0LjIyMTdIMzcuMzc0Mkw0Ny4wMTEzIDUxLjYwOTRMMzYuNDM0IDU3Ljk5OTJMMzAuMzIyNyA0Ny4wMDEzSDI2LjY3OTRMMjAuNTY4IDU3Ljk5OTJaIiBmaWxsPSJ3aGl0ZSIgc3R5bGU9ImZpbGw6d2hpdGU7ZmlsbC1vcGFjaXR5OjE7Ii8+CjxwYXRoIGQ9Ik01Ni45OTkzIDMzLjQ4NTJIMzcuNzgzOEwyOC45MTA2IDE3LjM4NzdMMzguNDg5IDBMNDkuMDY2MyA2LjM4OTgzTDQzLjAxMzcgMTcuMzg3N0w0NC44MzU0IDIwLjc2N0g1Ni45OTkzVjMzLjQ4NTJaIiBmaWxsPSJ3aGl0ZSIgc3R5bGU9ImZpbGw6d2hpdGU7ZmlsbC1vcGFjaXR5OjE7Ii8+CjxwYXRoIGQ9Ik0xOS4yMTU1IDMzLjQ4NTJIMFYyMC43NjdIMTIuMTYzOUwxMy45ODU2IDE3LjM4NzdMNy45MzI5OSA2LjM4OTgzTDE4LjUxMDMgMEwyOC4wODg3IDE3LjM4NzdMMTkuMjE1NSAzMy40ODUyWiIgZmlsbD0id2hpdGUiIHN0eWxlPSJmaWxsOndoaXRlO2ZpbGwtb3BhY2l0eToxOyIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzM5M18yMTgiPgo8cmVjdCB3aWR0aD0iNTciIGhlaWdodD0iNTgiIGZpbGw9IndoaXRlIiBzdHlsZT0iZmlsbDp3aGl0ZTtmaWxsLW9wYWNpdHk6MTsiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K';
type TokenInfo = {
  symbol: string;
  price: number | null;
  apr: number | null;
  description: string;
  gradient: string;
  startGradient: string;
  endGradient: string;
  color: string;
  flickerColor: string;
  textColor: string;
  lineColor: string;
  bgColor: string;
  borderColor: string;
  icon: ImageRef;
  flickerSvgColor: string;
  base64Logo: string;
  ticker: string;
  titleColor: string;
  partners: {
    name: string;
    img: ImageRef;
    link: string;
    cta: string;
  }[];
};
export default function LandingRevShare() {
  const { aprs } = useAPR();
  const tokenPriceALP = useSelector((s) => s.tokenPrices.ALP);
  const tokenPriceADX = useSelector((s) => s.tokenPrices.ADX);

  const TOKEN_INFO: TokenInfo[] = [
    {
      symbol: 'ADX',
      price: tokenPriceADX,
      apr: aprs ? aprs.lm : null,
      description:
        'ADX votes in Adrena governance and gets 20% of USDC yield from platform fees.',
      gradient: 'from-[#FBCDCD] to-[#E33D3D]',
      startGradient: '#BE2222',
      titleColor: '#F8BCBC',

      endGradient: '#A7ABAE',
      color: '#290D0F',
      flickerColor: '#CD3737',
      textColor: 'text-[#FEB2B2]',
      lineColor: '#5D3233',
      bgColor: 'bg-gradient-to-br from-[#BD2121] to-[#541111]',
      borderColor: 'border-[#B65F5F]',
      icon: adxLogo,
      flickerSvgColor: '#EC6262',
      base64Logo: ADX_BASE64,
      ticker: 'AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw',
      partners: [
        {
          name: 'Rugcheck',
          img: rugcheckLogo,
          link: 'https://rugcheck.io/',
          cta: 'Open on Rugcheck',
        },
        {
          name: 'Dexscreener',
          img: dexscreenerLogo,
          link: 'https://dexscreener.com/solana/adrena',
          cta: 'Open on Dexscreener',
        },
        {
          name: 'Raydium',
          img: raydiumLogo,
          link: 'https://raydium.io/',
          cta: 'Open on Raydium',
        },
        {
          name: 'Jupiter',
          img: jupiterLogo,
          link: 'https://jupiter.exchange/',
          cta: 'Open on Jupiter',
        },
        {
          name: 'Coingecko',
          img: coingeckoLogo,
          link: 'https://www.coingecko.com/en/coins/adrena',
          cta: 'Open on Coingecko',
        },
      ],
    },
    {
      symbol: 'ALP',
      price: tokenPriceALP,
      apr: aprs ? aprs.lp : null,
      description:
        'ALP serves as the counter party for traders. Gets 70% of USDC yield from platform fees.',
      gradient: 'from-[#DBE1F2] to-[#7C98E9]',
      color: '#0A1837',
      flickerColor: '#5C6FDA',
      lineColor: '#314269',
      startGradient: '#264DCA',
      titleColor: '#C8D2F0',
      textColor: 'text-[#BEC8E7]',
      endGradient: '#A7ABAE',
      bgColor: 'bg-gradient-to-br from-[#244DCA] to-[#7D22CD]',
      borderColor: 'border-[#6682D9]',
      icon: alpLogo,
      flickerSvgColor: '#8D82ED',
      base64Logo: ALP_BASE64,
      ticker: '4yCLi5yWGzpTWMQ1iWHG5CrGYAdBkhyEdsuSugjDUqwj',
      partners: [
        {
          name: 'Sandglass',
          img: sandglassLogo,
          link: 'https://sandglass.finance/',
          cta: 'ADX incentives for ALP market',
        },
        {
          name: 'Kamino',
          img: kaminoLogo,
          link: 'https://kamino.finance/',
          cta: 'Multiply your yield with low-risk',
        },
        {
          name: 'Exponent',
          img: exponentLogo,
          link: 'https://exponent.fi/',
          cta: 'Earn Fixed Yield on ALP',
        },
        {
          name: 'Carrot',
          img: carrotLogo,
          link: 'https://www.carrot.io/',
          cta: 'Boost your ALP with leverage loop',
        },
        {
          name: 'Loopscale',
          img: loopscaleLogo,
          link: 'https://www.loopscale.com/',
          cta: 'Loop your ALP up to 5x',
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-[3.125rem] items-center w-full">
      <div>
        <h2 className="text-[3.3125rem] capitalize text-center bg-gradient-to-r from-[#959DF5] to-white bg-clip-text text-transparent">
          90% Revenue Share
        </h2>
        <p className="opacity-50 max-w-[37.5rem] text-center">
          Consolidate specs, milestones, tasks, and other documentation in one
          centralized location.
        </p>
      </div>

      <div className="flex flex-row flex-wrap gap-3 w-full">
        {TOKEN_INFO.map((token) => (
          <TokenCard key={token.symbol} token={token} />
        ))}
      </div>
    </div>
  );
}

const TokenCard = ({ token }: { token: TokenInfo }) => {
  const aprRef = useRef<HTMLDivElement>(null);
  const [aprValue, setAprValue] = useState<number | null>(null);
  const [activeLink, setActiveLink] = useState<string | null>(null);

  // Intersection Observer to animate APR when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setAprValue(token.apr);
            }, 500);
          }
        });
      },
      { threshold: 1 },
    );

    if (aprRef.current) {
      observer.observe(aprRef.current);
    }

    return () => {
      if (aprRef.current) {
        observer.unobserve(aprRef.current);
      }
    };
  }, [token.apr]);

  return (
    <div
      className={twMerge(
        'group border border-dotted border-white/25 rounded-xl p-2 w-full flex-1 cursor-pointer transition-all duration-300',
      )}
      style={{
        background: `repeating-linear-gradient(-45deg, ${token.lineColor}, ${token.lineColor} 1px, ${token.color} 1px, ${token.color} 5px)`,
      }}
    >
      <div
        className={twMerge(
          'relative p-3 rounded-xl border-2 overflow-hidden',
          token.bgColor,
          token.borderColor,
        )}
        style={{
          boxShadow:
            token.symbol === 'ALP'
              ? '0 0 1.25rem -0.1875rem #3b82f6'
              : '0 0 1.25rem -0.1875rem #C9243A',
        }}
      >
        <GeneratedFlickerEffect
          className="absolute inset-0"
          svgDataUrlForEffect={token.base64Logo}
          svgMaskGridSettingsForEffect={{
            color: token.flickerSvgColor,
            maxOpacity: 0.75,
            flickerChance: 0.18,
            squareSize: 3,
            gridGap: 4,
          }}
          backgroundGridSettingsForEffect={{
            color: token.flickerColor,
            maxOpacity: 0.4,
            flickerChance: 0.45,
            squareSize: 3,
            gridGap: 4,
          }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Image
              src={token.icon}
              alt={token.symbol}
              width={20}
              height={20}
              className="w-5 h-5 border border-white/30 rounded-full"
            />
            <span className="text-white font-semibold text-lg">
              {token.symbol}
            </span>
          </div>
          <div className="flex flex-row items-center gap-1">
            <LiveIcon className="w-3 h-3" />
            <NumberFlow
              value={token.price}
              format={{
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 3,
              }}
              className="text-sm font-mono"
              style={{ color: token.titleColor }}
            />
          </div>
        </div>

        {/* APR Display */}
        <div className="relative z-20" ref={aprRef}>
          <p
            className={twMerge(
              'text-[8.5rem] font-semibold bg-gradient-to-r bg-clip-text text-transparent text-nowrap',
              token.gradient,
            )}
          >
            <NumberFlow
              className={twMerge(
                'text-[8.5rem] font-monobold opacity-70 mr-4',
                token.gradient,
              )}
              locales="en-US"
              format={{ style: 'percent' }}
              value={aprValue !== null ? aprValue / 100 : 0}
            />
            APR
          </p>
        </div>

        <p
          className={twMerge(
            'relative text-base mb-6 max-w-[25rem] -translate-y-5 z-20',
            token.textColor,
          )}
        >
          {token.description}
        </p>
        <div className="flex flex-row items-center justify-between pr-2 relative z-20">
          <div onMouseLeave={() => setActiveLink(null)}>
            {token.partners.map((partner) => (
              <Link
                key={partner.name}
                href={partner.link}
                target="_blank"
                onMouseOver={() => setActiveLink(partner.name)}
                className={twMerge(
                  'inline-flex -ml-3 first:ml-0 group-hover:ml-1 transition-all duration-300',
                  activeLink === partner.name && 'scale-110 z-10',
                  activeLink !== null &&
                    activeLink !== partner.name &&
                    'opacity-50',
                )}
              >
                <Image
                  src={partner.img}
                  alt={partner.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                  style={{ border: `1px solid ${token.endGradient}` }}
                />
              </Link>
            ))}
          </div>
          <div className="flex flex-row items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
            <AnimatePresence mode="wait">
              {activeLink === null ? (
                <motion.div
                  key="ticker"
                  initial={{ opacity: 0, y: -5, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -5, filter: 'blur(2px)' }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-row items-center gap-2"
                >
                  <CopyButton
                    textToCopy={token.ticker}
                    notificationTitle="Ticker copied!"
                  />
                  <p className={'text-sm font-mono'}>
                    {getAbbrevWalletAddress(token.ticker)}
                  </p>
                </motion.div>
              ) : null}
              {activeLink !== null ? (
                <motion.p
                  key={token.partners.find((p) => p.name === activeLink)?.cta}
                  initial={{ opacity: 0, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(2px)' }}
                  transition={{ duration: 0.2 }}
                  className={'text-sm font-mono'}
                >
                  {token.partners.find((p) => p.name === activeLink)?.cta}
                </motion.p>
              ) : null}
            </AnimatePresence>
            <Image
              src={arrowIcon}
              alt="arrow icon"
              className="w-2 h-2 group-hover:rotate-45 transition duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
