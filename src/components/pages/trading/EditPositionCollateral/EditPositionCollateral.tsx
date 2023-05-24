import { BN } from '@project-serum/anchor';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
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
  client,
}: {
  className?: string;
  position: PositionExtended;
  triggerPositionsReload: () => void;
  onClose: () => void;
  client: AdrenaClient | null;
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

  const rowStyle = 'w-full flex justify-between mt-2';

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
    if (!client)
      return {
        minLeverage: null,
        maxLeverage: null,
      };

    const custody = client.getCustodyByMint(position.token.mint);

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
    if (!client || !input) return;

    try {
      const txHash = await client.removeCollateral({
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
    if (!client || !input) return;

    try {
      const txHash = await client.addCollateralToPosition({
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
    if (!client || !input) {
      setAmountAndFee(null);
      setLiquidationPrice(null);
      return;
    }

    const localLoadingCounter = ++loadingCounter;

    // Load new amount and fee
    (selectedAction === 'deposit'
      ? client.getAddLiquidityAmountAndFee({
          amountIn: uiToNative(input, position.token.decimals),
          token: position.token,
        })
      : client.getRemoveLiquidityAmountAndFee({
          lpAmountIn: uiToNative(input, AdrenaClient.alpToken.decimals),
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
    client
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
  }, [client, input, position, position.token, selectedAction]);

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
    <div className={twMerge('flex', 'flex-col', 'h-full', className)}>
      <TabSelect
        className="mb-4"
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
          textTopRight={`Max: ${(() => {
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
                ? `: ${formatNumber(input / markPrice, 6)} ${
                    position.token.name
                  }`
                : null}
            </>
          }
          textTopRight={`Max: ${formatNumber(
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

      <div className="flex flex-col text-sm">
        {selectedAction === 'withdraw' ? (
          <>
            <div className="flex w-full justify-evenly mt-4">
              {[25, 50, 75, 100].map((percentage) => (
                <div
                  key={percentage}
                  className="cursor-pointer text-txtfade hover:text-txtregular"
                  onClick={() => {
                    setInput(
                      Number(
                        formatNumber(
                          (position.collateralUsd * percentage) / 100,
                          USD_DECIMALS,
                        ),
                      ),
                    );
                  }}
                >
                  {percentage}%
                </div>
              ))}
            </div>
            <div className="mt-2 h-[1px] w-full bg-grey" />
          </>
        ) : null}

        <div className={rowStyle}>
          <div className="text-txtfade">Leverage</div>
          <div className="flex">
            {updatedLeverage !== 0 ? (
              <div>{formatNumber(position.leverage, 2)}x</div>
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

        <div className="mt-2 h-[1px] w-full bg-grey" />

        <div className={rowStyle}>
          <div className="text-txtfade">Mark Price</div>
          <div>{formatPriceInfo(markPrice)}</div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Entry Price</div>
          <div>{formatPriceInfo(entryPrice)}</div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Liq. Price</div>
          <div>{formatPriceInfo(liquidationPrice)}</div>
        </div>

        <div className="mt-2 h-[1px] w-full bg-grey" />

        <div className={rowStyle}>
          <div className="text-txtfade">Size</div>
          <div className="flex">{formatPriceInfo(position.collateralUsd)}</div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Collateral ({position.token.name})</div>
          <div className="flex">
            {!input && markPrice
              ? formatNumber(position.collateralUsd / markPrice, USD_DECIMALS)
              : null}

            {input && markPrice ? (
              <>
                {formatNumber(position.collateralUsd / markPrice, USD_DECIMALS)}
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
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Fees</div>
          <div>
            {amountAndFee
              ? formatPriceInfo(nativeToUi(amountAndFee.fee, USD_DECIMALS))
              : '-'}
          </div>
        </div>
      </div>

      <Button
        className="mt-4 bg-highlight"
        title={executeBtnText}
        activateLoadingIcon={true}
        onClick={() => handleExecute()}
        disabled={!!overMaxAuthorizedLeverage || !!overMinAuthorizedLeverage}
      />
    </div>
  );
}
