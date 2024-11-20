import { BN } from '@coral-xyz/anchor';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import FormatNumber from '@/components/Number/FormatNumber';
import RefreshButton from '@/components/RefreshButton/RefreshButton';
import { PRICE_DECIMALS, USD_DECIMALS } from '@/constant';
import { useDebounce } from '@/hooks/useDebounce';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { getTokenImage, getTokenSymbol, nativeToUi, uiToNative } from '@/utils';

import arrowRightIcon from '../../../../../public/images/arrow-right.svg';
import infoIcon from '../../../../../public/images/Icons/info.svg';
import warningIcon from '../../../../../public/images/Icons/warning.png';
import walletImg from '../../../../../public/images/wallet-icon.svg';
import TradingInput from '../TradingInput/TradingInput';
import NetValueTooltip from '../TradingInputs/NetValueTooltip';

// hardcoded in backend too
const MIN_LEVERAGE = 1.1;

// use the counter to handle asynchronous multiple loading
// always ignore outdated information
let loadingCounter = 0;

export default function EditPositionCollateral({
  className,
  position,
  triggerUserProfileReload,
  onClose,
}: {
  className?: string;
  position: PositionExtended;
  triggerUserProfileReload: () => void;
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
    currentLeverage: number;
    collateral: number;
    collateralUsd: number;
  } | null>();

  const markPrice: number | null =
    tokenPrices[getTokenSymbol(position.token.symbol)];
  const collateralPrice: number | null =
    tokenPrices[position.collateralToken.symbol];

  const walletBalance: number | null =
    walletTokenBalances?.[
    position.side === 'long'
      ? position.token.symbol
      : position.collateralToken.symbol
    ] ?? null;

  const [belowMinLeverage, setBelowMinLeverage] = useState(false);
  const [aboveMaxLeverage, setAboveMaxLeverage] = useState(false);

  const maxInitialLeverage = window.adrena.client.getCustodyByPubkey(
    position.custody,
  )?.maxInitialLeverage;

  const positionNetValue = position.collateralUsd + (position.pnl ?? 0);

  const [newPositionNetValue, setNewPositionNetValue] = useState<number | null>(
    null,
  );

  const executeBtnText = (() => {
    if (selectedAction === 'deposit' && !walletBalance)
      return `No ${position.collateralToken.symbol} in wallet`;
    if (!input) return 'Enter an amount';

    if (belowMinLeverage) {
      return 'Leverage under limit';
    }

    if (aboveMaxLeverage) {
      return 'Leverage over limit';
    }

    return selectedAction === 'deposit' ? 'Deposit' : `Withdraw`;
  })();

  useEffect(() => {
    if (input === null) return setNewPositionNetValue(null);

    if (selectedAction === 'withdraw') {
      return setNewPositionNetValue(positionNetValue - input);
    }

    if (!collateralPrice) return setNewPositionNetValue(null);

    setNewPositionNetValue(positionNetValue + input * collateralPrice);
  }, [collateralPrice, input, positionNetValue, selectedAction]);

  useEffect(() => {
    if (!updatedInfos) {
      setBelowMinLeverage(false);
      setAboveMaxLeverage(false);
      return;
    }

    if (updatedInfos.currentLeverage < MIN_LEVERAGE) {
      setBelowMinLeverage(true);
      setAboveMaxLeverage(false);
      return;
    }

    if (
      maxInitialLeverage &&
      updatedInfos.currentLeverage > maxInitialLeverage
    ) {
      setBelowMinLeverage(false);
      setAboveMaxLeverage(true);
      return;
    }

    setBelowMinLeverage(false);
    setAboveMaxLeverage(false);
  }, [maxInitialLeverage, position.custody, updatedInfos]);

  const doRemoveCollateral = async () => {
    if (!input) return;

    const notification =
      MultiStepNotification.newForRegularTransaction(
        'Remove Collateral',
      ).fire();

    try {
      await (position.side === 'long'
        ? window.adrena.client.removeCollateralLong.bind(window.adrena.client)
        : window.adrena.client.removeCollateralShort.bind(
          window.adrena.client,
        ))({
          position,
          collateralUsd: uiToNative(input, USD_DECIMALS),
          notification,
        });
    } catch (error) {
      console.log('error', error);
    }
  };

  const doAddCollateral = async () => {
    if (!input) return;

    const notification =
      MultiStepNotification.newForRegularTransaction('Add Collateral').fire();

    try {
      await window.adrena.client.addCollateralToPosition({
        position,
        addedCollateral: uiToNative(
          input,
          position.side === 'long'
            ? position.token.decimals
            : position.collateralToken.decimals,
        ),
        notification,
      });

      triggerUserProfileReload();
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    if (!input || !collateralPrice) {
      setLiquidationPrice(null);
      return;
    }

    const localLoadingCounter = ++loadingCounter;

    (async () => {
      const liquidationPrice = await (selectedAction === 'deposit'
        ? window.adrena.client.getPositionLiquidationPrice({
          position,
          addCollateral: uiToNative(
            input,
            position.side === 'long'
              ? position.token.decimals
              : position.collateralToken.decimals,
          ),
          removeCollateral: new BN(0),
        })
        : window.adrena.client.getPositionLiquidationPrice({
          position,
          addCollateral: new BN(0),
          removeCollateral: uiToNative(
            input / collateralPrice,
            position.side === 'long'
              ? position.token.decimals
              : position.collateralToken.decimals,
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
  }, [
    debouncedInput,
    position,
    position.token,
    position.collateralToken,
    selectedAction,
  ]);

  // Recalculate leverage/collateral depending on the input and price
  useEffect(() => {
    if (
      !input ||
      !collateralPrice ||
      position.pnl === null ||
      typeof position.pnl === 'undefined'
    ) {
      setUpdatedInfos(null);
      setBelowMinLeverage(false);
      return;
    }

    let updatedCollateralAmount: number;
    let updatedCollateralUsd: number;

    if (selectedAction === 'deposit') {
      updatedCollateralAmount =
        position.collateralUsd / collateralPrice + input;
      updatedCollateralUsd = updatedCollateralAmount * collateralPrice;
    } else {
      updatedCollateralUsd = Math.max(0, position.collateralUsd - (input || 0));
      updatedCollateralAmount = updatedCollateralUsd / collateralPrice;
    }

    const updatedCurrentLeverage =
      position.sizeUsd / (updatedCollateralUsd + position.pnl);

    if (updatedCurrentLeverage < 1.1) {
      setBelowMinLeverage(true);
      setUpdatedInfos(null);
    } else {
      setBelowMinLeverage(false);

      if (maxInitialLeverage && updatedCurrentLeverage > maxInitialLeverage) {
        setAboveMaxLeverage(true);
      } else {
        setAboveMaxLeverage(false);
      }
      setUpdatedInfos({
        currentLeverage: updatedCurrentLeverage,
        collateral: updatedCollateralAmount,
        collateralUsd: updatedCollateralUsd,
      });
    }
  }, [
    input,
    collateralPrice,
    position.collateralAmount,
    position.collateralUsd,
    position.pnl,
    position.sizeUsd,
    selectedAction,
    maxInitialLeverage,
  ]);

  const calculateCollateralPercentage = (percentage: number) =>
    Number(Number((positionNetValue * Number(percentage)) / 100).toFixed(2));

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

  const rowStyle = 'w-full flex justify-between items-center';

  const rightArrowElement = (
    <Image
      className="ml-2 mr-2 opacity-60"
      src={arrowRightIcon}
      height={16}
      width={16}
      alt="Arrow"
    />
  );

  if (selectedAction === 'withdraw') {
    const maxWithdrawal = positionNetValue;
    if (input !== null && input > maxWithdrawal) {
      setInput(maxWithdrawal);
    }
  } else {
    const maxDeposit = walletBalance ?? 0;
    if (input !== null && input > maxDeposit) {
      setInput(maxDeposit);
    }
  }

  const isInputValid =
    input !== null &&
    input > 0 &&
    (selectedAction === 'deposit' || // the input is capped at what the user has in wallet
      (selectedAction === 'withdraw' && input <= position.collateralUsd));

  return (
    <div
      className={twMerge('flex flex-col gap-2 h-full w-[24em] pt-4', className)}
    >
      <div className="px-4">
        <div className="flex flex-col p-3 py-2.5 border bg-[#040D14] rounded-lg">
          <div className="w-full flex justify-between mt-">
            <div className="flex items-center">
              <Image
                src={getTokenImage(position.token)}
                width={20}
                height={20}
                alt={`${getTokenSymbol(position.token.symbol)} logo`}
                className="mr-2"
              />
              <div className="text-sm text-bold">
                {getTokenSymbol(position.token.symbol)} Price
              </div>
            </div>
            <FormatNumber
              nb={markPrice}
              format="currency"
              className="text-sm text-bold"
              precision={position.token.displayPriceDecimalsPrecision}
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className="w-full flex justify-between">
            <div className="text-sm text-gray-400">Pos. Size</div>
            <FormatNumber
              nb={position.sizeUsd}
              format="currency"
              precision={2}
              className="text-gray-400"
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className="w-full flex justify-between">
            <div className="text-sm text-gray-400">Pos. Size native</div>
            <FormatNumber
              nb={
                position.side === 'long'
                  ? position.size
                  : position.sizeUsd / position.price
              }
              className="text-gray-400"
              precision={position.collateralToken.displayAmountDecimalsPrecision}
              suffix={getTokenSymbol(position.collateralToken.symbol)}
              isDecimalDimmed={true}
            />
          </div>
        </div>
      </div>

      <div className="px-4 mt-2">
        <div className="flex flex-col border p-3 py-2.5 bg-[#040D14] rounded-lg">
          <div className={rowStyle}>
            <div className="text-sm">Collateral</div>
            <div className="flex items-center justify-end">
              <FormatNumber
                nb={position.collateralUsd}
                format="currency"
                className={input ? 'text-xs' : 'text-sm'}
              />

              {input ? (
                <>
                  {rightArrowElement}

                  <div className="flex flex-col">
                    <div className="flex flex-col items-end text-sm">
                      <FormatNumber
                        nb={updatedInfos?.collateralUsd}
                        format="currency"
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-gray-400">PnL</div>

            <FormatNumber
              nb={position.pnl && markPrice ? position.pnl : null}
              prefix={position.pnl && position.pnl > 0 ? '+' : ''}
              format="currency"
              className={`font-bold text-${position.pnl && position.pnl > 0 ? 'green' : 'redbright'
                }`}
              isDecimalDimmed={false}
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-gray-400">Net Value</div>
            <div className="flex items-center justify-end">
              <NetValueTooltip position={position}>
                <span className="underline-dashed">
                  <FormatNumber
                    nb={positionNetValue}
                    format="currency"
                    className={input ? 'text-xs' : 'text-sm'}
                  />
                </span>
              </NetValueTooltip>

              {input ? (
                <>
                  {rightArrowElement}

                  <div className="flex flex-col">
                    <div className="flex flex-col items-end text-sm">
                      <FormatNumber
                        nb={newPositionNetValue}
                        format="currency"
                        className="text-sm text-regular"
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-gray-400">Entry Price</div>

            <FormatNumber
              nb={position.price}
              format="currency"
              precision={position.token.displayPriceDecimalsPrecision}
              className="text-gray-400"
            />
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm text-gray-400">Initial Leverage</div>
            <div className="flex items-center ">
              <FormatNumber
                nb={position.sizeUsd / position.collateralUsd}
                suffix="x"
                className="text-gray-400"
                isDecimalDimmed={true}
              />
            </div>
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm">Current Leverage</div>
            <div className="flex items-center">
              <FormatNumber
                nb={position.currentLeverage}
                suffix="x"
                className={input ? ' text-xs' : 'text-sm'}
                isDecimalDimmed={true}
              />

              {input ? (
                <>
                  {rightArrowElement}

                  <div className="flex flex-col">
                    <div className="flex flex-col items-end text-sm">
                      {updatedInfos ? (
                        <FormatNumber
                          nb={updatedInfos?.currentLeverage}
                          suffix="x"
                          className={
                            maxInitialLeverage &&
                              updatedInfos.currentLeverage > maxInitialLeverage
                              ? 'text-redbright'
                              : ''
                          }
                        />
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="w-full h-[1px] bg-bcolor my-1" />

          <div className={rowStyle}>
            <div className="text-sm">Liquidation Price</div>
            <div className="flex items-center justify-end">
              <FormatNumber
                nb={position.liquidationPrice}
                format="currency"
                precision={position.token.displayPriceDecimalsPrecision}
                className={`${input ? 'text-xs' : 'text-sm'} text-orange`}
                isDecimalDimmed={false}
              />

              {input ? (
                <>
                  {rightArrowElement}

                  <div className="flex flex-col">
                    <div className="flex flex-col items-end text-sm">
                      {updatedInfos ? (
                        <FormatNumber
                          nb={liquidationPrice}
                          format="currency"
                          precision={
                            position.token.displayPriceDecimalsPrecision
                          }
                          className={`text-orange`}
                          isDecimalDimmed={false}
                        />
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <TabSelect
        wrapperClassName="h-12 flex items-center"
        selected={selectedAction}
        tabs={[
          { title: 'deposit', activeColor: 'border-b-white' },
          { title: 'withdraw', activeColor: 'border-b-white' },
        ]}
        onClick={(title) => {
          // Reset input when changing selected action
          setInput(null);
          setSelectedAction(title);
        }}
      />

      {selectedAction === 'deposit' ? (
        <>
          {belowMinLeverage && (
            <div className="flex flex-col text-sm ml-4 mr-4">
              <div className="bg-orange/30 p-4 border-dashed border-orange rounded flex relative w-full pl-10">
                <Image
                  className="opacity-100 absolute left-3 top-auto bottom-auto"
                  src={warningIcon}
                  height={20}
                  width={20}
                  alt="Warning icon"
                />
                This action would take the leverage below the minimum of 1.1x.
                Please adjust your input.
              </div>
            </div>
          )}

          <div className="flex flex-col border rounded-lg ml-4 mr-4 bg-third">
            <TradingInput
              className="text-sm"
              inputClassName="border-0 bg-third"
              value={input}
              selectedToken={
                position.side === 'long'
                  ? position.token
                  : position.collateralToken
              }
              tokenList={[]}
              onTokenSelect={() => {
                // One token only
              }}
              onChange={setInput}
            />
          </div>

          {
            /* Display wallet balance */
            (() => {
              if (!walletTokenBalances) return null;

              const balance =
                walletTokenBalances[position.collateralToken.symbol];
              if (balance === null) return null;

              return (
                <div
                  className="flex flex-row items-center ml-auto mr-4 cursor-pointer"
                  onClick={() => setInput(walletBalance)}
                >
                  <Image
                    className="mr-1 opacity-60 relative"
                    src={walletImg}
                    height={17}
                    width={17}
                    alt="Wallet icon"
                  />
                  <FormatNumber
                    nb={balance}
                    precision={
                      position.collateralToken.displayAmountDecimalsPrecision
                    }
                    className="text-txtfade"
                    isDecimalDimmed={false}
                    suffix={position.collateralToken.symbol}
                  />

                  <RefreshButton className="ml-1" />
                </div>
              );
            })()
          }
        </>
      ) : (
        <>
          {/* Withdraw collateral info */}
          <div className="flex flex-col text-sm ml-4 mr-4">
            <div className="bg-blue/30 p-3 border-dashed border-blue rounded flex relative w-full pl-10 text-xs mb-2">
              <Image
                className="opacity-60 absolute left-3 top-auto bottom-auto"
                src={infoIcon}
                height={16}
                width={16}
                alt="Info icon"
              />
              <span className="text-sm">
                Withdrawn collateral will be received in{' '}
                {position.collateralToken.symbol}
              </span>
            </div>
          </div>

          {/* Check for max leverage*/}
          {maxInitialLeverage &&
            position.currentLeverage &&
            position.currentLeverage >= maxInitialLeverage ? (
            <div className="flex flex-col text-sm ml-4 mr-4">
              <div className="bg-blue/30 p-3 border-dashed border-blue rounded flex relative w-full pl-10 text-xs mb-2">
                <Image
                  className="opacity-60 absolute left-3 top-auto bottom-auto"
                  src={infoIcon}
                  height={16}
                  width={16}
                  alt="Info icon"
                />
                <span className="text-sm">
                  Your position is above the maximum leverage of{' '}
                  {maxInitialLeverage}x, you cannot withdraw more collateral.
                </span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col border rounded-lg ml-4 mr-4 bg-third">
            <TradingInput
              className="text-sm"
              inputClassName="border-0 bg-third"
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
              disabled={
                position.currentLeverage !== null &&
                position.currentLeverage <= 1.1
              }
            />
          </div>

          {!aboveMaxLeverage && !belowMinLeverage && (
            <div className="flex flex-row gap-3 px-4">
              {[25, 50, 75].map((percent, i) => {
                return (
                  <Button
                    key={i}
                    title={`${percent}%`}
                    variant="secondary"
                    rounded={false}
                    className="flex-grow text-xs bg-third border border-bcolor hover:border-white/10 rounded-lg flex-1 font-mono"
                    onClick={() => setInput(calculateCollateralPercentage(25))}
                  ></Button>
                );
              })}
            </div>
          )}

          <div className="text-sm text-txtfade ml-auto mr-4">
            <FormatNumber
              nb={Math.min(positionNetValue, position.collateralUsd)}
              format="currency"
              className="inline text-sm text-txtfade"
              isDecimalDimmed={false}
            />{' '}
            of collateral in the position
          </div>
        </>
      )}

      <Button
        className="m-4"
        size="lg"
        title={executeBtnText}
        disabled={!isInputValid || belowMinLeverage || aboveMaxLeverage}
        onClick={() => handleExecute()}
      />
    </div>
  );
}
