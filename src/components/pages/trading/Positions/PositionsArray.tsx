import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Menu from '@/components/common/Menu/Menu';
import MenuItem from '@/components/common/Menu/MenuItem';
import MenuItems from '@/components/common/Menu/MenuItems';
import MenuSeperator from '@/components/common/Menu/MenuSeperator';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

export default function PositionsArray({
  positions,
  triggerClosePosition,
  triggerEditPositionCollateral,
}: {
  positions: PositionExtended[] | null;
  triggerClosePosition: (p: PositionExtended) => void;
  triggerEditPositionCollateral: (p: PositionExtended) => void;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const connected = !!useSelector((s) => s.walletState.wallet);

  const columnStyle = 'text-sm px-3 ';

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <table className="w-full">
      {/* Header */}

      <thead>
        <tr>
          {[
            'Position',
            'Leverage',
            'Net Value',
            'Size',
            'Collateral',
            'Entry Price',
            'Market Price',
            'Liq. Price',
          ].map((header) => (
            <th className="text-xs text-left p-3 opacity-50" key={header}>
              {header}
            </th>
          ))}
        </tr>
      </thead>

      {/* Content */}
      <tbody>
        {positions === null && !connected ? (
          <tr className="mt-5 mb-5 ml-auto mr-auto">
            Waiting for wallet connection ...
          </tr>
        ) : null}

        {positions === null && connected ? (
          <tr className="mt-5 mb-5 ml-auto mr-auto">Loading ...</tr>
        ) : null}

        {positions && !positions.length ? (
          <tr className="mt-5 mb-5 ml-auto mr-auto">No opened position</tr>
        ) : null}

        {positions?.map((position) => (
          <tr key={position.pubkey.toBase58()}>
            <td
              className={twMerge(
                columnStyle,
                'flex-col',
                'justify-center',
                'items-start',
              )}
            >
              <div className="flex flex-row gap-2">
                {' '}
                <img
                  className="w-8 h-8"
                  src={position.token.image}
                  alt={`${position.token.name} logo`}
                />{' '}
                <div>
                  <span className="font-mono">{position.token.name}</span>
                  <div
                    className={twMerge(
                      'text-xs font-mono',
                      'capitalize',
                      `text-${position.side === 'long' ? 'green' : 'red'}-500`,
                    )}
                  >
                    {position.side}
                  </div>
                </div>
              </div>
            </td>

            <td className={twMerge(columnStyle, 'font-mono')}>
              {formatNumber(position.leverage, 2)}x
            </td>

            <td className={twMerge(columnStyle, 'font-mono')}>
              {position.pnl ? (
                <span
                  className={`text-${
                    position.pnl > 0 ? 'green' : 'red'
                  }-500 font-mono`}
                >
                  {formatPriceInfo(position.pnl)}
                </span>
              ) : (
                '-'
              )}
            </td>

            <td className={twMerge(columnStyle, 'font-mono')}>
              {formatPriceInfo(position.sizeUsd)}
            </td>

            <td className={twMerge(columnStyle, 'font-mono')}>
              {formatPriceInfo(position.collateralUsd)}
            </td>

            <td className={twMerge(columnStyle, 'font-mono')}>
              {formatPriceInfo(position.price)}
            </td>

            <td className={twMerge(columnStyle, 'font-mono')}>
              {tokenPrices[position.token.name]
                ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  formatPriceInfo(tokenPrices[position.token.name]!)
                : '-'}
            </td>

            <td className={columnStyle}>
              {formatPriceInfo(position.liquidationPrice ?? null)}
            </td>

            <td className="relative ">
              <Button
                variant="text"
                leftIcon="images/icons/threeDots.svg"
                onClick={() => setIsOpen(!isOpen)}
              />

              <Menu
                open={isOpen}
                className="w-fit"
                onClose={() => {
                  setIsOpen(false);
                }}
              >
                <MenuItems>
                  <MenuItem
                    onClick={() => {
                      triggerEditPositionCollateral(position);
                    }}
                  >
                    Edit Collateral
                  </MenuItem>
                  <MenuSeperator />
                  <MenuItem
                    onClick={() => {
                      triggerClosePosition(position);
                    }}
                  >
                    Close
                  </MenuItem>
                </MenuItems>
              </Menu>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
