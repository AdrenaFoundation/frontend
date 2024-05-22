import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import { alpLiquidityCap } from '@/constant';
import { FeesAndAmountsType } from '@/pages/buy_alp';
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
  connected,
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
  connected: boolean;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const aumLiquidityRatio = Math.round(((aumUsd ?? 0) * 100) / alpLiquidityCap);
  const [isLoading, setLoading] = useState<boolean>(false);

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

      <h5 className="text-white mt-6">Verify</h5>

      <div
        className={twMerge(
          'flex flex-col bg-black border rounded-lg p-2',
          className,
        )}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-sm text-txtfade">Fees</div>
          </div>

          <div className="relative flex flex-col text-sm font-mono">
            {formatPriceInfo(feesUsd, 4)}
          </div>
        </div>
      </div>

      {actionType === 'buy' ? (
        <div className="flex flex-col mt-4">
          <div className="text-sm mb-3">
            Alternative Routes <span className="text-xs">(Fee Reduction)</span>
          </div>
          <div className="w-full bg-black rounded-lg p-3">
            <ul className="flex flex-col gap-0">
              {window.adrena.client.tokens.map((token) => (
                <li
                  className={twMerge(
                    'flex flex-row items-center justify-between p-2 rounded-lg cursor-pointer border border-transparent',
                    token.symbol === collateralToken.symbol
                      ? 'bg-third border-bcolor'
                      : '',
                  )}
                  onClick={() => {
                    onCollateralTokenChange(token);
                  }}
                  key={token.symbol}
                >
                  <div className="flex flex-row items-center gap-3">
                    <Image
                      src={token.image}
                      className="w-4 h-4"
                      alt="token logo"
                    />
                    <p>{token.symbol}</p>
                  </div>

                  <div className="flex flex-row items-center gap-3">
                    <FormatNumber
                      nb={feesAndAmounts?.[token.symbol].amount}
                      format="currency"
                      className="text-sm"
                      placeholder=""
                    />
                    <input
                      type="radio"
                      checked={token.symbol === collateralToken.symbol}
                      onChange={() => false}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
