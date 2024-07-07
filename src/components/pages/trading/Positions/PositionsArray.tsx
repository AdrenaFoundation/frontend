import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getArrowElement } from '@/utils';

import NetValueTooltip from '../TradingInputs/NetValueTooltip';

export default function PositionsArray({
  bodyClassName,
  borderColor,
  connected,
  className,
  positions,
  triggerClosePosition,
  triggerEditPositionCollateral,
}: {
  bodyClassName?: string;
  borderColor?: string;
  connected: boolean;
  className?: string;
  positions: PositionExtended[] | null;
  triggerClosePosition: (p: PositionExtended) => void;
  triggerEditPositionCollateral: (p: PositionExtended) => void;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const isBelow1100 = useBetterMediaQuery('(max-width: 1100px)');

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
  const border = 'border-b pt-2' + borderColor ? borderColor : 'border-bcolor';
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

  return (
    <table className={twMerge('w-full', className, bodyClassName)}>
      {/* Header */}

      <thead
        className={twMerge(
          'border-b',
          borderColor ? borderColor : 'border-bcolor',
        )}
      >
        <tr>
          <th className={twMerge(columnHeadStyle, 'w-[14%]')}>Position</th>
          <th className={twMerge(columnHeadStyle, 'w-[14%]')}>Net Value</th>

          <th className={twMerge(columnHeadStyle, 'w-[14%]')}>Collateral</th>
          <th className={twMerge(columnHeadStyle, 'w-[14%]')}>Size</th>

          <th className={twMerge(columnHeadStyle, 'w-[14%]')}>
            Entry / Mark Price
          </th>
          <th className={twMerge(columnHeadStyle, 'w-[14%]')}>Liq. Price</th>
          <th
            className={twMerge(
              columnHeadStyle,
              'w-[14%] lg:w-[10%] border-none',
            )}
          >
            Close
          </th>
        </tr>
      </thead>

      {/* Content */}
      <tbody>
        {positions?.map((position, i) => (
          // Use Fragment to avoid key error
          <React.Fragment key={position.pubkey.toBase58()}>
            <tr
              key={position.pubkey.toBase58() + '-0'}
              className={twMerge(
                'border-b',
                borderColor ? borderColor : 'border-bcolor',
              )}
            >
              <td
                className={twMerge(
                  'items-center text-xs md:text-sm text-center h-10',
                )}
              >
                <div className="h-full w-full items-center justify-center flex font-mono">
                  <Image
                    className="hidden md:block lg:hidden xl:block"
                    height={28}
                    width={28}
                    src={position.token.image}
                    alt={`${position.token.symbol} logo`}
                  />
                  <table className="flex flex-col ml-2 text-xs md:text-sm text-center h-10">
                    <tbody className="flex flex-col h-full">
                      <tr>
                        <td>
                          <div className="grow flex h-full items-center justify-start pt-0.5 mt-[0.2em]">
                            {window.location.pathname !== '/trade' ? (
                              <Link
                                href={`/trade?pair=USDC_${position.token.symbol}&action=${position.side}`}
                                target=""
                              >
                                <span className="font-boldy underline text-xs md:text-sm">
                                  {position.token.symbol}
                                </span>
                              </Link>
                            ) : (
                              <span className="font-boldy text-xs md:text-sm">
                                {position.token.symbol}
                              </span>
                            )}
                            <span
                              className={twMerge(
                                'font-boldy ml-1 uppercase text-xs md:text-sm',
                                `text-${
                                  position.side === 'long'
                                    ? 'green'
                                    : 'redbright'
                                }`,
                              )}
                            >
                              {position.side}
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr className="text-center h-10 font-mono">
                        <td>
                          <div className="flex">
                            {position ? (
                              <FormatNumber
                                nb={position.leverage}
                                suffix="x"
                                className="text-xs"
                              />
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>

              <td
                className={twMerge(
                  'font-mono items-center text-xs text-center h-10',
                )}
              >
                <div className="flex flex-col h-full w-full items-center justify-center">
                  {position.pnl && position?.collateralUsd ? (
                    <div className="flex items-center justify-center">
                      <NetValueTooltip position={position} placement="top">
                        <span className="underline-dashed">
                          <FormatNumber
                            nb={position.collateralUsd + position.pnl}
                            format="currency"
                            className="text-xs"
                          />
                        </span>
                      </NetValueTooltip>
                    </div>
                  ) : (
                    '-'
                  )}
                  {position.pnl ? (
                    <div className="flex mt-1">
                      <FormatNumber
                        nb={position.pnl}
                        format="currency"
                        className={`mr-0.5 text-xs text-${
                          position.pnl && position.pnl > 0
                            ? 'green'
                            : 'redbright'
                        }`}
                        isDecimalDimmed={false}
                      />

                      {position.pnl ? (
                        <>
                          <FormatNumber
                            nb={(position.pnl / position.collateralUsd) * 100}
                            format="percentage"
                            prefix="("
                            suffix=")"
                            precision={2}
                            isDecimalDimmed={false}
                            className={`text-xs text-${
                              position.pnl && position.pnl > 0
                                ? 'green'
                                : 'redbright'
                            }`}
                          />
                        </>
                      ) : null}
                    </div>
                  ) : (
                    '-'
                  )}
                </div>
              </td>

              <td className={twMerge('font-mono text-xs text-center h-10')}>
                <div className="flex flex-col items-center justify-center">
                  <div className="h-full w-full items-center justify-center flex">
                    <FormatNumber
                      nb={position.collateralUsd}
                      format="currency"
                      className="text-xs"
                    />
                    <Button
                      size="xs"
                      className="ml-1.5 text-txtfade border-bcolor bg-[#a8a8a810] hover:text-white"
                      title="Edit"
                      variant="outline"
                      onClick={() => {
                        triggerEditPositionCollateral(position);
                      }}
                    />
                  </div>
                </div>
              </td>

              {isBelow1100 ? null : (
                <td className={twMerge(columnStyle, 'font-mono')}>
                  <div className="h-full w-full items-center justify-center flex">
                    <FormatNumber
                      nb={position.sizeUsd}
                      format="currency"
                      className="text-xs"
                    />
                  </div>
                </td>
              )}

              <td className={twMerge(columnStyle, 'font-mono')}>
                {isBelow1100 ? (
                  <div className="flex flex-col h-full w-full items-center justify-center">
                    <FormatNumber
                      nb={position.price}
                      format="currency"
                      className="text-xs mr-1"
                    />

                    <div className="flex">
                      <FormatNumber
                        nb={tokenPrices[position.token.symbol]}
                        format="currency"
                        className="text-xs text-txtfade"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FormatNumber
                      nb={position.price}
                      format="currency"
                      className="text-xs"
                      minimumFractionDigits={2}
                    />

                    <span className="text-xs text-txtfade ml-1 mr-1">/</span>

                    <FormatNumber
                      nb={tokenPrices[position.token.symbol]}
                      format="currency"
                      className="text-xs text-txtfade"
                      minimumFractionDigits={2}
                    />
                  </div>
                )}
              </td>

              <td className={twMerge(columnStyle)}>
                <div className="h-full w-full items-center justify-center flex">
                  <FormatNumber
                    nb={position.liquidationPrice}
                    format="currency"
                    className="text-xs"
                    minimumFractionDigits={2}
                  />
                </div>
              </td>

              <td
                className={twMerge(columnStyle, 'font-mono items-center')}
                style={{ height: '5em' }}
              >
                <div className="flex h-full w-full justify-center items-center">
                  <Button
                    size="xs"
                    className="ml-1.5 text-txtfade border-bcolor bg-[#a8a8a810] hover:text-white"
                    title="Close"
                    variant="outline"
                    onClick={() => {
                      triggerClosePosition(position);
                    }}
                  />
                </div>
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
                tokenPrices[position.token.symbol] &&
                (tokenPrices[position.token.symbol] ?? 0) <
                  (position.liquidationPrice ?? 0)
                  ? generateLiquidationBlock()
                  : null}
                {position.side === 'short' &&
                tokenPrices[position.token.symbol] &&
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
