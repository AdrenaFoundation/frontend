import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import Table from '@/components/pages/monitoring/TableLegacy';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useStakingLeaderboard from '@/hooks/useStakingLeaderboard';
import { getAbbrevNickname, getAbbrevWalletAddress } from '@/utils';

interface StakingLeaderboardProps {
  walletAddress: string | null;
  setProfile?: (profile: any) => void;
}

export default function StakingLeaderboard({
  walletAddress,
  setProfile,
}: StakingLeaderboardProps) {
  const { data, isLoading, error } = useStakingLeaderboard(walletAddress, 100);
  const isMobile = useBetterMediaQuery('(max-width: 768px)');
  const isLarge = useBetterMediaQuery('(min-width: 1200px)');

  const handleProfileView = async (pubkey: string) => {
    if (!setProfile) return;

    const p = await window.adrena.client.loadUserProfile({
      user: new PublicKey(pubkey),
    });

    if (p === false) {
      setProfile({
        wallet: new PublicKey(pubkey),
        nickname: null,
        avatar: null,
      });
    } else {
      setProfile(p);
    }
  };

  const tableData = useMemo(() => {
    if (!data?.leaderboard) return [];

    return data.leaderboard.map((entry, index) => ({
      rowTitle: '',
      values: [
        // Rank
        entry.rank <= 3 ? (
          <div
            key={`rank-${index}`}
            className="flex items-center justify-center"
          >
            <div
              className={twMerge(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                entry.rank === 1
                  ? 'bg-yellow-500 text-black'
                  : entry.rank === 2
                    ? 'bg-gray-400 text-black'
                    : 'bg-orange-600 text-white',
              )}
            >
              {entry.rank}
            </div>
          </div>
        ) : (
          <span key={`rank-${index}`} className="text-sm text-center font-mono">
            {entry.rank}
          </span>
        ),

        // Wallet/Nickname
        <div
          key={`wallet-${index}`}
          className="flex items-center gap-2 cursor-pointer hover:text-blue-400"
          onClick={() => handleProfileView(entry.walletAddress)}
        >
          {entry.nickname ? (
            <span className="font-medium">
              {getAbbrevNickname(entry.nickname)}
            </span>
          ) : (
            <span className="font-mono text-sm">
              {getAbbrevWalletAddress(entry.walletAddress)}
            </span>
          )}
        </div>,

        // Virtual Amount (Total Voting Power)
        <div key={`virtual-${index}`} className="text-right">
          <FormatNumber
            nb={entry.virtualAmount}
            precision={0}
            className="font-mono"
          />
        </div>,

        // Liquid Stake
        !isMobile ? (
          <div key={`liquid-${index}`} className="text-right">
            <FormatNumber
              nb={entry.liquidStake}
              precision={0}
              className="font-mono text-sm opacity-75"
            />
          </div>
        ) : null,

        // Locked Stakes
        !isMobile ? (
          <div key={`locked-${index}`} className="text-right">
            <FormatNumber
              nb={entry.lockedStakes}
              precision={0}
              className="font-mono text-sm opacity-75"
            />
          </div>
        ) : null,
      ].filter(Boolean),
    }));
  }, [data?.leaderboard, isMobile, handleProfileView]);

  const columnsTitles = useMemo(
    () => [
      <span key="rank" className="ml-[2.2em] opacity-50">
        #
      </span>,
      <span key="trader" className="ml-6 opacity-50">
        Staker
      </span>,
      <div key="virtual" className="ml-auto mr-auto opacity-50 text-center">
        Voting Power
      </div>,
      ...(isMobile
        ? []
        : [
            <div
              key="liquid"
              className="ml-auto mr-auto opacity-50 text-center text-sm"
            >
              Liquid
            </div>,
            <div
              key="locked"
              className="ml-auto mr-auto opacity-50 text-center text-sm"
            >
              Locked
            </div>,
          ]),
    ],
    [isMobile],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-txtfade">Loading staking leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-txtfade">No staking data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* User Status Banner */}
      {data.userRank && data.userVirtualAmount && (
        <div className="bg-[#0B131D] border border-[#1F2730] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm opacity-75">Your Rank</div>
              <div className="font-mono text-lg font-bold">
                {data.userRank}
                {data.userRank <= 50 && (
                  <span className="text-xs ml-1 opacity-75">
                    (
                    {Math.round(
                      ((data.userRank - 1) / data.totalStakers) * 100,
                    )}
                    %)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm opacity-75">Voting Power</div>
              <div className="font-mono text-lg">
                <FormatNumber nb={data.userVirtualAmount} precision={0} />
              </div>
            </div>

            {data.userAboveAmount && (
              <div className="flex items-center gap-2 text-sm opacity-75">
                <span>Next rank needs:</span>
                <span className="font-mono">
                  <FormatNumber
                    nb={data.userAboveAmount - data.userVirtualAmount}
                    precision={0}
                  />
                </span>
                <span>more ADX</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <Table
        className="bg-transparent gap-1 border-none p-0"
        columnTitlesClassName="text-sm opacity-50"
        columnsTitles={columnsTitles}
        data={tableData}
        rowHovering={true}
        pagination={true}
        paginationClassName="scale-[80%] p-0"
        nbItemPerPage={50}
        nbItemPerPageWhenBreakpoint={10}
        breakpoint="768px"
        rowClassName="bg-[#0B131D] hover:bg-[#1F2730] py-0 items-center"
        rowTitleWidth="0%"
        isFirstColumnId
      />
    </div>
  );
}
