import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

import DataApiClient from '@/DataApiClient';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';
import { PageProps, RechartsData } from '@/types';
import { getCustodyByMint } from '@/utils';

import FormatNumber from '../Number/FormatNumber';

export default function FooterStats({
  mainPool,
}: {
  mainPool: PageProps['mainPool'];
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [aumData, setAumData] = useState<RechartsData[]>([]);
  const [volumeData, setVolumeData] = useState<RechartsData[]>([]);
  const [totalOpenInterestData, setTotalOpenInterestData] = useState<RechartsData[]>([]);
  const aumUsd = useAssetsUnderManagement();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const custodyResult = await DataApiClient.getCustodyInfo(
      'custodyinfodaily',
      'open_interest_long_usd=true&open_interest_short_usd=true',
      365,
    );

    const result = await DataApiClient.getPoolInfo({
      dataEndpoint: 'poolinfodaily',
      queryParams:
        'aum_usd=true&lp_token_price=true&cumulative_trading_volume_usd=true&cumulative_borrow_fee_usd=true',
      dataPeriod: 365,
    });

    if (result) {
      const { aum_usd, cumulative_trading_volume_usd } = result;
      if (aum_usd) {
        const formattedData = aum_usd.map((aum) => ({
          value: aum,
        }));

        setAumData(formattedData);
      }

      if (cumulative_trading_volume_usd) {
        console.log(
          'Cumulative trading volume:',
          cumulative_trading_volume_usd,
        );
        const formattedVolumeData = cumulative_trading_volume_usd.map(
          (volume) => ({
            value: volume,
          }),
        );
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
    { label: 'VOL', value: mainPool?.totalTradingVolume },
    { label: 'AUM', value: aumUsd },
    {
      label: 'OI',
      value: (mainPool?.oiLongUsd ?? 0) + (mainPool?.oiShortUsd ?? 0),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      className="relative p-2 px-0 border-l border-inputcolor cursor-pointer hover:bg-third transition-colors duration-300 w-[18.75rem]"
      onMouseOver={() => setShowDetails(true)}
      onMouseOut={() => setShowDetails(false)}
    >
      <div className="w-5 h-full bg-gradient-to-r from-secondary to-transparent absolute left-0 top-0 z-20" />
      <div className="w-5 h-full bg-gradient-to-l from-secondary to-transparent absolute right-0 top-0 z-20" />

      <div className="overflow-hidden w-full">
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
                nb={stat.value}
                className="text-xs"
                format="currency"
                isDecimalDimmed={false}
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
                nb={stat.value}
                className="text-xs"
                format="currency"
                isDecimalDimmed={false}
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
            className="absolute left-0 bottom-0 min-w-[18.75rem] flex flex-col bg-secondary border border-inputcolor rounded-lg z-50"
          >
            <div className="flex flex-row items-center justify-between gap-3 p-3">
              <div>
                <p className="text-xs font-interMedium opacity-50">Volume</p>
                <FormatNumber
                  nb={stats[0].value}
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

            <div className="flex flex-row items-center justify-between gap-3 p-3 border-t border-inputcolor">
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
                    stroke="#F7931A"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-row items-center justify-between gap-3 p-3 border-t border-inputcolor">
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
