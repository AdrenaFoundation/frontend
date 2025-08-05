import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import MixedAreaLineChart from '@/components/ReCharts/MixedAreaLineChart';
import { ADRENA_EVENTS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { RechartsData } from '@/types';
import { formatSnapshotTimestamp, getGMT } from '@/utils';

export default function OpenInterestLongShortChart() {
    const [data, setData] = useState<RechartsData[] | null>(null);
    const [period, setPeriod] = useState<string | null>('6M');
    const periodRef = useRef(period);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        periodRef.current = period;
        getData();
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(getData, 30000);
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [period]);

    const getData = async () => {
        try {
            const dataEndpoint = (() => {
                switch (periodRef.current) {
                    case '1d':
                        return 'poolinfo';
                    case '7d':
                        return 'poolinfohourly';
                    case '1M':
                        return 'poolinfodaily';
                    case '3M':
                        return 'poolinfodaily';
                    case '6M':
                        return 'poolinfodaily';
                    case '1Y':
                        return 'poolinfodaily';
                    default:
                        return 'poolinfo';
                }
            })();

            const dataPeriod = (() => {
                switch (periodRef.current) {
                    case '1d':
                        return 1;
                    case '7d':
                        return 7;
                    case '1M':
                        return 31;
                    case '3M':
                        return 93;
                    case '6M':
                        return 183;
                    case '1Y':
                        return 365;
                    default:
                        return 1;
                }
            })();
            const data = await DataApiClient.getPoolInfo({
                dataEndpoint,
                queryParams: 'open_interest_long_usd=true&open_interest_short_usd=true',
                dataPeriod,
            });
            if (!data) return;
            const { open_interest_long_usd, open_interest_short_usd, snapshot_timestamp } = data;
            if (!open_interest_long_usd || !open_interest_short_usd || !snapshot_timestamp) return;
            const timeStamp = formatSnapshotTimestamp(snapshot_timestamp, periodRef.current);
            const formatted = timeStamp.map((time, i) => {
                const long = open_interest_long_usd[i] ?? 0;
                const short = open_interest_short_usd[i] ?? 0;
                const total = long + short;
                const longPct = total > 0 ? (long / total) * 100 : 0;
                return {
                    time,
                    'Long OI': long,
                    'Short OI': short,
                    'Long VS Short %': longPct,
                };
            });
            setData(formatted);
        } catch (e) {
            console.error('Error fetching open interest data:', e);
        }
    };

    if (!data) {
        return (
            <div className="h-full w-full flex items-center justify-center text-sm">
                <Loader />
            </div>
        );
    }

    return (
        <MixedAreaLineChart
            title="Open Interest Long vs Short USD"
            data={data}
            labels={[
                { name: 'Long OI', color: '#07956B', type: 'area', yAxisId: 'left' },
                { name: 'Short OI', color: '#ff344e', type: 'area', yAxisId: 'left' },
                { name: 'Long VS Short %', color: '#ffffff', type: 'line', yAxisId: 'right' }
            ]}
            period={period}
            gmt={period === '1M' || period === '3M' || period === '6M' || period === '1Y' ? 0 : getGMT()}
            periods={['1d', '7d', '1M', '3M', '6M', '1Y']}
            setPeriod={setPeriod}
            leftDomain={['dataMin', 'dataMax']}
            rightDomain={[0, 100]}
            formatLeftY="currency"
            formatRightY="percentage"
            events={ADRENA_EVENTS.filter((event) => event.type === 'Global')}
        />
    );
}
