import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import externalLinkLogo from '@/../public/images/external-link-logo.png';
import shareIcon from '@/../public/images/Icons/share-fill.svg';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Switch from '@/components/common/Switch/Switch';
import { Congrats } from '@/components/Congrats/Congrats';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended, PositionHistoryExtended } from '@/types';
import { formatDate, formatTimeDifference, getFullTimeDifference, getTokenImage, getTokenSymbol, getTxExplorer } from '@/utils';

import FeesPaidTooltip from './FeesPaidTooltip';
import SharePositionModal from './SharePositionModal';

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

const PositionHistoryBlock = ({
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
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showAfterFees, setShowAfterFees] = useState(showFeesInPnl);

  const symbol = getTokenSymbol(positionHistory.token.symbol);
  const img = getTokenImage(positionHistory.token);

  const pnlValue = showAfterFees
    ? positionHistory.pnl
    : positionHistory.pnl + positionHistory.fees;

  const totalFees = positionHistory.exit_fees + positionHistory.borrow_fees;

  const positionName = (
    <div className="flex items-center justify-center h-full">
      <Image
        className="w-[2em] h-[2em] mr-2"
        src={img}
        width={200}
        height={200}
        alt={`${symbol} logo`}
      />
      <div className="flex flex-col">
        <div className="flex items-center justify-center">
          {window.location.pathname !== '/trade' ? (
            <Link href={`/trade?pair=USDC_${symbol}&action=${positionHistory.side}`} target="">
              <div className="uppercase underline font-boldy text-sm lg:text-xl">
                {symbol}
              </div>
            </Link>
          ) : (
            <div className="uppercase font-boldy text-sm lg:text-lg">
              {symbol}
            </div>
          )}
          <div className={`uppercase font-boldy text-sm lg:text-lg ml-1 ${positionHistory.side === 'long' ? 'text-green' : 'text-red'}`}>
            {positionHistory.side}
          </div>
          <LeverageDisplay
            leverage={positionHistory.entry_leverage}
            positionSize={positionHistory.entry_collateral_amount * positionHistory.entry_leverage}
            entryCollateral={positionHistory.entry_collateral_amount}
            finalCollateral={positionHistory.final_collateral_amount}
          />
        </div>
        <p className="text-xxs opacity-50">{formatDate(positionHistory.entry_date)}</p>
      </div>
    </div>
  );

  const pnl = (
    <div className="flex flex-col items-center min-w-[10em] w-[10em]">
      <div className="flex flex-row gap-2 w-full font-mono text-xxs text-txtfade justify-center items-center">
        PnL
        <label className="flex items-center cursor-pointer">
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
      <div className="flex items-center">
        <FormatNumber
          nb={pnlValue}
          format="currency"
          className={`mr-0.5 font-bold text-${pnlValue > 0 ? 'green' : 'redbright'}`}
          isDecimalDimmed={false}
        />
        <FormatNumber
          nb={(pnlValue / positionHistory.entry_collateral_amount) * 100}
          format="percentage"
          prefix="("
          suffix=")"
          suffixClassName={`ml-0 text-${pnlValue > 0 ? 'green' : 'redbright'}`}
          precision={2}
          isDecimalDimmed={false}
          className={`text-xs text-${pnlValue > 0 ? 'green' : 'redbright'}`}
        />
      </div>
    </div>
  );

  const InfoBlock = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col items-center min-w-[5em] w-[5em] ${className}`}>
      <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center mb-1">
        {label}
      </div>
      {children}
    </div>
  );

  return (
    <>
      <div className={twMerge(
        'min-w-[250px] w-full flex flex-col border rounded-lg bg-secondary overflow-hidden',
        bodyClassName,
        borderColor,
      )}>

        <div className="flex border-b p-3 items-center w-full relative">
          <div className="flex items-center">{positionName}</div>
          <div className="ml-auto lg:absolute lg:left-1/2 lg:-translate-x-1/2">{pnl}</div>
        </div>


        <div className="flex flex-row grow justify-evenly flex-wrap gap-y-2 pb-2 pt-2 pr-2 pl-2">
          <InfoBlock label="Time Opened">
            <div className="text-xs text-gray-400">
              {formatTimeDifference(
                getFullTimeDifference(
                  positionHistory.entry_date,
                  positionHistory.exit_date ?? new Date()
                )
              )}
            </div>
          </InfoBlock>

          <InfoBlock label="Entry Price">
            <FormatNumber
              nb={positionHistory.entry_price}
              format="currency"
              className="text-xs"
              isDecimalDimmed={false}
            />
          </InfoBlock>

          <InfoBlock label="Exit Price">
            <FormatNumber
              nb={positionHistory.exit_price}
              format="currency"
              className="text-xs"
              isDecimalDimmed={false}
            />
          </InfoBlock>

          <InfoBlock label="Status">
            <div className="flex items-center gap-1">
              {positionHistory.status === 'liquidate' ? (
                <span className="text-orange text-xs">Liquidated</span>
              ) : (
                <span className="text-blue text-xs">Closed</span>
              )}
              <Link href={getTxExplorer(positionHistory.last_tx)} target="_blank">
                <Image src={externalLinkLogo} alt="View transaction" width={12} height={12} />
              </Link>
            </div>
          </InfoBlock>

          <InfoBlock label="Fees Paid">
            <FeesPaidTooltip
              entryFees={0}
              exitFees={positionHistory.exit_fees}
              borrowFees={positionHistory.borrow_fees}
            >
              <div className="flex items-center border-b border-dotted border-gray-400">
                <FormatNumber
                  nb={totalFees}
                  format="currency"
                  className="text-xs text-redbright"
                  isDecimalDimmed={false}
                />
              </div>
            </FeesPaidTooltip>
          </InfoBlock>

          {showShareButton && (
            <>
              <Button
                leftIcon={shareIcon}
                variant='secondary'
                className='hidden lg:block opacity-50 hover:opacity-100'
                onClick={() => {
                  setIsOpen(true);
                }}
              />
              <div className="lg:hidden flex flex-col justify-center items-center w-full border-t">
                <Button
                  size="xs"
                  className="text-txtfade border-bcolor border-t border-l bg-[#a8a8a810] hover:bg-bcolor h-9 w-full"
                  leftIcon={shareIcon}
                  rounded={false}
                  onClick={() => {
                    setIsOpen(true);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <Modal
            title="Share PnL"
            close={() => setIsOpen(false)}
            className="overflow-y-auto"
            wrapperClassName="h-[80vh] sm:h-auto"
          >
            <div className="absolute top-0 w-[300px]">
              {pnlValue > 0 && <Congrats />}
            </div>
            <SharePositionModal
              position={{
                pnl: pnlValue,
                token: positionHistory.token,
                side: positionHistory.side,
                price: positionHistory.entry_price,
                fees: -totalFees,
                exitFeeUsd: positionHistory.exit_fees,
                borrowFeeUsd: positionHistory.borrow_fees,
                collateralUsd: positionHistory.entry_collateral_amount,
                sizeUsd: positionHistory.entry_collateral_amount * positionHistory.entry_leverage,
                exitPrice: positionHistory.exit_price,
                nativeObject: {
                  openTime: new Date(positionHistory.entry_date).getTime() / 1000,
                }
              } as unknown as PositionExtended}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(PositionHistoryBlock);
