import { BN } from '@project-serum/anchor';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import Button from '@/components/Button/Button';
import Checkbox from '@/components/Checkbox/Checkbox';
import { USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  DISPLAY_NUMBER_PRECISION,
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

  const markPrice: number | null = tokenPrices[position.token.name];

  const entryPrice: number =
    nativeToUi(position.collateralUsd, 6) /
    nativeToUi(position.collateralAmount, position.token.decimals);

  const rowStyle = 'w-full flex justify-between mt-2';

  const pnl = position.pnl
    ? !position.pnl.profit.isZero()
      ? nativeToUi(position.pnl.profit, 6)
      : nativeToUi(position.pnl.loss, 6) * -1
    : null;

  const executeBtnText = (() => {
    if (!input) return 'Enter an amount';

    if (input < nativeToUi(position.collateralUsd, 6)) {
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

    const price = uiToNative(markPrice, USD_DECIMALS);

    const priceWithSlippage = price.add(
      price
        .mul(new BN(allowedIncreasedSlippage ? 1 : 0.3 * 100))
        .div(new BN(10_000)),
    );

    // TODO: Price should be calculated correctly using getExitPriceAndFee views
    // Price we use now do not account for fees, making position close to fail all the time due to slippage
    // Instead, to make it work now, we use High artificial Slippage
    const artificialSlippageToDeleteLater = priceWithSlippage
      .mul(new BN(10_000))
      .div(new BN(9_000));

    try {
      const txHash = await client.closePosition({
        position,
        // price: priceWithSlippage,
        price: artificialSlippageToDeleteLater,
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

    if (input < position.uiCollateralUsd) {
      await doPartialClose();
    } else {
      await doFullClose();
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
              ? `: ${formatNumber(
                  input / markPrice,
                  DISPLAY_NUMBER_PRECISION,
                )} ${position.token.name}`
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
          <div>{markPrice ? formatPriceInfo(markPrice) : '-'}</div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Entry Price</div>
          <div>{entryPrice ? formatPriceInfo(entryPrice) : '-'}</div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Liq. Price</div>
          <div>
            {position.uiLiquidationPrice
              ? formatPriceInfo(position.uiLiquidationPrice)
              : '-'}
          </div>
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
          <div>{pnl && markPrice ? formatPriceInfo(pnl, true) : null}</div>
        </div>

        <div className={rowStyle}>
          <div className="text-txtfade">Fees</div>
          <div>TODO</div>
        </div>
      </div>

      <Button
        className="mt-4 bg-highlight"
        title={executeBtnText}
        activateLoadingIcon={true}
        onClick={() => handleExecute()}
      />
    </div>
  );
}
