import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Pagination from '@/components/common/Pagination/Pagination';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import FilterSidebar from '@/components/pages/monitoring/FilterSidebar/FilterSidebar';
import UserProfileBlock from '@/components/pages/monitoring/UserProfileBlock';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import { UserProfileExtended } from '@/types';

import reloadIcon from '../../../public/images/Icons/arrow-down-up.svg';

type SortableKeys = keyof Pick<
    UserProfileExtended,
    | 'totalTradeVolumeUsd'
    | 'totalPnlUsd'
    | 'openingAverageLeverage'
    | 'totalFeesPaidUsd'
>;

export default function AllUserProfiles({
    showFeesInPnl,
    view
}: {
    showFeesInPnl: boolean;
    view: string;
}) {
    const { allUserProfiles, triggerAllUserProfilesReload } =
        useAllUserProfilesMetadata();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [sortConfigs, setSortConfigs] = useState<{
        [key: string]: 'asc' | 'desc';
    }>({
        totalPnlUsd: 'asc',
        totalTradeVolumeUsd: 'asc',
        openingAverageLeverage: 'asc',
        totalFeesPaidUsd: 'asc',
    });

    const keys = {
        pnl: 'totalPnlUsd',
        'trade volume': 'totalTradeVolumeUsd',
        leverage: 'openingAverageLeverage',
        'fees paid': 'totalFeesPaidUsd',
    } as const;

    const [sortOrder, setSortOrder] = useState<string[]>([
        'totalPnlUsd',
        'totalTradeVolumeUsd',
        'openingAverageLeverage',
        'totalFeesPaidUsd',
    ]);
    const [sortedProfiles, setSortedProfiles] = useState<UserProfileExtended[]>(
        [],
    );
    const [paginatedProfiles, setPaginatedProfiles] = useState<
        UserProfileExtended[]
    >([]);
    const [usernameFilter, setUsernameFilter] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [pnlFilter, setPnlFilter] = useState('all');
    const [initialRankedProfiles, setInitialRankedProfiles] = useState<
        UserProfileExtended[]
    >([]);
    const [hideZeroTradeVolume, setHideZeroTradeVolume] = useState(true);
    const [activeProfile, setActiveProfile] =
        useState<UserProfileExtended | null>(null);

    useEffect(() => {
        if (view !== 'userProfiles') return;

        const filteredProfiles = allUserProfiles.filter((profile) => {
            const ownerCondition =
                ownerFilter === '' ||
                profile.pubkey
                    .toBase58()
                    .toLowerCase()
                    .includes(ownerFilter.toLowerCase());
            const pnlCondition =
                pnlFilter === 'all' ||
                (pnlFilter === 'profit' && profile.totalPnlUsd > 0) ||
                (pnlFilter === 'loss' && profile.totalPnlUsd < 0);
            const tradeVolumeCondition =
                !hideZeroTradeVolume || profile.totalTradeVolumeUsd > 0;

            const usernameCondition = usernameFilter === '' || profile.nickname.toLowerCase().includes(usernameFilter.toLowerCase());

            return usernameCondition && ownerCondition && pnlCondition && tradeVolumeCondition;
        });

        const sortedByPnl = [...filteredProfiles].sort(
            (a, b) => b.totalPnlUsd - a.totalPnlUsd,
        );

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        allUserProfiles,
        sortConfigs,
        sortOrder,
        pnlFilter,
        hideZeroTradeVolume,
        ownerFilter,
        usernameFilter,
        view,
    ]);

    useEffect(() => {
        const paginated = sortedProfiles.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage,
        );
        setPaginatedProfiles(paginated);
    }, [currentPage, sortedProfiles]);

    const toggleSortOrder = (criteria: keyof typeof keys) => {
        setSortConfigs((prevConfigs) => ({
            ...prevConfigs,
            [keys[criteria] as SortableKeys]:
                prevConfigs[keys[criteria] as SortableKeys] === 'desc' ? 'asc' : 'desc',
        }));
        setSortOrder((prevOrder) => {
            const newOrder = prevOrder.filter(
                (item) => item !== (keys[criteria] as SortableKeys),
            );
            return [keys[criteria] as SortableKeys, ...newOrder];
        });
    };

    return (
        <>
            <div>
                <StyledContainer className="p-0">
                    <div className="flex flex-col md:flex-row md:gap-3">
                        <FilterSidebar
                            searches={[{
                                value: ownerFilter,
                                placeholder: 'Filter by owner (pubkey)',
                                handleChange: setOwnerFilter,
                            }, {
                                value: usernameFilter,
                                placeholder: 'Filter by username',
                                handleChange: setUsernameFilter,
                            }]}
                            filterOptions={[
                                {
                                    type: 'radio',
                                    name: 'PnL',
                                    activeOption: pnlFilter,
                                    handleChange: setPnlFilter,
                                    optionItems: [
                                        { label: 'all' },
                                        { label: 'profit' },
                                        { label: 'loss' },
                                    ],
                                },
                            ]}
                            switchOptions={[
                                {
                                    label: 'Hide profiles w/o trades',
                                    checked: hideZeroTradeVolume,
                                    handleChange: setHideZeroTradeVolume,
                                },
                            ]}
                            sortOptions={{
                                handleChange: toggleSortOrder as React.Dispatch<React.SetStateAction<string>>,
                                optionItems: [
                                    { label: 'pnl', order: sortConfigs.totalPnlUsd },
                                    {
                                        label: 'trade volume',
                                        order: sortConfigs.totalTradeVolumeUsd,
                                    },
                                    {
                                        label: 'leverage',
                                        order: sortConfigs.openingAverageLeverage,
                                    },
                                    { label: 'fees paid', order: sortConfigs.totalFeesPaidUsd },
                                ],
                            }}
                        />

                        <div className="w-full p-4">
                            <div className="mb-4 w-full">
                                <Button
                                    icon={reloadIcon}
                                    variant="outline"
                                    onClick={triggerAllUserProfilesReload}
                                    className="w-7 h-7 p-0 border-bcolor ml-auto"
                                    iconClassName="w-4 h-4 opacity-75 hover:opacity-100"
                                />
                            </div>
                            <div className="flex flex-wrap flex-col gap-2 mb-3">
                                {paginatedProfiles.map((profile) => (
                                    <UserProfileBlock
                                        key={profile.pubkey.toBase58()}
                                        profile={profile as UserProfileExtended & { rank: number }}
                                        setActiveProfile={setActiveProfile}
                                    />
                                ))}
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalItems={sortedProfiles.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>
                </StyledContainer>
            </div>

            <AnimatePresence>
                {activeProfile && (
                    <Modal
                        className="h-[80vh] w-full overflow-y-auto"
                        wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper-1.jpg')]"
                        title=""
                        close={() => setActiveProfile(null)}
                        isWrapped={false}
                    >
                        <ViewProfileModal
                            profile={activeProfile}
                            showFeesInPnl={showFeesInPnl}
                            close={() => setActiveProfile(null)}
                        />
                    </Modal>
                )}
            </AnimatePresence>
        </>
    );
}
