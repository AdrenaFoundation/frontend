import { twMerge } from 'tailwind-merge';

import { TokenBalance } from '@/hooks/useGetBalancesAndJupiterPrices';

import FormatNumber from '../Number/FormatNumber';

interface TokenListItemProps {
    token: TokenBalance & { priceUsd?: number; valueUsd?: number };
    onClick?: () => void;
    isSelected?: boolean;
}

export function TokenListItem({ token, onClick, isSelected = false }: TokenListItemProps) {
    return (
        <div className={twMerge(
            onClick
                ? `flex items-center justify-between p-2 bg-third rounded-lg cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-opacity-80'}`
                : 'flex items-center justify-between p-2 bg-third rounded-lg',
        )} onClick={onClick}>
            <div className="flex items-center gap-3">
                {token.icon ? (
                    // Use regular img tag for external token icons to avoid Next.js domain restrictions
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={token.icon}
                        alt={token.symbol}
                        width={20}
                        height={20}
                        className="w-7 h-7 rounded-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                ) : null}

                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${token.icon ? 'hidden' : ''}`}>
                    <span className="rounded-full w-8 h-8 bg-gray-900 border border-bcolor">
                    </span>
                </div>

                <div>
                    <div className="text-white text-base">{token.name === 'Wrapped SOL' ? 'Solana' : token.name}</div>
                    <div className="text-xs text-white/60">
                        {token.uiAmount.toFixed(Math.min(4, token.decimals))} {token.symbol}
                    </div>
                </div>
            </div>

            <div className="text-right">
                <FormatNumber
                    nb={token.valueUsd}
                    format="currency"
                    isDecimalDimmed={false}
                    className='text-mono text-sm'
                />

                <div className="text-xs">
                    {token.priceChange24h !== undefined ? (
                        <FormatNumber
                            nb={token.priceChange24h}
                            format="percentage"
                            isDecimalDimmed={false}
                            prefix={token.priceChange24h >= 0 ? '+' : ''}
                            className={twMerge('text-mono text-sm', token.priceChange24h >= 0 ? 'text-green' : 'text-red')}
                        />
                    ) : (
                        <span className="text-gray">-</span>
                    )}
                </div>
            </div>
        </div>
    );
}
