import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import { alpLiquidityCap } from '@/constant';
import { FeesAndAmountsType } from '@/pages/buy_alp_adx';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber, formatPriceInfo, nativeToUi, uiToNative } from '@/utils';

import InfoAnnotation from '../../monitoring/InfoAnnotation';
import TradingInput from '../../trading/TradingInput/TradingInput';

// use the counter to handle asynchronous multiple loading
// always ignore outdated informations
let loadingCounter = 0;

export default function ALPSwapInputs({
  actionType,
  className,
  alpToken,
  collateralToken,
  allowedCollateralTokens,
  alpInput,
  feesUsd,
  onChangeAlpInput,
  setAlpPrice,
  collateralInput,
  onChangeCollateralInput,
  collateralPrice,
  setCollateralPrice,
  onCollateralTokenChange,
  setFeesUsd,
  feesAndAmounts,
  aumUsd,
}: {
  actionType: 'buy' | 'sell';
  className?: string;
  alpToken: Token;
  feesUsd: number | null;
  collateralToken: Token;
  collateralInput: number | null;
  allowedCollateralTokens: Token[] | null;
  collateralPrice: number | null;
  setCollateralPrice: (v: number | null) => void;
  alpInput: number | null;
  onChangeAlpInput: (v: number | null) => void;
  onChangeCollateralInput: (v: number | null) => void;
  setAlpPrice: (v: number | null) => void;
  onCollateralTokenChange: (t: Token) => void;
  setFeesUsd: (f: number | null) => void;
  feesAndAmounts: FeesAndAmountsType | null;
  aumUsd: number | undefined;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const wallet = useSelector((s) => s.walletState.wallet);
  const [connected, setConnected] = useState<boolean>(false);
  const aumLiquidityRatio = Math.round(((aumUsd ?? 0) * 100) / alpLiquidityCap);
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setConnected(!!wallet);
  }, [wallet]);
  // When price change or input change, recalculate inputs and displayed price
  {
    // Adapt displayed prices when token prices change
    useEffect(() => {
      const collateralTokenPrice = tokenPrices[collateralToken.symbol] ?? null;
      const alpTokenPrice = tokenPrices[alpToken.symbol] ?? null;

      if (collateralTokenPrice !== null && collateralInput !== null) {
        setCollateralPrice(collateralInput * collateralTokenPrice);
      }

      if (alpTokenPrice !== null && alpInput !== null) {
        setAlpPrice(alpTokenPrice * alpInput);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      // Don't target tokenPrices directly otherwise it refreshes even when unrelated prices changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
      collateralToken && tokenPrices[collateralToken.symbol],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      alpToken && tokenPrices[alpToken.symbol],
    ]);

    useEffect(() => {
      // Ignore the event as it is not the editable input
      if (actionType === 'buy') return;

      const collateralTokenPrice = tokenPrices[collateralToken.symbol] ?? null;
      // missing informations or empty input
      if (
        alpInput === 0 ||
        alpInput === null ||
        collateralTokenPrice === null
      ) {
        // deprecate current loading
        setLoading(false);
        loadingCounter += 1;

        setSaveUpFees(null);
        onChangeCollateralInput(null);
        setCollateralPrice(null);
        setAlpPrice(null);
        setFeesUsd(null);
        return;
      }

      setLoading(true);

      const localLoadingCounter = ++loadingCounter;

      setFeesUsd(null);

      window.adrena.client
        .getRemoveLiquidityAmountAndFee({
          lpAmountIn: uiToNative(alpInput, alpToken.decimals),
          token: collateralToken,
        })
        .then((amountAndFee) => {
          // Verify that information is not outdated
          // If loaderCounter doesn't match it means
          // an other request has been casted due to input change
          if (localLoadingCounter !== loadingCounter) {
            return;
          }

          if (!amountAndFee) {
            setLoading(false);
            setSaveUpFees(null);
            onChangeCollateralInput(null);
            setCollateralPrice(null);
            setFeesUsd(null);
            return;
          }

          onChangeCollateralInput(
            nativeToUi(amountAndFee.amount, collateralToken.decimals),
          );

          setCollateralPrice(
            collateralTokenPrice *
              nativeToUi(amountAndFee.amount, collateralToken.decimals),
          );

          setFeesUsd(
            collateralTokenPrice *
              nativeToUi(amountAndFee.fee, collateralToken.decimals),
          );
          setLoading(false);
        })
        .catch((e) => {
          console.log('e', e);
          setSaveUpFees(null);
          onChangeCollateralInput(null);
          setCollateralPrice(null);
          setLoading(false);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alpInput, collateralToken]);

    useEffect(() => {
      // Ignore the event as it is not the editable input
      if (actionType === 'sell') return;

      const alpTokenPrice = tokenPrices[alpToken.symbol] ?? null;
      const collateralTokenPrice = tokenPrices[collateralToken.symbol] ?? null;

      // missing informations or empty input
      if (
        collateralInput === null ||
        alpTokenPrice === null ||
        collateralTokenPrice === null
      ) {
        // deprecate current loading
        setLoading(false);
        loadingCounter += 1;

        onChangeAlpInput(null);
        setSaveUpFees(null);
        setAlpPrice(null);
        setCollateralPrice(null);
        setFeesUsd(null);
        return;
      }

      setLoading(true);

      const localLoadingCounter = ++loadingCounter;

      setFeesUsd(null);

      window.adrena.client
        .getAddLiquidityAmountAndFee({
          amountIn: uiToNative(collateralInput, collateralToken.decimals),
          token: collateralToken,
        })
        .then((amountAndFee) => {
          // Verify that information is not outdated
          // If loaderCounter doesn't match it means
          // an other request has been casted due to input change
          if (localLoadingCounter !== loadingCounter) {
            return;
          }

          if (!amountAndFee) {
            setLoading(false);
            setSaveUpFees(null);
            onChangeAlpInput(null);
            setAlpPrice(null);
            setFeesUsd(null);
            return;
          }

          onChangeAlpInput(nativeToUi(amountAndFee.amount, alpToken.decimals));
          setAlpPrice(
            alpTokenPrice * nativeToUi(amountAndFee.amount, alpToken.decimals),
          );

          setFeesUsd(
            collateralTokenPrice *
              nativeToUi(amountAndFee.fee, collateralToken.decimals),
          );
          setLoading(false);
        })
        .catch((e) => {
          console.log('e', e);
          setSaveUpFees(null);
          setAlpPrice(null);
          setLoading(false);
        });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collateralInput, collateralToken]);
  }

  const handleAlpInputChange = (v: number | null) => {
    const nb = Number(v);

    if (v === null || isNaN(nb)) {
      onChangeAlpInput(null);
      return;
    }

    onChangeAlpInput(nb);
  };

  const handleCollateralInputChange = (v: number | null) => {
    const nb = Number(v);

    setSaveUpFees(null);

    if (v === null || isNaN(nb)) {
      onChangeCollateralInput(null);
      return;
    }

    onChangeCollateralInput(nb);
  };

  const alpInputComponent = (
    <TradingInput
      className="text-sm rounded-full"
      inputClassName={actionType === 'sell' ? 'bg-inputcolor' : 'bg-third'}
      tokenListClassName={twMerge(
        'rounded-tr-lg rounded-br-lg',
        actionType === 'sell' ? 'bg-inputcolor' : 'bg-third',
      )}
      menuClassName="shadow-none justify-end mr-2"
      menuOpenBorderClassName="rounded-tr-lg rounded-br-lg"
      loading={actionType === 'buy' && isLoading}
      disabled={actionType === 'buy'}
      value={alpInput}
      maxButton={connected && actionType === 'sell'}
      maxClassName="relative left-6"
      selectedToken={alpToken}
      tokenList={[alpToken]}
      onMaxButtonClick={() => {
        onChangeAlpInput(walletTokenBalances?.[alpToken.symbol] ?? 0);
      }}
      onTokenSelect={() => {
        // only one token
      }}
      onChange={handleAlpInputChange}
    />
  );

  const collateralComponent = (
    <TradingInput
      className="text-sm rounded-full"
      inputClassName={actionType === 'buy' ? 'bg-inputcolor' : 'bg-third'}
      tokenListClassName={twMerge(
        'rounded-tr-lg rounded-br-lg',
        actionType === 'buy' ? 'bg-inputcolor' : 'bg-third',
      )}
      menuClassName="shadow-none"
      menuOpenBorderClassName="rounded-tr-lg rounded-br-lg"
      loading={actionType === 'sell' && isLoading}
      disabled={actionType === 'sell'}
      value={collateralInput}
      maxButton={connected && actionType === 'buy'}
      selectedToken={collateralToken}
      tokenList={allowedCollateralTokens || []}
      subText={
        collateralPrice !== null ? (
          <span className="text-txtfade">
            {formatPriceInfo(collateralPrice, 3)}
          </span>
        ) : null
      }
      onMaxButtonClick={() => {
        setSaveUpFees(null);
        onChangeCollateralInput(
          walletTokenBalances?.[collateralToken.symbol] ?? 0,
        );
      }}
      onTokenSelect={onCollateralTokenChange}
      onChange={(v: number | null) => {
        setSaveUpFees(null);
        handleCollateralInputChange(v);
      }}
    />
  );

  const [saveUpFees, setSaveUpFees] = useState<
    [string, FeesAndAmountsType[0]][] | null
  >(null);

  useEffect(() => {
    if (feesAndAmounts === null) {
      setSaveUpFees(null);
      return;
    }

    setSaveUpFees(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(feesAndAmounts).filter(([_, value]) => {
        if (value.fees === null) return false;

        const feeNow = feesAndAmounts[collateralToken.symbol]?.fees ?? null;

        if (feeNow === null) return false;

        return value.fees < feeNow;
      }),
    );
  }, [collateralToken.symbol, feesAndAmounts]);

  return (
    <div className={twMerge('relative flex flex-col', className)}>
      <h5 className="text-white mb-3">Pay</h5>

      {actionType === 'buy' ? collateralComponent : alpInputComponent}

      {
        /* Display wallet balance */
        (() => {
          const token = actionType === 'buy' ? collateralToken : alpToken;

          if (!token || !walletTokenBalances) return null;

          const balance = walletTokenBalances[token.symbol];
          if (balance === null) return null;

          return (
            <div className="ml-auto mt-3">
              <span className="text-txtfade text-sm font-mono">
                {formatNumber(balance, 4)}
              </span>
              <span className="text-txtfade text-sm ml-1">
                {token.symbol} in wallet
              </span>
            </div>
          );
        })()
      }

      <div className="text-sm text-white mt-2 mb-3">Receive</div>

      {actionType === 'buy' ? alpInputComponent : collateralComponent}

      {actionType === 'buy' && aumUsd ? (
        /* Display AUM / liquidity cap of ALP */
        <div className="mt-4">
          <div className="w-full">
            <div className="flex items-center justify-center mb-2">
              <h6 className="text-txtfade text-xs">
                Assets Under Management ({Math.round(aumUsd)}) / Liquidity Cap (
                {alpLiquidityCap})
              </h6>
            </div>
            <div className="flex-start flex h-2.5 w-full overflow-hidden rounded-full bg-third font-sans text-xs font-medium">
              <div
                className={twMerge(
                  'flex items-center justify-center h-full overflow-hidden text-white break-all bg-white rounded-full',
                  // `w-[${aumLiquidityRatio}%]`, Have to use style because it was not working properly with tailwind
                )}
                style={{ width: `${aumLiquidityRatio}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : null}

      <h5 className="text-white mt-6">Verify</h5>

      <div
        className={twMerge(
          'flex flex-col bg-black border rounded-lg p-2',
          className,
        )}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <InfoAnnotation
              text="Amount of tokens being traded."
              className="w-3 grow-0 mr-1"
            />

            <div className="text-sm text-txtfade">Fees</div>
          </div>

          <div className="relative flex flex-col text-sm font-mono">
            {formatPriceInfo(feesUsd, 4)}
          </div>
        </div>
      </div>

      {actionType === 'buy' ? (
        <div className="flex flex-col mt-4">
          <div className="text-sm">
            Alternative Routes <span className="text-xs">(Fee Reduction)</span>
          </div>

          {saveUpFees !== null && saveUpFees.length ? (
            <div className="flex flex-col gap-y-4 mt-2">
              {(() => {
                const sortedSaveUpFees = saveUpFees
                  // Highest saving first
                  .sort(([, a], [, b]) => (a.fees ?? 0) - (b.fees ?? 0));

                return sortedSaveUpFees.map(([key, value], i) => {
                  return feesUsd ? (
                    <div className="flex flex-col">
                      {i === 0 ? (
                        <div className="text-xs ml-auto mr-auto mt-2 mb-2">
                          Recommended
                        </div>
                      ) : null}

                      <Button
                        key={key}
                        title={
                          <div className="flex">
                            <span className="">use {key} and pay</span>
                            <span className="font-mono ml-1">
                              {formatPriceInfo(value.fees, 4)}
                            </span>
                            <span className="ml-1">of fees</span>
                          </div>
                        }
                        size="lg"
                        variant="secondary"
                        className={twMerge(
                          'justify-center w-full border-2',
                          i === 0 ||
                            sortedSaveUpFees[i - 1][1].fees === value.fees
                            ? 'border-white'
                            : '',
                        )}
                        onClick={() => {
                          onCollateralTokenChange(value.token);

                          // Wait for the input to be updated, then change the input
                          setTimeout(() => {
                            onChangeCollateralInput(
                              Number(
                                value.equivalentAmount?.toFixed(
                                  value.token.decimals,
                                ),
                              ),
                            );
                          }, 0);
                        }}
                      />
                    </div>
                  ) : null;
                });
              })()}
            </div>
          ) : null}

          {saveUpFees !== null && !saveUpFees.length ? (
            <div className="pt-2 pb-2 pr-2 pl-6 bg-black border rounded-lg mt-4 flex justify-center flex-col">
              <span className="text-txtfade">You are using the best route</span>
            </div>
          ) : null}

          {saveUpFees === null ? (
            <div className="pt-2 pb-2 pr-2 pl-6 bg-black border rounded-lg mt-4 flex justify-center flex-col">
              <span className="text-txtfade">Loading ...</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
