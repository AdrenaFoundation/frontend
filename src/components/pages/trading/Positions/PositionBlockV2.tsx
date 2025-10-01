import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { MINIMUM_POSITION_OPEN_TIME } from '@/constant';
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
import { ButtonGroup } from './PositionBlockComponents/ButtonGroup';
import { POSITION_BLOCK_STYLES } from './PositionBlockComponents/PositionBlockStyles';
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
  const [closableIn, setClosableIn] = useState<number | null>(null);
  const [isPnlWithFees, setIsPnlWithFees] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [isMedium, setIsMedium] = useState(false);
  const [isBig, setIsBig] = useState(false);
  const [isBiggest, setIsBiggest] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (blockRef.current) {
        const width = blockRef.current.offsetWidth;

        setIsBig(width >= 699 && width < 1200);
        setIsCompact(width < 699 && width > 482);
        setIsMedium(width <= 482 && width > 370);
        setIsMini(width <= 370);
        setIsBiggest(width >= 1200);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const borrowResolve = () => {
    try {
      const notification = MultiStepNotification.newForRegularTransaction(
        'Position Borrow Resolve',
      ).fire();

      window.adrena.client.positionBorrowResolve({
        notification,
        targetPosition: position.pubkey,
      });
    } catch {
      // Ignore error
    }
  };

  const positionBorrowFeesShouldBeResolved = useMemo(
    () => (position.borrowFeeUsd ?? 0) - (position.paidInterestUsd ?? 0) > 50,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [position.borrowFeeUsd, position.paidInterestUsd],
  );

  const positionDataFormatted: PositionDetailType[] = useMemo(
    () => [
      {
        title: 'Duration',
        value: formatTimeDifference(
          getFullTimeDifference(position.openDate, new Date(Date.now())),
        ),
        format: 'time',
      },
      {
        title: 'Net Value',
        value: position.collateralUsd + (position.pnl ?? 0),
        format: 'currency',
        className: !(isMedium || isMini) ? 'hidden' : undefined,
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
        tooltip: (
          <FormatNumber
            nb={position.collateralAmount}
            format="number"
            className={POSITION_BLOCK_STYLES.text.white}
            precision={position.collateralToken.displayAmountDecimalsPrecision}
            suffix={`${getTokenSymbol(
              position.collateralToken.symbol,
            )} (at init.)`}
          />
        ),
      },
      {
        title: 'Size',
        value: position.sizeUsd,
        format: 'currency',
        tooltip: (
          <FormatNumber
            nb={
              position.side === 'long'
                ? position.size
                : position.sizeUsd / position.price
            }
            format="number"
            className={POSITION_BLOCK_STYLES.text.white}
            precision={position.token.displayAmountDecimalsPrecision}
            suffix={getTokenSymbol(position.token.symbol)}
          />
        ),
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
    ],
    [
      position.openDate,
      position.collateralUsd,
      position.pnl,
      position.currentLeverage,
      position.sizeUsd,
      position.price,
      position.token.symbol,
      position.liquidationPrice,
      position.breakEvenPrice,
      position.stopLossLimitPrice,
      position.takeProfitLimitPrice,
      tradeTokenPrice,
      triggerEditPositionCollateral,
      triggerStopLossTakeProfit,
    ],
  );

  return (
    <div
      className="border bg-[#0B131D] rounded-md overflow-hidden"
      ref={blockRef}
    >
      <div className="flex flex-row items-center justify-between p-2 px-3 border-b">
        <TokenDetails position={position} setTokenB={setTokenB} />
        <PnLDetails
          position={position}
          showAfterFees={isPnlWithFees}
          setIsPnlWithFees={setIsPnlWithFees}
        />
        {isMedium || isMini ? null : (
          <NetValue position={position} showAfterFees={isPnlWithFees} />
        )}
      </div>
      <div
        className={twMerge(
          'flex flex-wrap flex-1 p-3',
          isMini && 'flex-col gap-1',
          isMedium && 'grid grid-cols-3 gap-2',
          isCompact && 'grid grid-cols-4 gap-2',
          isBig && 'grid grid-cols-7 gap-2',
          isBiggest && 'justify-between gap-2',
        )}
      >
        <PositionDetail
          data={positionDataFormatted}
          readOnly={readOnly}
          itemClassName={twMerge(
            isMini &&
              'border-0 flex-row justify-between items-center w-full p-0',
          )}
        />

        {readOnly ? (
          positionBorrowFeesShouldBeResolved ? (
            <Tippy
              content={`Settle the position’s $${((position.borrowFeeUsd ?? 0) - position.paidInterestUsd).toFixed(2)} in borrow fees now. Fees are distributed to LPs, stakers, the DAO, and referrals.`}
            >
              <div>
                <Button
                  size="xs"
                  className={twMerge(
                    POSITION_BLOCK_STYLES.button.base,
                    'min-w-[14em] mt-1',
                  )}
                  title="Resolve Borrow Fees"
                  rounded={false}
                  onClick={() => borrowResolve()}
                />
              </div>
            </Tippy>
          ) : null
        ) : (
          <ButtonGroup
            position={position}
            closableIn={closableIn}
            isCompact={isCompact}
            isMedium={isMedium}
            isMini={isMini}
            isBig={isBig}
            isBiggest={isBiggest}
            triggerEditPositionCollateral={triggerEditPositionCollateral}
            triggerStopLossTakeProfit={triggerStopLossTakeProfit}
            triggerClosePosition={triggerClosePosition}
            setIsOpen={() => setShareClosePosition?.(position)}
          />
        )}
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
    <div className="flex flex-col justify-end items-end">
      <p className="text-xs opacity-50 text-right md:text-center font-semibold mb-1">
        Net Value
      </p>

      <NetValueTooltip position={position}>
        <div className="flex underline-dashed">
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
  if (!position.pnl || !position.collateralUsd || position.collateralUsd === 0)
    return null;

  const fees = -(position.exitFeeUsd + (position.borrowFeeUsd ?? 0));

  return (
    <div className="flex flex-col justify-end items-end md:justify-center md:items-center">
      <div
        className="hidden md:flex items-center gap-1 mb-1 cursor-pointer select-none"
        onClick={() => {
          setIsPnlWithFees(!showAfterFees);
        }}
      >
        <p className="text-sm sm:text-xs opacity-50 text-center font-semibold">
          PnL{' '}
        </p>
        <Switch
          checked={showAfterFees}
          size="small"
          onChange={() => {
            // handle toggle in parent div
          }}
        />
        <span className="text-xs sm:text-xxs opacity-30">
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
              'text-sm sm:text-xs font-monobold',
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
          prefixClassName="text-sm sm:text-xs"
          suffixClassName={`ml-0 text-sm sm:text-xs ${(showAfterFees ? position.pnl : position.pnl - fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
          precision={2}
          minimumFractionDigits={2}
          isDecimalDimmed={false}
          className={`text-sm sm:text-xs ${(showAfterFees ? position.pnl : position.pnl - fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
        />
      </div>
    </div>
  );
};
