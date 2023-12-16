import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import WalletSelectionModal from '@/components/WalletAdapter/WalletSelectionModal';
import { useDispatch, useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

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

  const columnStyle = 'flex w-full justify-between';

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

        <p className="text-xs opacity-50 font-normal">
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
          key={position.pubkey.toBase58()}
          className="flex flex-col bg-secondary border border-gray-300 rounded-lg w-full"
        >
          <div className="border-b border-grey-300 p-4">
            {position.token.symbol}
          </div>

          <ul className="flex flex-col gap-2 p-4">
            <li className={columnStyle}>
              <p className="opacity-50">Leverage</p>
              <div className="flex-row gap-3">
                <p className="font-mono text-right">
                  {formatNumber(position.leverage, 2)}x
                </p>
                <p
                  className={twMerge(
                    'ml-1 capitalize',
                    position.side === 'long'
                      ? 'text-green-500'
                      : 'text-red-500',
                  )}
                >
                  {position.side}
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
              <p className="opacity-50">PnL</p>
              <p className="font-mono text-right">
                {position.pnl ? (
                  <span
                    className={`text-${position.pnl > 0 ? 'green' : 'red'}-400`}
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

          <div className="flex gap-3 p-4">
            <Button
              className="w-full"
              size="sm"
              variant="secondary"
              title="Close Collateral"
              onClick={() => {
                triggerClosePosition(position);
              }}
            />

            <Button
              className="w-full"
              size="sm"
              variant="secondary"
              title="Edit Collateral"
              onClick={() => {
                triggerEditPositionCollateral(position);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
