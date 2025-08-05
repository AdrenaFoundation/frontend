import { useEffect, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import MixedAreaLineChart from '@/components/ReCharts/MixedAreaLineChart';
import { ADRENA_EVENTS } from '@/constant';
import DataApiClient from '@/DataApiClient';
import { RechartsData } from '@/types';
import { formatSnapshotTimestamp, getGMT } from '@/utils';

export default function DrawdownChart() {
    const [chartData, setChartData] = useState<RechartsData[] | null>(null);
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
                queryParams: 'lp_token_price=true',
                dataPeriod,
            });
            if (!data) return;
            const { lp_token_price, snapshot_timestamp } = data;
            if (!lp_token_price || !snapshot_timestamp) return;
            const timeStamp = formatSnapshotTimestamp(snapshot_timestamp, periodRef.current);
            let runningPeak = 0;
            const formatted = lp_token_price.map((price, i) => {
                if (price === 0) return { time: timeStamp[i], 'ALP Price': null, 'Max DD From Peak %': null };
                runningPeak = Math.max(runningPeak, price);
                const currentDD = (price - runningPeak) / runningPeak * 100;
                return {
                    time: timeStamp[i],
                    'ALP Price': price,
                    'Max DD From Peak %': currentDD,
                };
            });

            setChartData(formatted);
        } catch (e) {
            console.error('Error fetching data:', e);
        }
    };

    if (!chartData) {
        return (
            <div className="h-full w-full flex items-center justify-center text-sm">
                <Loader />
            </div>
        );
    }

    const latestData = chartData[chartData.length - 1];
    const latestPrice = latestData['LP Price'] as number;/*  */

    return (
        <MixedAreaLineChart
            title={'ALP Price & Max Drawdown'}
            subValue={latestPrice}
            data={chartData}
            labels={[
                { name: 'ALP Price', color: '#fde000', type: 'line', yAxisId: 'left' },
                { name: 'Max DD From Peak %', color: '#ffffff', type: 'line', yAxisId: 'right' }
            ]}
            period={period}
            gmt={period === '1M' || period === '3M' || period === '6M' || period === '1Y' ? 0 : getGMT()}
            periods={['1d', '7d', '1M', '3M', '6M', '1Y']}
            setPeriod={setPeriod}
            leftDomain={['dataMin', 'dataMax']}
            rightDomain={['dataMin', 'dataMax']}
            formatLeftY="currency"
            formatRightY="percentage"
            events={ADRENA_EVENTS.filter((event) => event.type === 'Global')}
            exportToCSV={() => {
                if (!chartData) return;
                const headers = ['Time', 'ALP Price', 'Max DD From Peak %'];
                const csvContent = [headers.join(','), ...chartData.map(row => [row.time, row['ALP Price'], row['Max DD From Peak %']].join(','))].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `drawdown_${period}_${new Date().getTime()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            }}
        />
    );
}
