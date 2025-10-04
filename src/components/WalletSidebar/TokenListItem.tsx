import { TokenBalance } from '@/hooks/useTokenBalances';

interface TokenListItemProps {
    token: TokenBalance & { priceUsd?: number; valueUsd?: number };
    onClick?: () => void;
    isSelected?: boolean;
}

export function TokenListItem({ token, onClick, isSelected = false }: TokenListItemProps) {
    const baseClasses = onClick
        ? `flex items-center justify-between p-3 bg-third rounded-lg cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-opacity-80'
        }`
        : 'flex items-center justify-between p-3 bg-third rounded-lg';

    return (
        <div className={baseClasses} onClick={onClick}>
            <div className="flex items-center gap-3">
                {token.icon ? (
                    // Use regular img tag for external token icons to avoid Next.js domain restrictions
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={token.icon}
                        alt={token.symbol}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                            // Fallback to gradient placeholder if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                ) : null}
                {/* Fallback gradient placeholder - shown when no icon or when image fails */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${token.icon ? 'hidden' : ''}`}>
                    <span className="text-white text-sm font-bold">
                        -
                    </span>
                </div>
                <div>
                    <div className="text-white font-medium">{token.name === 'Wrapped SOL' ? 'Solana' : token.name}</div>
                    <div className="text-sm text-gray">
                        {token.uiAmount.toFixed(Math.min(4, token.decimals))} {token.symbol}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-white font-semibold text-lg">
                    {token.valueUsd !== undefined && token.valueUsd !== null ? `$${token.valueUsd.toFixed(2)}` : '-'}
                </div>
                <div className="text-xs">
                    {token.priceChange24h !== undefined ? (
                        token.priceChange24h >= 0 ?
                            <span className="text-green">+{token.priceChange24h.toFixed(2)}%</span> :
                            <span className="text-red">{token.priceChange24h.toFixed(2)}%</span>
                    ) : (
                        <span className="text-gray">-</span>
                    )}
                </div>
            </div>
        </div>
    );
}
