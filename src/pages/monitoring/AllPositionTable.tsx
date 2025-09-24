import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import Modal from '@/components/common/Modal/Modal';
import {
  CurrencyCell,
  DateCell,
  LeverageCell,
  PnlCell,
  SideCell,
  TokenCell,
} from '@/components/pages/monitoring/PositionHistoryTable/PositionTableComp/PositionCells';
import Table, { TableHeaderType } from '@/components/pages/monitoring/Table';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { PROFILE_PICTURES } from '@/constant';
import { PositionExtended, UserProfileExtended } from '@/types';
import { getAbbrevWalletAddress, getNonUserProfile } from '@/utils';

export default function AllPositionTable({
  paginatedPositions,
  currentPage,
  totalPages,
  setCurrentPage,
  handleSort,
  sortDirection,
  sortBy,
}: {
  paginatedPositions: PositionExtended[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  handleSort: (key: string) => void;
  sortDirection: 'asc' | 'desc';
  sortBy: string;
}) {
  const [isPnlWithFees] = useState<boolean>(true);
  const [isNative] = useState<boolean>(false);
  const [activeTrader, setActiveTrader] = useState<string | null>(null);

  const headers: TableHeaderType[] = [
    { title: 'Owner', key: 'owner', sticky: 'left' },
    { title: 'Token', key: 'token', width: 5, sticky: 'left' },
    { title: 'Side', key: 'side', width: 3.75 },
    {
      title: 'Leverage',
      key: 'leverage',
      width: 5,
      align: 'right',
      isSortable: true,
    },
    { title: 'PnL', key: 'pnl', align: 'right', isSortable: true },
    { title: 'Size', key: 'size', align: 'right', isSortable: true },
    {
      title: 'Collateral',
      key: 'collateral',
      align: 'right',
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
    owner: (
      <OwnerCell
        userProfile={position.userProfile ?? null}
        walletAddress={position.owner.toBase58()}
      />
    ),
    side: <SideCell side={position.side} />,
    leverage: (
      <LeverageCell
        leverage={position.currentLeverage || position.initialLeverage}
        precision={2}
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
      />
    ),
    collateral: (
      <CurrencyCell
        value={isNative ? position.collateralAmount : position.collateralUsd}
        isCurrency={!isNative}
      />
    ),
    entryPrice: <CurrencyCell value={position.price} />,
    liquidationPrice: (
      <CurrencyCell value={position.liquidationPrice ?? null} />
    ),
    openDate: <DateCell date={position.openDate} />,
    id: position.owner.toBase58(),
  }));

  return (
    <>
      <div className="border-t p-3">
        <Table
          title="All Positions"
          headers={headers}
          data={formattedData}
          height="100%"
          currentPage={currentPage}
          totalPages={totalPages}
          loadPageData={setCurrentPage}
          handleSort={handleSort}
          sortDirection={sortDirection}
          sortBy={sortBy}
          onRowClick={(row) => {
            setActiveTrader(String(row));
          }}
        />
      </div>

      <AnimatePresence>
        {activeTrader ? (
          <Modal
            close={() => setActiveTrader(null)}
            className="h-[80vh] w-full overflow-y-auto"
            wrapperClassName="items-start w-full max-w-[70em] sm:mt-0"
            isWrapped={false}
          >
            <ViewProfileModal
              profile={
                paginatedPositions.find(
                  (p) => p.owner.toBase58() === activeTrader,
                )?.userProfile || getNonUserProfile(activeTrader)
              }
              close={() => setActiveTrader(null)}
            />
          </Modal>
        ) : null}
      </AnimatePresence>
    </>
  );
}
const OwnerCell = ({
  userProfile,
  walletAddress,
}: {
  userProfile: UserProfileExtended | null;
  walletAddress: string;
}) => {
  return (
    <div className="flex items-center gap-2" key={walletAddress}>
      <Image
        src={PROFILE_PICTURES[userProfile ? userProfile.profilePicture : 0]}
        alt="profile pic"
        width={16}
        height={16}
        className="w-4 h-4 rounded-full border border-inputcolor"
      />
      <span className="font-mono text-xs underline-dashed max-w-24 truncate">
        {userProfile
          ? userProfile.nickname
          : getAbbrevWalletAddress(walletAddress)}
      </span>
    </div>
  );
};
