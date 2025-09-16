import Image from 'next/image';
import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import Table, { TableHeaderType } from '@/components/pages/monitoring/Table';
import { PROFILE_PICTURES } from '@/constant';
import useUserProfile from '@/hooks/useUserProfile';
import { PositionExtended } from '@/types';
import { getAbbrevWalletAddress, getTokenImage, getTokenSymbol } from '@/utils';

export default function AllPositionTable({
  paginatedPositions,
  currentPage,
  totalPages,
  setCurrentPage,
}: {
  paginatedPositions: PositionExtended[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}) {
  const [isPnlWithFees] = useState<boolean>(true);
  const [isNative] = useState<boolean>(false);

  const headers: TableHeaderType[] = [
    { title: 'Owner', key: 'owner', sticky: 'left' },
    { title: 'Token', key: 'token', width: 5, sticky: 'left' },
    { title: 'Side', key: 'side', width: 3.75 },
    { title: 'Leverage', key: 'leverage', width: 4 },
    { title: 'PnL', key: 'pnl', align: 'right', isSortable: true },
    { title: 'Size', key: 'size', align: 'right', isSortable: true },
    {
      title: 'Collateral',
      key: 'collateral',
      align: 'right',
      isSortable: true,
    },
    { title: 'Entry Price', key: 'entryPrice', align: 'right' },
    { title: 'Liq. Price', key: 'liquidationPrice', align: 'right' },
    { title: 'Open Date', key: 'openDate', align: 'right' },
  ];

  const { maxPnl, minPnl } = useMemo(() => {
    return paginatedPositions.reduce(
      (acc, p) => {
        const pnl = isPnlWithFees ? p.pnl || 0 : p.pnlMinusFees || 0;
        acc.maxPnl = Math.max(acc.maxPnl, pnl);
        acc.minPnl = Math.min(acc.minPnl, pnl);
        return acc;
      },
      {
        maxPnl: 0,
        minPnl: 0,
      },
    );
  }, [paginatedPositions, isPnlWithFees]);

  const formattedData = paginatedPositions.map((position) => ({
    token: <TokenCell token={position.token} />,
    owner: <OwnerCell position={position} />,
    side: <SideCell side={position.side} />,
    leverage: (
      <LeverageCell
        leverage={position.currentLeverage || position.initialLeverage}
      />
    ),
    pnl: (
      <PnlCell
        pnl={isPnlWithFees ? position.pnl || 0 : position.pnlMinusFees || 0}
        maxPnl={maxPnl}
        minPnl={minPnl}
      />
    ),
    size: (
      <CurrencyCell
        value={isNative ? position.size : position.sizeUsd}
        isCurrency={!isNative}
        suffix={
          isNative ? ` ${getTokenSymbol(position.token.symbol)}` : undefined
        }
      />
    ),
    collateral: (
      <CurrencyCell
        value={isNative ? position.collateralAmount : position.collateralUsd}
        isCurrency={!isNative}
        suffix={
          isNative
            ? ` ${getTokenSymbol(position.collateralToken.symbol)}`
            : undefined
        }
      />
    ),
    entryPrice: <CurrencyCell value={position.price} />,
    liquidationPrice: <CurrencyCell value={position.liquidationPrice} />,
    openDate: <DateCell date={position.openDate} />,
    id: position.pubkey.toBase58(),
  }));

  return (
    <div className="border-t p-3">
      <Table
        title="All Positions"
        headers={headers}
        data={formattedData}
        height="100%"
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        loadPageData={() => Promise.resolve()}
      />
    </div>
  );
}

const TokenCell = ({ token }: { token: PositionExtended['token'] }) => {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={getTokenImage(token)}
        alt={token.symbol}
        width={24}
        height={24}
        className="w-4 h-4 rounded-full"
      />
      <span className="font-interMedium text-sm">
        {getTokenSymbol(token.symbol)}
      </span>
    </div>
  );
};

const OwnerCell = ({ position }: { position: PositionExtended }) => {
  const walletAddress = position.owner.toBase58();
  const { userProfile } = useUserProfile(walletAddress);

  return (
    <div className="flex items-center gap-2">
      <Image
        src={PROFILE_PICTURES[userProfile ? userProfile.profilePicture : 0]}
        alt="profile pic"
        width={16}
        height={16}
        className="w-4 h-4 rounded-full border border-inputcolor"
      />
      <span className="font-mono text-xs underline-dashed">
        {userProfile
          ? userProfile.nickname
          : getAbbrevWalletAddress(walletAddress)}
      </span>
    </div>
  );
};

const SideCell = ({ side }: { side: 'long' | 'short' }) => {
  return (
    <div
      className={twMerge(
        'inline-flex px-2 py-1 rounded text-xs font-mono capitalize',
        side === 'long'
          ? 'bg-green/10 text-greenSide'
          : 'bg-red/10 text-redSide',
      )}
    >
      {side}
    </div>
  );
};

const LeverageCell = ({ leverage }: { leverage: number }) => {
  return (
    <FormatNumber
      nb={leverage}
      suffix="x"
      className="font-mono text-sm"
      precision={1}
      isDecimalDimmed={false}
    />
  );
};

const PnlCell = ({
  pnl,
  maxPnl,
  minPnl,
}: {
  pnl: number;
  maxPnl: number;
  minPnl: number;
}) => {
  const range = maxPnl - minPnl;
  const position = range > 0 ? ((pnl - minPnl) / range) * 100 : 50;

  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden flex-none">
        <div
          className={twMerge(
            'h-full rounded-full transition-all',
            pnl >= 0 ? 'bg-green' : 'bg-red',
          )}
          style={{ width: `${Math.abs(position)}%` }}
        />
      </div>
      <FormatNumber
        nb={pnl}
        format="currency"
        className={twMerge(
          'font-mono text-sm w-full',
          pnl >= 0 ? 'text-green' : 'text-red',
        )}
        precision={2}
        isDecimalDimmed={false}
      />
    </div>
  );
};

const CurrencyCell = ({
  value,
  isCurrency = true,
  suffix,
}: {
  value: number | null | undefined;
  isCurrency?: boolean;
  suffix?: string;
}) => {
  if (value === null || value === undefined) {
    return <span className="font-mono text-sm opacity-50">-</span>;
  }

  return (
    <FormatNumber
      nb={value}
      format={isCurrency ? 'currency' : 'number'}
      suffix={suffix}
      className="font-mono text-sm"
      precision={isCurrency ? 2 : 4}
      isDecimalDimmed={false}
    />
  );
};

const DateCell = ({ date }: { date: Date }) => {
  return (
    <span className="font-mono text-sm">
      {date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}
    </span>
  );
};
