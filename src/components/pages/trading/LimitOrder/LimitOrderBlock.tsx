import Image from 'next/image';
import React, { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { selectStreamingTokenPriceFallback } from '@/selectors/streamingTokenPrices';
import { useSelector } from '@/store/store';
import { LimitOrder } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import { POSITION_BLOCK_STYLES } from '../Positions/PositionBlockComponents/PositionBlockStyles';
import { ValueColumn } from '../Positions/PositionBlockComponents/ValueColumn';

interface LimitOrderBlocProps {
    order: LimitOrder;
    onCancel: () => void;
}

export function LimitOrderBlock({ order, onCancel }: LimitOrderBlocProps) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isCompact, setIsCompact] = useState(false);
    const [isMini, setIsMini] = useState(false);
    const [isMedium, setIsMedium] = useState(false);
    const [isBig, setIsBig] = useState(false);

    const token = window.adrena.client.tokens.find((t) =>
        t.custody?.equals(order.custody)
    );
    const collateralToken = window.adrena.client.tokens.find((t) =>
        t.custody?.equals(order.collateralCustody)
    );

    const tradeTokenPrice = useSelector((s) =>
        selectStreamingTokenPriceFallback(s, getTokenSymbol(token?.symbol ?? ''))
    );

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;

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

    if (!token || !collateralToken) return null;

    const columnClasses = twMerge(
        POSITION_BLOCK_STYLES.column.base,
        isBig && POSITION_BLOCK_STYLES.column.sizes.big,
        isCompact && POSITION_BLOCK_STYLES.column.sizes.compact,
        isMedium && POSITION_BLOCK_STYLES.column.sizes.medium,
        isMini && POSITION_BLOCK_STYLES.column.sizes.mini
    );

    return (
        <div ref={containerRef} className="min-w-[250px] w-full flex flex-col p-4 rounded-md border border-white/10 justify-start items-start gap-2.5">
            <div className="w-full pb-[0.7em] border-b border-white/10 justify-start items-center gap-2.5 inline-flex">
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
                                <div className={`px-2 py-1 rounded-md justify-center items-center gap-2 flex ${order.side === 'long' ? 'bg-greenSide/10' : 'bg-redSide/10'}`}>
                                    <div className={`text-center text-xs font-mono ${order.side === 'long' ? 'text-greenSide' : 'text-redSide'}`}>
                                        {t(`trade.${order.side}`)}
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
            <div className={twMerge(
                "flex flex-wrap flex-1 gap-2 w-full",
                isMini && "grid grid-cols-2",
                isMedium && "grid grid-cols-3",
                isCompact && "grid grid-cols-3",
                isBig && "grid grid-cols-5",
            )}>
                <ValueColumn
                    label={t('trade.limitOrder.collateral')}
                    value={
                        <div className="flex items-start gap-1">
                            <FormatNumber
                                nb={order.amount}
                                precision={collateralToken.displayAmountDecimalsPrecision}
                                className={POSITION_BLOCK_STYLES.text.white}
                            />
                            <Image
                                className="w-3.5 h-3.5 rounded-full"
                                src={collateralToken.image}
                                width={200}
                                height={200}
                                alt={`${collateralToken.symbol} logo`}
                            />
                        </div>
                    }
                    columnClasses={columnClasses}
                />

                <ValueColumn
                    label={t('trade.limitOrder.marketPrice')}
                    value={
                        <FormatNumber
                            nb={tradeTokenPrice}
                            format="currency"
                            precision={token.displayPriceDecimalsPrecision}
                            className={POSITION_BLOCK_STYLES.text.white}
                            isDecimalDimmed={false}
                        />
                    }
                    valueClassName={POSITION_BLOCK_STYLES.text.white}
                    columnClasses={columnClasses}
                />

                <ValueColumn
                    label={t('trade.limitOrder.triggerPrice')}
                    value={
                        <FormatNumber
                            nb={order.triggerPrice}
                            format="currency"
                            precision={token.displayPriceDecimalsPrecision}
                            className={POSITION_BLOCK_STYLES.text.white}
                            isDecimalDimmed={false}
                        />
                    }
                    valueClassName={POSITION_BLOCK_STYLES.text.white}
                    columnClasses={columnClasses}
                />

                <ValueColumn
                    label={t('trade.limitOrder.limitPrice')}
                    value={
                        order.limitPrice ? (
                            <FormatNumber
                                nb={order.limitPrice}
                                format="currency"
                                precision={token.displayPriceDecimalsPrecision}
                                className={POSITION_BLOCK_STYLES.text.white}
                                isDecimalDimmed={false}
                            />
                        ) : (
                            <div className={POSITION_BLOCK_STYLES.text.white}>-</div>
                        )
                    }
                    valueClassName={POSITION_BLOCK_STYLES.text.white}
                    columnClasses={columnClasses}
                />

                <div className={twMerge(
                    "flex gap-2 items-center",
                    isMini && "col-span-2 col-start-1 row-start-3 w-1/2 justify-self-end",
                    isMedium && "col-span-2 col-start-2 row-start-2 w-1/2 justify-self-end",
                    isCompact && "col-span-2 col-start-2 row-start-2 w-1/2 justify-self-end",
                    isBig && "col-span-1 col-start-5 row-start-1 w-full justify-end"
                )}>
                    <Button
                        size="xs"
                        className={isBig ? POSITION_BLOCK_STYLES.button.base : POSITION_BLOCK_STYLES.button.filled}
                        onClick={onCancel}
                        title={t('trade.limitOrder.cancel')}
                        rounded={false}
                    />
                </div>
            </div>
        </div>
    );
}

// Memoize this component to avoid unnecessary re-renders
export default memo(LimitOrderBlock);
