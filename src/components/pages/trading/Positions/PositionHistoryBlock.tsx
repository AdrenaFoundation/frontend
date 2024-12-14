import 'tippy.js/dist/tippy.css'; // Import Tippy's CSS

import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import externalLinkLogo from '@/../public/images/external-link-logo.png';
import shareIcon from '@/../public/images/Icons/share-fill.svg'
import solLogo from '@/../public/images/sol.svg';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Switch from '@/components/common/Switch/Switch';
import { Congrats } from '@/components/Congrats/Congrats';
import FormatNumber from '@/components/Number/FormatNumber';
import { ImageRef, PositionExtended, PositionHistoryExtended, Token } from '@/types';
import {
  formatDate,
  getTokenImage,
  getTokenSymbol,
  getTxExplorer,
} from '@/utils';

import FeesPaidTooltip from './FeesPaidTooltip';
import SharePositionModal from './SharePositionModal';

interface TokenImageProps {
  symbol: string;
  image: ImageRef;
}

const TokenImage: React.FC<TokenImageProps> = ({ symbol, image }) => (
  <Image
    className="w-[1em] h-[1em] mr-1"
    src={symbol === 'JITOSOL' ? solLogo : image}
    width={200}
    height={200}
    alt={`${symbol === 'JITOSOL' ? 'SOL' : symbol} logo`}
  />
);

interface DateDisplayProps {
  date: string | number | Date;
}

const DateDisplay: React.FC<DateDisplayProps> = ({ date }) => (
  <p className="text-xs font-mono opacity-50">{formatDate(date)}</p>
);

interface TokenSymbolProps {
  symbol: string;
  pathname: string;
  side: 'long' | 'short';
}

const TokenSymbol: React.FC<TokenSymbolProps> = ({ symbol, pathname, side }) =>
  pathname !== '/trade' ? (
    <Link href={`/trade?pair=USDC_${symbol}&action=${side}`} target="">
      <div className="uppercase underline font-boldy text-sm">{symbol}</div>
    </Link>
  ) : (
    <div className="uppercase font-boldy text-sm opacity-90">{symbol}</div>
  );

// Add this new component
interface LeverageDisplayProps {
  leverage: number;
  positionSize: number;
  entryCollateral: number;
  finalCollateral: number;
}

const LeverageDisplay: React.FC<LeverageDisplayProps> = ({ leverage, positionSize, entryCollateral, finalCollateral }) => (
  <Tippy
    content={
      <>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs mr-2">Size:</span>
          <FormatNumber
            nb={positionSize}
            format="currency"
            minimumFractionDigits={2}
            precision={2}
            className="text-xs"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs mr-2">Entry Collateral:</span>
          <FormatNumber
            nb={entryCollateral}
            format="currency"
            minimumFractionDigits={2}
            precision={2}
            className="text-xs"
          />
        </div>
        {finalCollateral !== entryCollateral && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs mr-2">Final Collateral:</span>
            <FormatNumber
              nb={finalCollateral}
              format="currency"
              minimumFractionDigits={2}
              precision={2}
              className="text-xs"
            />
          </div>
        )}
      </>
    }
    placement="auto"
  >
    <div className="text-xs ml-1 text-gray-400 border-b border-dotted border-gray-400 cursor-help">
      {leverage}x
    </div>
  </Tippy>
);

export default function PositionHistoryBlock({
  bodyClassName,
  borderColor,
  positionHistory,
  showShareButton = true,
  showFeesInPnl,
}: {
  bodyClassName?: string;
  borderColor?: string;
  positionHistory: PositionHistoryExtended;
  showShareButton?: boolean;
  showFeesInPnl: boolean;
}) {
  // const blockRef = useRef<HTMLDivElement>(null);
  // const isSmallSize = useResizeObserver(blockRef);
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const symbol = getTokenSymbol(positionHistory.token.symbol);
  const img = getTokenImage(positionHistory.token);

  const renderPositionName = (className?: string) => (
    <div className={twMerge(className)}>
      <div className="flex items-center h-full">
        <TokenImage symbol={symbol} image={img} />
        {window.location.pathname !== '/trade' ? (
          <TokenSymbol
            symbol={symbol}
            pathname={window.location.pathname}
            side={positionHistory.side}
          />
        ) : (
          <div className="uppercase font-bold text-sm opacity-90">{symbol}</div>
        )}
        <div
          className={twMerge(
            'uppercase font-bold text-xs ml-1 opacity-90',
            positionHistory.side === 'long' ? 'text-green' : 'text-red',
          )}
        >
          {positionHistory.side}
        </div>
        <LeverageDisplay
          leverage={positionHistory.entry_leverage}
          positionSize={positionHistory.entry_collateral_amount * positionHistory.entry_leverage}
          entryCollateral={positionHistory.entry_collateral_amount}
          finalCollateral={positionHistory.final_collateral_amount}
        />
      </div>
      <DateDisplay date={positionHistory.entry_date} />
    </div>
  );

  const renderPriceDisplay = (price: number | null, title: string) => (
    <div className="flex flex-col items-center">
      <PriceDisplay price={price} token={positionHistory.token} title={title} />
    </div>
  );

  const renderPnl = () => pnl;

  const renderExitDate = () => (
    <div className="flex flex-col items-center">
      <div className="flex w-full font-mono text-xxs justify-center items-center">
        {positionHistory.status === 'close' ? (
          <Link
            href={getTxExplorer(positionHistory.last_tx)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <span className="text-blue cursor-pointer hover:underline mr-1">
              Closed on
            </span>
            <Image
              src={externalLinkLogo}
              alt="External link"
              width={12}
              height={12}
            />
          </Link>
        ) : positionHistory.status === 'liquidate' ? (
          <Link
            href={getTxExplorer(positionHistory.last_tx)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <span className="text-orange cursor-pointer hover:underline mr-1">
              Liquidated on
            </span>
            <Image
              src={externalLinkLogo}
              alt="External link"
              width={12}
              height={12}
            />
          </Link>
        ) : (
          'Exit Date'
        )}
      </div>
      {positionHistory.exit_date ? (
        <DateDisplay date={positionHistory.exit_date} />
      ) : (
        <p className="text-xs font-mono opacity-50">-</p>
      )}
    </div>
  );

  const renderFeesPaid = () => <div className="w-24">{feesPaid}</div>;

  useEffect(() => {
    setShowAfterFees(showFeesInPnl);
  }, [showFeesInPnl]);

  const [showAfterFees, setShowAfterFees] = useState(showFeesInPnl); // State to manage fee display

  const pnl = (
    <div className="flex flex-col items-center">
      <div className="flex w-full font-mono text-xxs text-txtfade opacity-90 justify-center items-center">
        PnL
        <label className="flex items-center ml-1 cursor-pointer">
          <Switch
            className="mr-0.5"
            checked={showAfterFees}
            onChange={() => setShowAfterFees(!showAfterFees)}
            size="small"
          />
          <span className="ml-0.5 text-xxs text-gray-600 whitespace-nowrap w-6 text-center">
            {showAfterFees ? 'w/ fees' : 'w/o fees'}
          </span>
        </label>
      </div>

      {positionHistory.pnl ? (
        <div className="flex text-center w-full">
          <FormatNumber
            nb={
              showAfterFees
                ? positionHistory.pnl
                : positionHistory.pnl + positionHistory.fees
            }
            format="currency"
            className={`mr-0.5 opacity-90 font-bold text-sm text-${(showAfterFees
              ? positionHistory.pnl
              : positionHistory.pnl + positionHistory.fees) > 0
              ? 'green'
              : 'redbright'
              }`}
            minimumFractionDigits={2}
            precision={2}
            isDecimalDimmed={false}
          />

          <FormatNumber
            nb={
              ((showAfterFees
                ? positionHistory.pnl
                : positionHistory.pnl + positionHistory.fees) /
                positionHistory.final_collateral_amount) *
              100
            }
            format="percentage"
            prefix="("
            suffix=")"
            precision={2}
            isDecimalDimmed={false}
            suffixClassName={`ml-0 text-${(showAfterFees
              ? positionHistory.pnl
              : positionHistory.pnl + positionHistory.fees) > 0
              ? 'green'
              : 'redbright'
              }`}
            className={`text-xxs opacity-90 text-${(showAfterFees
              ? positionHistory.pnl
              : positionHistory.pnl + positionHistory.fees) > 0
              ? 'green'
              : 'redbright'
              }`}
          />
        </div>
      ) : (
        '-'
      )}
    </div>
  );

  const pnlValue = showAfterFees
    ? positionHistory.pnl
    : positionHistory.pnl + positionHistory.fees;

  const percentage = positionHistory.final_collateral_amount
    ? (pnlValue / positionHistory.final_collateral_amount) * 100
    : null;

  {
    percentage !== null ? (
      <FormatNumber
        nb={percentage}
        format="percentage"
        prefix="("
        suffix=")"
        suffixClassName='ml-0 text-txtfade'
        precision={2}
        isDecimalDimmed={false}
        className={`text-xxs opacity-90 text-${pnlValue > 0 ? 'green' : 'redbright'
          }`}
      />
    ) : null;
  }

  const feesPaid = (
    <div className="flex flex-col items-center">
      <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
        Fees Paid
      </div>
      <FeesPaidTooltip
        entryFees={0}
        exitFees={positionHistory.exit_fees}
        borrowFees={positionHistory.borrow_fees}
      >
        <div className="flex cursor-help">
          <span className="border-b border-dotted border-gray">
            <FormatNumber
              nb={positionHistory.exit_fees + positionHistory.borrow_fees}
              format="currency"
              className="text-xs text-redbright"
              isDecimalDimmed={false}
            />
          </span>
        </div>
      </FeesPaidTooltip>
    </div>
  );

  interface PriceDisplayProps {
    price: number | null;
    token: Token;
    title: string;
  }

  const PriceDisplay: React.FC<PriceDisplayProps> = ({
    price,
    token,
    title,
  }) => {
    const decimals = token.symbol === 'BONK' ? 8 : 2;

    return (
      <div className="flex flex-col items-center w-24">
        <div className="w-full font-mono text-xxs text-txtfade text-center">
          {title}
        </div>

        <FormatNumber
          nb={price}
          format="currency"
          className="text-xs"
          minimumFractionDigits={decimals}
          precision={decimals}
        />
      </div>
    );
  };

  return (
    <>
      <div
        className={twMerge(
          'min-w-[300px] w-full border rounded-lg border-dashed border-bcolor overflow-hidden',
          bodyClassName,
          borderColor,
        )}
        key={positionHistory.position_id}
      >
        <div className="md:hidden px-5 py-3 flex flex-row items-center justify-between border-b border-dashed">
          <div className="flex items-center text-leftr">{renderPositionName()}</div> <div className="flex text-center">{renderPnl()}</div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-row justify-between items-center p-0">
          <div className="flex-1 hidden md:flex items-center justify-center text-left p-2 border-b lg:border-b-0 border-dashed">{renderPositionName()}</div>
          <div className="flex-1 flex justify-center md:border-x xl:border-0 border-dashed p-2">
            {renderPriceDisplay(positionHistory.entry_price, 'Entry Price')}
          </div>
          <div className="flex-1 flex justify-center p-2 border-l md:border-l-0 md:border-r lg:border-r-0 border-dashed">
            {renderPriceDisplay(positionHistory.exit_price, 'Exit Price')}
          </div>
          <div className="flex-1 hidden md:flex justify-center text-center border-t xl:border-0 border-dashed p-2">{renderPnl()}</div>
          <div className="flex-1 flex justify-center border-t border-r lg:border-l border-b-0 xl:border-0 border-dashed p-2">{renderExitDate()}</div>
          <div className="flex-1 flex justify-center border-t xl:border-0 border-dashed p-2">{renderFeesPaid()}</div>
          {showShareButton && (
            <Button
              leftIcon={shareIcon}
              variant='secondary'
              className='hidden xl:block opacity-50 hover:opacity-100'
              onClick={() => {
                setIsOpen(true);
              }}
            />
          )}
        </div>
        <div className="xl:hidden justify-center items-center w-full border-t border-dashed">
          <Button
            size="xs"
            className="text-txtfade border-bcolor border-b-0 bg-[#a8a8a810] hover:bg-bcolor w-full"
            title="Share"
            rounded={false}
            onClick={() => {
              setIsOpen(true);
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <Modal title="Share PnL" close={() => setIsOpen(false)} className="overflow-y-auto"
            wrapperClassName="h-[80vh] sm:h-auto">
            <div className="absolute top-0 w-[300px]">
              {(() => {
                const fees = -(
                  (positionHistory.exit_fees ?? 0) +
                  (positionHistory.borrow_fees ?? 0)
                );
                const pnlUsd = positionHistory.pnl
                  ? positionHistory.pnl - fees
                  : null;

                if (!pnlUsd || pnlUsd < 0) return;

                return <Congrats />;
              })()}
            </div>
            <SharePositionModal position={{
              pnl: pnlValue,
              token: positionHistory.token,
              side: positionHistory.side,
              price: positionHistory.entry_price,
              fees: -(
                (positionHistory.exit_fees ?? 0) +
                (positionHistory.borrow_fees ?? 0)
              ),
              exitFeeUsd: positionHistory.exit_fees,
              borrowFeeUsd: positionHistory.borrow_fees,
              collateralUsd: positionHistory.entry_collateral_amount,
              sizeUsd: positionHistory.entry_collateral_amount * positionHistory.entry_leverage,
              exitPrice: positionHistory.exit_price,
              nativeObject: {
                openTime: new Date(positionHistory.entry_date).getTime() / 1000,
              }
            } as unknown as PositionExtended} />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}