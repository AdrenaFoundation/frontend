import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
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
import { formatPriceInfo, nativeToUi, uiToNative } from '@/utils';

import TradingInput from '../../trading/TradingInput/TradingInput';

let loadingCounterMainData = 0;

export default function ALPSwapSell({
    className,
    connected,
}: {
    className?: string;
    connected: boolean;
}) {
    const dispatch = useDispatch();
    const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
    const wallet = useSelector((s) => s.walletState.wallet);
    const usdcToken = window.adrena.client.getUsdcToken();
    const [collateralInput, setCollateralInput] = useState<number | null>(null);
    const [collateralToken, setCollateralToken] = useState<Token>(usdcToken);
    const [collateralPrice, setCollateralPrice] = useState<number | null>(null);
    const [collateralInputUsd, setCollateralInputUsd] = useState<number | null>(null);
    const [isMainDataLoading, setIsMainDataLoading] = useState(false);
    const [alpInput, setAlpInput] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fee, setFee] = useState<number | null>(null);

    const executeSellAlp = useCallback(async () => {
        if (!connected) {
            dispatch(openCloseConnectionModalAction(true));
            return;
        }

        if (
            !wallet?.walletAddress ||
            !alpInput
        ) {
            console.log('Missing some info');
            return;
        }

        const notification =
            MultiStepNotification.newForRegularTransaction('Selling ALP').fire();

        try {
            await window.adrena.client.removeLiquidity({
                owner: new PublicKey(wallet.walletAddress),
                lpAmountIn: uiToNative(alpInput, window.adrena.client.alpToken.decimals),
                mint: collateralToken.mint,

                // TODO: Apply proper slippage
                minAmountOut: new BN(0),
                notification,
            });

            dispatch(fetchWalletTokenBalances());
            setAlpInput(null);
        } catch (error) {
            console.log('error', error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alpInput, collateralInput, collateralToken.decimals, collateralToken.mint, connected, wallet && wallet.walletAddress]);

    const estimateRemoveLiquidityAndFee = useCallback(async () => {
        // Because we fire one request every time the user change the input, needs to keep only the last one
        const localLoadingCounter = ++loadingCounterMainData;

        setErrorMessage(null);
        setFee(null);

        // Cannot calculate
        if (alpInput === null || alpInput === 0) {
            console.log('Cannot calculate');
            return;
        }

        setIsMainDataLoading(true);

        console.log('Do calculate!');

        try {
            const amountAndFee = await window.adrena.client
                .getRemoveLiquidityAmountAndFee({
                    lpAmountIn: uiToNative(alpInput, window.adrena.client.alpToken.decimals),
                    token: collateralToken,
                });

            console.log('>>>> Amount and fee', {
                amount: amountAndFee?.amount.toString(),
                fee: amountAndFee?.fee.toString(),
                collateralTokenDecimals: nativeToUi(amountAndFee?.fee ?? new BN(0), collateralToken.decimals),
            }, {
                lpAmount: uiToNative(alpInput, window.adrena.client.alpToken.decimals),
                token: collateralToken.symbol,
            })

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

            setCollateralInput(nativeToUi(amountAndFee.amount, collateralToken.decimals));
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
    }, [alpInput, collateralToken]);

    // Trigger calculations
    useEffect(() => {
        estimateRemoveLiquidityAndFee();
    }, [estimateRemoveLiquidityAndFee]);

    return (
        <div className={twMerge('relative flex flex-col gap-1', className, !connected && 'opacity-20 cursor-not-allowed')}>
            <div className='flex flex-row gap-2 items-center justify-between mt-4 mb-1'>
                <h5 className="text-white">Collateral</h5>
                {walletTokenBalances ? <div className="flex flex-row justify-end items-center cursor-pointer" onClick={() => {
                    setAlpInput(walletTokenBalances['ALP']);
                }}>
                    <FormatNumber
                        nb={walletTokenBalances['ALP']}
                        className='text-xs items-center justify-center'
                        precision={4}
                    />

                    <RefreshButton />
                </div> : null}

            </div>

            <TradingInput
                className="text-xs rounded-full"
                inputClassName='bg-third'
                value={alpInput}
                selectedToken={window.adrena.client.alpToken}
                tokenList={[window.adrena.client.alpToken]}
                placeholder='0'
                onTokenSelect={() => {
                    // only one token
                }}
                onChange={(v: number | null) => {
                    setAlpInput(v);
                }}
            />

            <h5 className="text-white mt-4 mb-2">Receive</h5>
            <TradingInput
                className="text-xs rounded-full"
                inputClassName='bg-inputcolor'
                value={collateralInput}
                selectedToken={collateralToken ?? undefined}
                loading={isMainDataLoading}
                disabled={true}
                tokenList={[]}
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
                    setFee(null);
                    setCollateralPrice(null);
                    setCollateralToken(t);
                }}
                onChange={() => {
                    // Is disabled
                }}
            />

            <h5 className="text-white mt-4 mb-1">Fees</h5>

            <div
                className={twMerge(
                    'flex flex-col border bg-[#040D14] rounded-lg gap-0',
                    className,
                )}
            >
                <div className="flex justify-between items-center h-12 p-4">
                    <div className="flex gap-2 items-center">
                        <Image
                            src={usdcToken?.image}
                            className="w-4 h-4"
                            alt="token logo"
                        />
                        <p className="text-base font-boldy">
                            {usdcToken?.symbol}
                        </p>
                    </div>

                    {fee !== null ? (
                        <div className="flex flex-col">
                            <div className="flex gap-1 items-center">
                                <FormatNumber
                                    nb={fee}
                                    isDecimalDimmed={false}
                                    className="text-base font-mono"
                                    format="number"
                                />

                                <div className="text-base font-mono">
                                    {usdcToken?.symbol}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-[9em] h-6 bg-gray-800 rounded-xl" />
                    )}
                </div>
            </div>

            {errorMessage ? (
                <div className="flex mt-4 text-xs font-mono w-full items-center justify-center bg-[#ff000030] pt-2 pb-2">
                    {'>>'} {errorMessage}
                </div>
            ) : null}

            {/* Button to execute action */}
            {connected ? <Button
                title={!(alpInput === null || ((walletTokenBalances && (walletTokenBalances['ALP'] ?? 0) < alpInput))) ? "Redeem ALP" : 'Insufficient ALP'}
                size="lg"
                disabled={errorMessage !== null || isMainDataLoading || alpInput === null || collateralInput === null || !!((walletTokenBalances && (walletTokenBalances['ALP'] ?? 0) < alpInput))}
                className="justify-center w-full mt-2"
                onClick={executeSellAlp}
            /> : null}
        </div>
    );
}
