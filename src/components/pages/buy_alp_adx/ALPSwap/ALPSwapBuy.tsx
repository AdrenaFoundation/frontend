import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import RefreshButton from '@/components/RefreshButton/RefreshButton';
import { useDispatch, useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatPriceInfo, getArrowElement, nativeToUi, uiToNative } from '@/utils';

import infoIcon from '../../../../../public/images/Icons/info.svg';
import warningIcon from '../../../../../public/images/Icons/warning.png';
import jupIcon from '../../../../../public/images/jup-logo.png';
import TradingInput from '../../trading/TradingInput/TradingInput';

let loadingCounterMainData = 0;
let loadingCounterAlternativeData = 0;

export default function ALPSwapBuy({
    className,
    connected,
}: {
    className?: string;
    connected: boolean;
}) {
    const dispatch = useDispatch();
    const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
    const tokenPrices = useSelector((s) => s.tokenPrices);
    const wallet = useSelector((s) => s.walletState.wallet);
    const [collateralInput, setCollateralInput] = useState<number | null>(null);
    const [collateralToken, setCollateralToken] = useState<Token>(window.adrena.client.tokens[2]);
    const [collateralPrice, setCollateralPrice] = useState<number | null>(null);
    const [collateralInputUsd, setCollateralInputUsd] = useState<number | null>(null);
    const [isMainDataLoading, setIsMainDataLoading] = useState(false);
    const [isAlternativeRouteDataLoading, setIsAlternativeRouteDataLoading] = useState(false);
    const [alpInput, setAlpInput] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fee, setFee] = useState<number | null>(null);
    const [feeUsd, setFeeUsd] = useState<number | null>(null);
    const [alternativeRoutesFees, setAlternativeRoutesFees] = useState<{
        [tokenSymbol: string]: {
            error: string | null;
            fee: number | null;
            feeUsd: number | null;
            betterRoute: boolean | null;
            bestRoute: boolean | null;
        },
    } | null>(null);
    const [highFeeWarning, setHighFeeWarning] = useState<boolean>(false);

    const executeBuyAlp = useCallback(async () => {
        if (!connected) {
            dispatch(openCloseConnectionModalAction(true));
            return;
        }

        if (
            !wallet?.walletAddress ||
            !collateralInput ||
            !alpInput
        ) {
            console.log('Missing some info');
            return;
        }

        const notification =
            MultiStepNotification.newForRegularTransaction('Buying ALP').fire();

        try {
            await window.adrena.client.addLiquidity({
                owner: new PublicKey(wallet.walletAddress),
                amountIn: uiToNative(collateralInput, collateralToken.decimals),
                mint: collateralToken.mint,

                // TODO: Apply proper slippage
                minLpAmountOut: new BN(0),
                notification,
            });

            dispatch(fetchWalletTokenBalances());
            setCollateralInput(null);
        } catch (error) {
            console.log('error', error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alpInput, collateralInput, collateralToken.decimals, collateralToken.mint, connected, wallet && wallet.walletAddress]);

    const estimateAddLiquidityAndFeeForAlternativeRoutes = useCallback(async () => {
        // Because we fire one request every time the user change the input, needs to keep only the last one
        const localLoadingCounter = ++loadingCounterAlternativeData;

        setAlternativeRoutesFees(null);
        setIsAlternativeRouteDataLoading(false);

        if (collateralInput === null || window.adrena.client.tokens.some(t => !tokenPrices[t.symbol])) {
            console.log('Cannot calculate alternative routes');
            return;
        }

        setIsAlternativeRouteDataLoading(true);

        console.log('Do calculate alternative routes!');

        const tokens = window.adrena.client.tokens.filter(t => t.symbol !== collateralToken.symbol);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const collateralPrice = tokenPrices[collateralToken.symbol]! * collateralInput;

        try {
            // Load all amounts and fees for all tokens
            const amountsAndFees = await Promise.allSettled(
                tokens.map(t => window.adrena.client
                    .getAddLiquidityAmountAndFee({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        amountIn: uiToNative(collateralPrice / tokenPrices[t.symbol]!, t.decimals),
                        token: t,
                    }))
            );

            setIsAlternativeRouteDataLoading(false);

            // Verify that information is not outdated
            // If loaderCounter doesn't match it means
            // an other request has been casted due to input change, we need to drop the result as it doesn't match input anymore
            if (localLoadingCounter !== loadingCounterAlternativeData) {
                return;
            }

            setAlternativeRoutesFees(amountsAndFees.reduce((acc, amountAndFee, i) => ({
                ...acc,
                [tokens[i].symbol]: {
                    error: amountAndFee.status === 'rejected' ? (() => {
                        if (typeof amountAndFee.reason === 'object' && typeof (amountAndFee.reason as { errorString: string })['errorString'] !== 'undefined') {
                            return (amountAndFee.reason as { errorString: string }).errorString;
                        }

                        return 'Cannot calculate';
                    })() : null,
                    fee: amountAndFee.status === 'fulfilled' && amountAndFee.value !== null ? nativeToUi(amountAndFee.value.fee, tokens[i].decimals) : null,
                    feeUsd: null,
                    betterRoute: null,
                    bestRoute: null,
                },
            }), {}));
        } catch (e) {
            console.log('Error getting amounts and fees for alternative routes', e);

            setAlternativeRoutesFees(tokens.reduce((acc, t) => ({
                ...acc,
                [t.symbol]: {
                    error: 'Cannot calculate',
                    fee: null,
                    feeUsd: null,
                    betterRoute: null,
                    bestRoute: null,
                },
            }), {}));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collateralInput, collateralToken.symbol]);

    const estimateAddLiquidityAndFee = useCallback(async () => {
        // Because we fire one request every time the user change the input, needs to keep only the last one
        const localLoadingCounter = ++loadingCounterMainData;

        setErrorMessage(null);
        setFee(null);
        setFeeUsd(null);
        setAlternativeRoutesFees(null);

        // Cannot calculate
        if (collateralInput === null) {
            console.log('Cannot calculate');
            return;
        }

        setIsMainDataLoading(true);

        console.log('Do calculate!');

        try {
            const amountAndFee = await window.adrena.client
                .getAddLiquidityAmountAndFee({
                    amountIn: uiToNative(collateralInput, collateralToken.decimals),
                    token: collateralToken,
                });

            setIsMainDataLoading(false);

            // Verify that information is not outdated
            // If loaderCounter doesn't match it means
            // an other request has been casted due to input change, we need to drop the result as it doesn't match input anymore
            if (localLoadingCounter !== loadingCounterMainData) {
                return;
            }

            if (!amountAndFee) {
                setErrorMessage('Liquidity amount and fee not found');
                return;
            }

            setAlpInput(nativeToUi(amountAndFee.amount, window.adrena.client.alpToken.decimals));
            setFee(nativeToUi(amountAndFee.fee, collateralToken.decimals));
            setErrorMessage(null);
        } catch (e) {
            console.log('Error loading price', e);
            if (typeof e === 'object' && typeof (e as { errorString: string })['errorString'] !== 'undefined') {
                setErrorMessage((e as { errorString: string }).errorString);
                return;
            }

            // we set this error message because we do not get error message from anchor simulate
            setErrorMessage('Pool ratio reached for this token');
        }
    }, [collateralInput, collateralToken]);

    // Keep price up tp date
    useEffect(() => {
        setCollateralPrice(tokenPrices[collateralToken.symbol]);
    }, [collateralToken, collateralInput, tokenPrices]);

    // Keep collateral input usd value up to date
    useEffect(() => {
        if (collateralToken !== null && collateralPrice !== null && collateralInput !== null) {
            setCollateralInputUsd(collateralPrice * collateralInput);
        } else {
            setCollateralInputUsd(null);
        }
    }, [collateralInput, collateralPrice, collateralToken]);

    // Keep fee usd value up to date
    useEffect(() => {
        if (fee !== null && collateralPrice !== null) {
            setFeeUsd(fee * collateralPrice);
            return;
        }

        setFeeUsd(null);
    }, [collateralPrice, fee]);

    useEffect(() => {
        if (alternativeRoutesFees === null) return;

        // If the actual fee is 1.5x higher than the best alternative route, display warning

        setAlternativeRoutesFees((prev) => {
            if (prev === null) return null;

            const alternativeRoutesFeesTmp = Object.fromEntries(Object.entries(prev).map(([tokenSymbol, info]) => {
                const alternativeRouteFeeUsd = tokenPrices[tokenSymbol] === null || info.fee === null ? null : info.fee * tokenPrices[tokenSymbol];

                return [tokenSymbol, {
                    ...info,
                    feeUsd: alternativeRouteFeeUsd,
                    betterRoute: feeUsd !== null && alternativeRouteFeeUsd !== null && feeUsd > alternativeRouteFeeUsd,
                    bestRoute: false,
                }];
            }));

            const [bestRouteSymbol] = Object.entries(alternativeRoutesFeesTmp).reduce((best, entry) => {
                if (best[1] === null || best[1].feeUsd === null) {
                    return entry;
                }

                if (entry[1].feeUsd === null) {
                    return best;
                }

                if (entry[1].feeUsd < best[1].feeUsd) {
                    return entry;
                }

                return best;
            }, [null, null] as [string | null, { feeUsd: number | null } | null]);

            if (bestRouteSymbol !== null)
                alternativeRoutesFeesTmp[bestRouteSymbol].bestRoute = true;

            return alternativeRoutesFeesTmp;
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [!!alternativeRoutesFees, tokenPrices]);

    useEffect(() => {

        let shouldDisplayHighFeeWarning = false;

        Object.values(alternativeRoutesFees ?? {}).forEach((info) => {
            if (info.feeUsd !== null && feeUsd !== null && feeUsd > info.feeUsd * 1.5) {
                shouldDisplayHighFeeWarning = true;
            }
        });

        setHighFeeWarning(shouldDisplayHighFeeWarning);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alternativeRoutesFees]);

    // Trigger calculations
    useEffect(() => {
        estimateAddLiquidityAndFee();
        estimateAddLiquidityAndFeeForAlternativeRoutes();
    }, [collateralInput, estimateAddLiquidityAndFee, estimateAddLiquidityAndFeeForAlternativeRoutes]);

    return (
        <div className={twMerge('relative flex flex-col gap-1', className)}>
            <div className="bg-blue/30 p-4 border-dashed border-blue text-sm rounded flex relative w-full pl-10">
                <Image
                    className="opacity-100 absolute left-3 top-auto bottom-auto"
                    src={infoIcon}
                    height={20}
                    width={20}
                    alt="Info icon"
                />

                For the protocol health, please consider depositing using the best routes. You get lower fees, protocol pool stays balanced, we all win ❤️
            </div>

            {walletTokenBalances ? <div className="flex flex-row justify-end items-center cursor-pointer" onClick={() => {
                setCollateralInput(walletTokenBalances[collateralToken.symbol]);
            }}>
                <FormatNumber
                    nb={walletTokenBalances[collateralToken.symbol]}
                    className='text-xs items-center justify-center'
                />

                <RefreshButton />
            </div> : null}

            <TradingInput
                className="text-sm rounded-full"
                inputClassName='bg-inputcolor'
                tokenListClassName='rounded-tr-lg rounded-br-lg bg-inputcolor'
                menuClassName="shadow-none"
                menuOpenBorderClassName="rounded-tr-lg rounded-br-lg"
                value={collateralInput}
                selectedToken={collateralToken ?? undefined}
                tokenList={window.adrena.client.tokens}
                subText={
                    collateralPrice !== null && collateralToken ? (
                        <span className="text-txtfade">
                            {formatPriceInfo(
                                collateralInputUsd,
                                collateralToken.displayPriceDecimalsPrecision,
                            )}
                        </span>
                    ) : null
                }
                onTokenSelect={(t: Token) => {
                    setCollateralInput(null);
                    setCollateralInputUsd(null);
                    setAlternativeRoutesFees(null);
                    setAlpInput(null);
                    setFee(null);
                    setFeeUsd(null);
                    setCollateralPrice(null);
                    setCollateralToken(t);
                    setHighFeeWarning(false);
                }}
                onChange={(v: number | null) => {
                    // ALP number needs to be recalculated
                    setAlpInput(null);
                    setCollateralInput(v);
                }}
            />

            <div className="flex flex-row justify-between items-center">

            </div>

            {getArrowElement('down', 'relative h-6 w-4 pt-2 mb-2 opacity-50')}

            <TradingInput
                className="text-sm rounded-full"
                inputClassName='bg-third'
                tokenListClassName='rounded-tr-lg rounded-br-lg bg-third'
                menuClassName="shadow-none justify-end mr-2"
                menuOpenBorderClassName="rounded-tr-lg rounded-br-lg"
                loading={isMainDataLoading}
                disabled={true}
                value={alpInput}
                selectedToken={window.adrena.client.alpToken}
                tokenList={[window.adrena.client.alpToken]}
                placeholder='0'
                onTokenSelect={() => {
                    // only one token
                }}
                onChange={() => {
                    // ignore
                }}
            />

            <h5 className="text-white mt-4 mb-2 ml-6">Buy Info</h5>

            <div
                className={twMerge(
                    'flex flex-col bg-third border rounded-lg pt-2 pr-2 pl-2 gap-1',
                    className,
                )}
            >
                <div className="flex justify-between items-center h-12 p-4">
                    <div className="flex items-center">
                        <div className="text-sm text-txtfade">Fees</div>
                    </div>

                    {fee !== null ? <div className='flex flex-col justify-end pr-4'>
                        <div className='flex gap-1 items-center'>
                            <FormatNumber
                                nb={fee}
                                isDecimalDimmed={false}
                                className='text-base'
                                format="number"
                            />
                            <div className='text-base'>{collateralToken?.symbol}</div>
                        </div>

                        <div>
                            <FormatNumber
                                nb={feeUsd}
                                isDecimalDimmed={false}
                                className='text-xs text-txtfade'
                                format="currency"
                            />
                        </div>
                    </div> : <div className="w-[9em] h-6 bg-gray-800 rounded-xl" />}
                </div>

                <div className='w-full h-[1px] bg-gray-800' />

                <div className="flex flex-col mt-3">
                    <div className="text-sm text-txtfade ml-4">
                        Alternative Routes
                    </div>

                    <div className="w-full p-3 gap-2 flex flex-wrap">
                        {window.adrena.client.tokens.map((token) => (
                            <div key={token.symbol} className={twMerge(
                                'flex flex-col grow items-center justify-center',
                                token.symbol === collateralToken.symbol ? 'hidden' : '',
                            )}>
                                <div className={twMerge(
                                    'flex flex-col items-center justify-between rounded-lg cursor-pointer border border-gray-800 grow overflow-hidden w-full',
                                )}
                                    onClick={() => {
                                        setCollateralInput(null);
                                        setCollateralInputUsd(null);
                                        setAlternativeRoutesFees(null);
                                        setAlpInput(null);
                                        setFee(null);
                                        setFeeUsd(null);
                                        setCollateralPrice(null);
                                        setCollateralToken(token);
                                    }}
                                >
                                    <div className="flex flex-row items-center gap-3 p-2">
                                        <Image
                                            src={token.image}
                                            className="w-4 h-4"
                                            alt="token logo"
                                        />
                                        <p>{token.symbol}</p>
                                    </div>

                                    <div className='w-full h-[1px] bg-gray-800' />

                                    <div className="flex items-center p-2 h-10 min-w-[6em] w-auto justify-center flex-col">
                                        {!isAlternativeRouteDataLoading ?
                                            alternativeRoutesFees?.[token.symbol]?.error ? <span
                                                className="text-xs max-w-full text-txtfade text-center text-wrap">
                                                {alternativeRoutesFees[token.symbol].error}
                                            </span>
                                                :
                                                <FormatNumber
                                                    nb={alternativeRoutesFees?.[token.symbol]?.feeUsd}
                                                    format="currency"
                                                    className="text-sm"
                                                /> :
                                            <div className="w-[5em] h-4 bg-gray-800 rounded-xl" />}
                                    </div>

                                    <Button
                                        title="use"
                                        className='h-6 w-full rounded-none opacity-80 hover:opacity-100'
                                        variant="primary"
                                        onClick={() => {
                                            setCollateralInput(null);
                                            setCollateralInputUsd(null);
                                            setAlternativeRoutesFees(null);
                                            setAlpInput(null);
                                            setFee(null);
                                            setFeeUsd(null);
                                            setCollateralPrice(null);
                                            setCollateralToken(token);
                                        }}
                                    />
                                </div>

                                {alternativeRoutesFees?.[token.symbol]?.bestRoute ?
                                    <div className='text-xs font-boldy h-8 flex items-center justify-center' onClick={() => {
                                        setCollateralInput(null);
                                        setCollateralInputUsd(null);
                                        setAlternativeRoutesFees(null);
                                        setAlpInput(null);
                                        setFee(null);
                                        setFeeUsd(null);
                                        setCollateralPrice(null);
                                        setCollateralToken(token);
                                    }}>Best route!</div> :
                                    alternativeRoutesFees?.[token.symbol]?.betterRoute ?
                                        <div className='text-xs font-boldy h-8 flex items-center justify-center' onClick={() => {
                                            setCollateralInput(null);
                                            setCollateralInputUsd(null);
                                            setAlternativeRoutesFees(null);
                                            setAlpInput(null);
                                            setFee(null);
                                            setFeeUsd(null);
                                            setCollateralPrice(null);
                                            setCollateralToken(token);
                                        }}>Better route!</div> : <div className='h-8' />}
                            </div>
                        ))}
                    </div>
                </div>

                {highFeeWarning ? <Tippy
                    content={
                        <div className="text-sm flex flex-col text-center gap-2">
                            This is not optimal and we are working on an improved experience with the upcoming &quot;deposit in ratio&quot; system.
                        </div>
                    }
                    placement="auto"
                >
                    <div className="bg-orange/30 p-4 border-dashed border-orange rounded flex relative w-full flex-col pl-10 text-sm">
                        <Image
                            className="opacity-100 absolute left-3 top-auto bottom-auto"
                            src={warningIcon}
                            height={20}
                            width={20}
                            alt="Warning icon"
                        />
                        High fees, consider using a different asset, or in lower proportion and breaking down the deposits.
                        <Button
                            title="Swap on Jupiter"
                            href={`https://jup.ag/swap/USDC-`}
                            isOpenLinkInNewTab
                            rightIcon={jupIcon}
                            iconClassName="w-5 h-5"
                            // size="lg"
                            className="mt-4 px-14 py-3 text-base"
                        />
                    </div>

                </Tippy> : null}
            </div>

            {errorMessage ? (
                <div className="flex mt-4 text-xs font-mono w-full items-center justify-center bg-[#ff000030] pt-2 pb-2">
                    {'>>'} {errorMessage}
                </div>
            ) : null}

            {/* Button to execute action */}
            <Button
                title="Buy ALP"
                size="lg"
                disabled={errorMessage !== null || isMainDataLoading || alpInput === null || collateralInput === null}
                className="justify-center w-full mt-2"
                onClick={executeBuyAlp}
            />
        </div>
    );
}

