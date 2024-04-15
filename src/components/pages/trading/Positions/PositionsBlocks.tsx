import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import WalletSelectionModal from '@/components/WalletAdapter/WalletSelectionModal';
import { useDispatch, useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { formatNumber, formatPriceInfo, getArrowElement } from '@/utils';

import phantomLogo from '../../../../../public/images/phantom.png';

export default function PositionsBlocks({
  className,
  positions,
  triggerClosePosition,
  triggerEditPositionCollateral,
}: {
  className?: string;
  positions: PositionExtended[] | null;
  triggerClosePosition: (p: PositionExtended) => void;
  triggerEditPositionCollateral: (p: PositionExtended) => void;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const connected = !!useSelector((s) => s.walletState.wallet);
  const dispatch = useDispatch();
  const arrowElementUpRight = getArrowElement('up', 'right-[0.5em] opacity-70');
  const arrowElementUpLeft = getArrowElement('up', 'left-[0.5em] opacity-70');

  const columnStyle = 'flex w-full justify-between';

  const handleClick = () => {
    if (!connected) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }
  };

  function generateLiquidationBlock() {
    return (
      <div className="flex-col bg-red justify-center items-center text-center align-middle text-xs opacity-70">
        <div className="flex justify-center items-center text-center align-middle relative">
          {arrowElementUpLeft}
          Liquideable
          {arrowElementUpRight}
        </div>
      </div>
    );
  }

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

  return (
    <div className={twMerge('w-full', 'flex', 'flex-wrap', className)}>
      {positions === null && connected ? (
        <div className="mt-5 mb-5 ml-auto mr-auto">Loading ...</div>
      ) : null}

      {positions && !positions.length ? (
        <div className="mt-5 mb-5 ml-auto mr-auto">No opened position</div>
      ) : null}

      {positions?.map((position) => (
        <div
          className="flex gap-1 flex-col w-full"
          key={position.pubkey.toBase58()}
        >
          <div className="flex flex-col bg-secondary border rounded-lg w-full mt-3 mb-3">
            <div className="flex flex-row justify-between items-center border-b">
              <div className="flex flex-row h-10 items-center relative overflow-hidden">
                <Image
                  className="absolute left-[-0.7em] top-auto grayscale opacity-40"
                  src={position.token.image}
                  width={70}
                  height={70}
                  alt={`${position.token.symbol} logo`}
                />

                <div className="flex">
                  <span
                    className={twMerge(
                      'ml-16 capitalize font-mono',
                      position.side === 'long' ? 'text-green' : 'text-red',
                    )}
                  >
                    {position.side}
                  </span>

                  <h3 className="text-sm capitalize font-mono ml-2">
                    {position.token.name}
                  </h3>
                </div>
              </div>

              <div></div>

              <div className="flex ml-auto mr-3">
                <Button
                  className="text-xs"
                  title="close"
                  variant="secondary"
                  onClick={() => {
                    triggerClosePosition(position);
                  }}
                />

                <Button
                  className="text-xs ml-4"
                  title="edit"
                  variant="secondary"
                  onClick={() => {
                    triggerEditPositionCollateral(position);
                  }}
                />
              </div>
            </div>

            {position.side === 'long' &&
            position.price < (position.liquidationPrice ?? 0)
              ? generateLiquidationBlock()
              : position.side === 'short' &&
                position.price > (position.liquidationPrice ?? 0)
              ? generateLiquidationBlock()
              : ''}

            <ul className="flex flex-col gap-2 p-4">
              <li className={columnStyle}>
                <p className="opacity-50">Leverage</p>
                <div className="flex-row gap-3">
                  <p className="font-mono text-right">
                    {formatNumber(position.leverage, 2)}x
                  </p>
                </div>
              </li>

              <li className={columnStyle}>
                <p className="opacity-50">Size</p>
                <p className="font-mono text-right">
                  {formatPriceInfo(position.sizeUsd)}
                </p>
              </li>
              <li className={columnStyle}>
                <p className="opacity-50">Collateral</p>
                <p className="font-mono text-right">
                  {formatPriceInfo(position.collateralUsd)}
                </p>
              </li>
              <li className={columnStyle}>
                <p className="opacity-50">Net value</p>
                <p className="font-mono text-right">
                  {position.pnl ? (
                    <span
                      className={`text-${
                        position.pnl > 0 ? 'green' : 'red'
                      }-400`}
                    >
                      {formatPriceInfo(position.pnl)}
                    </span>
                  ) : (
                    '-'
                  )}
                </p>
              </li>

              <li className={columnStyle}>
                <p className="opacity-50">Entry Price</p>
                <p className="font-mono text-right">
                  {formatPriceInfo(position.price)}
                </p>
              </li>

              <li className={columnStyle}>
                <p className="opacity-50">Mark Price</p>
                <p className="font-mono text-right">
                  {formatPriceInfo(tokenPrices[position.token.symbol])}
                </p>
              </li>

              <li className={columnStyle}>
                <p className="opacity-50">Liquidation Price</p>
                <p className="font-mono text-right">
                  {formatPriceInfo(position.liquidationPrice ?? null)}
                </p>
              </li>
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
