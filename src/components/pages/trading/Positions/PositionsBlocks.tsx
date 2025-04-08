import { memo } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { PositionExtended, Token } from '@/types';

import PositionBlock from './PositionBlock';

export function PositionsBlocks({
  connected,
  className,
  positions,
  triggerStopLossTakeProfit,
  triggerClosePosition,
  triggerEditPositionCollateral,
  setTokenB,
}: {
  bodyClassName?: string;
  borderColor?: string;
  connected: boolean;
  className?: string;
  positions: PositionExtended[] | null;
  triggerStopLossTakeProfit: (p: PositionExtended) => void;
  triggerClosePosition: (p: PositionExtended) => void;
  triggerEditPositionCollateral: (p: PositionExtended) => void;
  wrapped?: boolean;
  setTokenB: (token: Token) => void;
}) {
  if (positions === null && !connected) {
    return (
      <div className="flex overflow-hidden bg-main/90 w-full border rounded-lg mt-4 h-[15em] items-center justify-center">
        <WalletConnection connected={connected} />
      </div>
    );
  }

  return (
    <>
      {positions === null && connected ? (
        <>
          {window.location.pathname === '/trade' ? (
            <div className="flex overflow-hidden bg-main/90 grow border rounded-lg h-[15em] items-center justify-center">
              <div className="text-sm opacity-50 font-normal mt-5 font-boldy">
                Loading ...
              </div>
            </div>
          ) : (
            <div className="text-sm opacity-50 font-normal mt-5 mb-5 ml-auto mr-auto font-boldy grow">
              Loading ...
            </div>
          )}
        </>
      ) : null}

      {positions !== null && !positions.length ? (
        <>
          {window.location.pathname === '/trade' ? (
            <div className="flex overflow-hidden bg-main/90 grow border rounded-lg h-[15em] items-center justify-center">
              <div className="text-sm opacity-50 font-normal mt-5 font-boldy">
                No opened position
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <Button title="Open a position" href="/trade" size="lg" className='my-4' />
            </div>
          )}
        </>
      ) : null}

      {positions !== null && positions.length ? (
        <div
          className={twMerge(
            'flex flex-col bg-first w-full h-full gap-3',
            className,
          )}
        >
          {positions.map((position) => (
            <PositionBlock
              key={position.pubkey.toBase58()}
              position={position}
              triggerStopLossTakeProfit={triggerStopLossTakeProfit}
              triggerClosePosition={triggerClosePosition}
              triggerEditPositionCollateral={triggerEditPositionCollateral}
              setTokenB={setTokenB}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

export default memo(PositionsBlocks);
