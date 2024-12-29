import React, { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import chartIcon from '@/../public/images/Icons/chart-icon.svg';
import listIcon from '@/../public/images/Icons/list-ul.svg';
import Button from '@/components/common/Button/Button';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import Pagination from '@/components/common/Pagination/Pagination';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import AllPositionsChart from '@/components/pages/global/AllPositionsChart/AllPositionsChart';
import { RealizedPnlChart } from '@/components/pages/global/RealizedPnl/RealizedPnlChart';
import { UnrealizedPnlChart } from '@/components/pages/global/UnrealizedPnl/UnrealizedPnlChart';
import FilterSidebar from '@/components/pages/monitoring/FilterSidebar/FilterSidebar';
import PositionBlock from '@/components/pages/trading/Positions/PositionBlock';
import { useAllPositions } from '@/hooks/useAllPositions';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import reloadIcon from '../../../public/images/Icons/arrow-down-up.svg';
import resetIcon from '../../../public/images/Icons/cross.svg';

export default function AllPositions({ showFeesInPnl, isSmallScreen, view }: { showFeesInPnl: boolean, isSmallScreen: boolean, view: string }) {
    const wallet = useSelector((state) => state.walletState.wallet);

    const connected = !!wallet;

    const { allPositions, triggerAllPositionsReload } = useAllPositions({
        connected,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [sideFilter, setSideFilter] = useState('all');
    const [mintFilter, setMintFilter] = useState<string[] | null>(null);
    const [ownerFilter, setOwnerFilter] = useState('');
    const [pnlFilter, setPnlFilter] = useState('all');
    const itemsPerPage = 7;
    const [sortConfigs, setSortConfigs] = useState<{
        [key: string]: 'asc' | 'desc';
    }>({
        pnl: 'asc',
        size: 'asc',
        leverage: 'desc',
    });
    const [sortOrder, setSortOrder] = useState<string[]>([
        'pnl',
        'size',
        'leverage',
    ]);

    const [sortedPositions, setSortedPositions] = useState<PositionExtended[]>(
        [],
    );
    const [paginatedPositions, setPaginatedPositions] = useState<
        PositionExtended[]
    >([]);

    const [viewPage, setViewPage] = useState<string>('List view');

    useEffect(() => {
        if (view !== 'livePositions') return;

        const filteredPositions = allPositions.filter((position) => {
            const matchesSide = sideFilter === 'all' || position.side === sideFilter;
            const matchesMint =
                mintFilter === null ||
                mintFilter.includes(getTokenSymbol(position.token.symbol));
            const matchesUser =
                ownerFilter === '' ||
                position.owner
                    .toBase58()
                    .toLowerCase()
                    .includes(ownerFilter.toLowerCase());
            const matchesPnl =
                pnlFilter === 'all' ||
                (pnlFilter === 'profit' && position.pnl && position.pnl > 0) ||
                (pnlFilter === 'loss' && position.pnl && position.pnl < 0);
            return matchesSide && matchesMint && matchesUser && matchesPnl;
        });

        setSortedPositions(
            filteredPositions.sort((a, b) => {
                for (const criteria of sortOrder) {
                    const order = sortConfigs[criteria];
                    const multiplier = order === 'asc' ? 1 : -1;
                    let comparison = 0;

                    switch (criteria) {
                        case 'pnl':
                            comparison = multiplier * ((b.pnl || 0) - (a.pnl || 0));
                            break;
                        case 'size':
                            comparison = multiplier * (b.sizeUsd - a.sizeUsd);
                            break;
                        case 'leverage':
                            comparison =
                                multiplier *
                                ((b.currentLeverage || 0) - (a.currentLeverage || 0));
                            break;
                    }

                    if (comparison !== 0) return comparison;
                }

                return 0;
            }),
        );
    }, [
        allPositions,
        mintFilter,
        ownerFilter,
        pnlFilter,
        sideFilter,
        sortConfigs,
        sortOrder,
        view,
    ]);

    useEffect(() => {
        const paginatedPositions = sortedPositions.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage,
        );

        setPaginatedPositions(paginatedPositions);
    }, [currentPage, sortedPositions]);

    const toggleSortOrder = (criteria: string) => {
        const prevConfigs = { ...sortConfigs };

        setSortConfigs(() => ({
            ...prevConfigs,
            [criteria]: prevConfigs[criteria] === 'desc' ? 'asc' : 'desc',
        }));
        setSortOrder((prevOrder) => {
            const newOrder = prevOrder.filter((item) => item !== criteria);
            return [criteria, ...newOrder];
        });
    };

    const resetFilters = () => {
        setSideFilter('all');
        setMintFilter(null);
        setOwnerFilter('');
        setPnlFilter('all');
        setCurrentPage(1);
    };

    const refreshPositions = () => {
        triggerAllPositionsReload();
    };

    const unrealizedPnl = useMemo(() => {
        return allPositions.reduce((pnl, position) => {
            return pnl + (position.pnl ?? 0);
        }, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allPositions.map((x) => x.pnl ?? 0).join(',')]);

    const unrealizedBorrowFee = useMemo(() => {
        return allPositions.reduce((total, position) => {
            return total + (position.borrowFeeUsd ?? 0);
        }, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allPositions.map((x) => x.borrowFeeUsd ?? 0).join(',')]);

    const unrealizedCloseFee = useMemo(() => {
        return allPositions.reduce((total, position) => {
            return total + (position.exitFeeUsd ?? 0);
        }, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allPositions.map((x) => x.exitFeeUsd ?? 0).join(',')]);

    return (
        <div>
            <StyledContainer className="p-0">
                <div className="flex flex-wrap justify-between">
                    <NumberDisplay
                        title="POSITION COUNT"
                        nb={allPositions.length}
                        format="number"
                        precision={0}
                        className="border-0 min-w-[12em]"
                        bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                        headerClassName="pb-2"
                        titleClassName="text-[0.7em] sm:text-[0.7em]"
                    />

                    <NumberDisplay
                        title="UNREALIZED PNL"
                        nb={unrealizedPnl}
                        format="currency"
                        precision={0}
                        className="border-0 min-w-[12em]"
                        bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                        headerClassName="pb-2"
                        titleClassName="text-[0.7em] sm:text-[0.7em]"
                    />

                    <NumberDisplay
                        title="UNREALIZED BORROW FEES"
                        nb={unrealizedBorrowFee}
                        format="currency"
                        precision={0}
                        className="border-0 min-w-[12em]"
                        bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                        headerClassName="pb-2"
                        titleClassName="text-[0.7em] sm:text-[0.7em]"
                    />

                    <NumberDisplay
                        title="UNREALIZED CLOSE FEES"
                        nb={unrealizedCloseFee}
                        format="currency"
                        precision={0}
                        className="border-0 min-w-[12em]"
                        bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                        headerClassName="pb-2"
                        titleClassName="text-[0.7em] sm:text-[0.7em]"
                    />
                </div>
            </StyledContainer>
            {
                view === 'livePositions' ?
                    <>
                        <StyledContainer className="flex gap-6">

                            <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
                                <UnrealizedPnlChart isSmallScreen={isSmallScreen} />
                                <RealizedPnlChart isSmallScreen={isSmallScreen} />
                            </div>
                        </StyledContainer>
                        <StyledContainer className="p-0">
                            <div className="flex flex-col md:flex-row md:gap-3">
                                <FilterSidebar
                                    views={[
                                        {
                                            title: 'List view',
                                            icon: listIcon,
                                        },
                                        {
                                            title: 'Chart view',
                                            icon: chartIcon,
                                        },
                                    ]}
                                    activeView={viewPage}
                                    handleViewChange={setViewPage}
                                    search={{
                                        placeholder: 'Filter by owner (pubkey)',
                                        value: ownerFilter,
                                        handleChange: setOwnerFilter,
                                    }}
                                    filterOptions={[
                                        {
                                            type: 'radio',
                                            name: 'Side',
                                            activeOption: sideFilter,
                                            handleChange: setSideFilter,
                                            optionItems: [
                                                { label: 'all' },
                                                { label: 'long' },
                                                { label: 'short' },
                                            ],
                                        },
                                        {
                                            type: 'checkbox',
                                            name: 'Mint',
                                            activeOption: mintFilter,
                                            handleChange: setMintFilter,
                                            optionItems: window.adrena.client.tokens
                                                .filter((token) => token.symbol !== 'USDC')
                                                .map((token) => ({
                                                    label: getTokenSymbol(token.symbol),
                                                    icon: getTokenImage(token),
                                                })),
                                        },
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
                                    sortOptions={{
                                        handleChange: toggleSortOrder as React.Dispatch<React.SetStateAction<string>>,
                                        optionItems: [
                                            { label: 'pnl', order: sortConfigs.pnl },
                                            { label: 'size', order: sortConfigs.size },
                                            { label: 'leverage', order: sortConfigs.leverage },
                                        ],
                                        disabled: viewPage === 'Chart view',
                                    }}
                                />
                                <div className="flex flex-col gap-3 w-full p-4">
                                    {viewPage === 'Chart view' ? (
                                        <div className="flex w-full min-h-[34em] h-[34em] grow">
                                            <AllPositionsChart
                                                allPositions={sortedPositions}
                                                showFeesInPnl={showFeesInPnl}
                                            />
                                        </div>
                                    ) : null}

                                    {viewPage === 'List view' ? (
                                        <>
                                            <div className="flex flex-wrap justify-between gap-2">
                                                <div className="flex flex-row justify-between w-full mb-2">
                                                    <div className="flex flex-row gap-3 flex-wrap">
                                                        {mintFilter?.map((mint) => (
                                                            <Button
                                                                variant="outline"
                                                                title={mint}
                                                                className="border border-bcolor"
                                                                rightIcon={resetIcon}
                                                                key={mint}
                                                                onClick={() =>
                                                                    setMintFilter((prev) => {
                                                                        if (prev === null || prev.length === 1)
                                                                            return null;
                                                                        return prev.filter((item) => item !== mint);
                                                                    })
                                                                }
                                                            />
                                                        ))}

                                                        {sideFilter !== 'all' && (
                                                            <Button
                                                                variant="outline"
                                                                title={sideFilter}
                                                                className={twMerge(
                                                                    'border border-bcolor',
                                                                    sideFilter === 'long' && 'text-green',
                                                                    sideFilter === 'short' && 'text-red',
                                                                )}
                                                                rightIcon={resetIcon}
                                                                onClick={() => setSideFilter('all')}
                                                            />
                                                        )}

                                                        {pnlFilter !== 'all' && (
                                                            <Button
                                                                variant="outline"
                                                                title={pnlFilter}
                                                                className={twMerge(
                                                                    'border border-bcolor',
                                                                    pnlFilter === 'profit' && 'text-green',
                                                                    pnlFilter === 'loss' && 'text-red',
                                                                )}
                                                                rightIcon={resetIcon}
                                                                onClick={() => setPnlFilter('all')}
                                                            />
                                                        )}

                                                        {mintFilter?.length ||
                                                            sideFilter !== 'all' ||
                                                            pnlFilter !== 'all' ? (
                                                            <Button
                                                                variant="text"
                                                                title="clear all"
                                                                className="p-0"
                                                                onClick={resetFilters}
                                                            />
                                                        ) : null}
                                                    </div>

                                                    <Button
                                                        icon={reloadIcon}
                                                        variant="outline"
                                                        onClick={refreshPositions}
                                                        className="w-7 h-7 p-0 border-bcolor ml-auto"
                                                        iconClassName="w-4 h-4 opacity-75 hover:opacity-100"
                                                    />
                                                </div>
                                                {paginatedPositions.length ? (
                                                    <div className="flex flex-col w-full gap-2">
                                                        {paginatedPositions.map((position) => (
                                                            <PositionBlock
                                                                key={position.pubkey.toBase58()}
                                                                position={position}
                                                                showFeesInPnl={showFeesInPnl}
                                                                readOnly={true}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center w-full py-4 opacity-50">
                                                        No matches 📭
                                                    </div>
                                                )}
                                            </div>

                                            <Pagination
                                                currentPage={currentPage}
                                                totalItems={sortedPositions.length}
                                                itemsPerPage={itemsPerPage}
                                                onPageChange={setCurrentPage}
                                            />
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </StyledContainer>
                    </>
                    : null
            }
        </div >
    );
}
