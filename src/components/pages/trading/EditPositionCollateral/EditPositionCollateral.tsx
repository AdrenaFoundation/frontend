import { BN } from '@project-serum/anchor';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { AmountAndFee, PositionExtended, Token } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  formatNumber,
  formatPriceInfo,
  nativeToUi,
  uiToNative,
} from '@/utils';

import TradingInput from '../TradingInput/TradingInput';

// use the counter to handle asynchronous multiple loading
// always ignore outdated informations
let loadingCounter = 0;

export default function EditPositionCollateral({
  className,
  position,
  triggerPositionsReload,
  onClose,
}: {
  className?: string;
  position: PositionExtended;
  triggerPositionsReload: () => void;
  onClose: () => void;
}) {
  const [selectedAction, setSelectedAction] = useState<'deposit' | 'withdraw'>(
    'deposit',
  );
  const [input, setInput] = useState<number | null>(null);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const [amountAndFee, setAmountAndFee] = useState<AmountAndFee | null>(null);
  const [liquidationPrice, setLiquidationPrice] = useState<number | null>(
    position.liquidationPrice ?? null,
  );

  const markPrice: number | null = tokenPrices[position.token.name];

  const walletBalance: number | null =
    walletTokenBalances?.[position.token.name] ?? null;

  const listStyle = 'w-full flex justify-between';

  const entryPrice: number = position.price;

  /**/
  const updatedLeverage: number | null = (() => {
    if (!input || markPrice === null) return null;

    // PnL is taken into account when calculating new position leverage
    const newPositionUsd =
      selectedAction === 'deposit'
        ? position.collateralUsd + markPrice * input + (position.pnl ?? 0)
        : position.collateralUsd - input + (position.pnl ?? 0);

    if (newPositionUsd <= 0) {
      return newPositionUsd;
    }

    return position.sizeUsd / newPositionUsd;
  })();

  const { minLeverage, maxLeverage } = (() => {
    const custody = window.adrena.client.getCustodyByMint(position.token.mint);

    return {
      minLeverage: 1,
      maxLeverage: custody.maxLeverage,
    };
  })();

  const overMaxAuthorizedLeverage: boolean | null =
    maxLeverage === null || updatedLeverage === null
      ? null
      : updatedLeverage < 0 || updatedLeverage > maxLeverage;

  const overMinAuthorizedLeverage: boolean | null =
    maxLeverage === null || updatedLeverage === null
      ? null
      : updatedLeverage < 0 || updatedLeverage < minLeverage;

  const executeBtnText = (() => {
    if (!input) return 'Enter an amount';

    if (overMaxAuthorizedLeverage || overMinAuthorizedLeverage) {
      return 'Leverage over limit';
    }

    return selectedAction === 'deposit' ? 'Deposit' : 'Withdraw';
  })();

  const doRemoveCollateral = async () => {
    if (!input) return;

    try {
      const txHash = await window.adrena.client.removeCollateral({
        position,
        collateralUsd: uiToNative(input, USD_DECIMALS),
      });

      addSuccessTxNotification({
        title: 'Successfull Withdraw',
        txHash,
      });

      triggerPositionsReload();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Withdraw Error',
        error,
      });
    }
  };

  const doAddCollateral = async () => {
    if (!input) return;

    try {
      const txHash = await window.adrena.client.addCollateralToPosition({
        position,
        addedCollateral: uiToNative(input, position.token.decimals),
      });

      addSuccessTxNotification({
        title: 'Successfull Deposit',
        txHash,
      });

      triggerPositionsReload();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Deposit Error',
        error,
      });
    }
  };

  useEffect(() => {
    if (!input) {
      setAmountAndFee(null);
      setLiquidationPrice(null);
      return;
    }

    const localLoadingCounter = ++loadingCounter;

    // Load new amount and fee
    (selectedAction === 'deposit'
      ? window.adrena.client.getAddLiquidityAmountAndFee({
          amountIn: uiToNative(input, position.token.decimals),
          token: position.token,
        })
      : window.adrena.client.getRemoveLiquidityAmountAndFee({
          lpAmountIn: uiToNative(input, window.adrena.client.alpToken.decimals),
          token: position.token,
        })
    )
      .then((amountAndFee: AmountAndFee | null) => {
        // Verify that information is not outdated
        // If loaderCounter doesn't match it means
        // an other request has been casted due to input change
        if (localLoadingCounter !== loadingCounter) {
          return;
        }

        setAmountAndFee(amountAndFee);
      })
      .catch((e) => {
        // Ignore error
        console.log(e);
      });

    // Load new liquidation price
    window.adrena.client
      .getPositionLiquidationPrice({
        position,
        addCollateral:
          selectedAction === 'deposit'
            ? uiToNative(input, position.token.decimals)
            : new BN(0),
        removeCollateral: new BN(0),
      })
      .then((liquidationPrice: BN | null) => {
        // Verify that information is not outdated
        // If loaderCounter doesn't match it means
        // an other request has been casted due to input change
        if (localLoadingCounter !== loadingCounter) {
          return;
        }

        setLiquidationPrice(
          liquidationPrice
            ? nativeToUi(liquidationPrice, position.token.decimals)
            : null,
        );
      })
      .catch((e) => {
        // Ignore error
        console.log(e);
      });
  }, [input, position, position.token, selectedAction]);

  const handleExecute = async () => {
    if (!input) return;

    // AddCollateral or RemoveCollateral
    try {
      if (selectedAction === 'deposit') {
        await doAddCollateral();
      } else {
        await doRemoveCollateral();
      }
    } finally {
      onClose();
    }
  };

  return (
    <div className={twMerge('flex flex-col gap-3 h-full', className)}>
      <TabSelect
        selected={selectedAction}
        tabs={[{ title: 'deposit' }, { title: 'withdraw' }]}
        onClick={(title) => {
          // Reset input when changing selected action
          setInput(null);
          setAmountAndFee(null);
          setSelectedAction(title);
        }}
      />

      {selectedAction === 'deposit' ? (
        <TradingInput
          textTopLeft="Deposit"
          textTopRight={`Max · ${(() => {
            if (walletBalance === null) return null;

            return formatNumber(walletBalance, position.token.decimals);
          })()}`}
          value={input}
          maxButton={true}
          selectedToken={position.token}
          tokenList={[]}
          onTokenSelect={() => {
            // One token only
          }}
          onChange={setInput}
          onMaxButtonClick={() => setInput(walletBalance)}
        />
      ) : (
        <TradingInput
          textTopLeft={
            <>
              Withdraw
              {input && markPrice
                ? ` · ${formatNumber(input / markPrice, 6)} ${
                    position.token.name
                  }`
                : null}
            </>
          }
          textTopRight={`Max · ${formatNumber(
            position.collateralUsd,
            USD_DECIMALS,
          )}`}
          value={input}
          maxButton={true}
          selectedToken={
            {
              name: 'USD',
            } as Token
          }
          tokenList={[]}
          onTokenSelect={() => {
            // One token only
          }}
          onChange={setInput}
          onMaxButtonClick={() => setInput(position.collateralUsd)}
        />
      )}

      <div className="flex flex-col gap-3 text-sm mt-3">
        {selectedAction === 'withdraw' ? (
          <>
            <TabSelect
              tabs={[
                { title: '25%' },
                { title: '50%' },
                { title: '75%' },
                { title: '100%' },
              ]}
              onClick={(title) => {
                setInput(
                  Number(
                    formatNumber(
                      (position.collateralUsd * Number(title.split('%')[0])) /
                        100,
                      USD_DECIMALS,
                    ),
                  ),
                );
              }}
            />
          </>
        ) : null}

        <div className={listStyle}>
          <p className="text-txtfade">Leverage</p>
          <div className="flex font-mono text-right">
            {updatedLeverage !== 0 ? (
              <p>{formatNumber(position.leverage, 2)}x</p>
            ) : (
              '-'
            )}

            {input && updatedLeverage ? (
              <>
                {
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="images/arrow-right.svg" alt="arrow right" />
                }
                <div
                  className={twMerge(
                    (overMaxAuthorizedLeverage || overMinAuthorizedLeverage) &&
                      'text-red-400',
                  )}
                >
                  {updatedLeverage > 0 ? (
                    `${formatNumber(updatedLeverage, 2)}x`
                  ) : (
                    <span>OVER LIMIT</span>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="h-[1px] w-full bg-gray-300 rounded" />

        <ul className="flex flex-col gap-2">
          <li className={listStyle}>
            <p className="opacity-50">Mark Price</p>
            <p className="font-mono text-right">{formatPriceInfo(markPrice)}</p>
          </li>
          <li className={listStyle}>
            <p className="opacity-50">Entry Price</p>
            <p className="font-mono text-right">
              {formatPriceInfo(entryPrice)}
            </p>
          </li>
          <li className={listStyle}>
            <p className="opacity-50">Liq. Price</p>
            <p className="font-mono text-right">
              {formatPriceInfo(liquidationPrice)}
            </p>
          </li>
        </ul>

        <div className="h-[1px] w-full bg-gray-300 rounded" />

        <ul className="flex flex-col gap-2">
          <li className={listStyle}>
            <p className="opacity-50">Size</p>

            <p className="font-mono text-right">
              {formatPriceInfo(position.collateralUsd)}
            </p>
          </li>
          <li className={listStyle}>
            <p className="opacity-50">Collateral ({position.token.name})</p>
            <p className="flex font-mono text-right">
              {!input && markPrice
                ? formatNumber(position.collateralUsd / markPrice, USD_DECIMALS)
                : null}

              {input && markPrice ? (
                <>
                  {formatNumber(
                    position.collateralUsd / markPrice,
                    USD_DECIMALS,
                  )}
                  {
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="images/arrow-right.svg" alt="arrow right" />
                  }
                  {/* TODO: properly account for fees here on final displayed numbers */}
                  {selectedAction === 'deposit'
                    ? formatNumber(
                        position.collateralUsd / markPrice + input,
                        USD_DECIMALS,
                      )
                    : formatNumber(
                        (position.collateralUsd - input) / markPrice,
                        USD_DECIMALS,
                      )}
                </>
              ) : null}
            </p>
          </li>

          <li className={listStyle}>
            <p className="opacity-50">Fees </p>
            <p className="font-mono text-right">
              {amountAndFee
                ? formatPriceInfo(nativeToUi(amountAndFee.fee, USD_DECIMALS))
                : '-'}
            </p>
          </li>
        </ul>
      </div>

      <Button
        className="mt-4"
        size="lg"
        title={executeBtnText}
        onClick={() => handleExecute()}
        disabled={!!overMaxAuthorizedLeverage || !!overMinAuthorizedLeverage}
      />
    </div>
  );
}
