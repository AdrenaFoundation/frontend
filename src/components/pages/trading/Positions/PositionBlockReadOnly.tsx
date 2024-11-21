import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import OnchainAccountInfo from '../../monitoring/OnchainAccountInfo';
import NetValueTooltip from '../TradingInputs/NetValueTooltip';

export default function PositionBlockReadOnly({
    bodyClassName,
    borderColor,
    position,
    showFeesInPnl,
}: {
    bodyClassName?: string;
    borderColor?: string;
    position: PositionExtended;
    showFeesInPnl: boolean;
}) {
    const tokenPrices = useSelector((s) => s.tokenPrices);

    const blockRef = useRef<HTMLDivElement>(null);

    const liquidable = (() => {
        const tokenPrice = tokenPrices[getTokenSymbol(position.token.symbol)];

        if (
            tokenPrice === null ||
            typeof position.liquidationPrice === 'undefined' ||
            position.liquidationPrice === null
        )
            return;

        if (position.side === 'long') return tokenPrice < position.liquidationPrice;

        // Short
        return tokenPrice > position.liquidationPrice;
    })();

    const isSmallSize = useBetterMediaQuery('(max-width: 700px)');

    const positionName = (
        <div
            className="flex items-center justify-left h-full min-w-[12em]"
        >
            <Image
                className="w-[2em] h-[2em] mr-2"
                src={getTokenImage(position.token)}
                width={200}
                height={200}
                alt={`${getTokenSymbol(position.token.symbol)} logo`}
            />

            <div className="flex flex-col">
                <div className="flex items-center justify-center">
                    {window.location.pathname !== '/trade' ? (
                        <div className="uppercase font-boldy text-sm lg:text-xl">
                            {getTokenSymbol(position.token.symbol)}
                        </div>
                    ) : (
                        <div className="uppercase font-boldy text-sm lg:text-lg">
                            {getTokenSymbol(position.token.symbol)}
                        </div>
                    )}

                    <div
                        className={twMerge(
                            'uppercase font-boldy text-sm lg:text-lg ml-1',
                            position.side === 'long' ? 'text-green' : 'text-red',
                        )}
                    >
                        {position.side}
                    </div>
                    <div className="ml-1 text-xs text-txtfade">
                        <FormatNumber
                            nb={position.initialLeverage}
                            format="number"
                            suffix="x"
                            precision={2}
                            isDecimalDimmed={false}
                            className="text-txtfade"
                        />
                    </div>
                </div>

                <OnchainAccountInfo
                    address={position.pubkey}
                    shorten={true}
                    className="text-xxs"
                    iconClassName="w-2 h-2"
                />
            </div>
        </div>
    );

    useEffect(() => {
        setShowAfterFees(showFeesInPnl);
    }, [showFeesInPnl]);

    const [showAfterFees, setShowAfterFees] = useState(showFeesInPnl); // State to manage fee display
    const fees = -((position.exitFeeUsd ?? 0) + (position.borrowFeeUsd ?? 0));

    const pnl = (
        <div className="flex flex-col items-center min-w-[10em] w-[10em]">
            <div className="flex flex-row gap-2 w-full font-mono text-xxs text-txtfade justify-center items-center">
                PnL
                <label className="flex items-center cursor-pointer">
                    <Switch
                        className="mr-0.5"
                        checked={showAfterFees}
                        onChange={() => setShowAfterFees(!showAfterFees)}
                        size="small"
                    />
                    <span className="ml-0.5 text-xxs text-gray-600 whitespace-nowrap w-6 text-center">
                        {showAfterFees ? 'w/ fees' : 'w/o fees'}
                    </span>
                </label>
            </div>
            {position.pnl ? (
                <div className="flex items-center">
                    <FormatNumber
                        nb={
                            showAfterFees
                                ? position.pnl + fees
                                : position.pnl
                        }
                        format="currency"
                        className={`mr-0.5 font-bold text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0
                            ? 'green'
                            : 'redbright'
                            }`}
                        isDecimalDimmed={false}
                    />

                    <FormatNumber
                        nb={
                            ((showAfterFees ? position.pnl : position.pnl - fees) /
                                position.collateralUsd) *
                            100
                        }
                        format="percentage"
                        prefix="("
                        suffix=")"
                        suffixClassName={`ml-0 text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0
                            ? 'green'
                            : 'redbright'
                            }`}
                        precision={2}
                        isDecimalDimmed={false}
                        className={`text-xs text-${(showAfterFees ? position.pnl : position.pnl - fees) > 0
                            ? 'green'
                            : 'redbright'
                            }`}
                    />
                </div>
            ) : (
                '-'
            )}
        </div>
    );

    const netValue = (
        <div className="flex flex-col items-center">
            <div
                className={`flex w-full font-mono text-xxs text-txtfade ${isSmallSize ? 'justify-center' : 'justify-end'
                    } items-center`}
            >
                Net value
            </div>

            <div className="flex">
                {position.pnl ? (
                    <>
                        <NetValueTooltip position={position}>
                            <span className="underline-dashed">
                                <FormatNumber
                                    nb={position.collateralUsd + position.pnl}
                                    format="currency"
                                    className="text-md"
                                />
                            </span>
                        </NetValueTooltip>
                    </>
                ) : (
                    '-'
                )}
            </div>
        </div>
    );

    const ownerInfo = (
        <div className="flex flex-col items-center min-w-[5em] w-[5em]">
            <div className="flex w-full font-mono text-xs text-txtfade justify-center items-center">
                Owner
            </div>
            <OnchainAccountInfo
                address={position.owner}
                shorten={true}
                className="text-xs"
                iconClassName="w-2 h-2"
            />
        </div>
    );

    return (
        <>
            <div
                className={twMerge(
                    'min-w-[250px] w-full flex flex-col border rounded-lg bg-[#050D14]',
                    bodyClassName,
                    borderColor,
                )}
                key={position.pubkey.toBase58()}
                ref={blockRef}
            >
                {isSmallSize ? (
                    <div className="flex flex-col w-full items-center">
                        <div className="border-b flex-1 flex w-full justify-between p-3">
                            {positionName}
                            {ownerInfo}
                        </div>
                        <div className="border-b flex-1 flex w-full justify-between p-3">
                            {pnl}
                            {netValue}
                        </div>
                    </div>
                ) : (
                    <div className="flex border-b p-3 justify-between items-center flex-wrap w-full">
                        {positionName}
                        {ownerInfo}
                        {pnl}
                        {netValue}
                    </div>
                )}

                <div className="flex flex-row grow justify-evenly flex-wrap gap-3 p-3">
                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Cur. Leverage
                        </div>
                        <div className="flex">
                            <FormatNumber
                                nb={position.currentLeverage}
                                format="number"
                                className="text-gray-400 text-xs lowercase"
                                suffix="x"
                                isDecimalDimmed={false}
                                precision={2}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Size
                        </div>
                        <div className="flex underline-dashed">
                            <Tippy
                                content={
                                    <FormatNumber
                                        nb={position.side === 'long' ? position.size : position.sizeUsd / position.price}
                                        format="number"
                                        className="text-gray-400 text-xs"
                                        precision={position.token.displayAmountDecimalsPrecision}
                                        suffix={getTokenSymbol(position.token.symbol)}
                                    />
                                }
                                placement="auto"
                            >
                                <FormatNumber
                                    nb={position.sizeUsd}
                                    format="currency"
                                    className="text-gray-400 text-xs"
                                />
                            </Tippy>
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Collateral
                        </div>
                        <div className="flex underline-dashed">
                            <Tippy
                                content={
                                    <FormatNumber
                                        nb={position.collateralAmount}
                                        format="number"
                                        className="text-gray-400 text-xs"
                                        precision={
                                            position.collateralToken.displayAmountDecimalsPrecision
                                        }
                                        suffix={`${getTokenSymbol(
                                            position.collateralToken.symbol,
                                        )} (at init.)`}
                                    />
                                }
                                placement="auto"
                            >
                                <FormatNumber
                                    nb={position.collateralUsd}
                                    format="currency"
                                    className="text-xs"
                                />
                            </Tippy>
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Entry Price
                        </div>
                        <div className="flex">
                            <FormatNumber
                                nb={position.price}
                                format="currency"
                                precision={position.token.displayPriceDecimalsPrecision}
                                className="text-xs bold"
                                isDecimalDimmed={false}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Market Price
                        </div>
                        <div className="flex">
                            <FormatNumber
                                nb={tokenPrices[getTokenSymbol(position.token.symbol)]}
                                format="currency"
                                precision={position.token.displayPriceDecimalsPrecision}
                                className="text-gray-400 text-xs bold"
                                isDecimalDimmed={false}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                            Liq. Price
                        </div>
                        <div className="flex p-1 rounded" role="button" tabIndex={0}>
                            <FormatNumber
                                nb={position.liquidationPrice}
                                format="currency"
                                precision={position.token.displayPriceDecimalsPrecision}
                                className="text-xs text-orange"
                                isDecimalDimmed={false}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs justify-center items-center text-txtfade">
                            Take Profit
                        </div>
                        <div className="flex p-1 rounded" role="button" tabIndex={0}>
                            {position.takeProfitIsSet &&
                                position.takeProfitLimitPrice &&
                                position.takeProfitLimitPrice > 0 ? (
                                <FormatNumber
                                    nb={position.takeProfitLimitPrice}
                                    format="currency"
                                    className="text-xs text-blue"
                                />
                            ) : (
                                <div className="flex text-xs">-</div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[5em] w-[5em]">
                        <div className="flex w-full font-mono text-xxs justify-center items-center text-txtfade">
                            Stop Loss
                        </div>
                        <div className="flex p-1 rounded" role="button" tabIndex={0}>
                            {position.stopLossIsSet &&
                                position.stopLossLimitPrice &&
                                position.stopLossLimitPrice > 0 ? (
                                <FormatNumber
                                    nb={position.stopLossLimitPrice}
                                    format="currency"
                                    className="text-xs text-blue"
                                    precision={position.token.displayPriceDecimalsPrecision}
                                    minimumFractionDigits={
                                        position.token.displayPriceDecimalsPrecision
                                    }
                                    isDecimalDimmed={false}
                                />
                            ) : (
                                <div className="flex text-xs">-</div>
                            )}
                        </div>
                    </div>
                </div>

                {(liquidable) && (
                    <div className="flex items-center justify-center pt-2 pb-2 border-t gap-4">
                        {liquidable && (
                            <h2 className="text-red text-xs">Liquidable</h2>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
