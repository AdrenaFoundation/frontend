import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import { twMerge } from 'tailwind-merge';

import bonkLogo from '@/../public/images/bonk.png';
import btcLogo from '@/../public/images/btc.svg';
import arrowDropdownIcon from '@/../public/images/Icons/arrow-down-2.svg';
import arrowIcon from '@/../public/images/Icons/arrow-slim.svg';
import solLogo from '@/../public/images/sol.svg';
import { ADRENA_GREEN, ADRENA_RED } from '@/constant';
import DataApiClient from '@/DataApiClient';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';
import useDynamicCustodyAvailableLiquidity from '@/hooks/useDynamicCustodyAvailableLiquidity';
import { useSelector } from '@/store/store';
import { PageProps, RechartsData } from '@/types';
import { getCustodyByMint, getTokenSymbol } from '@/utils';

import InfiniteScroll from '../common/InfiniteScroll/InfiniteScroll';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';
import FormatNumber from '../Number/FormatNumber';
import InfoAnnotation from '../pages/monitoring/InfoAnnotation';
import { CHAOS_API_ENDPOINT } from '../pages/trading/TradingChart/datafeed';

export default function FooterStats({
  mainPool,
}: {
  mainPool: PageProps['mainPool'];
}) {
  const router = useRouter();
  const aumUsd = useAssetsUnderManagement();
  const [cookies, setCookies] = useCookies(['footer-activeToken']);
  const initialActiveToken =
    (cookies['footer-activeToken'] as 'SOL' | 'BTC' | 'BONK') || 'BTC';
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

  const tokenDataArr = tokenHistoricalData[activeToken];

  const firstPrice =
    typeof tokenDataArr[0]?.close === 'number'
      ? Number(tokenDataArr[0].close)
      : null;

  const lastPrice =
    typeof tokenDataArr[tokenDataArr.length - 1]?.close === 'number'
      ? Number(tokenDataArr[tokenDataArr.length - 1].close)
      : null;

  const priceColor = useCallback(() => {
    if (firstPrice === null || lastPrice === null) {
      return 'text-white'; // Default color if no data
    }

    if (lastPrice > firstPrice) {
      return 'text-green';
    }

    if (lastPrice < firstPrice) {
      return 'text-redbright';
    }

    return 'text-white';
  }, [firstPrice, lastPrice])();

  const [volumeData, setVolumeData] = useState<RechartsData[]>([]);
  const [totalOpenInterestData, setTotalOpenInterestData] = useState<
    RechartsData[]
  >([]);

  const [isTokenDataLoading, setIsTokenDataLoading] = useState(true);

  const token = window.adrena.client.tokens.find(
    (t) => getTokenSymbol(t.symbol) === activeToken,
  );

  const tokenPrices = useSelector((state) => state.tokenPrices);
  const tokenPrice = token?.symbol ? tokenPrices[token.symbol] : null;

  const custody = token?.mint
    ? window.adrena.client.getCustodyByMint(token?.mint)
    : null;

  const custodyArray = useMemo(() => (custody ? [custody] : []), [custody]);

  const custodyLiquidityData =
    useDynamicCustodyAvailableLiquidity(custodyArray);

  const custodyLiquidity =
    custody && custodyLiquidityData
      ? custodyLiquidityData[custody.pubkey.toBase58()]
      : null;

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
        `${CHAOS_API_ENDPOINT}/trading-view/data?feed=${token}USD&type=1H&from=${
        // past 24 hours
        Math.floor(Date.now() / 1000) - 24 * 60 * 60
        }&till=${Date.now()}`,
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
      30,
    );

    const result = await DataApiClient.getPoolInfo({
      dataEndpoint: 'poolinfodaily',
      queryParams: 'aum_usd=true&cumulative_trading_volume_usd=true',
      dataPeriod: 30,
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
      value: tokenPrices[activeToken],
    },
    {
      label: `${activeToken} Liquidity`,
      value:
        custodyLiquidity && tokenPrice ? custodyLiquidity * tokenPrice : null,
    },
    {
      label: 'OI',
      value: (mainPool?.oiLongUsd ?? 0) + (mainPool?.oiShortUsd ?? 0),
    },
    { label: 'AUM', value: aumUsd },
    { label: 'VOL', value: volumeData[volumeData.length - 1]?.value || 0 },
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
              className="text-sm font-regular"
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

      <InfiniteScroll speed={20} gap="md">
        {stats.map((stat, i) => (
          <div
            key={stat.label + i}
            className="flex flex-row items-center flex-shrink-0"
          >
            <span className="text-xs opacity-50 mr-1">
              {stat.label}
            </span>
            <FormatNumber
              nb={stat.value as number}
              className="text-xs"
              format="currency"
              prefix="$"
              prefixClassName="text-xs"
              isDecimalDimmed={false}
              precision={activeToken === 'BONK' ? 6 : 2}
              isAbbreviate
              isAbbreviateIcon={
                stat.label.includes('Price') ? false : undefined
              }
            />
          </div>
        ))}
      </InfiniteScroll>

      <AnimatePresence>
        {showDetails ? (
          <motion.div
            initial={{ opacity: 0, y: '-2rem' }}
            animate={{ opacity: 1, y: '-2.5rem' }}
            exit={{ opacity: 0, y: '-2rem' }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 bottom-0 min-w-[18.75rem] flex flex-col bg-secondary border border-inputcolor rounded-md z-50 p-2"
          >
            <div
              className={twMerge(
                'relative flex flex-row items-center justify-between gap-3 p-3 transition-opacity duration-300 border border-inputcolor rounded-md',
                isTokenDataLoading
                  ? 'opacity-30 pointer-events-none cursor-not-allowed'
                  : '',
              )}
            >
              <div>
                <Menu
                  trigger={
                    <div className="flex flex-row items-center gap-1 mb-1 opacity-50 hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs font-regular">
                        24h {activeToken} Price
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
                  openMenuClassName="top-3 rounded-md"
                  bgClassName="rounded-md fixed"
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
                    nb={tokenPrices[activeToken]}
                    className={`text-base ${priceColor}`}
                    format="currency"
                    isDecimalDimmed={false}
                  />
                </div>
                <div className="flex flex-row items-center justify-center gap-1 mt-1">
                  <InfoAnnotation
                    className="inline-flex ml-0 opacity-30"
                    text="This value represents the total size available for borrowing in this market and side by all traders. It depends on the pool's available liquidity and configuration restrictions."
                  />
                  <p className="text-xs opacity-30 font-semibold">
                    Avail. long liq.
                  </p>
                  <AnimatePresence mode="wait">
                    {custodyLiquidity !== null &&
                      tokenPrice &&
                      custody &&
                      !isTokenDataLoading ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        key={`${activeToken}-available-liq`}
                      >
                        <FormatNumber
                          nb={custodyLiquidity * tokenPrice}
                          format="currency"
                          precision={2}
                          className="text-xs opacity-50 transition-opacity duration-300"
                          isDecimalDimmed={false}
                          isAbbreviate
                          isAbbreviateIcon
                        />
                      </motion.span>
                    ) : (
                      <motion.div
                        key="adx-staking-loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#050D14] h-[1.125rem] w-[3rem] animate-loader rounded-md"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <ResponsiveContainer width={100} height={50}>
                <LineChart data={tokenHistoricalData[activeToken]}>
                  <YAxis
                    domain={[
                      (dataMin: number) => dataMin * 0.999, // add a little padding
                      (dataMax: number) => dataMax * 1.001,
                    ]}
                    tickFormatter={(v) => `$${v.toFixed(2)}`}
                    hide={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke={
                      priceColor === 'text-green' ? ADRENA_GREEN : ADRENA_RED
                    }
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col border border-inputcolor rounded-md overflow-hidden mt-3">
              <div
                className="flex flex-row items-center justify-between gap-3 p-3 border-inputcolor hover:bg-third transition duration-300"
                onClick={() => {
                  router.push('/monitoring');
                }}
              >
                <div>
                  <p className="text-xs opacity-50">
                    {' '}
                    24h Volume
                  </p>
                  <FormatNumber
                    nb={stats[4].value as number}
                    className="text-base"
                    format="currency"
                    isDecimalDimmed={false}
                  />
                </div>
                <ResponsiveContainer width={100} height={50}>
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
                  <p className="text-xs opacity-50">AUM</p>
                  <FormatNumber
                    nb={aumUsd}
                    className="text-base"
                    format="currency"
                    isDecimalDimmed={false}
                  />
                </div>
                <ResponsiveContainer width={100} height={50}>
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
                  <p className="text-xs opacity-50">
                    Open Interest
                  </p>
                  <FormatNumber
                    nb={
                      (mainPool?.oiLongUsd ?? 0) + (mainPool?.oiShortUsd ?? 0)
                    }
                    className="text-base"
                    format="currency"
                    isDecimalDimmed={false}
                  />
                </div>
                <ResponsiveContainer width={100} height={50}>
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
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
