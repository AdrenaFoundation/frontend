import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import WalletSelectionModal from '@/components/WalletAdapter/WalletSelectionModal';
import { useDispatch, useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getArrowElement } from '@/utils';

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
          title={
            !window.adrena.geoBlockingData.allowed
              ? 'Geo-Restricted Access'
              : 'Connect wallet'
          }
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
      <div className="flex h-full min-h-[5em] grow items-center justify-center">
        <span className="text-sm opacity-50 font-normal h-full flex items-center justify-center font-boldy">
          No opened position
        </span>
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
        Liquideable
        {arrowElementUpRight}
      </div>
    );
  }

  return (
    <table className="w-full">
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
          <>
            <tr key={position.pubkey.toBase58()}>
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
                    <span className="font-boldy">{position.token.symbol}</span>
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
                <FormatNumber nb={position.leverage} suffix="x" />
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                <FormatNumber
                  nb={position.pnl}
                  format="currency"
                  className={`text-${
                    position.pnl && position.pnl > 0 ? 'green' : 'red'
                  }`}
                />
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                <FormatNumber nb={position.sizeUsd} format="currency" />
              </td>

              <td className={twMerge(columnStyle, 'font-mono')}>
                <FormatNumber nb={position.collateralUsd} format="currency" />
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
                <FormatNumber
                  nb={position.liquidationPrice}
                  format="currency"
                />
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
            <tr className={twMerge(i !== positions.length - 1 && border)}>
              <td
                colSpan={9}
                className="flex-col bg-red justify-center items-center text-center align-middle text-xs opacity-70"
              >
                {position.side === 'long' &&
                position.price < (position.liquidationPrice ?? 0)
                  ? generateLiquidationBlock()
                  : position.side === 'short' &&
                    position.price > (position.liquidationPrice ?? 0)
                  ? generateLiquidationBlock()
                  : ''}
              </td>
            </tr>
          </>
        ))}
      </tbody>
    </table>
  );
}
