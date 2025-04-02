import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import FormatNumber from '@/components/Number/FormatNumber';
import { CustodyExtended, PositionExtended, Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import InfoAnnotation from '../../../monitoring/InfoAnnotation';
import { ErrorDisplay } from './ErrorDisplay';
import SolanaIDInfo from './SolanaIDInfo';

interface MarketOrderContentProps {
    side: 'long' | 'short';
    tokenB: Token;
    allowedTokenB: Token[];
    inputB: number | null;
    openedPosition: PositionExtended | null;
    isInfoLoading: boolean;
    custody: CustodyExtended | null;
    usdcCustody: CustodyExtended | null;
    availableLiquidityShort: number;
    tokenPriceB: number | null;
    usdcPrice: number | null;
    errorMessage: string | null;
    buttonTitle: string;
    insufficientAmount: boolean;
    onTokenBSelect: (token: Token) => void;
    onInputBChange: (value: number | null) => void;
    onExecute: () => void;
    tokenPriceBTrade: number | undefined | null;
    walletAddress: string | null;
}

export const MarketOrderContent = ({
    side,
    tokenB,
    allowedTokenB,
    inputB,
    openedPosition,
    isInfoLoading,
    custody,
    usdcCustody,
    availableLiquidityShort,
    tokenPriceB,
    usdcPrice,
    errorMessage,
    buttonTitle,
    insufficientAmount,
    onTokenBSelect,
    onExecute,
    tokenPriceBTrade,
    walletAddress,
}: MarketOrderContentProps) => (
    <div className="flex flex-col transition-opacity duration-500 mt-4">
        <h5 className="flex items-center ml-4">Size</h5>

        <div className="flex items-center h-16 pr-3 bg-third mt-1 border rounded-lg z-40">
            <Select
                className="shrink-0 h-full flex items-center w-[7em]"
                selectedClassName="w-14"
                menuClassName="rounded-tl-lg rounded-bl-lg ml-3"
                menuOpenBorderClassName="rounded-tl-lg rounded-bl-lg"
                selected={getTokenSymbol(tokenB.symbol)}
                options={allowedTokenB.map((token) => ({
                    title: getTokenSymbol(token.symbol),
                    img: getTokenImage(token),
                }))}
                onSelect={(name) => {
                    const token = allowedTokenB.find(
                        (t) => getTokenSymbol(t.symbol) === name,
                    )!;
                    onTokenBSelect(token);
                }}
                reversed={true}
            />

            {!isInfoLoading ? (
                <div className="flex ml-auto">
                    {openedPosition && tokenPriceB && inputB ? (
                        <div className="flex flex-col self-center items-end line-through mr-3">
                            <FormatNumber
                                nb={openedPosition.sizeUsd / tokenPriceB}
                                precision={tokenB.symbol === 'BTC' ? 4 : 2}
                                className="text-txtfade"
                                isAbbreviate={tokenB.symbol === 'BONK'}
                                info={tokenB.symbol === 'BONK' ? (openedPosition.sizeUsd / tokenPriceB).toString() : null}
                            />
                            <FormatNumber
                                nb={openedPosition.sizeUsd}
                                format="currency"
                                className="text-txtfade text-xs line-through"
                            />
                        </div>
                    ) : null}

                    <div className="relative flex flex-col">
                        <div className="flex flex-col items-end font-mono">
                            <FormatNumber
                                nb={inputB}
                                precision={tokenB.displayAmountDecimalsPrecision}
                                className="text-lg"
                                isAbbreviate={tokenB.symbol === 'BONK'}
                                info={tokenB.symbol === 'BONK' ? inputB?.toString() : null}
                            />
                            {inputB && tokenPriceBTrade && (
                                <FormatNumber
                                    nb={inputB * tokenPriceBTrade}
                                    format="currency"
                                    className="text-txtfade text-sm"
                                />
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full h-[40px] bg-bcolor rounded-xl" />
            )}
        </div>

        <div className="flex sm:mt-2">
            <div className="flex items-center ml-2">
                <span className="text-txtfade">max size:</span>
                <FormatNumber
                    nb={side === 'long'
                        ? custody?.maxPositionLockedUsd
                        : usdcCustody?.maxPositionLockedUsd ?? null}
                    format="currency"
                    className="text-txtfade text-xs ml-1"
                />
                <InfoAnnotation
                    className="ml-1 inline-flex"
                    text="The maximum size of the position you can open, for that market and side."
                />
            </div>

            <div className="ml-auto items-center flex mr-2">
                <span className="text-txtfade mr-1">avail. liq.:</span>
                <FormatNumber
                    nb={side === 'long'
                        ? custody && tokenPriceB && custody.liquidity * tokenPriceB
                        : usdcPrice && usdcCustody && custody &&
                        Math.min(usdcCustody.liquidity * usdcPrice, availableLiquidityShort)
                    }
                    format="currency"
                    precision={0}
                    className="text-txtfade text-xs"
                />
                <InfoAnnotation
                    className="inline-flex"
                    text="This value represents the total size available for borrowing in this market and side by all traders. It depends on the pool's available liquidity and configuration restrictions."
                />
            </div>
        </div>

        {errorMessage && <ErrorDisplay errorMessage={errorMessage} />}

        <SolanaIDInfo walletAddress={walletAddress} />

        <Button
            className={twMerge(
                'w-full justify-center mt-2 mb-1 sm:mb-2',
                side === 'short' ? 'bg-red text-white' : 'bg-green text-white',
            )}
            size="lg"
            title={buttonTitle}
            disabled={errorMessage != null || insufficientAmount}
            onClick={onExecute}
        />
    </div>
);
