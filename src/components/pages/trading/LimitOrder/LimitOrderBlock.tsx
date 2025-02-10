import Image from 'next/image';
import React, { memo, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { selectStreamingTokenPriceFallback } from '@/selectors/streamingTokenPrices';
import { useSelector } from '@/store/store';
import { LimitOrder } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

interface LimitOrderBlocProps {
    order: LimitOrder;
    onCancel: () => void;
}

export function LimitOrderBlock({ order, onCancel }: LimitOrderBlocProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isCompact, setIsCompact] = useState(false);
    const [isMini, setIsMini] = useState(false);
    const [isMedium, setIsMedium] = useState(false);
    const [isBig, setIsBig] = useState(false);

    const token = window.adrena.client.tokens.find((t) =>
        t.mint.equals(order.custody)
    );
    const collateralToken = window.adrena.client.tokens.find((t) =>
        t.mint.equals(order.collateralCustody)
    );

    const tradeTokenPrice = useSelector((s) =>
        selectStreamingTokenPriceFallback(s, getTokenSymbol(token?.symbol ?? ''))
    );

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                console.log('containerRef.current.offsetWidth', width);

                // Adjusted breakpoints to avoid edge cases
                setIsBig(width >= 601);
                setIsCompact(width <= 600 && width > 482);
                setIsMedium(width <= 482 && width > 370);
                setIsMini(width <= 370);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    //console.log('order', order);

    if (!token || !collateralToken) return null;

    const columnClasses = twMerge(
        "flex flex-col gap-0.5",
        isBig ? "flex-1" : "",
        isCompact ? "flex-1" : "",
        isMedium ? "flex-1 min-w-[9em]" : "",
        isMini ? "flex-1 min-w-[6.4em]" : ""
    );

    const limitPriceColumnClasses = twMerge(
        columnClasses,
        isCompact && "flex-none ml-auto"
    );

    const buttonColumnClasses = twMerge(
        columnClasses,
        isBig && "flex-none ml-auto"
    );

    const priceContainerClasses = twMerge(
        isBig ? "w-full flex gap-4" : "",
        isCompact ? "w-full flex" : "",
        isMedium ? "w-full flex gap-4 flex-wrap" : "",
        isMini ? "w-full flex gap-4 flex-row flex-wrap" : ""
    );

    const buttonContainerClasses = twMerge(
        "flex gap-2",
        isBig ? "hidden" : "",
        isCompact ? "w-full flex-row" : "",
        isMedium ? "w-full flex-col" : "",
        isMini ? "w-full flex-col" : "",
    );

    const buttonClasses = twMerge(
        "px-2.5 py-1.5 bg-whiteLabel/5 rounded-md text-grayLabel font-normal font-mono",
        isCompact ? "w-full" : "",
    );

    return (
        <div ref={containerRef} className="min-w-[250px] w-full flex flex-col p-4 rounded-lg border border-white/10 justify-start items-start gap-2.5">
            <div className="w-full pb-3 border-b border-white/10 justify-start items-center gap-2.5 inline-flex">
                <div className="grow shrink basis-0 h-9 justify-between items-center flex">
                    <div className="justify-start items-center gap-2.5 flex">
                        <Image
                            className="w-8 h-8 rounded-full"
                            src={getTokenImage(token)}
                            width={200}
                            height={200}
                            alt={`${getTokenSymbol(token.symbol)} logo`}
                        />
                        <div className="flex-col justify-start items-start gap-0.5 inline-flex">
                            <div className="justify-start items-center gap-2 inline-flex">
                                <div className="text-center text-whiteLabel text-lg font-black font-mono tracking-wider">
                                    {getTokenSymbol(token.symbol)}
                                </div>
                                <div className={`px-2 py-1 rounded-lg justify-center items-center gap-2 flex ${order.side === 'long' ? 'bg-greenSide/10' : 'bg-redSide/10'}`}>
                                    <div className={`text-center text-xs font-medium font-mono ${order.side === 'long' ? 'text-greenSide' : 'text-redSide'}`}>
                                        {order.side.charAt(0).toUpperCase() + order.side.slice(1)}
                                    </div>
                                </div>
                                <div className="text-center text-whiteLabel text-sm font-extrabold font-mono">
                                    <FormatNumber
                                        nb={order.leverage}
                                        format="number"
                                        precision={0}
                                        isDecimalDimmed={false}
                                    />x
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-whiteLabel text-lg font-normal font-mono">
                        #{order.id}
                    </div>
                </div>
            </div>
            <div className={priceContainerClasses}>
                <div className={columnClasses}>
                    <div className="text-grayLabel text-xxs font-normal font-mono">
                        Collateral
                    </div>
                    <div className="flex items-start gap-1.5">
                        <FormatNumber
                            nb={order.amount}
                            precision={token.displayAmountDecimalsPrecision}
                            className="text-whiteLabel text-xs font-medium font-mono leading-3"
                        />
                        <Image
                            className="w-3 h-3 rounded-full"
                            src={collateralToken.image}
                            width={13}
                            height={13}
                            alt={`${collateralToken.symbol} logo`}
                        />
                    </div>
                </div>

                <div className={columnClasses}>
                    <div className="text-grayLabel text-xxs font-normal font-mono">
                        Market Price
                    </div>
                    <FormatNumber
                        nb={tradeTokenPrice}
                        format="currency"
                        precision={token.displayPriceDecimalsPrecision}
                        className="text-grayLabel text-xs font-medium font-mono"
                        isDecimalDimmed={false}
                    />
                </div>

                <div className={columnClasses}>
                    <div className="text-grayLabel text-xxs font-normal font-mono">
                        Trigger Price
                    </div>
                    <FormatNumber
                        nb={order.triggerPrice}
                        format="currency"
                        precision={token.displayPriceDecimalsPrecision}
                        className="text-whiteLabel text-xs font-medium font-mono"
                        isDecimalDimmed={false}
                    />
                </div>

                <div className={limitPriceColumnClasses}>
                    <div className="text-grayLabel text-xxs font-normal font-mono">
                        Limit Price
                    </div>
                    {order.limitPrice ? (
                        <FormatNumber
                            nb={order.limitPrice}
                            format="currency"
                            precision={token.displayPriceDecimalsPrecision}
                            className="text-whiteLabel text-xs font-medium font-mono"
                            isDecimalDimmed={false}
                        />
                    ) : (
                        <span className="text-whiteLabel text-base font-medium font-mono">
                            -
                        </span>
                    )}
                </div>

                {isBig && (
                    <div className={buttonColumnClasses}>
                        <div className="text-grayLabel text-xxs font-normal font-mono">

                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="xs"
                                className={buttonClasses}
                                onClick={onCancel}
                                title="Edit"
                                rounded={false}
                            />
                            <Button
                                size="xs"
                                className={buttonClasses}
                                onClick={onCancel}
                                title="Close"
                                rounded={false}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className={buttonContainerClasses}>
                <Button
                    size="xs"
                    className={buttonClasses}
                    onClick={onCancel}
                    title="Edit"
                    rounded={false}
                />
                <Button
                    size="xs"
                    className={buttonClasses}
                    onClick={onCancel}
                    title="Close"
                    rounded={false}
                />
            </div>
        </div>
    );
}

// Memoize this component to avoid unnecessary re-renders
export default memo(LimitOrderBlock);
