import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import Filter from '@/components/Filter/Filter';
import AllPositionsChart from '@/components/pages/global/AllPositionsChart/AllPositionsChart';
import PositionBlockReadOnly from '@/components/pages/trading/Positions/PositionBlockReadOnly';
import { useAllPositions } from '@/hooks/useAllPositions';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import reloadIcon from '../../../public/images/Icons/arrow-down-up.svg';
import resetIcon from '../../../public/images/Icons/cross.svg';

export default function AllPositions() {
    const wallet = useSelector((state) => state.walletState.wallet);

    const connected = !!wallet;

    const { allPositions, triggerAllPositionsReload } =
        useAllPositions({
            connected,
        });
    const [currentPage, setCurrentPage] = useState(1);
    const [sideFilter, setSideFilter] = useState('all');
    const [mintFilter, setMintFilter] = useState('all');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [pnlFilter, setPnlFilter] = useState('all');
    const itemsPerPage = 7;
    const [sortConfigs, setSortConfigs] = useState<{
        [key: string]: 'asc' | 'desc';
    }>({
        pnl: 'desc',
        size: 'desc',
        age: 'desc',
    });
    const [sortOrder, setSortOrder] = useState<string[]>(['pnl', 'size', 'age']);

    const [sortedPositions, setSortedPositions] = useState<PositionExtended[]>(
        [],
    );
    const [paginatedPositions, setPaginatedPositions] = useState<
        PositionExtended[]
    >([]);

    const [view, setView] = useState<'list' | 'chart'>('list');

    useEffect(() => {
        const filteredPositions = allPositions.filter((position) => {
            const matchesSide = sideFilter === 'all' || position.side === sideFilter;
            const matchesMint =
                mintFilter === 'all' ||
                getTokenSymbol(position.token.symbol) === mintFilter;
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
    ]);

    useEffect(() => {
        const paginatedPositions = sortedPositions.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage,
        );

        setPaginatedPositions(paginatedPositions);
    }, [currentPage, sortedPositions]);

    const toggleSortOrder = (criteria: string) => {
        setSortConfigs((prevConfigs) => ({
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
        setMintFilter('all');
        setOwnerFilter('');
        setPnlFilter('all');
        setCurrentPage(1);
    };

    const refreshPositions = () => {
        triggerAllPositionsReload();
    };

    return (
        <div className="flex flex-col gap-2 p-2">
            <StyledContainer className="p-4">
                <div className="flex flex-col gap-3">
                    <div className='flex gap-3'>
                        <div className='flex text-base cursor-pointer items-center w-[10em] justify-evenly border'>
                            <div className={twMerge('hover:opacity-100', view === 'list' ? 'opacity-100 underline' : 'opacity-50')}
                                onClick={() => setView('list')}>
                                List
                            </div>

                            <div className={twMerge('hover:opacity-100', view === 'chart' ? 'opacity-100 underline' : 'opacity-50')}
                                onClick={() => setView('chart')}>
                                Chart
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 justify-between gap-3 grow">
                            <Filter
                                options={[{ name: 'all' }, { name: 'long' }, { name: 'short' }]}
                                activeFilter={sideFilter}
                                setFilter={setSideFilter}
                            />

                            <Filter
                                options={[{ name: 'all' }].concat(
                                    window.adrena.client.tokens
                                        .filter((token) => token.symbol !== 'USDC')
                                        .map((token) => ({
                                            name: getTokenSymbol(token.symbol),
                                            icon: getTokenImage(token),
                                        })),
                                )}
                                activeFilter={mintFilter}
                                setFilter={setMintFilter}
                            />

                            <Filter
                                options={[{ name: 'all' }, { name: 'profit' }, { name: 'loss' }]}
                                activeFilter={pnlFilter}
                                setFilter={setPnlFilter}
                            />
                        </div>
                    </div>

                    {view === 'chart' ? <div className='flex w-full h-[34em] max-h-full'>
                        <AllPositionsChart allPositions={sortedPositions} />
                    </div> : null}

                    {view === 'list' ? <><div className='flex flex-col'>
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <input
                                type="pubkey"
                                placeholder="Filter by owner (pubkey)"
                                value={ownerFilter}
                                onChange={(e) => setOwnerFilter(e.target.value)}
                                className="bg-gray-800 text-white border border-gray-700 rounded p-1 px-2 w-full sm:max-w-[20em] text-sm"
                            />

                            <div className="flex flex-row gap-3 items-center justify-between w-full sm:w-auto">
                                <div
                                    className={`flex flex-wrap justify-center items-center text-sm bg-secondary rounded-full p-0.5 px-4 border border-bcolor`}
                                >
                                    {['pnl', 'size', 'leverage'].map((criteria) => (
                                        <React.Fragment key={criteria}>
                                            <button
                                                className="px-2 py-1 rounded-full transition-colors flex items-center"
                                                onClick={() => toggleSortOrder(criteria)}
                                            >
                                                {criteria.charAt(0).toUpperCase() + criteria.slice(1)}
                                                <span className="ml-1 text-txtfade text-[14px]">
                                                    {sortConfigs[criteria] === 'asc' ? '↑' : '↓'}
                                                </span>
                                            </button>
                                            {criteria !== 'leverage' && (
                                                <div className="w-px h-4 bg-bcolor mx-[1px]"></div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <div className="flex items-center justify-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={resetFilters}
                                            variant="outline"
                                            className="w-[30px] h-[30px] p-0 border border-bcolor"
                                            icon={resetIcon}
                                        />
                                        <Button
                                            onClick={refreshPositions}
                                            variant="outline"
                                            className="w-[30px] h-[30px] p-0 border border-bcolor"
                                            icon={reloadIcon}
                                        ></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                        <div className="flex flex-wrap justify-between gap-2">
                            {paginatedPositions.length ? (
                                <div className="flex flex-col w-full gap-2">
                                    {paginatedPositions.map((position) => (
                                        <PositionBlockReadOnly
                                            key={position.pubkey.toBase58()}
                                            position={position}
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
                    </> : null}
                </div>
            </StyledContainer>
        </div>
    );
}
