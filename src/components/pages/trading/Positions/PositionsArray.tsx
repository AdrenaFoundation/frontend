import Tippy from '@tippyjs/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getArrowElement } from '@/utils';

import LeverageTooltip from '../TradingInputs/LeverageTooltip';

export default function PositionsArray({
  bodyClassName,
  connected,
  className,
  positions,
  triggerClosePosition,
  triggerEditPositionCollateral,
}: {
  bodyClassName?: string;
  connected: boolean;
  className?: string;
  positions: PositionExtended[] | null;
  triggerClosePosition: (p: PositionExtended) => void;
  triggerEditPositionCollateral: (p: PositionExtended) => void;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  if (positions === null && !connected) {
    return <WalletConnection connected={connected} />;
  }

  if (positions === null && connected) {
    return (
      <div className="flex h-full items-center justify-center opacity-50">
        <Loader />
      </div>
    );
  }

  if (positions && !positions.length) {
    return (
      <div className="flex flex-col gap-2 h-full min-h-[5em] grow items-center justify-center">
        <span className="text-sm opacity-50 font-normal flex items-center justify-center font-boldy">
          No opened position
        </span>
        {window.location.pathname === '/trade' ? null : (
          <Button title="Open a position" href={'/trade'} size="lg" />
        )}
      </div>
    );
  }

  const columnHeadStyle = 'text-sm text-center opacity-50 font-boldy p-3';
  const columnStyle = 'text-sm text-center h-10';
  const border = 'border-b border-bcolor pt-2';
  const arrowElementUpRight = getArrowElement('up', 'right-[0.5em] opacity-70');
  const arrowElementUpLeft = getArrowElement('up', 'left-[0.5em] opacity-70');

  function generateLiquidationBlock() {
    return (
      <div className="flex justify-center items-center text-center align-middle relative">
        {arrowElementUpLeft}
        Liquidation price reached
        {arrowElementUpRight}
      </div>
    );
  }

  console.log('positions', positions);

  return (
    <table className={twMerge('w-full', className, bodyClassName)}>
      {/* Header */}

      <thead className="border-b border-bcolor">
        <tr>
          <th className={twMerge(columnHeadStyle, 'w-[6.5em]')}>Position</th>
          <th className={columnHeadStyle}>Leverage</th>
          <th className={columnHeadStyle}>Net Value</th>
          <th className={columnHeadStyle}>Size</th>
          <th className={columnHeadStyle}>Collateral</th>
          <th className={columnHeadStyle}>Entry Price</th>
          <th className={columnHeadStyle}>Market Price</th>
          <th className={columnHeadStyle}>Liq. Price</th>
          <th
            className={twMerge(
              columnHeadStyle,
              'shrink-0 grow-0 w-[7em] border-none',
            )}
          >
            Actions
          </th>
        </tr>
      </thead>

      {/* Content */}
      <tbody>
        {positions?.map((position, i) => (
          // Use Fragment to avoid key error
          <React.Fragment key={position.pubkey.toBase58()}>
            <tr key={position.pubkey.toBase58() + '-0'}>
              <td
                className={twMerge(
                  'flex-col justify-center items-center',
                  columnStyle,
                )}
              >
                <div className="flex flex-row h-full items-center w-[8em] justify-center relative overflow-hidden pl-2">
                  <Image
                    className=""
                    height={14}
                    width={14}
                    src={position.token.image}
                    alt={`${position.token.symbol} logo`}
                  />

                  <div className="grow flex h-full items-center justify-start pl-1 mt-[0.2em]">
                    {window.location.pathname !== '/trade' ? (
                      <Link
                        href={`/trade?pair=USDC_${position.token.symbol}&action=${position.side}`}
                        target=""
                      >
                        <span className="font-boldy underline">
                          {position.token.symbol}
                        </span>
                      </Link>
                    ) : (
                      <span className="font-boldy">
                        {position.token.symbol}
                      </span>
                    )}

                    <h5
                      className={twMerge(
                        'text-sm uppercase ml-1',
                        `text-${position.side === 'long' ? 'green' : 'red'}`,
                      )}
                    >
                      {position.side}
                    </h5>
                  </div>
                </div>
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                {position ? (
                  <LeverageTooltip openedPosition={position}>
                    <FormatNumber
                      nb={position.leverage}
                      suffix="x"
                      className="underline-dashed"
                    />
                  </LeverageTooltip>
                ) : null}
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                {position.pnl ? (
                  <Tippy
                    content={
                      <div className="flex flex-col flex-wrap w-[20em] p-4">
                        <h3 className="tracking-wider">Net Value</h3>
                        <h4 className="mt-2">
                          Collateral + Price Change - Fees
                        </h4>
                        <StyledSubSubContainer className="flex-col mt-4">
                          <div className="flex w-full items-center justify-between">
                            <span className="text-sm">Collateral</span>
                            <FormatNumber
                              nb={position.collateralUsd}
                              format="currency"
                            />
                          </div>

                          <div className="flex w-full items-center justify-between mt-4">
                            <span className="text-sm">Price Change</span>
                            <FormatNumber
                              nb={position?.priceChangeUsd ?? 0}
                              format="currency"
                            />
                          </div>

                          <div className="flex w-full items-center justify-between mt-4">
                            <span className="text-sm">Borrow Fee</span>
                            <FormatNumber
                              nb={position?.borrowFeeUsd ?? 0}
                              format="currency"
                              prefix="-"
                            />
                          </div>
                          <div className="flex w-full items-center justify-between">
                            <span className="text-sm">Close Fee</span>
                            <FormatNumber
                              nb={position.exitFeeUsd}
                              format="currency"
                              prefix="-"
                            />
                          </div>
                          <div className="h-[1px] bg-bcolor w-full mt-4 mb-2"></div>

                          <div className="flex w-full items-center justify-between">
                            <span className="text-sm">PnL</span>
                            <FormatNumber
                              nb={position.pnl}
                              format="currency"
                              className={`text-${
                                position.pnl && position.pnl > 0
                                  ? 'green'
                                  : 'red'
                              }`}
                            />
                          </div>
                        </StyledSubSubContainer>
                      </div>
                    }
                    placement="top"
                  >
                    <FormatNumber
                      nb={position.pnl}
                      format="currency"
                      className={`text-${
                        position.pnl && position.pnl > 0 ? 'green' : 'red'
                      } underline-dashed`}
                    />
                  </Tippy>
                ) : (
                  '-'
                )}
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                <FormatNumber nb={position.sizeUsd} format="currency" />
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                <Tippy
                  content={
                    <div className="flex flex-col flex-wrap w-[20em] p-4">
                      <h3 className="tracking-wider">Collateral</h3>
                      <div className="mt-4 text-white">
                        Position Size * 10 BPS / (Initial Collateral +
                        Unrealized Profit - Unrealized Loss)
                      </div>

                      <StyledSubSubContainer className="flex-col mt-4">
                        <div className="flex w-full items-center justify-between">
                          <span className="text-sm">Initial Collateral</span>
                          <FormatNumber
                            nb={position.collateralUsd}
                            format="currency"
                          />
                        </div>

                        <div className="flex w-full items-center justify-between">
                          <span className="text-sm">Borrow Fee</span>
                          <FormatNumber
                            nb={position?.borrowFeeUsd ?? 0}
                            format="currency"
                            prefix="-"
                          />
                        </div>
                      </StyledSubSubContainer>
                    </div>
                  }
                  placement="top"
                >
                  <FormatNumber
                    nb={position.collateralUsd - (position?.borrowFeeUsd ?? 0)}
                    format="currency"
                    className="underline-dashed"
                  />
                </Tippy>
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                <FormatNumber nb={position.price} format="currency" />
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                <FormatNumber
                  nb={tokenPrices[position.token.symbol]}
                  format="currency"
                />
              </td>

              <td className={columnStyle}>
                <Tippy
                  content={
                    <div className="flex flex-col flex-wrap w-[20em] p-4">
                      <h3 className="tracking-wider">Liquidation Price:</h3>
                      <div className="text-white mt-4">
                        Position Price +- (Collateral + Unrealized Profit -
                        Unrealized Loss - Exit Fee - Interest - Size / Max
                        Leverage) * Position Price / Size
                      </div>
                    </div>
                  }
                  placement="top"
                >
                  <FormatNumber
                    nb={position.liquidationPrice}
                    format="currency"
                    className="underline-dashed"
                  />
                </Tippy>
              </td>

              <td
                className={twMerge(
                  columnStyle,
                  'font-mono flex w-[7em] shrink-0 grow-0 justify-evenly items-center',
                )}
              >
                <Button
                  className="text-xs p-0"
                  title="close"
                  variant="text"
                  onClick={() => {
                    triggerClosePosition(position);
                  }}
                />

                <span>/</span>

                <Button
                  className="text-xs p-0"
                  title="edit"
                  variant="text"
                  onClick={() => {
                    triggerEditPositionCollateral(position);
                  }}
                />
              </td>
            </tr>

            <tr
              key={position.pubkey.toBase58() + '-1'}
              className={twMerge(i !== positions.length - 1 && border)}
            >
              <td
                colSpan={9}
                className="flex-col bg-red justify-center items-center text-center align-middle text-xs opacity-70"
              >
                {position.side === 'long' &&
                (tokenPrices[position.token.symbol] ?? 0) <
                  (position.liquidationPrice ?? 0)
                  ? generateLiquidationBlock()
                  : null}
                {position.side === 'short' &&
                (tokenPrices[position.token.symbol] ?? 0) >
                  (position.liquidationPrice ?? 0)
                  ? generateLiquidationBlock()
                  : null}
              </td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
