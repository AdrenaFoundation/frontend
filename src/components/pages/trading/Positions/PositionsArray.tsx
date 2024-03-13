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

  const columnHeadStyle = 'text-sm text-center opacity-50 font-medium py-2';
  const columnStyle = 'text-sm py-1 text-center h-10';

  return (
    <table className="w-full">
      {/* Header */}

      <thead>
        <tr>
          <th className={twMerge(columnHeadStyle, 'w-[6.5em]')}>Position</th>
          <th className={columnHeadStyle}>Leverage</th>
          <th className={columnHeadStyle}>Net Value</th>
          <th className={columnHeadStyle}>Size</th>
          <th className={columnHeadStyle}>Collateral</th>
          <th className={columnHeadStyle}>Entry Price</th>
          <th className={columnHeadStyle}>Market Price</th>
          <th className={columnHeadStyle}>Liq. Price</th>
          <th className={twMerge(columnHeadStyle, 'shrink-0 grow-0 w-[7em]')}>
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
                'flex-col justify-center items-center',
                columnStyle,
              )}
            >
              <div className="flex flex-row h-full items-center w-[6.5em] justify-center relative overflow-hidden">
                <Image
                  className="opacity-[10%] absolute left-[-2.5em] grayscale"
                  height={80}
                  width={80}
                  src={position.token.image}
                  alt={`${position.token.symbol} logo`}
                />

                <div className="grow flex h-full items-center justify-start pl-3">
                  <span className="font-mono">{position.token.symbol}</span>
                  <div
                    className={twMerge(
                      'text-sm font-mono capitalize font-bold ml-1',
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
        ))}
      </tbody>
    </table>
  );
}
