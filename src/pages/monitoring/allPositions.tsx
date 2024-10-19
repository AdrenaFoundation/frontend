import React, { useState } from 'react';

import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import PositionBlockReadOnly from '@/components/pages/trading/Positions/PositionBlockReadOnly';
import { useAllPositions } from '@/hooks/useAllPositions';
import { getTokenImage, getTokenSymbol } from '@/utils';

export default function AllPositions() {
    const { allPositions } = useAllPositions();
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

    const filteredPositions = allPositions.filter(position => {
        const matchesSide = sideFilter === 'all' || position.side === sideFilter;
        const matchesMint = mintFilter === 'all' || position.token.mint.toBase58() === mintFilter;
        const matchesUser = ownerFilter === '' || position.owner.toBase58().toLowerCase().includes(ownerFilter.toLowerCase());
        const matchesPnl = pnlFilter === 'all' || (pnlFilter === "profit" && position.pnl && position.pnl > 0) || (pnlFilter === "loss" && position.pnl && position.pnl < 0);
        return matchesSide && matchesMint && matchesUser && matchesPnl;
    });

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

    const sortedPositions = [...filteredPositions].sort((a, b) => {
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
    });

    const paginatedPositions = sortedPositions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const resetFilters = () => {
        setSideFilter('all');
        setMintFilter('all');
        setOwnerFilter('');
        setPnlFilter('all');
        setCurrentPage(1);
    };

    return (
        <div className="flex flex-col gap-2 p-4">
            <StyledContainer className="p-4">
                <h2 style={{ textAlign: 'center' }}>Live Positions from all Traders</h2>
                <div className="flex flex-wrap justify-between mb-4 items-center">
                    <div className="flex flex-wrap border border-gray-700 rounded-lg p-2 bg-secondary">
                        {['all', 'long', 'short'].map(type => (
                            <Button
                                key={type}
                                onClick={() => setSideFilter(type)}
                                variant={type === sideFilter ? 'outline' : 'text'}
                                className={`w-20 ${type === 'long' ? 'text-green' : type === 'short' ? 'text-red' : ''}`}
                                title={type.charAt(0).toUpperCase() + type.slice(1)}
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 border border-gray-700 rounded-lg p-2 bg-secondary">
                        <Button
                            onClick={() => setMintFilter('all')}
                            variant={mintFilter === 'all' ? 'outline' : 'text'}
                            className="w-20 flex items-center"
                            title="All"
                        >
                        </Button>
                        {window.adrena.client.tokens
                            .filter(token => token.symbol !== 'USDC')
                            .map(token => (
                                <div key={token.mint.toBase58()} className='flex items-center'>
                                    <Button
                                        onClick={() => setMintFilter(token.mint.toBase58())}
                                        variant={token.mint.toBase58() === mintFilter ? 'outline' : 'text'}
                                        className="w-20 flex items-center"
                                        title={getTokenSymbol(token.symbol)}
                                        icon={getTokenImage(token)}
                                    >
                                    </Button>
                                </div>
                            ))}
                    </div>
                    <div className="flex flex-wrap border border-gray-700 rounded-lg p-2 bg-secondary">
                        {['all', 'profit', 'loss'].map(type => (
                            <Button
                                key={type}
                                onClick={() => setPnlFilter(type)}
                                variant={type === pnlFilter ? 'outline' : 'text'}
                                className={`w-20 ${type === 'profit' ? 'text-green' : type === 'loss' ? 'text-redbright' : ''}`}
                                title={type.charAt(0).toUpperCase() + type.slice(1)}
                            />
                        ))}
                    </div>
                    <div className="w-px h-6 bg-bcolor mx-2 hidden md:block"></div>
                    <div className="flex flex-wrap items-center text-base bg-secondary rounded-full p-[2px] border border-bcolor">
                        {['pnl', 'size', 'leverage'].map(criteria => (
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
                                {criteria !== 'leverage' && <div className="w-px h-4 bg-bcolor mx-[1px] hidden md:block"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="w-px h-6 bg-bcolor mx-2 hidden md:block"></div>
                    <div className="flex flex-wrap items-center">
                        <input
                            type="pubkey"
                            placeholder="Filter by owner (pubkey)"
                            value={ownerFilter}
                            onChange={(e) => setOwnerFilter(e.target.value)}
                            className="bg-gray-800 text-white border border-gray-700 rounded p-1"
                        />
                    </div>
                    <Button
                        onClick={resetFilters}
                        variant="outline"
                        className="ml-2"
                        title="x Reset"
                    >
                    </Button>
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
                    totalItems={filteredPositions.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </StyledContainer>
        </div>
    );
}
