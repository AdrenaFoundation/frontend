import { twMerge } from 'tailwind-merge';

import { TokenBalance } from '@/hooks/analytics-metrics/useGetBalancesAndJupiterPrices';

import FormatNumber from '../Number/FormatNumber';

interface TokenListItemProps {
  token: TokenBalance & { priceUsd?: number; valueUsd?: number };
  onClick?: () => void;
  isSelected?: boolean;
}

export function TokenListItem({
  token,
  onClick,
  isSelected = false,
}: TokenListItemProps) {
  return (
    <div
      className={twMerge(
        'flex items-center justify-between p-3 bg-third rounded-lg',
        onClick
          ? `hover:bg-gray-800 hover:opacity-100 opacity-80 cursor-pointer transition-colors`
          : '',
        isSelected ? 'opacity-100 bg-gray-800' : '',
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0">
        {token.icon ? (
          // Use regular img tag for external token icons to avoid Next.js domain restrictions
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={token.icon}
            alt={token.symbol}
            width={32}
            height={32}
            className="size-8 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}

        <div
          className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${token.icon ? 'hidden' : ''}`}
        >
          <span className="rounded-full size-full bg-gray-900 border border-bcolor"></span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-white text-sm leading-tight truncate">
            {token.name === 'Wrapped SOL' ? 'Solana' : token.name}
          </div>
          <div className="text-xs text-white/60 leading-tight truncate">
            {token.uiAmount.toFixed(Math.min(4, token.decimals))} {token.symbol}
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <FormatNumber
          nb={token.valueUsd}
          format="currency"
          isDecimalDimmed={false}
          className="text-mono text-sm leading-tight"
        />

        <div className="text-xs leading-tight">
          {token.priceChange24h !== undefined ? (
            <FormatNumber
              nb={token.priceChange24h}
              format="percentage"
              isDecimalDimmed={false}
              prefix={token.priceChange24h >= 0 ? '+' : ''}
              className={twMerge(
                'text-mono text-xs',
                token.priceChange24h >= 0 ? 'text-green' : 'text-red',
              )}
            />
          ) : (
            <span className="text-gray">-</span>
          )}
        </div>
      </div>
    </div>
  );
}
