import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import shareIcon from '@/../public/images/Icons/share-fill.svg';
import Button from '@/components/common/Button/Button';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { MINIMUM_POSITION_OPEN_TIME } from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { selectStreamingTokenPriceFallback } from '@/selectors/streamingTokenPrices';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import {
  formatTimeDifference,
  getFullTimeDifference,
  getTokenImage,
  getTokenSymbol,
} from '@/utils';

import {
  PositionDetail,
  PositionDetailType,
} from './PositionBlockComponents/PositionDetail';

interface PositionBlockProps {
  position: PositionExtended;
  triggerClosePosition?: (p: PositionExtended) => void;
  triggerStopLossTakeProfit?: (p: PositionExtended) => void;
  triggerEditPositionCollateral?: (p: PositionExtended) => void;
  readOnly?: boolean;
  setTokenB: (token: Token) => void;
  setShareClosePosition: (p: PositionExtended) => void;
}

export default function PositionBlockV2({
  position,
  triggerClosePosition,
  triggerStopLossTakeProfit,
  triggerEditPositionCollateral,
  readOnly = false,
  setTokenB,
  setShareClosePosition,
}: PositionBlockProps) {
  const isMobile = useBetterMediaQuery('(min-width: 1150px)');
  const [closableIn, setClosableIn] = useState<number | null>(null);
  const [isPnlWithFees, setIsPnlWithFees] = useState(true);
  const [isNative, setIsNative] = useState(false);

  const tradeTokenPrice = useSelector((s) =>
    selectStreamingTokenPriceFallback(s, getTokenSymbol(position.token.symbol)),
  );

  useEffect(() => {
    const openedTime = position.nativeObject.openTime.toNumber() * 1000;
    const openedDuration = Date.now() - openedTime;
    const diff = MINIMUM_POSITION_OPEN_TIME - openedDuration;

    // If the position has been opened for more than 10 seconds, it can be closed
    if (diff <= 0) {
      setClosableIn(0);
      return;
    }

    const interval = setInterval(() => {
      const openedDuration = Date.now() - openedTime;
      const diff = MINIMUM_POSITION_OPEN_TIME - openedDuration;

      if (diff <= 0) {
        setClosableIn(0);
        return clearInterval(interval);
      }

      setClosableIn(diff);
    }, 100);

    setClosableIn(diff);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.nativeObject.openTime.toNumber()]);

  const allData = [
    {
      title: 'Net Value',
      value: position.collateralUsd + (position.pnl ?? 0),
      format: 'currency',
      className: 'md:hidden',
    },
    {
      title: 'Cur. Lev',
      value: position.currentLeverage,
      format: 'number',
      suffix: 'x',
      precision: 1,
      isDecimalDimmed: false,
    },
    {
      title: 'Collateral',
      value: position.collateralUsd,
      format: 'currency',
      onEditClick: () => triggerEditPositionCollateral?.(position),
    },
    {
      title: 'Size',
      value: position.sizeUsd,
      format: 'currency',
    },
    {
      title: 'Entry',
      value: position.price,
      format: 'currency',
    },
    {
      title: 'Liquidation',
      value: position.liquidationPrice,
      format: 'currency',
      color: 'text-orange',
      isDecimalDimmed: false,
      onEditClick: () => triggerEditPositionCollateral?.(position),
    },
    {
      title: 'Stop Loss',
      value:
        typeof position.stopLossLimitPrice !== 'undefined'
          ? position.stopLossLimitPrice
          : null,
      format: 'currency',
      color: 'text-blue',
      isDecimalDimmed: false,
      onEditClick: () => triggerStopLossTakeProfit?.(position),
    },
    {
      title: 'Take Profit',
      value:
        typeof position.takeProfitLimitPrice !== 'undefined'
          ? position.takeProfitLimitPrice
          : null,
      format: 'currency',
      color: 'text-blue',
      isDecimalDimmed: false,
      onEditClick: () => triggerStopLossTakeProfit?.(position),
    },
  ].filter((d) => d !== null) as PositionDetailType[];

  return (
    <div className="border bg-[#0B131D] border-inputcolor rounded-xl overflow-hidden">
      <div className="flex flex-row items-center justify-between p-2 px-3 border-b">
        <TokenDetails position={position} setTokenB={setTokenB} />
        <PnLDetails position={position} showAfterFees={isPnlWithFees} />
        <NetValue position={position} showAfterFees={isPnlWithFees} />
      </div>

      {isMobile ? (
        <div
          className={twMerge(
            'grid grid-cols-[2fr_auto_auto_1fr] xl:grid-cols-[2fr_1fr_1fr_1fr] 2xl:grid-cols-[auto_2fr_1fr_1fr_1fr] p-3 gap-3',
            !readOnly && 'border-b',
          )}
        >
          <PositionDetail
            data={[
              {
                title: 'Duration',
                value: formatTimeDifference(
                  getFullTimeDifference(
                    position.openDate,
                    new Date(Date.now()),
                  ),
                ),
                format: 'time',
              },
            ]}
            className="hidden 2xl:flex"
            readOnly={readOnly}
          />

          <PositionDetail
            data={[
              {
                title: 'Cur. Lev',
                value: position.currentLeverage ?? 0, // fix
                format: 'number',
                suffix: 'x',
                precision: 1,
                isDecimalDimmed: false,
              },
              {
                title: 'Collateral',
                value: position.collateralUsd,
                format: 'currency',
                onEditClick: () => triggerEditPositionCollateral?.(position),
              },
              {
                title: 'Size',
                value: position.sizeUsd,
                format: 'currency',
              },
            ]}
            readOnly={readOnly}
          />

          <PositionDetail
            data={[
              {
                title: 'Entry',
                value: position.price,
                format: 'currency',
              },
              {
                title: 'Market',
                value: tradeTokenPrice,
                format: 'currency',
                className: 'hidden xl:flex',
              },
            ]}
            readOnly={readOnly}
          />

          <PositionDetail
            data={[
              {
                title: 'Liquidation',
                value: position.liquidationPrice ?? 0,
                format: 'currency',
                color: 'text-orange',
                isDecimalDimmed: false,
                onEditClick: () => triggerEditPositionCollateral?.(position),
              },
              {
                title: 'Break Even',
                value: position.breakEvenPrice ?? 0,
                format: 'currency',
                color: 'text-[#965DFF]',
                className: 'hidden xl:flex',
                isDecimalDimmed: false,
              },
            ]}
            readOnly={readOnly}
          />

          <PositionDetail
            data={[
              {
                title: 'Stop Loss',
                value: position.stopLossLimitPrice ?? null,
                format: 'currency',
                color: 'text-blue',
                onEditClick: () => triggerStopLossTakeProfit?.(position),
                isDecimalDimmed: false,
              },
              {
                title: 'Take Profit',
                value: position.takeProfitLimitPrice ?? null,
                format: 'currency',
                color: 'text-blue',
                onEditClick: () => triggerStopLossTakeProfit?.(position),
                isDecimalDimmed: false,
              },
            ]}
            readOnly={readOnly}
          />
        </div>
      ) : (
        <PositionDetail
          data={allData}
          className="bg-transparent items-start flex-col !border-0 !border-b rounded-none p-3 gap-2"
          itemClassName="border-0 flex-row justify-between items-center w-full p-0"
          titleClassName="text-sm"
          showDivider={false}
          readOnly={readOnly}
        />
      )}
      {!readOnly ? (
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="flex flex-row items-center w-full lg:w-auto">
            <div
              className="flex flex-row items-center gap-3 p-2 px-3 border-r border-r-bcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300 w-full lg:w-auto"
              onClick={() => {
                setIsPnlWithFees(!isPnlWithFees);
              }}
            >
              <Switch
                checked={isPnlWithFees}
                size="small"
                onChange={() => {
                  setIsPnlWithFees(!isPnlWithFees);
                }}
              />
              <p className="text-sm font-interMedium opacity-50">PnL w/ fees</p>
            </div>

            <div
              className="flex flex-row items-center gap-3 p-2 px-3 border-r border-r-bcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300 w-full lg:w-auto"
              onClick={() => setIsNative(!isNative)}
            >
              <Switch
                checked={isNative}
                size="small"
                onChange={() => {
                  setIsNative(!isNative);
                }}
              />
              <p className="text-sm font-interMedium opacity-50">Native</p>
            </div>

            <div
              className="flex flex-row items-center gap-3 p-2.5 px-3 lg:border-r border-r-bcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300 flex-none"
              onClick={() => setShareClosePosition(position)}
            >
              <Image
                src={shareIcon}
                alt="Share"
                width={16}
                height={16}
                className="w-3 h-3"
              />
            </div>
          </div>

          <div
            className={
              'flex flex-row items-center gap-2 p-1.5 px-2 border-t lg:border-t-0 w-full lg:w-auto lg:border-l border-l-bcolor'
            }
          >
            <Button
              title="Edit"
              size="sm"
              className="flex-1 lg:h-auto px-2 py-0.5 rounded-lg bg-[#142030] border border-inputcolor text-white text-opacity-50 hover:text-opacity-100 duration-300"
              onClick={() => triggerEditPositionCollateral?.(position)}
            />
            <Button
              title="SL/TP"
              size="sm"
              className="flex-1 lg:h-auto px-2 py-0.5 rounded-lg bg-[#142030] border border-inputcolor text-white text-opacity-50 hover:text-opacity-100 duration-300"
              onClick={() => triggerStopLossTakeProfit?.(position)}
            />
            <Button
              title={
                closableIn === 0 || closableIn === null
                  ? 'Close'
                  : `Close (${Math.ceil((closableIn || 0) / 1000)}s)`
              }
              size="sm"
              className={twMerge(
                'flex-1 lg:h-auto px-2 py-0.5 rounded-lg bg-[#142030] border border-inputcolor text-white text-opacity-50 hover:text-opacity-100 duration-300 disabled:opacity-30 disabled:cursor-not-allowed',
                (closableIn !== 0 || closableIn !== null) && 'flex-none',
              )}
              disabled={closableIn !== 0 && closableIn !== null}
              onClick={() => triggerClosePosition?.(position)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

const TokenDetails = ({
  position,
  setTokenB,
}: {
  position: PositionBlockProps['position'];
  setTokenB?: (token: Token) => void;
}) => {
  return (
    <div
      className="flex flex-row gap-2 items-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
      onClick={() => setTokenB?.(position.token)}
    >
      <Image
        src={getTokenImage(position.token)}
        alt="token"
        height={30}
        width={30}
        className="w-9 h-9 border border-inputcolor rounded-full"
      />
      <div>
        <div className="flex flex-row items-center gap-2 mb-0.5">
          <p className="font-interSemibold text-base">
            {getTokenSymbol(position.token.symbol)}
          </p>
          <p
            className={twMerge(
              'text-xs p-0.5 px-1.5 rounded-md font-mono capitalize',
              position.side === 'long'
                ? 'bg-green/10 text-greenSide'
                : 'bg-red/10 text-redSide',
            )}
          >
            {position.side}
          </p>
          <FormatNumber
            nb={position.initialLeverage}
            suffix="x"
            className="opacity-50 text-xs"
            precision={0}
            isDecimalDimmed={false}
          />
        </div>
        <p className="text-xs opacity-50 font-boldy">
          {new Date(position.openDate).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
};

const NetValue = ({
  position,
  showAfterFees,
}: {
  position: PositionBlockProps['position'];
  showAfterFees: boolean;
}) => {
  if (!position.pnl) return null;

  const fees = -(position.exitFeeUsd + (position.borrowFeeUsd ?? 0));

  return (
    <div className="hidden md:flex flex-col justify-end items-end">
      <p className="text-xs opacity-50 text-right md:text-center font-interMedium mb-1">
        Net Value
      </p>

      <div className="hidden md:flex underline-dashed">
        <FormatNumber
          nb={
            position.collateralUsd +
            (showAfterFees ? position.pnl : position.pnl - fees)
          }
          format="currency"
          className={twMerge('text-base font-mono items-end justify-end')}
          isDecimalDimmed={false}
          minimumFractionDigits={2}
        />
      </div>
    </div>
  );
};

const PnLDetails = ({
  position,
  showAfterFees,
}: {
  position: PositionBlockProps['position'];
  showAfterFees: boolean;
}) => {
  if (!position.pnl) return null;

  const fees = -(position.exitFeeUsd + (position.borrowFeeUsd ?? 0));

  return (
    <div className="flex flex-col justify-end items-end md:justify-center md:items-center">
      <p className="hidden md:flex text-xs opacity-50 text-center font-interMedium mb-1">
        PnL
      </p>

      <div
        className={twMerge(
          'rounded-md px-1.5 pr-2 py-1 flex flex-col md:flex-row items-end md:items-center md:gap-1',
          position.pnl >= 0 ? 'bg-green/10' : 'bg-red/10',
        )}
      >
        <div className="flex flex-row items-center gap-1">
          <FormatNumber
            nb={showAfterFees ? position.pnl : position.pnl - fees}
            format="currency"
            className={twMerge(
              'text-base font-mono font-medium',
              position.pnl >= 0 ? 'text-[#35C488]' : 'text-redbright',
            )}
            isDecimalDimmed={false}
            minimumFractionDigits={2}
          />
        </div>

        <FormatNumber
          nb={
            ((showAfterFees ? position.pnl : position.pnl - fees) /
              position.collateralUsd) *
            100
          }
          format="percentage"
          prefix="( "
          suffix=" )"
          prefixClassName="text-xs"
          suffixClassName={`ml-0 text-xs ${(showAfterFees ? position.pnl : position.pnl - fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
          precision={2}
          minimumFractionDigits={2}
          isDecimalDimmed={false}
          className={`text-xs ${(showAfterFees ? position.pnl : position.pnl - fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
        />
      </div>
    </div>
  );
};
