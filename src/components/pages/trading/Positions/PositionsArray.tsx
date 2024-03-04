import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import Loader from '@/components/Loader/Loader';
import WalletSelectionModal from '@/components/WalletAdapter/WalletSelectionModal';
import { useDispatch, useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

import phantomLogo from '../../../../../public/images/phantom.png';

export default function PositionsArray({
  positions,
  triggerClosePosition,
  triggerEditPositionCollateral,
}: {
  positions: PositionExtended[] | null;
  triggerClosePosition: (p: PositionExtended) => void;
  triggerEditPositionCollateral: (p: PositionExtended) => void;
}) {
  const dispatch = useDispatch();

  const tokenPrices = useSelector((s) => s.tokenPrices);
  const connected = !!useSelector((s) => s.walletState.wallet);

  const columnStyle = 'text-sm py-5';

  const handleClick = () => {
    if (!connected) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }
  };

  if (positions === null && !connected) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Button
          title="Connect Wallet"
          variant="secondary"
          rightIcon={phantomLogo}
          className="mb-2"
          onClick={handleClick}
        />

        <p className="text-sm opacity-50 font-normal">
          Waiting for wallet connection
        </p>

        <WalletSelectionModal />
      </div>
    );
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
      <div className="flex h-full items-center justify-center">
        <p className="text-sm opacity-50 font-normal">No opened position</p>
      </div>
    );
  }

  return (
    <table className="w-full">
      {/* Header */}

      <thead>
        <tr>
          <th className="text-sm text-left opacity-50 font-medium">Position</th>
          <th className="text-sm text-left opacity-50 font-medium">Leverage</th>
          <th className="text-sm text-left opacity-50 font-medium">
            Net Value
          </th>
          <th className="text-sm text-left opacity-50 font-medium">Size</th>
          <th className="text-sm text-left opacity-50 font-medium">
            Collateral
          </th>
          <th className="text-sm text-left opacity-50 font-medium">
            Entry Price
          </th>
          <th className="text-sm text-left opacity-50 font-medium">
            Market Price
          </th>
          <th className="text-sm text-left opacity-50 font-medium">
            Liq. Price
          </th>
          <th className="text-sm text-right opacity-50 font-medium w-12 shrink-0 grow-0">
            Actions
          </th>
        </tr>
      </thead>

      {/* Content */}
      <tbody>
        {positions?.map((position, i) => (
          <tr
            key={position.pubkey.toBase58()}
            className={twMerge(
              i !== positions.length - 1 && 'border-b border-b-gray-200',
            )}
          >
            <td
              className={twMerge(
                'flex-col justify-center items-start',
                columnStyle,
                i === 0 && 'pt-3',
              )}
            >
              <div className="flex flex-row gap-2">
                <Image
                  height={32}
                  width={32}
                  src={position.token.image}
                  alt={`${position.token.symbol} logo`}
                />
                <div>
                  <span className="font-mono">{position.token.symbol}</span>
                  <div
                    className={twMerge(
                      'text-sm font-mono capitalize',
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
              {tokenPrices[position.token.symbol]
                ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  formatPriceInfo(tokenPrices[position.token.symbol]!)
                : '-'}
            </td>

            <td className={columnStyle}>
              {formatPriceInfo(position.liquidationPrice ?? null)}
            </td>

            <td
              className={twMerge(
                columnStyle,
                'font-mono flex flex-col w-12 shrink-0 grow-0 justify-center items-center',
              )}
            >
              <Button
                className="text-xs"
                title="close"
                variant="text"
                onClick={() => {
                  triggerClosePosition(position);
                }}
              />

              <Button
                className="text-xs"
                title="edit"
                variant="text"
                onClick={() => {
                  triggerEditPositionCollateral(position);
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
