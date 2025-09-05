import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import Table from '@/components/pages/monitoring/TableLegacy';
import DataApiClient from '@/DataApiClient';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { Trader, UserProfileExtended, UserProfileMetadata } from '@/types';
import { getAbbrevNickname, getAbbrevWalletAddress, getNonUserProfile } from '@/utils';


interface TopTradersProps {
    startDate: string;
    endDate: string;
    allUserProfilesMetadata: UserProfileMetadata[];
    setProfile: (profile: UserProfileExtended | null) => void;
}

type SortField = 'average_trade_time' | 'pnl_minus_fees' | 'volume' | 'fees' | 'volume_weighted_pnl_percentage' | 'win_rate_percentage' | 'pnl_volatility' | 'shortest_trade_time' | 'number_positions' | 'number_transactions';
type SortDirection = 'asc' | 'desc';

export default function TopTraders({ startDate, endDate, allUserProfilesMetadata, setProfile }: TopTradersProps) {
    const [traders, setTraders] = useState<Trader[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('pnl_minus_fees');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const isExtraLargeScreen = useBetterMediaQuery('(min-width: 1500px)');
    // const isLargeScreen = useBetterMediaQuery('(min-width: 1024px)');

    const numberTraders = 100;

    const userProfilesMap = useMemo(() => {
        return allUserProfilesMetadata.reduce(
            (acc, profile) => {
                acc[profile.owner.toBase58()] = profile.nickname;
                return acc;
            },
            {} as Record<string, string>,
        );
    }, [allUserProfilesMetadata]);

    useEffect(() => {
        const fetchTraders = async () => {
            try {
                setIsLoading(true);
                const response = await DataApiClient.getTraders({
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    limit: numberTraders,
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

    const handleProfileView = async (pubkey: string) => {
        const p = await window.adrena.client.loadUserProfile({ user: new PublicKey(pubkey) });

        if (p === false) {
            setProfile(getNonUserProfile(pubkey));
        } else {
            setProfile(p);
        }
    };
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedTraders = useMemo(() => {
        return [...traders].sort((a, b) => {
            const multiplier = sortDirection === 'asc' ? 1 : -1;
            return (a[sortField] - b[sortField]) * multiplier;
        });
    }, [traders, sortField, sortDirection]);

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

    if (isLoading) {
        return <div className="h-full w-full flex items-center justify-center text-sm">
            <div
                className="bg-[#040D14] border rounded-lg p-3 w-full h-full flex items-center justify-center"
            >
                <Loader />
            </div>
        </div >;
    };
    if (error) return <div className='flex justify-center items-center'>Error: {error}</div>;

    return (
        <>
            <div
                className="bg-[#040D14] border rounded-lg p-3"
            >
                <div className="flex gap-2">
                    <p className="font-boldy text-lg">Top {numberTraders} traders</p>
                    <p className="font-boldy text-txtfade text-lg">(closed trades)</p>
                </div>
                <div className="px-4">
                    <div className="mt-3">
                        <Table
                            className="bg-transparent gap-1 border-none p-0"
                            columnTitlesClassName="text-sm"
                            columnsTitles={[
                                <span className="ml-auto mr-auto opacity-50 flex items-center" key="trader">Trader</span>,
                                /*  <button
                                     onClick={() => handleSort('pnl')}
                                     className={getSortButtonClass('pnl')}
                                     key='pnl'
                                 >
                                     <span className={getSortTextClass('pnl')}>PNL</span>
                                     <SortIcon field="pnl" />
                                 </button>, */
                                <button
                                    onClick={() => handleSort('average_trade_time')}
                                    className={getSortButtonClass('average_trade_time')}
                                    key='average_trade_time'
                                >
                                    <span className={getSortTextClass('average_trade_time')}>AVG TIME</span>
                                    <SortIcon field="average_trade_time" />
                                </button>,
                                <button
                                    onClick={() => handleSort('pnl_minus_fees')}
                                    className={getSortButtonClass('pnl_minus_fees')}
                                    key='pnl_minus_fees'
                                >
                                    <span className={getSortTextClass('pnl_minus_fees')}>
                                        {isExtraLargeScreen ? 'PNL WITH FEES' : 'PNL'}
                                    </span>
                                    <SortIcon field="pnl_minus_fees" />
                                </button>,
                                <button
                                    onClick={() => handleSort('volume')}
                                    className={getSortButtonClass('volume')}
                                    key='volume'
                                >
                                    <span className={getSortTextClass('volume')}>
                                        {isExtraLargeScreen ? 'VOLUME' : 'VOLUME'}
                                    </span>
                                    <SortIcon field="volume" />
                                </button>,
                                <button
                                    onClick={() => handleSort('fees')}
                                    className={getSortButtonClass('fees')}
                                    key='fees'
                                >
                                    <span className={getSortTextClass('fees')}>FEES</span>
                                    <SortIcon field="fees" />
                                </button>,
                                <button
                                    onClick={() => handleSort('volume_weighted_pnl_percentage')}
                                    className={getSortButtonClass('volume_weighted_pnl_percentage')}
                                    key='volume_weighted_pnl_percentage'
                                >
                                    <span className={getSortTextClass('volume_weighted_pnl_percentage')}>
                                        {isExtraLargeScreen ? 'VOLUME PNL RATIO' : 'VOL. PNL'}
                                    </span>
                                    <SortIcon field="volume_weighted_pnl_percentage" />
                                </button>,
                                <button
                                    onClick={() => handleSort('win_rate_percentage')}
                                    className={getSortButtonClass('win_rate_percentage')}
                                    key='win_rate_percentage'
                                >
                                    <span className={getSortTextClass('win_rate_percentage')}>
                                        {isExtraLargeScreen ? 'WIN RATE' : 'WIN%'}
                                    </span>
                                    <SortIcon field="win_rate_percentage" />
                                </button>,
                                <button
                                    onClick={() => handleSort('pnl_volatility')}
                                    className={getSortButtonClass('pnl_volatility')}
                                    key='pnl_volatility'
                                >
                                    <span className={getSortTextClass('pnl_volatility')}>
                                        {isExtraLargeScreen ? 'PNL VOLATILITY' : 'PNL VOLAT'}
                                    </span>
                                    <SortIcon field="pnl_volatility" />
                                </button>,
                                <button
                                    onClick={() => handleSort('shortest_trade_time')}
                                    className={getSortButtonClass('shortest_trade_time')}
                                    key='shortest_trade_time'
                                >
                                    <span className={getSortTextClass('shortest_trade_time')}>
                                        {isExtraLargeScreen ? 'SHORTEST TIME' : 'SHORTEST'}
                                    </span>
                                    <SortIcon field="shortest_trade_time" />
                                </button>,

                                <button
                                    onClick={() => handleSort('number_positions')}
                                    className={getSortButtonClass('number_positions')}
                                    key='positions'
                                >
                                    <span className={getSortTextClass('number_positions')}>
                                        {isExtraLargeScreen ? 'POSITIONS' : 'POS'}
                                    </span>
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
                            breakpoint="1024px"
                            data={sortedTraders.map((trader, i) => ({
                                rowTitle: '',
                                values: [
                                    <p
                                        key={`trader-${i}`}
                                        className={twMerge(
                                            'flex items-center justify-end lg:justify-center text-xs grow hover:underline transition duration-300 cursor-pointer',
                                            userProfilesMap[trader.user_pubkey]
                                                ? ''
                                                : 'opacity-50'
                                        )}
                                        onClick={() => {
                                            handleProfileView(trader.user_pubkey);
                                        }}
                                    >
                                        <Tippy
                                            content="View profile"
                                        >
                                            <span>
                                                {userProfilesMap[trader.user_pubkey]
                                                    ? getAbbrevNickname(userProfilesMap[trader.user_pubkey], 9)
                                                    : getAbbrevWalletAddress(trader.user_pubkey, 4)
                                                }
                                            </span>
                                        </Tippy>
                                    </p>,
                                    < div className='flex items-center justify-end lg:justify-center grow' key={`average_trade_time-${i}`} >
                                        <FormatNumber
                                            nb={trader.average_trade_time}
                                            format="time"
                                            className='text-xs'
                                        />
                                    </div>,
                                    < div className='flex items-center justify-end lg:justify-center grow' key={`pnl_minus_fees-${i}`} >
                                        <FormatNumber
                                            nb={trader.pnl_minus_fees}
                                            format="currency"
                                            className={twMerge('text-xs font-boldy', trader.pnl_minus_fees >= 0 ? 'text-green' : 'text-red')}
                                            precision={trader.pnl_minus_fees >= 50 ? 0 : 2}
                                            isDecimalDimmed={false}
                                            minimumFractionDigits={trader.pnl_minus_fees >= 50 ? 0 : 2}
                                            isAbbreviate={trader.pnl_minus_fees > 1000 ? true : false}
                                        />
                                    </div>,
                                    <div className='flex items-center justify-end lg:justify-center grow' key={`volume-${i}`}>
                                        <FormatNumber
                                            nb={trader.volume}
                                            isDecimalDimmed={false}
                                            isAbbreviate={trader.volume > 1000 ? true : false}
                                            className='text-xs'
                                            format="currency"
                                            isAbbreviateIcon={false}
                                        />
                                    </div>,
                                    <div className='flex items-center justify-end lg:justify-center grow' key={`fees-${i}`}>
                                        <Tippy
                                            content={
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-txtfade">Borrow fees:</span>
                                                        <FormatNumber
                                                            nb={trader.borrow_fees}
                                                            format="currency"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-txtfade">Exit fees:</span>
                                                        <FormatNumber
                                                            nb={trader.exit_fees}
                                                            format="currency"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            }
                                            placement="auto"
                                        >
                                            <div className="underline-dashed">
                                                <FormatNumber
                                                    nb={trader.fees}
                                                    isDecimalDimmed={false}
                                                    isAbbreviate={trader.fees > 1000}
                                                    className='text-xs'
                                                    format="currency"
                                                />
                                            </div>
                                        </Tippy>
                                    </div>,
                                    <div className='flex items-center justify-end lg:justify-center grow' key={`volume_weighted_pnl_percentage-${i}`}>
                                        <FormatNumber
                                            nb={trader.volume_weighted_pnl_percentage}
                                            isDecimalDimmed={false}
                                            className='text-xs'
                                            format="percentage"
                                            isAbbreviateIcon={false}
                                        />
                                    </div>,
                                    <div className='flex items-center justify-end lg:justify-center grow' key={`win_rate-${i}`}>
                                        <FormatNumber
                                            nb={trader.win_rate_percentage}
                                            isDecimalDimmed={false}
                                            className='text-xs'
                                            format="percentage"
                                            isAbbreviateIcon={false}
                                        />
                                    </div>,
                                    <div className='flex items-center justify-end lg:justify-center grow' key={`pnl_volatility-${i}`}>
                                        <FormatNumber
                                            nb={trader.pnl_volatility}
                                            isDecimalDimmed={false}
                                            className='text-xs'
                                            format="percentage"
                                            isAbbreviateIcon={false}
                                        />
                                    </div>,
                                    <div className='flex items-center justify-end lg:justify-center grow' key={`shortest_trade_time-${i}`}>
                                        <FormatNumber
                                            nb={trader.shortest_trade_time}
                                            isDecimalDimmed={false}
                                            className='text-xs'
                                            format="time"
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
            </div >
        </>
    );
}
