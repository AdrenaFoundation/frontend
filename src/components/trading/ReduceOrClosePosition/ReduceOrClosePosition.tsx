import { BN } from '@project-serum/anchor';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import Button from '@/components/Button/Button';
import Checkbox from '@/components/Checkbox/Checkbox';
import { BPS, USD_DECIMALS } from '@/constant';
import useGetPositionExitPriceAndFee from '@/hooks/useGetPositionExitPriceAndFee';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  formatNumber,
  formatPriceInfo,
  nativeToUi,
  uiToNative,
} from '@/utils';

import TradingInput from '../TradingInput/TradingInput';

export default function ReduceOrClosePosition({
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
  const [allowedIncreasedSlippage, setAllowedIncreasedSlippage] =
    useState<boolean>(false);
  const [input, setInput] = useState<number | null>(null);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const priceAndFee = useGetPositionExitPriceAndFee(position, client);

  const markPrice: number | null = tokenPrices[position.token.name];

  const entryPrice: number | null = priceAndFee
    ? nativeToUi(priceAndFee.price, 6)
    : null;

  const rowStyle = 'w-full flex justify-between mt-2';

  const updatedLeverage: number | null = (() => {
    if (!input) return null;

    // PnL is taken into account when calculating new position leverage
    const newPositionUsd =
      position.uiCollateralUsd - input + (position.uiPnl ?? 0);

    if (newPositionUsd <= 0) {
      return newPositionUsd;
    }

    return position.uiSizeUsd / newPositionUsd;
  })();

  const maxAuthorizedLeverage: number | null = (() => {
    const maxLeverageBN = client?.custodies.find((custody) =>
      custody.pubkey.equals(position.custody),
    )?.pricing.maxLeverage;

    if (!maxLeverageBN) return null;

    return maxLeverageBN.toNumber() / BPS;
  })();

  const closing = input == position.uiCollateralUsd;

  const overMaxAuthorizedLeverage: boolean | null =
    maxAuthorizedLeverage === null || updatedLeverage === null
      ? null
      : (updatedLeverage < 0 || updatedLeverage > maxAuthorizedLeverage) &&
        !closing;

  const executeBtnText = (() => {
    if (!input) return 'Enter an amount';

    if (overMaxAuthorizedLeverage) {
      return 'Leverage over limit';
    }

    if (!closing) {
      return 'Reduce Position';
    }

    return 'Close Position';
  })();

  const doPartialClose = async () => {
    if (!client || !input) return;

    try {
      const txHash = await client.removeCollateral({
        position,
        collateralUsd: uiToNative(input, USD_DECIMALS),
      });

      addSuccessTxNotification({
        title: 'Successfull Position Reducing',
        txHash,
      });

      triggerPositionsReload();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Reducing Position',
        error,
      });
    }
  };

  const doFullClose = async () => {
    if (!client || !markPrice) return;

    try {
      const priceAndFee = await client.getExitPriceAndFee({
        position,
      });

      if (!priceAndFee) {
        return addNotification({
          title: 'Cannot calculate position closing price',
          type: 'info',
        });
      }

      const priceWithSlippage = priceAndFee.price
        .mul(new BN(10_000 - (allowedIncreasedSlippage ? 1 : 0.3 * 100)))
        .div(new BN(10_000));

      const txHash = await client.closePosition({
        position,
        price: priceWithSlippage,
      });

      addSuccessTxNotification({
        title: 'Successfull Position Close',
        txHash,
      });

      triggerPositionsReload();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Closing Position',
        error,
      });
    }
  };

  const handleExecute = async () => {
    if (!input) return;

    if (input > position.uiCollateralUsd) {
      setInput(position.uiCollateralUsd);
      return;
    }

    if (closing) {
      await doFullClose();
    } else {
      await doPartialClose();
    }

    onClose();
  };

  return (
    <div className={twMerge('flex', 'flex-col', 'h-full', className)}>
      <TradingInput
        textTopLeft={
          <>
            Close
            {input && markPrice
              ? `: ${formatNumber(input / markPrice, 6)} ${position.token.name}`
              : null}
          </>
        }
        textTopRight={
          <>{`Max: ${formatNumber(position.uiCollateralUsd, USD_DECIMALS)}`}</>
        }
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
        onMaxButtonClick={() => {
          setInput(position.uiCollateralUsd);
        }}
      />

      <div className="flex flex-col text-sm">
        <div className="flex w-full justify-evenly mt-4">
          {[25, 50, 75, 100].map((percentage) => (
            <div
              key={percentage}
              className="cursor-pointer text-txtfade hover:text-txtregular"
              onClick={() => {
                setInput(
                  Number(
                    formatNumber(
                      (position.uiCollateralUsd * percentage) / 100,
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

        <div className={`${rowStyle} mt-4`}>
          <div className="text-txtfade">Allow up to 1% slippage</div>
          <div className="flex items-center">
            <Checkbox
              checked={allowedIncreasedSlippage}
              onChange={setAllowedIncreasedSlippage}
            />
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Allowed slippage</div>
          <div>{allowedIncreasedSlippage ? '1.00%' : '0.30%'}</div>
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
          <div>{formatPriceInfo(position.uiLiquidationPrice ?? null)}</div>
        </div>

        <div className="mt-2 h-[1px] w-full bg-grey" />

        <div className={rowStyle}>
          <div className="text-txtfade">Size</div>
          <div className="flex">
            {!input ? formatPriceInfo(position.uiCollateralUsd) : null}

            {input ? (
              <>
                {formatPriceInfo(position.uiCollateralUsd)}
                {
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="images/arrow-right.svg" alt="arrow right" />
                }
                {formatPriceInfo(position.uiCollateralUsd - input)}
              </>
            ) : null}
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Leverage</div>
          <div className="flex">
            {closing ? (
              '-'
            ) : (
              <>
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
                        overMaxAuthorizedLeverage && 'text-red-400',
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
              </>
            )}
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Collateral ({position.token.name})</div>
          <div className="flex">
            {!input && markPrice
              ? formatNumber(position.uiCollateralUsd / markPrice, 6)
              : null}

            {input && markPrice ? (
              <>
                {formatNumber(position.uiCollateralUsd / markPrice, 6)}
                {
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="images/arrow-right.svg" alt="arrow right" />
                }
                {formatNumber(
                  (position.uiCollateralUsd - input) / markPrice,
                  6,
                )}
              </>
            ) : null}
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">PnL</div>
          <div>
            {position.uiPnl && markPrice
              ? formatPriceInfo(position.uiPnl, true)
              : null}
          </div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Fees</div>
          <div>
            {priceAndFee
              ? formatPriceInfo(nativeToUi(priceAndFee.fee, USD_DECIMALS))
              : '-'}
          </div>
        </div>
      </div>

      <Button
        className="mt-4 bg-highlight"
        title={executeBtnText}
        activateLoadingIcon={true}
        onClick={() => handleExecute()}
        disabled={!!overMaxAuthorizedLeverage}
      />
    </div>
  );
}
