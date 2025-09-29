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

import OnchainAccountInfo from '../../monitoring/OnchainAccountInfo';
import NetValueTooltip from '../TradingInputs/NetValueTooltip';
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
  setTokenB?: (token: Token) => void;
  setShareClosePosition?: (p: PositionExtended) => void;
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

  const PositionDataFormatted: PositionDetailType[] = [
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
      className: 'hidden xl:flex',
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
      isDecimalDimmed: position.token.symbol !== 'BONK',
      precision: position.token.symbol === 'BONK' ? 8 : 2,
    },
    {
      title: 'Market',
      value: tradeTokenPrice,
      format: 'currency',
      className: 'hidden xl:flex',
      isDecimalDimmed: position.token.symbol !== 'BONK',
      precision: position.token.symbol === 'BONK' ? 8 : 2,
    },
    {
      title: 'Liquidation',
      value:
        typeof position.liquidationPrice !== 'undefined'
          ? position.liquidationPrice
          : null,
      format: 'currency',
      color: 'text-orange',
      isDecimalDimmed: false,
      onEditClick: () => triggerEditPositionCollateral?.(position),
    },
    {
      title: 'Break Even',
      value:
        typeof position.breakEvenPrice !== 'undefined'
          ? position.breakEvenPrice
          : null,
      format: 'currency',
      color: 'text-purpleColor',
      className: 'hidden 2xl:flex',
      isDecimalDimmed: false,
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
  ];

  return (
    <div className="border bg-[#0B131D] rounded-md overflow-hidden">
      <div className="flex flex-row items-center justify-between p-2 px-3 border-b">
        <TokenDetails position={position} setTokenB={setTokenB} />
        <PnLDetails
          position={position}
          showAfterFees={isPnlWithFees}
          setIsPnlWithFees={setIsPnlWithFees}
        />
        <NetValue position={position} showAfterFees={isPnlWithFees} />
      </div>
      <div
        className={twMerge(
          'flex gap-6 p-3',
          !isMobile ? 'flex-col' : 'flex-row',
        )}
      >
        {isMobile ? (
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
              ...PositionDataFormatted,
            ]}
            className="justify-between w-full p-0"
            readOnly={readOnly}
          />
        ) : (
          <PositionDetail
            data={PositionDataFormatted}
            className="bg-transparent items-start flex-col !border-0 rounded-none gap-2 w-full p-0"
            itemClassName="border-0 flex-row justify-between items-center w-full p-0"
            readOnly={readOnly}
          />
        )}
        {!readOnly ? (
          <div className="flex flex-row items-center gap-2">
            <Button
              title="Edit"
              size="sm"
              className={twMerge(
                'lg:h-auto text-xs px-2 py-1 font-normal rounded-md bg-[#142030] text-white text-opacity-50 hover:text-opacity-100 duration-300',
                !isMobile && 'flex-1',
              )}
              onClick={() => triggerEditPositionCollateral?.(position)}
            />
            <Button
              title="TP/SL"
              size="sm"
              className={twMerge(
                'lg:h-auto text-xs px-2 py-1 font-normal rounded-md bg-[#142030] text-white text-opacity-50 hover:text-opacity-100 duration-300',
                !isMobile && 'flex-1',
              )}
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
                'lg:h-auto text-xs px-2 py-1 font-normal rounded-md bg-[#142030] text-white text-opacity-50 hover:text-opacity-100 duration-300 disabled:opacity-30 disabled:cursor-not-allowed',
                !isMobile && 'flex-1',
              )}
              disabled={closableIn !== 0 && closableIn !== null}
              onClick={() => triggerClosePosition?.(position)}
            />
            {setShareClosePosition ? (
              <div
                className="p-[0.4rem] group rounded-md bg-[#142030] text-white cursor-pointer"
                onClick={() => setShareClosePosition?.(position)}
              >
                <Image
                  src={shareIcon}
                  alt="share"
                  width={16}
                  height={16}
                  className="h-2.5 w-2.5 opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
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
        height={24}
        width={24}
        className="w-8 h-8 border border-inputcolor rounded-full"
      />
      <div>
        <div className="flex flex-row items-center gap-2 mb-0.5">
          <p className="font-bold text-base">
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
        <OnchainAccountInfo
          address={position.pubkey}
          shorten
          className="text-xs"
        />
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
      <p className="text-xs opacity-50 text-right md:text-center font-semibold mb-1">
        Net Value
      </p>

      <NetValueTooltip position={position}>
        <div className="hidden md:flex underline-dashed">
          <FormatNumber
            nb={
              position.collateralUsd +
              (showAfterFees ? position.pnl : position.pnl - fees)
            }
            format="currency"
            className={twMerge('text-xs font-mono items-end justify-end')}
            isDecimalDimmed={false}
            minimumFractionDigits={2}
          />
        </div>
      </NetValueTooltip>
    </div>
  );
};

const PnLDetails = ({
  position,
  showAfterFees,
  setIsPnlWithFees,
}: {
  position: PositionBlockProps['position'];
  showAfterFees: boolean;
  setIsPnlWithFees: (value: boolean) => void;
}) => {
  if (!position.pnl) return null;

  const fees = -(position.exitFeeUsd + (position.borrowFeeUsd ?? 0));

  return (
    <div className="flex flex-col justify-end items-end md:justify-center md:items-center">
      <div
        className="hidden md:flex items-center gap-1 mb-1 cursor-pointer select-none"
        onClick={() => {
          setIsPnlWithFees(!showAfterFees);
        }}
      >
        <p className="text-xs opacity-50 text-center font-interMedium">PnL </p>
        <Switch
          checked={showAfterFees}
          size="small"
          onChange={() => {
            // handle toggle in parent div
          }}
        />
        <span className="text-xxs opacity-30">
          {showAfterFees ? ' w/ fees' : ' w/o fees'}
        </span>
      </div>

      <div
        className={twMerge(
          'rounded-md px-1.5 pr-2 py-1 flex flex-col md:flex-row items-end md:items-center md:gap-1',
          (showAfterFees ? position.pnl : position.pnl - fees) >= 0
            ? 'bg-green/10'
            : 'bg-red/10',
        )}
      >
        <div className="flex flex-row items-center gap-1">
          <FormatNumber
            nb={showAfterFees ? position.pnl : position.pnl - fees}
            format="currency"
            className={twMerge(
              'text-xs font-mono font-medium',
              (showAfterFees ? position.pnl : position.pnl - fees) >= 0
                ? 'text-[#35C488]'
                : 'text-redbright',
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
