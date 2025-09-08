import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import { AdrenaNotificationData, TokenSymbol } from '@/types';
import { getTokenImage, getTokenSymbol, getTxExplorer } from '@/utils';

// Emoji by size (same as Discord)
function getSizeEmoji(size: number): string {
  if (size < 1_000) return '🦐'; // Shrimp
  if (size < 100_000) return '🐬'; // Dolphin
  if (size < 1_000_000) return '🐋'; // Whale
  return '🐙'; // Kraken
}

// Get token by market symbol - extract symbol from market name
function getTokenByMarketSymbol(market: string) {
  let symbol = market.split(/[-\/]/)[0].toUpperCase();

  if (symbol === 'BTC') {
    symbol = 'WBTC';
  }

  if (symbol === 'SOL') {
    symbol = 'JITOSOL';
  }

  return window.adrena?.client?.getTokenBySymbol(symbol as TokenSymbol) || null;
}

// Get notification colors based on type
function getNotificationColors(type: string): {
  bg: string;
  border: string;
  accent: string;
} {
  switch (type) {
    case 'position_opened':
      return {
        bg: 'bg-green/10',
        border: 'border-green/30',
        accent: 'text-green',
      };
    case 'position_closed':
      return {
        bg: 'bg-orange/10',
        border: 'border-orange/30',
        accent: 'text-orange',
      };
    case 'position_liquidated':
      return {
        bg: 'bg-red/10',
        border: 'border-red/30',
        accent: 'text-redbright',
      };
    case 'position_increased':
      return {
        bg: 'bg-blue/10',
        border: 'border-blue/30',
        accent: 'text-blue',
      };
    default:
      return {
        bg: 'bg-gray/10',
        border: 'border-gray/30',
        accent: 'text-gray',
      };
  }
}

// Get notification title with emoji
function getNotificationTitle(type: string, size: number): string {
  const emoji = getSizeEmoji(size);
  switch (type) {
    case 'position_opened':
      return `Position Opened ${emoji}`;
    case 'position_closed':
      return `Position Closed ${emoji}`;
    case 'position_liquidated':
      return `Liquidation Alert ${emoji} `;
    case 'position_increased':
      return `Position Increased ${emoji}`;
    default:
      return `Position Update ${emoji}`;
  }
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
}: {
  notification: AdrenaNotificationData;
  onMarkAsRead?: (signature: string) => void;
}) => {
  const createdAt = new Date(notification.created_at);
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

  const colors = getNotificationColors(notification.notification_type);
  const title = getNotificationTitle(
    notification.notification_type,
    Number(notification.size_usd_decimal || 0),
  );
  const token = getTokenByMarketSymbol(notification.market);

  // Calculate P&L
  const pnl = Number(
    notification.profit_usd_decimal || notification.loss_usd_decimal || 0,
  );
  const isProfit = Number(notification.profit_usd_decimal || 0) > 0;
  const pnlEmoji = isProfit ? '🟢' : '🔻';

  const handleInteraction = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.transaction_signature);
    }
  };

  return (
    <div
      className={twMerge(
        'relative p-4 border rounded-lg cursor-pointer transition-all duration-200',
        'hover:bg-white/5 group',
        colors.bg,
        colors.border,
        !notification.is_read && 'bg-opacity-100 border-opacity-50',
      )}
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
    >
      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {token ? (
            <Image
              src={getTokenImage(token)}
              alt={getTokenSymbol(token.symbol)}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-500/20 flex items-center justify-center">
              <span className="text-xs text-gray-400">?</span>
            </div>
          )}
          <div>
            <h3 className={twMerge('font-semibold text-sm', colors.accent)}>
              {title}
            </h3>
            <p className="text-xs text-gray-400">{timeAgo}</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        {/* Side & Market */}
        <div>
          <p className="text-gray-400 text-xs mb-1">Side</p>
          <p className="font-mono font-medium">
            {notification.side.toUpperCase()}
          </p>
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-1">Market</p>
          <p className="font-mono font-medium">{notification.market}</p>
        </div>

        {/* Size & Price */}
        <div>
          <p className="text-gray-400 text-xs mb-1">Size</p>
          <FormatNumber
            nb={notification.size_usd_decimal || 0}
            format="currency"
            className="font-mono font-medium text-sm mr-1"
            minimumFractionDigits={2}
          />
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-1">Price</p>
          {notification.price_decimal ? (
            <FormatNumber
              nb={notification.price_decimal}
              format="currency"
              precision={token?.displayPriceDecimalsPrecision || 2}
              className="font-mono font-medium text-sm"
              minimumFractionDigits={2}
            />
          ) : (
            <p className="font-mono font-medium text-sm">N/A</p>
          )}
        </div>

        {/* Conditional fields based on notification type */}
        {['position_opened', 'position_increased'].includes(
          notification.notification_type,
        ) && (
          <>
            <div>
              <p className="text-gray-400 text-xs mb-1">Collateral</p>
              {notification.collateral_amount_usd_decimal ? (
                <FormatNumber
                  nb={notification.collateral_amount_usd_decimal}
                  format="currency"
                  className="font-mono font-medium text-sm"
                  minimumFractionDigits={2}
                />
              ) : (
                <p className="font-mono font-medium text-sm">N/A</p>
              )}
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-1">Leverage</p>
              {notification.leverage_decimal ? (
                <FormatNumber
                  nb={notification.leverage_decimal}
                  format="number"
                  precision={2}
                  suffix="x"
                  className="font-mono font-medium text-sm"
                />
              ) : (
                <p className="font-mono font-medium text-sm">N/A</p>
              )}
            </div>
          </>
        )}

        {['position_closed', 'position_liquidated'].includes(
          notification.notification_type,
        ) && (
          <>
            <div>
              <p className="text-gray-400 text-xs mb-1">P&L</p>
              <div className="flex items-center gap-1">
                <span>{pnlEmoji}</span>
                <FormatNumber
                  nb={pnl}
                  format="currency"
                  className={twMerge(
                    'font-mono font-medium text-sm',
                    isProfit ? 'text-green-400' : 'text-red-400',
                  )}
                  prefix={isProfit ? '+' : ''}
                  minimumFractionDigits={2}
                />
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-1">Fees</p>
              <FormatNumber
                nb={notification.total_fees_decimal || 0}
                format="currency"
                className="font-mono font-medium text-sm"
                minimumFractionDigits={2}
              />
            </div>
          </>
        )}
      </div>

      {/* Transaction Link */}
      <div className="pt-2 border-t border-white/10">
        <p className="text-gray-400 text-xs mb-1">Transaction</p>
        <a
          href={getTxExplorer(notification.transaction_signature)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {`${notification.transaction_signature.slice(0, 8)}...${notification.transaction_signature.slice(-8)}`}
        </a>
      </div>
    </div>
  );
};
