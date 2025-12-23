import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import {
  CurrencyCell,
  DateCell,
  LeverageCell,
  OwnerCell,
  PnlCell,
  SideCell,
  TokenCell,
} from '@/components/pages/monitoring/PositionHistoryTable/PositionTableComp/PositionCells';
import Table, { TableHeaderType } from '@/components/pages/monitoring/Table';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { PositionExtended } from '@/types';
import { getNonUserProfile } from '@/utils';

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
  const { t } = useTranslation();
  const [isPnlWithFees] = useState<boolean>(true);
  const [isNative] = useState<boolean>(false);
  const [activeTrader, setActiveTrader] = useState<string | null>(null);

  const isMobile = useBetterMediaQuery(`(max-width: 1400px)`);

  const borrowResolve = (position: PositionExtended) => {
    try {
      const notification = MultiStepNotification.newForRegularTransaction(
        'Position Borrow Resolve',
      ).fire();

      window.adrena.client.positionBorrowResolve({
        notification,
        targetPosition: position.pubkey,
      });
    } catch {
      // Ignore error
    }
  };

  const positionBorrowFeesShouldBeResolved = (position: PositionExtended) =>
    (position.borrowFeeUsd ?? 0) - (position.paidInterestUsd ?? 0) > 50;

  const headers: TableHeaderType[] = [
    { title: t('monitoring.owner'), key: 'owner', sticky: 'left' },
    { title: t('monitoring.token'), key: 'token', width: 5, sticky: 'left' },
    { title: t('monitoring.side'), key: 'side', width: 3.75 },
    {
      title: t('monitoring.leverage'),
      key: 'leverage',
      width: 5,
      align: 'right',
      isSortable: true,
    },
    { title: t('monitoring.pnl'), key: 'pnl', align: 'right', isSortable: true },
    { title: t('monitoring.size'), key: 'size', align: 'right', isSortable: true },
    {
      title: t('monitoring.collateral'),
      key: 'collateral',
      align: 'right',
    },
    { title: t('monitoring.entryPrice'), key: 'entryPrice', align: 'right' },
    { title: t('monitoring.liqPrice'), key: 'liquidationPrice', align: 'right' },
    { title: t('monitoring.openDate'), key: 'openDate', align: 'right' },
    { title: t('monitoring.action'), key: 'resolve', width: 8.75, align: 'right' },
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

  const formattedData = useMemo(
    () =>
      paginatedPositions.map((position) => ({
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
            value={
              isNative ? position.collateralAmount : position.collateralUsd
            }
            isCurrency={!isNative}
          />
        ),
        entryPrice: (
          <CurrencyCell
            value={position.price}
            precision={position.token.displayPriceDecimalsPrecision}
          />
        ),
        liquidationPrice: (
          <CurrencyCell
            value={position.liquidationPrice ?? null}
            precision={position.token.displayPriceDecimalsPrecision}
          />
        ),
        openDate: <DateCell date={position.openDate} />,
        resolve: positionBorrowFeesShouldBeResolved(position) ? (
          <Button
            size="sm"
            variant="lightbg"
            title={t('monitoring.resolveBorrowFees')}
            onClick={(e) => {
              e?.stopPropagation();
              borrowResolve(position);
            }}
            className="text-xxs text-nowrap"
          />
        ) : (
          <span className="text-xs opacity-30">-</span>
        ),
        id: position.owner.toBase58(),
      })),
    [paginatedPositions, isPnlWithFees, isNative, maxPnl, minPnl, t],
  );

  return (
    <>
      <div className="overflow-hidden">
        <Table
          title={t('monitoring.allPositions')}
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
          isSticky={!!isMobile}
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
