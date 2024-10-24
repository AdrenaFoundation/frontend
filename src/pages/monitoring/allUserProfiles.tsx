import React, { useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import Switch from '@/components/common/Switch/Switch';
import UserProfileBlock from '@/components/pages/monitoring/UserProfileBlock';
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
            const pnlCondition = pnlFilter === 'all' ||
                (pnlFilter === "profit" && profile.totalPnlUsd > 0) ||
                (pnlFilter === "loss" && profile.totalPnlUsd < 0);
            const tradeVolumeCondition = !hideZeroTradeVolume || profile.totalTradeVolumeUsd > 0;
            return pnlCondition && tradeVolumeCondition;
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
    }, [allUserProfiles, sortConfigs, sortOrder, pnlFilter, hideZeroTradeVolume]);

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
                <div className="flex flex-col md:flex-row flex-wrap justify-between items-center gap-2">
                    <div className="flex flex-wrap border border-gray-700 rounded-lg p-2 bg-secondary w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Filter by owner (pubkey)"
                            value={ownerFilter}
                            onChange={(e) => setOwnerFilter(e.target.value)}
                            className="bg-gray-800 text-white border border-gray-700 rounded p-1 w-[15em] text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap border border-gray-700 rounded-lg p-2 bg-secondary w-full md:w-auto">
                        {['all', 'profit', 'loss'].map(type => (
                            <Button
                                key={type}
                                onClick={() => setPnlFilter(type)}
                                variant={type === pnlFilter ? 'outline' : 'text'}
                                className={`w-full md:w-20 ${type === 'profit' ? 'text-green' : type === 'loss' ? 'text-redbright' : ''}`}
                                title={type.charAt(0).toUpperCase() + type.slice(1)}
                                size="xs"
                            />
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center items-center text-sm bg-secondary rounded-full p-[2px] border border-bcolor w-full md:w-auto">
                        {['totalPnlUsd', 'totalTradeVolumeUsd', 'openingAverageLeverage', 'totalFeesPaidUsd'].map(criteria => (
                            <React.Fragment key={criteria}>
                                <button
                                    className="px-2 py-1 rounded-full transition-colors flex items-center w-auto"
                                    onClick={() => toggleSortOrder(criteria as SortableKeys)}
                                >
                                    {criteria === 'totalPnlUsd' ? 'PnL' : criteria === 'totalTradeVolumeUsd' ? 'Trade Volume' : criteria === 'openingAverageLeverage' ? 'Leverage' : criteria === 'totalFeesPaidUsd' ? 'Fees Paid' : ''}
                                    <span className="ml-1 text-txtfade text-[14px]">
                                        {sortConfigs[criteria] === 'asc' ? '↑' : '↓'}
                                    </span>
                                </button>
                                {criteria !== 'totalFeesPaidUsd' && <div className="w-px h-4 bg-bcolor mx-[1px]"></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="flex items-center ml-1 cursor-pointer">
                            <span className="mx-1 text-txtfade whitespace-nowrap text-center">
                                {hideZeroTradeVolume ? 'Hide' : 'Show'} 0 trade volume profiles
                            </span>
                            <Switch
                                className="mr-0.5"
                                checked={hideZeroTradeVolume}
                                onChange={() => setHideZeroTradeVolume(prev => !prev)}
                                size="medium"
                            />
                        </label>
                        <Button
                            onClick={resetFilters}
                            variant="outline"
                            className="w-full md:w-auto"
                            icon={resetIcon}
                        />
                        <Button
                            onClick={triggerAllUserProfilesReload}
                            variant="outline"
                            className="w-full md:w-auto"
                            icon={reloadIcon}
                        >
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap flex-col gap-0">
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
            </StyledContainer>
        </div>
    );
}
