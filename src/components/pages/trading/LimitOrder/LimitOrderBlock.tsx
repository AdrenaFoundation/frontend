import Image from 'next/image';
import React, { memo } from 'react';

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
    const token = window.adrena.client.tokens.find((t) =>
        t.mint.equals(order.custody)
    );
    const collateralToken = window.adrena.client.tokens.find((t) =>
        t.mint.equals(order.collateralCustody)
    );

    const tradeTokenPrice = useSelector((s) =>
        selectStreamingTokenPriceFallback(s, getTokenSymbol(token?.symbol ?? ''))
    );

    console.log('order', order);

    if (!token || !collateralToken) return null;

    return (
        <>
            <div className="min-w-[250px] w-full flex flex-col p-4 rounded-lg border border-white/10 justify-start items-start gap-2.5">
                <div className="w-full pb-3 border-b border-white/10 justify-start items-center gap-2.5 inline-flex">
                    <div className="grow shrink basis-0 h-9 justify-between items-center flex">
                        <div className="justify-start items-center gap-2.5 flex">
                            <Image
                                className="w-7 h-7 rounded-full"
                                src={getTokenImage(token)}
                                width={36}
                                height={36}
                                alt={`${getTokenSymbol(token.symbol)} logo`}
                            />
                            <div className="flex-col justify-start items-start gap-0.5 inline-flex">
                                <div className="justify-start items-center gap-2 inline-flex">
                                    <div className="text-center text-whiteLabel text-lg font-black font-mono">
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
                <div className="flex flex-row w-full justify-between flex-wrap gap-y-3 pb-2 px-2">
                    <div className="flex flex-col gap-1.5 min-w-[6em] w-[6em]">
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

                    <div className="flex flex-col gap-1.5 min-w-[6em] w-[6em]">
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

                    <div className="flex flex-col gap-1.5 min-w-[6em] w-[6em]">
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

                    <div className="flex flex-col gap-1.5 min-w-[6em] w-[6em]">
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

                    <div className="flex items-center">
                        <Button
                            size="xs"
                            className="px-2.5 py-1.5 bg-whiteLabel/5 rounded-md text-grayLabel font-normal font-mono"
                            onClick={onCancel}
                            title="Close"
                            rounded={false}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

// Memoize this component to avoid unnecessary re-renders
export default memo(LimitOrderBlock);
