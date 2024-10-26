import React, { useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import PositionBlockReadOnly from '@/components/pages/trading/Positions/PositionBlockReadOnly';
import { useAllPositions } from '@/hooks/useAllPositions';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import reloadIcon from '../../../public/images/Icons/arrow-down-up.svg'
import resetIcon from '../../../public/images/Icons/cross.svg'

export default function AllPositions({ isSmallSize }: { isSmallSize: boolean }) {
    const wallet = useSelector(state => state.walletState.wallet);

    const connected = !!wallet;

    const { allPositions, triggerAllPositionsReload } = useAllPositions({ connected });
    const [currentPage, setCurrentPage] = useState(1);
    const [sideFilter, setSideFilter] = useState('all');
    const [mintFilter, setMintFilter] = useState('all');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [pnlFilter, setPnlFilter] = useState('all');
    const itemsPerPage = 7;
    const [sortConfigs, setSortConfigs] = useState<{ [key: string]: 'asc' | 'desc' }>({
        pnl: 'desc',
        size: 'desc',
        age: 'desc'
    });
    const [sortOrder, setSortOrder] = useState<string[]>(['pnl', 'size', 'age']);

    const [sortedPositions, setSortedPositions] = useState<PositionExtended[]>([]);
    const [paginatedPositions, setPaginatedPositions] = useState<PositionExtended[]>([]);


    useEffect(() => {
        const filteredPositions = allPositions.filter(position => {
            const matchesSide = sideFilter === 'all' || position.side === sideFilter;
            const matchesMint = mintFilter === 'all' || position.token.mint.toBase58() === mintFilter;
            const matchesUser = ownerFilter === '' || position.owner.toBase58().toLowerCase().includes(ownerFilter.toLowerCase());
            const matchesPnl = pnlFilter === 'all' || (pnlFilter === "profit" && position.pnl && position.pnl > 0) || (pnlFilter === "loss" && position.pnl && position.pnl < 0);
            return matchesSide && matchesMint && matchesUser && matchesPnl;
        });

        setSortedPositions(filteredPositions.sort((a, b) => {
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
                        comparison = multiplier * ((b.currentLeverage || 0) - (a.currentLeverage || 0));
                        break;
                }

                if (comparison !== 0) return comparison;
            }

            return 0;
        }));
    }, [allPositions, mintFilter, ownerFilter, pnlFilter, sideFilter, sortConfigs, sortOrder]);

    useEffect(() => {
        const paginatedPositions = sortedPositions.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        setPaginatedPositions(paginatedPositions);
    }, [currentPage, sortedPositions]);

    const toggleSortOrder = (criteria: string) => {
        setSortConfigs(prevConfigs => ({
            ...prevConfigs,
            [criteria]: prevConfigs[criteria] === 'desc' ? 'asc' : 'desc'
        }));
        setSortOrder(prevOrder => {
            const newOrder = prevOrder.filter(item => item !== criteria);
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
                <div className="flex flex-row flex-wrap justify-between items-stretch gap-2">
                    <div className={`flex border border-gray-700 rounded-lg p-2 bg-secondary gap-1 ${isSmallSize ? 'w-full' : 'w-auto'}`}>
                        {['all', 'long', 'short'].map(type => (
                            <Button
                                key={type}
                                onClick={() => setSideFilter(type)}
                                variant={type === sideFilter ? 'outline' : 'text'}
                                className={`w-full md:w-20 ${type === 'long' ? 'text-green' : type === 'short' ? 'text-red' : ''}`}
                                size="xs"
                                title={type.charAt(0).toUpperCase() + type.slice(1)}
                            />
                        ))}
                    </div>

                    <div className={`flex border border-gray-700 rounded-lg py-2 pl-2 bg-secondary gap-1 ${isSmallSize ? 'w-full' : 'w-auto'}`}>
                        <div className='flex items-center justify-center'>
                            <Button
                                onClick={() => setMintFilter('all')}
                                variant={mintFilter === 'all' ? 'outline' : 'text'}
                                className="w-full md:w-20 flex items-center justify-center"
                                title="All"
                            >
                            </Button>
                        </div>
                        {window.adrena.client.tokens
                            .filter(token => token.symbol !== 'USDC')
                            .map(token => (
                                <div key={token.mint.toBase58()} className='flex items-center justify-center'>
                                    <Button
                                        onClick={() => setMintFilter(token.mint.toBase58())}
                                        variant={token.mint.toBase58() === mintFilter ? 'outline' : 'text'}
                                        className="w-full md:w-20 flex items-center justify-center"
                                        title={getTokenSymbol(token.symbol)}
                                        icon={getTokenImage(token)}
                                        size="xs" />
                                </div>
                            ))}
                    </div>

                    <div className={`flex border border-gray-700 rounded-lg p-2 bg-secondary gap-1 ${isSmallSize ? 'w-full' : 'w-auto'}`}>
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

                    <div className={`flex flex-wrap justify-center items-center text-sm bg-secondary rounded-full p-[2px] border border-bcolor`}>
                        {['pnl', 'size', 'leverage'].map(criteria => (
                            <React.Fragment key={criteria}>
                                <button
                                    className="px-2 py-1 rounded-full transition-colors flex items-center w-auto"
                                    onClick={() => toggleSortOrder(criteria)}
                                >
                                    {criteria.charAt(0).toUpperCase() + criteria.slice(1)}
                                    <span className="ml-1 text-txtfade text-[14px]">
                                        {sortConfigs[criteria] === 'asc' ? '↑' : '↓'}
                                    </span>
                                </button>
                                {criteria !== 'leverage' && <div className="w-px h-4 bg-bcolor mx-[1px]"></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center w-full md:w-auto justify-center gap-2">
                        <input
                            type="pubkey"
                            placeholder="Filter by owner (pubkey)"
                            value={ownerFilter}
                            onChange={(e) => setOwnerFilter(e.target.value)}
                            className="bg-gray-800 text-white border border-gray-700 rounded p-1 w-[15em] text-sm"
                        />

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={resetFilters}
                                variant="outline"
                                className="w-full md:w-auto"
                                icon={resetIcon}
                            />
                            <Button
                                onClick={refreshPositions}
                                variant="outline"
                                className="w-full md:w-auto"
                                icon={reloadIcon}
                            >
                            </Button>
                        </div>
                    </div>


                </div>

                <div className="flex flex-wrap justify-between gap-2">
                    {paginatedPositions.length ? (
                        <div className='flex flex-col bg-first w-full h-full gap-2'>
                            {paginatedPositions.map((position, index) => (
                                <PositionBlockReadOnly
                                    key={position.pubkey.toBase58()}
                                    position={position}
                                    className={index % 2 === 0 ? 'bg-secondary' : 'bg-secondary-light'}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center w-full py-4">
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
            </StyledContainer >
        </div >
    );
}
