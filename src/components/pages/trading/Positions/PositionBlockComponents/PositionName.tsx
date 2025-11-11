import Image from 'next/image';
import Link from 'next/link';

import FormatNumber from '@/components/Number/FormatNumber';
import { EnrichedPositionApi, PositionExtended, Token } from '@/types';
import { formatDate2Digits, getTokenImage, getTokenSymbol } from '@/utils';

import OnchainAccountInfo from '../../../monitoring/OnchainAccountInfo';

interface PositionNameProps {
  position: PositionExtended | EnrichedPositionApi;
  isHistory?: boolean;
  readOnly: boolean;
  setTokenB?: (token: Token) => void;
}

const TokenSymbolDisplay = ({
  symbol,
  className,
  onClick,
}: {
  symbol: string;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    className={`text-center text-whiteLabel text-lg font-black font-mono tracking-wider ${onClick ? 'cursor-pointer' : ''} ${className || ''}`}
    onClick={onClick}
  >
    {getTokenSymbol(symbol)}
  </div>
);

export const PositionName = ({
  position,
  readOnly,
  isHistory,
  setTokenB,
}: PositionNameProps) => {
  const isTradeRoute = window.location.pathname === '/trade';
  const tokenSymbol = position.token.symbol;

  const handleTokenClick = () => {
    if (!readOnly && isTradeRoute) {
      setTokenB?.(position.token);
    }
  };

  return (
    <div className="justify-start items-center gap-2.5 flex">
      <Image
        className={`w-8 h-8 rounded-full ${!readOnly && isTradeRoute ? 'cursor-pointer' : ''}`}
        src={getTokenImage(position.token)}
        width={200}
        height={200}
        alt={`${getTokenSymbol(tokenSymbol)} logo`}
        onClick={handleTokenClick}
      />

      <div className="flex flex-col justify-start items-start gap-0.5 inline-flex">
        <div className="flex items-center justify-center gap-2">
          {!readOnly && !isTradeRoute ? (
            <Link
              href={`/trade?pair=USDC_${getTokenSymbol(tokenSymbol)}&action=${position.side}`}
              target=""
            >
              <TokenSymbolDisplay symbol={tokenSymbol} />
            </Link>
          ) : (
            <TokenSymbolDisplay
              symbol={tokenSymbol}
              onClick={!readOnly && isTradeRoute ? handleTokenClick : undefined}
            />
          )}

          <div
            className={`px-2 py-1 rounded-lg justify-center items-center gap-2 flex ${
              position.side === 'long' ? 'bg-greenSide/10' : 'bg-redSide/10'
            }`}
          >
            <div
              className={`text-center text-xs font-mono ${
                position.side === 'long' ? 'text-greenSide' : 'text-redSide'
              }`}
            >
              {position.side.charAt(0).toUpperCase() + position.side.slice(1)}
            </div>
          </div>

          <div className="text-center text-whiteLabel text-sm font-extrabold font-mono">
            <FormatNumber
              nb={
                'initialLeverage' in position
                  ? position.initialLeverage
                  : position.entryLeverage
              }
              format="number"
              precision={0}
              isDecimalDimmed={false}
            />
            x
          </div>
          {isHistory ? (
            <div className="mt-1 text-xxs opacity-50">
              {formatDate2Digits(
                'entryDate' in position ? position.entryDate : '-',
              )}
            </div>
          ) : (
            <OnchainAccountInfo
              address={position.pubkey}
              shorten={true}
              className="text-xs font-mono mt-1"
              iconClassName="w-2 h-2"
            />
          )}
        </div>
      </div>
    </div>
  );
};
