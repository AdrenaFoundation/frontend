import { useEffect, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { GetPositionStatsReturnType } from '@/types';

export default function usePositionStats() {
    const [data, setData] = useState<GetPositionStatsReturnType<{ showPositionActivity: true }> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // last day default
    const [endDate, setEndDate] = useState<string>(new Date().toISOString());

    useEffect(() => {
        async function fetchData() {
            const result = await DataApiClient.getPositionStats({ showPositionActivity: true, startDate: new Date(startDate), endDate: new Date(endDate) });
            console.log(startDate, endDate);
            if (result) {
                setData(result);
                console.log(result);
            }

            setLoading(false);
        }

        fetchData();
    }, [startDate, endDate]);

    return { data, loading, startDate, setStartDate, endDate, setEndDate };
}
