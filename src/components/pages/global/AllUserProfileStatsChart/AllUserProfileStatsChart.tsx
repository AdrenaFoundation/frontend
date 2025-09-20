import React, { memo, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import { ResponsiveContainer, Treemap } from 'recharts';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import Loader from '@/components/Loader/Loader';
import DataApiClient from '@/DataApiClient';
import { SuperchargedUserProfile } from '@/hooks/useAllUserSupercharedProfiles';
import { TraderByVolumeInfo, UserProfileExtended } from '@/types';
import {
  formatNumberShort,
  formatPriceInfo,
  getAbbrevWalletAddress,
} from '@/utils';

const AllUserProfileStatsChart = ({
  filteredProfiles,
  setActiveProfile,
}: {
  filteredProfiles: SuperchargedUserProfile[] | null;
  setActiveProfile: (profile: UserProfileExtended) => void;
}) => {
  const today = useMemo(() => {
    const date = new Date();

    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
  }, []);

  const [selectedRange, setSelectedRange] = useState<string>('Today');
  const [startDate, setStartDate] = useState<string>(
    // Today
    today.toISOString(),
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString());
  const [traders, setTraders] = useState<TraderByVolumeInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeMetric, setActiveMetric] = useState<string>('volume');
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomStartDate, setSelectedCustomStartDate] =
    useState<string>(today.toISOString());
  const [selectedCustomEndDate, setSelectedCustomEndDate] = useState<string>(
    new Date().toISOString(),
  );

  useEffect(() => {
    fetchTraders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const fetchTraders = async (
    customStartDate?: string,
    customEndDate?: string,
  ) => {
    setError(null);

    try {
      setIsLoading(true);

      const response = await DataApiClient.getTraderByVolume({
        startDate: new Date(customStartDate ?? startDate),
        endDate: new Date(customEndDate ?? endDate),
      });

      if (response) {
        setTraders(response);
      } else {
        setError('Failed to fetch traders data');
      }
    } catch (err) {
      setError('Error fetching traders data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const traderWithUserProfiles = useMemo(() => {
    return traders?.map((trader) => {
      const userProfile = filteredProfiles?.find(
        (profile) => profile.wallet.toBase58() === trader.userPubkey.toBase58(),
      );

      return {
        ...trader,
        userProfile,
      };
    });
  }, [traders, filteredProfiles]);

  const data = useMemo(() => {
    return traderWithUserProfiles
      ? traderWithUserProfiles
        .map((trader) => {
          const key = trader.userPubkey.toBase58();
          const pubkey = trader.userPubkey.toBase58();
          const name =
            trader.userProfile?.profile?.nickname ??
            getAbbrevWalletAddress(pubkey);
          const volume = trader.totalVolume;
          const pnl = trader.totalPnl;

          const colorArray = [
            '#2a0505',
            '#500f0f',
            '#802f2f',
            '#a06464',
            '#4ca54c',
            '#308f30',
            '#1e5f1e',
            '#032803',
          ];

          const color = (() => {
            if (pnl < -50_000) return colorArray[0];
            if (pnl < -10_000) return colorArray[1];
            if (pnl < -1000) return colorArray[2];
            if (pnl < 0) return colorArray[3];
            if (pnl < 1000) return colorArray[4];
            if (pnl < 10_000) return colorArray[5];
            if (pnl < 50_000) return colorArray[6];
            return colorArray[7];
          })();

          return {
            name,
            key,
            children: [
              {
                color,
                key,
                name,
                pubkey,
                volume,
                pnl,
              },
            ],
          };
        })
        .filter((key) => key?.children[0].key !== undefined)
        .sort((a, b) => {
          if (!a || !b) {
            return 0;
          }
          return a.children[0].volume < b.children[0].volume ? 1 : -1;
        })
      : [];
  }, [traderWithUserProfiles]);

  return (
    <div className="flex flex-col w-0 flex-1 h-full items-center p-4">
      <div className="w-full h-[20%] rounded-lg flex flex-col items-center justify-center mb-3 sm:mb-0">
        <h2>Traders by volume</h2>
        <p className="opacity-50">Click on a trader to view user profile</p>
      </div>
      <div
        className={twMerge(
          'flex flex-col sm:flex-row  bg-secondary border border-gray-800 rounded text-sm items-center z-20 mb-3 transition-opacity duration-300',
          isLoading ? 'opacity-30 pointer-events-none' : '',
        )}
      >
        <Select
          onSelect={(value) => {
            setSelectedRange(value);
            const date = new Date();
            setEndDate(date.toISOString());
            switch (value) {
              case 'All Time':
                setStartDate('2024-09-25T00:00:00Z');
                break;
              case 'Last Month':
                date.setMonth(date.getMonth() - 1);
                setStartDate(date.toISOString());
                break;
              case 'Last Week':
                date.setDate(date.getDate() - 6);
                setStartDate(date.toISOString());
                break;
              case 'Yesterday':
                const yesterdayStart = new Date(
                  Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate() - 1,
                    0,
                    0,
                    0,
                    0,
                  ),
                );

                const yesterdayEnd = new Date(
                  Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate() - 1,
                    23,
                    59,
                    59,
                    999,
                  ),
                );

                setStartDate(yesterdayStart.toISOString());
                setEndDate(yesterdayEnd.toISOString());
                break;
              case 'Today':
                const todayStart = new Date(
                  Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate(),
                    0,
                    0,
                    0,
                    0,
                  ),
                );
                setStartDate(todayStart.toISOString());
                break;
              case 'Custom':
                break;
              default:
                break;
            }
          }}
          reversed={true}
          className="p-2 flex items-center"
          selectedTextClassName="text-sm font-medium"
          menuTextClassName="text-sm"
          menuClassName="rounded-tl-lg rounded-bl-lg ml-3"
          menuOpenBorderClassName="rounded-tl-lg rounded-bl-lg"
          options={[
            // { title: 'All Time' },
            // { title: 'Last Month' },
            { title: 'Last Week' },
            { title: 'Yesterday' },
            { title: 'Today' },
            // { title: 'Custom' },
          ]}
          selected={selectedRange}
        />

        {selectedRange === 'Custom' ? (
          <div className="flex flex-row gap-3 p-2 sm:pl-0">
            <DatePicker
              selected={new Date(selectedCustomStartDate)}
              onChange={(date: Date | null) => {
                if (date) {
                  setSelectedCustomStartDate(date.toISOString());
                }
              }}
              className="w-full sm:w-auto px-2 py-1 bg-[#050D14] rounded border border-gray-600"
              minDate={new Date('2023-09-25')}
              maxDate={new Date()}
            />
            <DatePicker
              selected={new Date(selectedCustomEndDate)}
              onChange={(date: Date | null) => {
                if (date) {
                  setSelectedCustomEndDate(date.toISOString());
                }
              }}
              className="w-full sm:w-auto px-2 py-1 bg-[#050D14] rounded border border-gray-600"
              minDate={new Date('2023-09-25')}
              maxDate={new Date()}
            />
            <Button
              title="Apply"
              onClick={() =>
                fetchTraders(selectedCustomStartDate, selectedCustomEndDate)
              }
            />
          </div>
        ) : (
          <p className="font-mono p-2 sm:pr-4 sm:pl-0 opacity-50">
            {new Date(startDate).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}{' '}
            –{' '}
            {new Date(endDate).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>

      <div className="flex flex-row gap-3 mb-3">
        <p className="opacity-25">show: </p>
        {['pnl', 'volume'].map((metric, i) => (
          <p
            className={twMerge(
              'opacity-50 hover:opacity-100 cursor-pointer transition-opacity duration-300 font-regular text-sm',
              activeMetric === metric && 'opacity-100 underline',
            )}
            onClick={() => setActiveMetric(metric)}
            key={i}
          >
            {metric}
          </p>
        ))}
      </div>

      {error && (
        <div className="text-red-500 font-mono my-3 text-center">{error}</div>
      )}

      {!isLoading ? (
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            width={400}
            height={400}
            data={data}
            dataKey="volume"
            isAnimationActive={false}
            stroke="#fff"
            content={
              <CustomizedContent
                root={undefined}
                depth={0}
                x={0}
                y={0}
                width={0}
                height={0}
                index={0}
                payload={undefined}
                color={''}
                pnl={null}
                volume={null}
                name={''}
                showVolume={activeMetric === 'volume'}
              />
            }
            onClick={(e) => {
              if (e.pubkey) {
                const trader = traderWithUserProfiles?.find(
                  (trader) => trader.userPubkey.toBase58() === e.pubkey,
                );
                if (trader?.userProfile?.profile) {
                  setActiveProfile(trader.userProfile.profile);
                }
              }
            }}
          />
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-sm">
          <Loader />
        </div>
      )}
      <div className="flex mt-4 items-center justify-center">
        <div className="flex ml-4 gap-8">
          <div className="flex flex-col items-center justify-center text-xs gap-2 font-mono">
            Trader PnL
            <div
              className="h-2 w-24 border"
              style={{
                background: 'linear-gradient(to right, #2a0505, #500f0f, #802f2f, #a06464, #4ca54c, #308f30, #1e5f1e, #032803)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AllUserProfileStatsChart);

const CustomizedContent: React.FC<{
  root: unknown;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: unknown;
  color: string;
  pnl: number | null;
  volume: number | null;
  name: string;
  showVolume: boolean;
}> = ({
  depth,
  x,
  y,
  width,
  height,
  index,
  color,
  volume,
  pnl,
  name,
  showVolume = true,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <g
        key={`node-${index}-${depth}-${name}`}
        className={twMerge('relative', depth > 1 ? 'cursor-pointer' : '')}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: '#fff',
            strokeWidth: depth === 1 ? 5 : 1,
            strokeOpacity: 1,
            opacity: isHovered ? 1 : 0.9,
          }}
        />

        {depth === 2 && width > 75 && showVolume && volume !== null ? (
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={width > 80 && height > 80 ? 12 : width > 50 ? 10 : width > 40 ? 8 : 6}
          >
            ${formatNumberShort(Number(volume))}
          </text>
        ) : null}

        {depth === 2 && width > 75 && !showVolume && pnl !== null ? (
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={width > 80 && height > 80 ? 12 : width > 50 ? 10 : width > 40 ? 8 : 6}
          >
            {formatPriceInfo(pnl)}
          </text>
        ) : null}

        {name && width > 100 ? (
          <text x={x + 10} y={y + 22} fill="#fff" fontSize={width > 50 ? 12 : width > 40 ? 10 : 8} fillOpacity={0.5}>
            {name}
          </text>
        ) : null}
      </g>
    );
  };
