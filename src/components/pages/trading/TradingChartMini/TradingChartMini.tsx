import Image from 'next/image';
import { useEffect } from 'react';

import { Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import TradingChartHeaderStats from '../TradingChartHeader/TradingChartHeaderStats';

export default function TradingChartMini({ token }: { token: Token }) {

    useEffect(() => {
        const cleanUpWidget = () => {
            const container = document.getElementById(
                'tradingview-mini-widget-container',
            );
            if (container) {
                container.innerHTML = '';
            }
        };

        cleanUpWidget();

        const script = document.createElement('script');
        script.id = 'tradingview-widget-script';
        script.src =
            'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
        script.async = true;

        script.innerHTML = JSON.stringify({
            symbol: `COINBASE:${getTokenSymbol(token.symbol)}USD`,
            width: '100%',
            height: '100',
            locale: 'en',
            dateRange: '1D',
            colorTheme: 'dark',
            isTransparent: true,
            autosize: true,
            chartOnly: true,
        });

        document
            .getElementById('tradingview-mini-widget-container')
            ?.appendChild(script);

        return cleanUpWidget;
    }, [token.symbol]);

    return (
        <div>
            <div className="p-4">
                <div className="flex flex-row gap-2 items-center mb-2">
                    <Image
                        src={getTokenImage(token)}
                        alt={token.symbol}
                        className="w-[20px] h-[20px]"
                    />
                    <p className="text-lg font-semibold">
                        {getTokenSymbol(token.symbol)} / USD
                    </p>
                </div>

                <TradingChartHeaderStats
                    selected={token}
                    className="flex-col justify-start items-start p-0"
                    priceClassName="text-2xl"
                    statsClassName="gap-1"
                />
            </div>
            <div
                id="tradingview-mini-widget-container"
                className="w-full h-[100px]"
            />
        </div>
    );
}
