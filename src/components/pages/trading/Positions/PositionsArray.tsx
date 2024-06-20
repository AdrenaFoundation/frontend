import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getArrowElement } from '@/utils';

import NetValueTooltip from '../TradingInputs/NetValueTooltip';
import SizeTooltip from '../TradingInputs/SizeTooltip';

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

  return (
    <table className={twMerge('w-full', className, bodyClassName)}>
      {/* Header */}

      <thead className="border-b border-bcolor">
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
              'shrink-0 grow-0 w-[14%] border-none',
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
            <tr key={position.pubkey.toBase58() + '-0'}>
              <td className="flex items-center text-sm text-center h-10">
                <Image
                  className="ml-5 mt-2 pt-2"
                  height={28}
                  width={28}
                  src={position.token.image}
                  alt={`${position.token.symbol} logo`}
                />
                <table className="flex flex-col ml-2 text-sm text-center h-10">
                  <tr>
                    <td>
                      <div className="flex flex-col h-full">
                        <div className="grow flex h-full items-center justify-start pt-2 mt-[0.2em]">
                          {window.location.pathname !== '/trade' ? (
                            <Link
                              href={`/trade?pair=USDC_${position.token.symbol}&action=${position.side}`}
                              target=""
                            >
                              <span className="font-boldy text-base underline">
                                {position.token.symbol}
                              </span>
                            </Link>
                          ) : (
                            <span className="font-boldy text-base">
                              {position.token.symbol}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="text-xs text-center h-10 font-mono">
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
                        <h5
                          className={twMerge(
                            'text-xs uppercase ml-1',
                            `text-${
                              position.side === 'long' ? 'green' : 'red'
                            }`,
                          )}
                        >
                          {position.side}
                        </h5>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                {position.pnl &&
                position?.priceChangeUsd &&
                position?.borrowFeeUsd ? (
                  <NetValueTooltip position={position} placement="top">
                    <FormatNumber
                      nb={position.sizeUsd - position.pnl}
                      format="currency"
                      className="underline-dashed"
                    />
                  </NetValueTooltip>
                ) : (
                  '-'
                )}
                <br />
                {position.pnl &&
                position?.priceChangeUsd &&
                position?.borrowFeeUsd ? (
                  <FormatNumber
                    nb={position.pnl}
                    format="currency"
                    className={`text-xs text-${
                      position.pnl && position.pnl > 0 ? 'green' : 'red'
                    }`}
                  />
                ) : (
                  '-'
                )}
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                <div className="flex items-center justify-center">
                  <FormatNumber
                    nb={position.collateralUsd - (position?.borrowFeeUsd ?? 0)}
                    format="currency"
                  />
                  <Button
                    className="text-xxs ml-1 text-txtfade px-2 border-bcolor bg-[#a8a8a810]"
                    title="Edit"
                    variant="outline"
                    onClick={() => {
                      triggerEditPositionCollateral(position);
                    }}
                  />
                </div>
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                <SizeTooltip position={position} placement="top">
                  <FormatNumber
                    nb={position.sizeUsd}
                    format="currency"
                    className="underline-dashed text-xs"
                  />
                </SizeTooltip>
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                <FormatNumber
                  nb={position.price}
                  format="currency"
                  className="text-xs mr-1"
                />
                <span className="text-txtfade">/</span>
                <FormatNumber
                  nb={tokenPrices[position.token.symbol]}
                  format="currency"
                  className="text-xs ml-1 text-txtfade"
                />
              </td>

              <td className={twMerge(columnStyle)}>
                <FormatNumber
                  nb={position.liquidationPrice}
                  format="currency"
                  className="text-xs"
                />
              </td>

              <td
                className={twMerge(columnStyle, 'font-mono items-center')}
                style={{ height: '5em' }}
              >
                <div className="flex justify-center items-center">
                  <Button
                    className="text-xxs ml-1 text-txtfade border-bcolor bg-[#a8a8a810]"
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
