import { BN } from '@coral-xyz/anchor';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import FormatNumber from '@/components/Number/FormatNumber';
import { PRICE_DECIMALS, USD_DECIMALS } from '@/constant';
import { useDebounce } from '@/hooks/useDebounce';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  formatNumber,
  formatPriceInfo,
  nativeToUi,
  uiToNative,
} from '@/utils';

import arrowRightIcon from '../../../../../public/images/arrow-right.svg';
import TradingInput from '../TradingInput/TradingInput';

const LEVERAGE_OVERFLOW = 999;

// use the counter to handle asynchronous multiple loading
// always ignore outdated information
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

  const [liquidationPrice, setLiquidationPrice] = useState<number | null>(
    position.liquidationPrice ?? null,
  );

  const debouncedInput = useDebounce(input);

  const [updatedInfos, setUpdatedInfos] = useState<{
    leverage: number;
    collateral: number;
    collateralUsd: number;
  } | null>();

  const markPrice: number | null = tokenPrices[position.token.symbol];
  const markCollateralPrice: number | null =
    tokenPrices[position.collateralToken.symbol];

  const walletBalance: number | null =
    walletTokenBalances?.[position.token.symbol] ?? null;

  const [underLeverage, setUnderLeverage] = useState<boolean>(false);
  const [overLeverage, setOverLeverage] = useState<boolean>(false);

  const executeBtnText = (() => {
    if (!input) return 'Enter an amount';

    if (underLeverage) {
      return 'Leverage under limit';
    }

    if (overLeverage) {
      return 'Leverage over limit';
    }

    return selectedAction === 'deposit' ? 'Deposit' : 'Withdraw';
  })();

  useEffect(() => {
    if (!updatedInfos) {
      setUnderLeverage(false);
      setOverLeverage(false);
      return;
    }

    if (updatedInfos && updatedInfos.leverage < 1) {
      setUnderLeverage(true);
      setOverLeverage(false);
      return;
    }

    if (updatedInfos && updatedInfos.leverage > 52) {
      setUnderLeverage(false);
      setOverLeverage(true);
      return;
    }
  }, [updatedInfos]);

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
    if (!input || !markCollateralPrice) {
      setLiquidationPrice(null);
      return;
    }

    const localLoadingCounter = ++loadingCounter;

    (async () => {
      const liquidationPrice = await (selectedAction === 'deposit'
        ? window.adrena.client.getPositionLiquidationPrice({
            position,
            addCollateral: uiToNative(input, position.token.decimals),
            removeCollateral: new BN(0),
          })
        : window.adrena.client.getPositionLiquidationPrice({
            position,
            addCollateral: new BN(0),
            removeCollateral: uiToNative(
              input / markCollateralPrice,
              position.token.decimals,
            ),
          }));

      // Verify that information is not outdated
      // If loaderCounter doesn't match it means
      // an other request has been casted due to input change
      if (localLoadingCounter !== loadingCounter) {
        return;
      }

      setLiquidationPrice(
        liquidationPrice ? nativeToUi(liquidationPrice, PRICE_DECIMALS) : null,
      );
    })().catch((e) => {
      // Ignore error
      console.log(e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput, position, position.token, selectedAction]);

  // Recalculate leverage/collateral depending on the input and price
  useEffect(() => {
    if (
      !input ||
      !markCollateralPrice ||
      position.pnl === null ||
      typeof position.pnl === 'undefined'
    ) {
      setUpdatedInfos(null);
      return;
    }

    let updatedCollateralAmount: number;
    let updatedCollateralUsd: number;

    if (selectedAction === 'deposit') {
      updatedCollateralAmount =
        position.collateralUsd / markCollateralPrice + input;

      updatedCollateralUsd = updatedCollateralAmount * markCollateralPrice;
    } else {
      updatedCollateralUsd = position.collateralUsd - input;

      updatedCollateralAmount = updatedCollateralUsd / markCollateralPrice;
    }

    let updatedLeverage =
      position.sizeUsd / (updatedCollateralUsd - position.pnl);

    // Leverage overflow
    if (updatedLeverage < 0) {
      updatedLeverage = LEVERAGE_OVERFLOW;
    }

    setUpdatedInfos({
      leverage: updatedLeverage,
      collateral: updatedCollateralAmount,
      collateralUsd: updatedCollateralUsd,
    });
  }, [
    input,
    markCollateralPrice,
    position.collateralAmount,
    position.collateralUsd,
    position.pnl,
    position.sizeUsd,
    selectedAction,
  ]);

  const calculateCollateralPercentage = (percentage: number) =>
    Number(
      Number((position.collateralUsd * Number(percentage)) / 100).toFixed(
        USD_DECIMALS,
      ),
    );

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

  const rowStyle = 'w-full flex justify-between mt-2';

  const rightArrowElement = (
    <Image
      className="ml-2 mr-2 opacity-60"
      src={arrowRightIcon}
      height={16}
      width={16}
      alt="Arrow"
    />
  );

  return (
    <div className={twMerge('flex flex-col gap-3 h-full w-[24em]', className)}>
      <TabSelect
        wrapperClassName="h-12 flex items-center"
        selected={selectedAction}
        tabs={[{ title: 'deposit' }, { title: 'withdraw' }]}
        onClick={(title) => {
          // Reset input when changing selected action
          setInput(null);
          setSelectedAction(title);
        }}
      />

      {selectedAction === 'deposit' ? (
        <>
          <TradingInput
            className="ml-4 mr-4"
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

          {
            /* Display wallet balance */
            (() => {
              if (!walletTokenBalances) return null;

              const balance =
                walletTokenBalances[position.collateralToken.symbol];
              if (balance === null) return null;

              return (
                <div className="ml-auto mr-4">
                  <FormatNumber
                    nb={balance}
                    precision={position.collateralToken.decimals}
                    className="text-txtfade"
                  />
                  <span className="text-sm text-txtfade ml-1">
                    {position.collateralToken.symbol} in wallet
                  </span>
                </div>
              );
            })()
          }
        </>
      ) : (
        <>
          <TradingInput
            className="ml-4 mr-4"
            value={input}
            selectedToken={
              {
                symbol: 'USD',
              } as Token
            }
            tokenList={[]}
            onTokenSelect={() => {
              // One token only
            }}
            onChange={setInput}
          />

          <div className="text-sm ml-auto mr-4">
            <FormatNumber
              nb={position.collateralUsd}
              format="currency"
              className="inline"
            />{' '}
            of collateral in the position
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 text-sm mt-1 ml-4 mr-4">
        {selectedAction === 'withdraw' ? (
          <div className="bg-third flex justify-evenly p-2 rounded-lg border">
            <div
              className="text-md  hover:text-white cursor-pointer font-mono"
              onClick={() => setInput(calculateCollateralPercentage(25))}
            >
              25%
            </div>
            <div
              className="text-md  hover:text-white cursor-pointer font-mono"
              onClick={() => setInput(calculateCollateralPercentage(50))}
            >
              50%
            </div>
            <div
              className="text-md  hover:text-white cursor-pointer font-mono"
              onClick={() => setInput(calculateCollateralPercentage(75))}
            >
              75%
            </div>
          </div>
        ) : null}

        <div className="flex flex-col border p-4 pt-2 bg-third rounded-lg">
          <div className={rowStyle}>
            <div className="text-sm">Size</div>

            <FormatNumber nb={position.sizeUsd} format="currency" />
          </div>

          <div className={rowStyle}>
            <div className="text-sm">Entry Price</div>

            <FormatNumber nb={position.price} format="currency" />
          </div>

          <div className={rowStyle}>
            <div className="text-sm">Mark Price</div>

            <FormatNumber nb={markPrice} format="currency" />
          </div>

          <div className={rowStyle}>
            <div className="text-sm">PnL</div>

            <FormatNumber
              nb={position.pnl && markPrice ? position.pnl : null}
              displayPlusSign={true}
              format="currency"
              className={`text-${
                position.pnl && position.pnl > 0 ? 'green' : 'red'
              }`}
            />
          </div>

          <div className={rowStyle}>
            <div className="text-sm">Initial Collateral</div>

            <div className="flex">
              <div className="flex flex-col items-end justify-center">
                <FormatNumber
                  nb={position.collateralUsd}
                  format="currency"
                  className={input ? 'text-xs' : 'text-sm'}
                />
              </div>

              {input ? (
                <>
                  {rightArrowElement}

                  <div className="flex flex-col">
                    <div className="flex flex-col items-end">
                      <FormatNumber nb={updatedInfos?.collateralUsd} />
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className={rowStyle}>
            <div className="text-sm">Leverage</div>
            <div className="flex items-center">
              <FormatNumber
                nb={position.leverage}
                suffix="x"
                className={input ? ' text-xs' : 'text-sm'}
                isDecimalDimmed={false}
              />

              {input ? (
                <>
                  {rightArrowElement}

                  {updatedInfos ? (
                    updatedInfos.leverage === LEVERAGE_OVERFLOW ? (
                      <span className="text-sm ">Overflow</span>
                    ) : (
                      <FormatNumber nb={updatedInfos?.leverage} suffix="x" />
                    )
                  ) : (
                    '-'
                  )}
                </>
              ) : null}
            </div>
          </div>

          <div className={rowStyle}>
            <div className="text-sm">Liquidation Price</div>
            <div className="flex items-center">
              <FormatNumber
                nb={position.liquidationPrice}
                format="currency"
                className={input ? ' text-xs' : 'text-sm'}
              />

              {input ? (
                <>
                  {rightArrowElement}

                  <FormatNumber nb={liquidationPrice} format="currency" />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <Button
        className="mt-4 rounded-none font-boldy text-lg"
        size="lg"
        title={executeBtnText}
        onClick={() => handleExecute()}
      />
    </div>
  );
}
