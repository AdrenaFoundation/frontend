import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { twMerge } from 'tailwind-merge';

import bonkLogo from '@/../public/images/bonk.png';
import btcLogo from '@/../public/images/btc.svg';
import arrowDropdownIcon from '@/../public/images/Icons/arrow-down-2.svg';
import arrowIcon from '@/../public/images/Icons/arrow-slim.svg';
import solLogo from '@/../public/images/sol.svg';
import DataApiClient from '@/DataApiClient';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';
import { PageProps, RechartsData } from '@/types';
import { getCustodyByMint } from '@/utils';

import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';
import FormatNumber from '../Number/FormatNumber';
import FooterStatsAvailableLiq from './FooterStatsAvailableLiq';

export default function FooterStats({
  mainPool,
}: {
  mainPool: PageProps['mainPool'];
}) {
  const router = useRouter();
  const aumUsd = useAssetsUnderManagement();
  const [cookies, setCookies] = useCookies(['footer-activeToken']);
  const initialActiveToken = (cookies['footer-activeToken'] as 'SOL' | 'BTC' | 'BONK') || 'BTC';
  const [activeToken, setActiveToken] = useState<'SOL' | 'BTC' | 'BONK'>(
    initialActiveToken,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [tokenHistoricalData, setTokenHistoricalData] = useState<{
    SOL: RechartsData[];
    BONK: RechartsData[];
    BTC: RechartsData[];
  }>({
    SOL: [],
    BONK: [],
    BTC: [],
  });
  const [aumData, setAumData] = useState<RechartsData[]>([]);
  const [volumeData, setVolumeData] = useState<RechartsData[]>([]);
  const [totalOpenInterestData, setTotalOpenInterestData] = useState<
    RechartsData[]
  >([]);
  const [isTokenDataLoading, setIsTokenDataLoading] = useState(true);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    fetchTokenHistoricalData(activeToken);
    setCookies('footer-activeToken', activeToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeToken]);

  const fetchTokenHistoricalData = async (token: 'SOL' | 'BTC' | 'BONK') => {
    if (tokenHistoricalData[token].length > 0) return;

    setIsTokenDataLoading(true);
    try {
      const response = await fetch(
        `https://history.oraclesecurity.org/trading-view/data?feed=${token}USD&type=1D&from=${Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60}&till=${Date.now()}`,
      );

      if (!response.ok) {
        console.error(`Error fetching ${token} price data`);
        return;
      }

      const data = await response.json();

      setTokenHistoricalData((prevData) => ({
        ...prevData,
        [token]: data.result.slice(-7),
      }));
    } catch (error) {
      console.error(`Error fetching ${token} price data:`, error);
    } finally {
      setIsTokenDataLoading(false);
    }
  };

  const getData = async () => {
    const custodyResult = await DataApiClient.getCustodyInfo(
      'custodyinfodaily',
      'open_interest_long_usd=true&open_interest_short_usd=true',
      7,
    );

    // Fetch only the last 8 days of cumulative volume for daily calculation (7 days diff)
    const result = await DataApiClient.getPoolInfo({
      dataEndpoint: 'poolinfodaily',
      queryParams: 'aum_usd=true&cumulative_trading_volume_usd=true',
      dataPeriod: 8,
    });

    if (result) {
      const { aum_usd, cumulative_trading_volume_usd } = result;
      if (aum_usd) {
        const formattedData = aum_usd.map((aum) => ({
          value: aum,
        }));

        setAumData(formattedData);
      }

      if (
        cumulative_trading_volume_usd &&
        cumulative_trading_volume_usd.length >= 2
      ) {
        const formattedVolumeData = [];
        for (let i = 1; i < cumulative_trading_volume_usd.length; i++) {
          formattedVolumeData.push({
            value:
              cumulative_trading_volume_usd[i] -
              cumulative_trading_volume_usd[i - 1],
          });
        }
        setVolumeData(formattedVolumeData);
      }
    }

    if (custodyResult) {
      const { open_interest_long_usd, open_interest_short_usd } = custodyResult;

      if (open_interest_long_usd && open_interest_short_usd) {
        let custodyData = {
          WBTC: { short: [], long: [] },
          BONK: { short: [], long: [] },
          JITOSOL: { short: [], long: [] },
        };

        for (const [mint, longValues] of Object.entries(
          open_interest_long_usd,
        )) {
          const custody = await getCustodyByMint(mint);
          if (!custody || !longValues) continue;

          // Ignore USDC
          if (custody.tokenInfo.symbol === 'USDC') continue;

          custodyData = {
            ...custodyData,
            [custody.tokenInfo.symbol]: {
              short: open_interest_short_usd[mint],
              long: longValues,
            },
          };
        }

        const maxLength = Math.max(
          custodyData.WBTC.long.length,
          custodyData.BONK.long.length,
          custodyData.JITOSOL.long.length,
        );

        const formattedOIData = [];
        for (let i = 0; i < maxLength; i++) {
          const total =
            Number(custodyData.WBTC.long[i] || 0) +
            Number(custodyData.BONK.long[i] || 0) +
            Number(custodyData.JITOSOL.long[i] || 0) +
            Number(custodyData.JITOSOL.short[i] || 0) +
            Number(custodyData.WBTC.short[i] || 0) +
            Number(custodyData.BONK.short[i] || 0);

          formattedOIData.push({ value: total });
        }

        setTotalOpenInterestData(formattedOIData);
      }
    }
  };

  const stats = [
    {
      label: `${activeToken} Price`,
      value: tokenHistoricalData[activeToken][tokenHistoricalData[activeToken].length - 1]?.close,
    },
    { label: 'VOL', value: volumeData[volumeData.length - 1]?.value || 0 },
    { label: 'AUM', value: aumUsd },
    {
      label: 'OI',
      value: (mainPool?.oiLongUsd ?? 0) + (mainPool?.oiShortUsd ?? 0),
    },
  ];

  const tokenImg = {
    BTC: btcLogo,
    SOL: solLogo,
    BONK: bonkLogo,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      className="group relative p-2 px-0 border-l border-inputcolor cursor-pointer hover:bg-third transition-colors duration-300 w-[18.75rem]"
      onMouseOver={() => setShowDetails(true)}
      onMouseOut={() => setShowDetails(false)}
    >
      <div className="hidden group-hover:block absolute w-full h-2 -top-2 left-0" />
      <AnimatePresence>
        {showDetails ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between absolute top-0 left-0 w-full h-full bg-secondary/10 backdrop-blur-sm z-20 px-3"
            onClick={() => {
              router.push('/monitoring');
            }}
          >
            <motion.p
              initial={{ opacity: 0, x: '-1rem', filter: 'blur(2px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0)' }}
              exit={{ opacity: 0, x: '-1rem', filter: 'blur(2px)' }}
              transition={{ duration: 0.3 }}
              className="text-sm font-interMedium"
            >
              Open monitoring page
            </motion.p>
            <motion.span
              initial={{ opacity: 0, x: '1rem', filter: 'blur(2px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0)' }}
              exit={{ opacity: 0, x: '1rem', filter: 'blur(2px)' }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={arrowIcon}
                alt="Arrow Icon"
                className="w-3 h-3 rotate-90"
                width={12}
                height={12}
              />
            </motion.span>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="w-5 h-full bg-gradient-to-r from-secondary to-transparent absolute left-0 top-0 z-20" />
      <div className="w-5 h-full bg-gradient-to-l from-secondary to-transparent absolute right-0 top-0 z-20" />

      <div className="group overflow-hidden w-full">
        <motion.div
          className="flex flex-row items-center gap-3 whitespace-nowrap"
          initial={{ x: 0 }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 20,
            ease: 'linear',
          }}
          style={{ willChange: 'transform' }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label + i}
              className="flex flex-row items-center px-3"
            >
              <span className="text-xs font-interMedium opacity-50 mr-1">
                {stat.label}
              </span>{' '}
              <FormatNumber
                nb={stat.value as number}
                className="text-xs"
                format="currency"
                prefix="$"
                prefixClassName="text-xs"
                isDecimalDimmed={false}
                precision={activeToken === 'BONK' ? 6 : 2}
                isAbbreviate
              />
            </div>
          ))}
          {stats.map((stat, i) => (
            <div
              key={stat.label + 'dup' + i}
              className="flex flex-row items-center px-3"
            >
              <span className="text-xs font-interMedium opacity-50 mr-1">
                {stat.label}
              </span>{' '}
              <FormatNumber
                nb={stat.value as number}
                className="text-xs"
                format="currency"
                prefix="$"
                prefixClassName="text-xs"
                isDecimalDimmed={false}
                precision={activeToken === 'BONK' ? 6 : 2}
                isAbbreviate
              />
            </div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: '-2rem' }}
            animate={{ opacity: 1, y: '-2.5rem' }}
            exit={{ opacity: 0, y: '-2rem' }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 bottom-0 min-w-[18.75rem] flex flex-col bg-secondary border border-inputcolor rounded-lg z-50 overflow-hidden"
          >
            <div
              className={twMerge(
                'relative flex flex-row items-center justify-between gap-3 p-3 transition-opacity duration-300',
                isTokenDataLoading
                  ? 'opacity-30 pointer-events-none cursor-not-allowed'
                  : '',
              )}
            >
              <div>
                <Menu
                  trigger={
                    <div className="flex flex-row items-center gap-1 mb-1 opacity-50 hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs font-interMedium">
                        {activeToken} Price
                      </p>

                      <Image
                        src={arrowDropdownIcon}
                        alt="dropdown icon"
                        width={12}
                        height={12}
                        className="w-3 h-3"
                      />
                    </div>
                  }
                  openMenuClassName="top-3"
                  isDim
                >
                  <MenuItems>
                    <MenuItem
                      onClick={() => {
                        setActiveToken('SOL');
                      }}
                      className="flex flex-row items-center gap-2 text-sm pl-2"
                    >
                      <Image
                        src={solLogo}
                        alt="SOL logo"
                        width={14}
                        height={14}
                        className="w-3 h-3"
                      />
                      SOL
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      onClick={() => {
                        setActiveToken('BTC');
                      }}
                      className="flex flex-row items-center gap-2 text-sm pl-2"
                    >
                      <Image
                        src={btcLogo}
                        alt="BTC logo"
                        width={14}
                        height={14}
                        className="w-3 h-3"
                      />
                      BTC
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      onClick={() => {
                        setActiveToken('BONK');
                      }}
                      className="flex flex-row items-center gap-2 text-sm pl-2"
                    >
                      <Image
                        src={bonkLogo}
                        alt="BONK logo"
                        width={14}
                        height={14}
                        className="w-3 h-3"
                      />
                      BONK
                    </MenuItem>
                  </MenuItems>
                </Menu>
                <div className="flex flex-row items-center gap-1.5">
                  <Image
                    src={tokenImg[activeToken]}
                    alt="Token logo"
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5"
                  />

                  <FormatNumber
                    nb={
                      (tokenHistoricalData[activeToken][
                        tokenHistoricalData[activeToken].length - 1
                      ]?.close as number) || 0
                    }
                    className="text-base"
                    format="currency"
                    isDecimalDimmed={false}
                  />
                </div>
                <FooterStatsAvailableLiq
                  activeToken={activeToken}
                  isLoading={isTokenDataLoading}
                />
              </div>
              <ResponsiveContainer width={120} height={30}>
                <LineChart data={tokenHistoricalData[activeToken]}>
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#07956b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div
              className="flex flex-row items-center justify-between gap-3 p-3 border-t border-inputcolor hover:bg-third transition duration-300"
              onClick={() => {
                router.push('/monitoring');
              }}
            >
              <div>
                <p className="text-xs font-interMedium opacity-50">
                  {' '}
                  24h Volume
                </p>
                <FormatNumber
                  nb={stats[1].value as number}
                  className="text-base"
                  format="currency"
                  isDecimalDimmed={false}
                />
              </div>
              <ResponsiveContainer width={120} height={30}>
                <LineChart data={volumeData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#07956b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div
              className="flex flex-row items-center justify-between gap-3 p-3 border-t border-inputcolor hover:bg-third transition duration-300"
              onClick={() => {
                router.push('/monitoring');
              }}
            >
              <div>
                <p className="text-xs font-interMedium opacity-50">AUM</p>
                <FormatNumber
                  nb={aumUsd}
                  className="text-base"
                  format="currency"
                  isDecimalDimmed={false}
                />
              </div>
              <ResponsiveContainer width={120} height={30}>
                <LineChart data={aumData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#07956b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div
              className="flex flex-row items-center justify-between gap-3 p-3 border-t border-inputcolor hover:bg-third transition duration-300"
              onClick={() => {
                router.push('/monitoring');
              }}
            >
              <div>
                <p className="text-xs font-interMedium opacity-50">
                  Open Interest
                </p>
                <FormatNumber
                  nb={(mainPool?.oiLongUsd ?? 0) + (mainPool?.oiShortUsd ?? 0)}
                  className="text-base"
                  format="currency"
                  isDecimalDimmed={false}
                />
              </div>
              <ResponsiveContainer width={120} height={30}>
                <LineChart data={totalOpenInterestData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#07956b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
