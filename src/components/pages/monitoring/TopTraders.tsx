import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import Table from '@/components/pages/monitoring/Table';
import DataApiClient from '@/DataApiClient';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { Trader } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

interface TopTradersProps {
    startDate: string;
    endDate: string;
}

type SortField = 'pnl' | 'realized_pnl' | 'volume' | 'fees' | 'borrow_fees' | 'exit_fees' | 'number_positions' | 'number_transactions';
type SortDirection = 'asc' | 'desc';

export default function TopTraders({ startDate, endDate }: TopTradersProps) {
    const [traders, setTraders] = useState<Trader[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('pnl');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const isLargeScreen = useBetterMediaQuery('(min-width: 1024px)');
    useEffect(() => {
        const fetchTraders = async () => {
            try {
                setIsLoading(true);
                const response = await DataApiClient.getTraders({
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                });

                if (response.success && response.data.traders) {
                    setTraders(response.data.traders);
                } else {
                    setError('Failed to fetch traders data');
                }
            } catch (err) {
                setError('Error fetching traders data');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTraders();
    }, [startDate, endDate]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedTraders = [...traders].sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1;
        const aValue = a[sortField];
        const bValue = b[sortField];
        return (aValue - bValue) * multiplier;
    });

    const SortIcon = ({ field }: { field: SortField }) => (
        <span className="ml-1 text-xs opacity-50">
            {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
        </span>
    );

    const getSortButtonClass = (field: SortField) => twMerge(
        'ml-auto mr-auto opacity-50 hover:opacity-100 flex items-center cursor-pointer',
        sortField === field && 'opacity-100'
    );

    const getSortTextClass = (field: SortField) =>
        sortField === field ? 'underline underline-offset-4' : '';

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div
            className="bg-[#040D14] border rounded-lg p-3"
        >
            <p className="font-boldy text-lg">Top traders</p>
            <div className="px-4">
                <div className="mt-3">
                    <Table
                        className="bg-transparent gap-1 border-none p-0"
                        columnTitlesClassName="text-sm"
                        columnsTitles={[
                            <span className="ml-auto mr-auto opacity-50 flex items-center" key="rank">#</span>,
                            <span className="ml-auto mr-auto opacity-50 flex items-center" key="trader">Trader</span>,
                            <button
                                onClick={() => handleSort('pnl')}
                                className={getSortButtonClass('pnl')}
                                key='pnl'
                            >
                                <span className={getSortTextClass('pnl')}>PNL</span>
                                <SortIcon field="pnl" />
                            </button>,
                            <button
                                onClick={() => handleSort('realized_pnl')}
                                className={getSortButtonClass('realized_pnl')}
                                key='realized_pnl'
                            >
                                <span className={getSortTextClass('realized_pnl')}>REALIZED PNL</span>
                                <SortIcon field="realized_pnl" />
                            </button>,
                            <button
                                onClick={() => handleSort('volume')}
                                className={getSortButtonClass('volume')}
                                key='volume'
                            >
                                <span className={getSortTextClass('volume')}>VOLUME</span>
                                <SortIcon field="volume" />
                            </button>,
                            <button
                                onClick={() => handleSort('fees')}
                                className={getSortButtonClass('fees')}
                                key='fees'
                            >
                                <span className={getSortTextClass('fees')}>TOTAL FEES</span>
                                <SortIcon field="fees" />
                            </button>,
                            <button
                                onClick={() => handleSort('borrow_fees')}
                                className={getSortButtonClass('borrow_fees')}
                                key='borrow_fees'
                            >
                                <span className={getSortTextClass('borrow_fees')}>BORROW F.</span>
                                <SortIcon field="borrow_fees" />
                            </button>,
                            <button
                                onClick={() => handleSort('exit_fees')}
                                className={getSortButtonClass('exit_fees')}
                                key='exit_fees'
                            >
                                <span className={getSortTextClass('exit_fees')}>EXIT F.</span>
                                <SortIcon field="exit_fees" />
                            </button>,
                            <button
                                onClick={() => handleSort('number_positions')}
                                className={getSortButtonClass('number_positions')}
                                key='positions'
                            >
                                <span className={getSortTextClass('number_positions')}>POSITIONS</span>
                                <SortIcon field="number_positions" />
                            </button>,
                            <button
                                onClick={() => handleSort('number_transactions')}
                                className={getSortButtonClass('number_transactions')}
                                key='transactions'
                            >
                                <span className={getSortTextClass('number_transactions')}>ACTIONS</span>
                                <SortIcon field="number_transactions" />
                            </button>,
                        ]}
                        rowHovering={true}
                        pagination={true}
                        paginationClassName='scale-[80%] p-0'
                        nbItemPerPage={10}
                        nbItemPerPageWhenBreakpoint={3}
                        rowClassName="bg-[#0B131D] hover:bg-[#1F2730] py-0 items-center"
                        rowTitleWidth="0%"
                        isFirstColumnId
                        breakpoint="1024px"
                        data={sortedTraders.map((trader, i) => ({
                            rowTitle: '',
                            values: [
                                <p className="flex items-center justify-end lg:justify-center grow" key={`rank-${i}`}>
                                    {i + 1}
                                </p>,
                                <p key={`trader-${i}`} className='flex items-center justify-end lg:justify-center opacity-50 text-xs grow'>
                                    {getAbbrevWalletAddress(trader.user_pubkey)}
                                </p>,
                                <div className='flex items-center justify-end lg:justify-center grow' key={`pnl-${i}`}>
                                    <FormatNumber
                                        nb={trader.pnl}
                                        format="currency"
                                        className={twMerge('text-xs font-boldy', trader.pnl >= 0 ? 'text-green' : 'text-red')}
                                        isAbbreviate={isLargeScreen ? true : false}
                                        precision={trader.pnl >= 50 ? 0 : 2}
                                        isDecimalDimmed={false}
                                        minimumFractionDigits={trader.pnl >= 50 ? 0 : 2}
                                    />
                                </div>,
                                <div className='flex items-center justify-end lg:justify-center grow' key={`realized_pnl-${i}`}>
                                    <FormatNumber
                                        nb={trader.realized_pnl}
                                        format="currency"
                                        className={twMerge('text-xs font-boldy', trader.realized_pnl >= 0 ? 'text-green' : 'text-red')}
                                        isAbbreviate={isLargeScreen ? true : false}
                                        precision={trader.realized_pnl >= 50 ? 0 : 2}
                                        isDecimalDimmed={false}
                                        minimumFractionDigits={trader.realized_pnl >= 50 ? 0 : 2}
                                    />
                                </div>,
                                <div className='flex items-center justify-end lg:justify-center grow' key={`volume-${i}`}>
                                    <FormatNumber
                                        nb={trader.volume}
                                        isDecimalDimmed={false}
                                        isAbbreviate={isLargeScreen ? true : false}
                                        className='text-xs'
                                        format="number"
                                        prefix='$'
                                        isAbbreviateIcon={false}
                                    />
                                </div>,
                                <div className='flex items-center justify-end lg:justify-center grow' key={`fees-${i}`}>
                                    <FormatNumber
                                        nb={trader.fees}
                                        isDecimalDimmed={false}
                                        isAbbreviate={isLargeScreen ? true : false}
                                        className='text-xs'
                                        format="number"
                                        prefix='$'
                                        isAbbreviateIcon={false}
                                    />
                                </div>,
                                <div className='flex items-center justify-end lg:justify-center grow' key={`borrow_fees-${i}`}>
                                    <FormatNumber
                                        nb={trader.borrow_fees}
                                        isDecimalDimmed={false}
                                        isAbbreviate={isLargeScreen ? true : false}
                                        className='text-xs'
                                        format="number"
                                        prefix='$'
                                        isAbbreviateIcon={false}
                                    />
                                </div>,
                                <div className='flex items-center justify-end lg:justify-center grow' key={`exit_fees-${i}`}>
                                    <FormatNumber
                                        nb={trader.exit_fees}
                                        isDecimalDimmed={false}
                                        isAbbreviate={isLargeScreen ? true : false}
                                        className='text-xs'
                                        format="number"
                                        prefix='$'
                                        isAbbreviateIcon={false}
                                    />
                                </div>,
                                <div className='flex items-center justify-end lg:justify-center grow' key={`positions-${i}`}>
                                    <span className='text-xs'>{trader.number_positions}</span>
                                </div>,
                                <div className='flex items-center justify-end lg:justify-center grow' key={`transactions-${i}`}>
                                    <span className='text-xs'>{trader.number_transactions}</span>
                                </div>,
                            ],
                        }))}
                    />
                </div>
            </div>
        </div>
    );
}
