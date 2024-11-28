import Head from 'next/head';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { getTokenSymbol } from '@/utils';

export function getTokenSymbolFromChartFormat(tokenSymbol: string) {
    return tokenSymbol.slice(0, tokenSymbol.length - ' / USD'.length);
}

export default function TradingChartHeaderStats({
    className,
    priceClassName,
    selected,
    statsClassName,
}: {
    className?: string;
    selected: Token;
    priceClassName?: string;
    statsClassName?: string;
}) {
    const selectedTokenPrice = useSelector(
        (s) => s.streamingTokenPrices[getTokenSymbol(selected.symbol)] ?? null,
    );
    const stats = useDailyStats();
    const [previousTokenPrice, setPreviousTokenPrice] = useState<number | null>(
        null,
    );
    const [tokenColor, setTokenColor] = useState<
        'text-white' | 'text-green' | 'text-red'
    >('text-white');

    if (selectedTokenPrice !== null) {
        if (previousTokenPrice !== null) {
            // if streamingTokenPrices is higher than previous value, set color to green
            // if streamingTokenPrices is smaller than previous value, set color to red
            const newTokenColor =
                selectedTokenPrice > previousTokenPrice
                    ? 'text-green'
                    : selectedTokenPrice < previousTokenPrice
                        ? 'text-red'
                        : tokenColor;
            // make sure we're only updating the local state if the new color is different.
            if (newTokenColor !== tokenColor) {
                setTokenColor(newTokenColor);
            }
        }

        if (selectedTokenPrice !== previousTokenPrice) {
            setPreviousTokenPrice(selectedTokenPrice);
        }
    }

    const dailyChange = stats?.[selected.symbol]?.dailyChange ?? null;
    const dailyVolume = stats?.[selected.symbol]?.dailyVolume ?? null;
    const lastDayHigh = stats?.[selected.symbol]?.lastDayHigh ?? null;
    const lastDayLow = stats?.[selected.symbol]?.lastDayLow ?? null;

    return (


        <div className={twMerge("flex w-full p-1 sm:p-0 flex-row gap-2 justify-between sm:justify-end sm:gap-6 items-center sm:pr-5", className)}>
            <FormatNumber
                nb={selectedTokenPrice}
                format="currency"
                minimumFractionDigits={2}
                precision={selected.displayPriceDecimalsPrecision}
                className={twMerge('text-lg font-bold', tokenColor, priceClassName)}
            />
            <div className="flex flex-row gap-3">
                <div className="flex items-center rounded-full flex-wrap">
                    <span className="flex font-mono sm:text-xxs text-txtfade text-right">
                        24h:
                    </span>
                </div>

                <div className={twMerge("flex items-center sm:gap-1 rounded-full flex-wrap", statsClassName)}>
                    <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
                        Ch.
                    </span>
                    <span
                        className={twMerge(
                            'font-mono text-xs sm:text-xxs', // Adjusted to text-xs
                            dailyChange
                                ? dailyChange > 0
                                    ? 'text-green'
                                    : 'text-red'
                                : 'text-white',
                        )}
                    >
                        {dailyChange
                            ? `${dailyChange.toFixed(2)}%` // Manually format to 2 decimal places
                            : '-'}
                    </span>
                </div>

                <div className={twMerge("flex items-center sm:gap-1 rounded-full flex-wrap", statsClassName)}>
                    <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
                        Vol.
                    </span>
                    <span className="font-mono text-xs sm:text-xxs">
                        <FormatNumber
                            nb={dailyVolume}
                            format="currency"
                            isAbbreviate={true}
                            isDecimalDimmed={false}
                            className="font-mono text-xxs" // Ensure smaller font
                        />
                    </span>
                </div>

                <div className={twMerge("flex items-center sm:gap-1 rounded-full flex-wrap", statsClassName)}>
                    <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
                        Hi
                    </span>
                    <span className="font-mono text-xs sm:text-xxs">
                        <FormatNumber
                            nb={lastDayHigh} // Assuming high is available in stats
                            format="currency"
                            className="font-mono text-xxs"
                        />
                    </span>
                </div>

                <div className={twMerge("flex items-center sm:gap-1 rounded-full flex-wrap", statsClassName)}>
                    <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
                        Lo
                    </span>
                    <span className="font-mono text-xxs sm:text-xs">
                        <FormatNumber
                            nb={lastDayLow} // Assuming low is available in stats
                            format="currency"
                            className="font-mono text-xxs"
                        />
                    </span>
                </div>
            </div>
        </div>
    );
}
