import React, { useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import Switch from '@/components/common/Switch/Switch';
import Filter from '@/components/Filter/Filter';
import UserProfileBlock from '@/components/pages/monitoring/UserProfileBlock';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { useAllUserProfiles } from '@/hooks/useAllUserProfiles';
import { UserProfileExtended } from '@/types';

import reloadIcon from '../../../public/images/Icons/arrow-down-up.svg'
import resetIcon from '../../../public/images/Icons/cross.svg'

type SortableKeys = keyof Pick<UserProfileExtended, 'totalTradeVolumeUsd' | 'totalPnlUsd' | 'openingAverageLeverage' | 'totalFeesPaidUsd'>;

export default function AllUserProfiles() {

    const { allUserProfiles, triggerAllUserProfilesReload } = useAllUserProfiles();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [sortConfigs, setSortConfigs] = useState<{ [key: string]: 'asc' | 'desc' }>({
        totalPnlUsd: 'asc',
        totalTradeVolumeUsd: 'asc',
        leverage: 'asc',
        feesPaid: 'asc'
    });
    const [sortOrder, setSortOrder] = useState<string[]>(['totalPnlUsd', 'totalTradeVolumeUsd', 'leverage', 'feesPaid']);
    const [sortedProfiles, setSortedProfiles] = useState<UserProfileExtended[]>([]);
    const [paginatedProfiles, setPaginatedProfiles] = useState<UserProfileExtended[]>([]);
    const [ownerFilter, setOwnerFilter] = useState('');
    const [pnlFilter, setPnlFilter] = useState('all');
    const [initialRankedProfiles, setInitialRankedProfiles] = useState<UserProfileExtended[]>([]);
    const [hideZeroTradeVolume, setHideZeroTradeVolume] = useState(true);

    const resetFilters = () => {
        setOwnerFilter('');
        setPnlFilter('all');
        setCurrentPage(1);
    };

    useEffect(() => {
        const filteredProfiles = allUserProfiles.filter(profile => {
            const ownerCondition = ownerFilter === '' || profile.pubkey.toBase58().toLowerCase().includes(ownerFilter.toLowerCase());
            const pnlCondition = pnlFilter === 'all' ||
                (pnlFilter === "profit" && profile.totalPnlUsd > 0) ||
                (pnlFilter === "loss" && profile.totalPnlUsd < 0);
            const tradeVolumeCondition = !hideZeroTradeVolume || profile.totalTradeVolumeUsd > 0;
            return ownerCondition && pnlCondition && tradeVolumeCondition;
        });

        const sortedByPnl = [...filteredProfiles].sort((a, b) => b.totalPnlUsd - a.totalPnlUsd);

        const rankedProfiles = sortedByPnl.map((profile, index) => ({
            ...profile,
            rank: index + 1,
        }));

        if (initialRankedProfiles.length === 0) {
            setInitialRankedProfiles(rankedProfiles);
        }

        const sorted = rankedProfiles.sort((a, b) => {
            for (const criteria of sortOrder) {
                const order = sortConfigs[criteria];
                const multiplier = order === 'asc' ? 1 : -1;
                const aValue = a[criteria as SortableKeys];
                const bValue = b[criteria as SortableKeys];
                const comparison = multiplier * (bValue - aValue);
                if (comparison !== 0) return comparison;
            }
            return 0;
        });

        setSortedProfiles(sorted);
    }, [allUserProfiles, sortConfigs, sortOrder, pnlFilter, hideZeroTradeVolume, ownerFilter]);

    useEffect(() => {
        const paginated = sortedProfiles.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        setPaginatedProfiles(paginated);
    }, [currentPage, sortedProfiles]);

    const toggleSortOrder = (criteria: SortableKeys) => {
        setSortConfigs(prevConfigs => ({
            ...prevConfigs,
            [criteria]: prevConfigs[criteria] === 'desc' ? 'asc' : 'desc'
        }));
        setSortOrder(prevOrder => {
            const newOrder = prevOrder.filter(item => item !== criteria);
            return [criteria, ...newOrder];
        });
    };

    return (
        <div className="flex flex-col gap-2 p-2">
            <StyledContainer className="p-4">
                <div className="flex flex-col gap-3">
                    <Filter
                        options={[{ name: 'all' }, { name: 'profit' }, { name: 'loss' }]}
                        activeFilter={pnlFilter}
                        setFilter={setPnlFilter}
                    />


                    <div className='flex flex-col lg:flex-row justify-between gap-3'>
                        <div className='flex flex-row gap-3 items-center'>
                            <input
                                type="text"
                                placeholder="Filter by owner (pubkey)"
                                value={ownerFilter}
                                onChange={(e) => setOwnerFilter(e.target.value)}
                                className="bg-gray-800 text-white border border-gray-700 rounded p-1 px-2 w-full sm:min-w-[20em] text-sm"
                            />

                            <label className="hidden sm:flex items-center ml-1 cursor-pointer">
                                <span className="mx-1 text-txtfade whitespace-nowrap text-center text-sm">
                                    Hide profiles w/o trades
                                </span>
                                <Switch
                                    className="mr-0.5"
                                    checked={hideZeroTradeVolume}
                                    onChange={() => setHideZeroTradeVolume(prev => !prev)}
                                    size="medium"
                                />
                            </label>
                        </div>

                        <div className='flex flex-col sm:flex-row gap-3 items-center justify-between'>
                            <div className="flex flex-wrap justify-center items-center text-sm bg-secondary rounded-full p-0.5 px-4 border border-bcolor gap-1 w-full sm:w-auto">
                                {['totalPnlUsd', 'totalTradeVolumeUsd', 'openingAverageLeverage', 'totalFeesPaidUsd'].map(criteria => (
                                    <React.Fragment key={criteria}>
                                        <button
                                            className="py-1 rounded-full transition-colors flex items-center w-auto"
                                            onClick={() => toggleSortOrder(criteria as SortableKeys)}
                                        >
                                            {criteria === 'totalPnlUsd' ? 'PnL' : criteria === 'totalTradeVolumeUsd' ? 'Trade Volume' : criteria === 'openingAverageLeverage' ? 'Leverage' : criteria === 'totalFeesPaidUsd' ? 'Fees Paid' : ''}
                                            <span className="ml-1 text-txtfade text-sm">
                                                {sortConfigs[criteria] === 'asc' ? '↑' : '↓'}
                                            </span>
                                        </button>
                                        {criteria !== 'totalFeesPaidUsd' && <div className="w-px h-4 bg-bcolor mx-[1px]"></div>}
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className='flex flex-row justify-between items-center w-full sm:w-auto'>
                                <label className="flex sm:hidden items-center ml-1 cursor-pointer">
                                    <span className="mx-1 text-txtfade whitespace-nowrap text-center text-sm">
                                        Hide profiles w/o trades
                                    </span>
                                    <Switch
                                        className="mr-0.5"
                                        checked={hideZeroTradeVolume}
                                        onChange={() => setHideZeroTradeVolume(prev => !prev)}
                                        size="medium"
                                    />
                                </label>

                                <div className="flex items-center gap-2">

                                    <Button
                                        onClick={resetFilters}
                                        variant="outline"
                                        className="w-[30px] h-[30px] p-0 border border-bcolor"
                                        icon={resetIcon}
                                    />
                                    <Button
                                        onClick={triggerAllUserProfilesReload}
                                        variant="outline"
                                        className="w-[30px] h-[30px] p-0 border border-bcolor"
                                        icon={reloadIcon}
                                    >
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >

                <div className="flex flex-wrap flex-col gap-2 min-h-[1000px]">
                    {paginatedProfiles.map((profile) => (
                        <UserProfileBlock key={profile.pubkey.toBase58()} profile={profile as UserProfileExtended & { rank: number }} />
                    ))}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItems={sortedProfiles.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </StyledContainer >
        </div >
    );
}
