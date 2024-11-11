import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import banner from '@/../public/images/comp-banner.png';
import timerBg from '@/../public/images/genesis-timer-bg.png';
import jitoLogo from '@/../public/images/jito-logo.svg';
import jitoLogo2 from '@/../public/images/jito-logo-2.png';
import jtoImage from '@/../public/images/jito-logo-2.png';
import Loader from '@/components/Loader/Loader';
import LeaderboardTable from '@/components/pages/competition/LeaderboardTable';
import WeeklyReward from '@/components/pages/competition/WeeklyReward';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import { useAllUserProfiles } from '@/hooks/useAllUserProfiles';
import {
    TradingCompetitionAchievementsAPI,
    TradingCompetitionLeaderboardAPI,
} from '@/types';
import {
    getDaysBetweenDates,
    getHoursBetweenDates,
} from '@/utils';
import { useSelector } from '@/store/store';

const division = [
    'Leviathan',
    'Abomination',
    'Mutant',
    'Spawn',
    'No Division',
] as const;

const adxRewardsPlaceholder = {
    'Leviathan': [320000, 240000, 160000, 40000, 40000, 40000, 40000, 40000, 40000, 40000],
    'Abomination': [160000, 120000, 80000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
    'Mutant': [80000, 60000, 40000, 10000, 10000, 10000, 10000, 10000, 10000, 10000],
    'Spawn': [40000, 30000, 20000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
    'No Division': [],
};

const jtoRewardsPlaceholder = {
    'Leviathan': [3200, 2400, 1600, 400, 400, 400, 400, 400, 400, 400],
    'Abomination': [1600, 1200, 800, 200, 200, 200, 200, 200, 200, 200],
    'Mutant': [800, 600, 400, 100, 100, 100, 100, 100, 100, 100],
    'Spawn': [400, 300, 200, 50, 50, 50, 50, 50, 50, 50],
    'No Division': [],
};

export default function Competition() {
    const wallet = useSelector((state) => state.walletState.wallet);
    const { allUserProfiles } = useAllUserProfiles();
    const [data, setData] = useState<TradingCompetitionLeaderboardAPI | null>(
        null,
    );
    const [achievements, setAchievements] =
        useState<TradingCompetitionAchievementsAPI | null>(null);
    const [week, setWeek] = useState(5);
    const [myDivision, setMyDivision] = useState<string | null>(null);

    const startDate = new Date('11/11/2024');
    const endDate = new Date('12/23/2024');

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allUserProfiles, wallet]);

    const [connectedWalletTickets, setConnectedWalletTickets] = useState<{
        fees: number | null;
        jito: number | null;
    } | null>(null);

    useEffect(() => {
        if (!wallet || !achievements || !data) return setConnectedWalletTickets(null);

        // Find user in the data
        const userIndex = achievements.fees_tickets.addresses[week].findIndex(x => x === wallet.walletAddress);

        // Not a part of the competition yet
        if (userIndex === -1) {
            setConnectedWalletTickets({
                fees: 0,
                jito: 0,
            });
            return;
        }

        setConnectedWalletTickets({
            fees: achievements.fees_tickets.tickets_count[userIndex][week] ?? 0,
            jito: achievements.jitosol_tickets.tickets_count[userIndex][week] ?? 0,
        });
    }, [wallet, data, achievements]);

    const getData = async () => {
        try {
            const response = await fetch(
                'https://datapi.adrena.xyz/awakening?season=preseason&show_achievements=true&show_trader_divisions=true',
            );
            const { data } = await response.json();
            const { trader_divisions = [], achievements = [] } = data;

            if (!trader_divisions || !achievements) {
                return;
            }

            if (wallet) {
                const f = trader_divisions.find(({ traders }: any) => {
                    // division.some((x) => )
                    return traders.some(({ address }: { address: string }) => address === wallet.walletAddress);
                });

                setMyDivision(f ? f.division ?? null : null);
            } else {
                setMyDivision(null);
            }

            division.forEach((divisionName) => {
                let divisionIndex = trader_divisions.findIndex(({ division }: any) => division === divisionName);

                if (divisionIndex === -1 || trader_divisions[divisionIndex].traders.length < 10) {
                    const nbMissing = 10 - (trader_divisions[divisionIndex]?.traders.length ?? 0);

                    if (divisionIndex === -1) {
                        trader_divisions.push({
                            division: divisionName,
                            traders: [],
                        });

                        divisionIndex = trader_divisions.length - 1;
                    }

                    for (let i = 0; i < nbMissing; i++) {
                        const rank = (10 - nbMissing) + (i + 1);
                        trader_divisions[divisionIndex].traders.push({
                            connected: false,
                            address: '-',
                            username: '-',
                            rank_in_division: rank,
                            total_volume: null,
                            total_pnl: null,
                            adx_reward: adxRewardsPlaceholder[divisionName]?.[rank - 1] ?? 0,
                            jto_reward: jtoRewardsPlaceholder[divisionName]?.[rank - 1] ?? 0,
                        });
                    }
                }
            });

            const formattedData = trader_divisions.reduce(
                (acc: TradingCompetitionLeaderboardAPI, { division, traders }: any) => {
                    acc[division as keyof TradingCompetitionLeaderboardAPI] = traders.map((trader: any) => {
                        let username = trader.address;

                        if (allUserProfiles && allUserProfiles.length > 0) {
                            const user = allUserProfiles.find(
                                (profile) => profile.owner.toBase58() === trader.address,
                            );

                            if (user) {
                                username = user.nickname;
                            }
                        }

                        return {
                            connected: trader.address === wallet?.walletAddress,
                            username,
                            rank: trader.rank_in_division,
                            volume: trader.total_volume,
                            pnl: trader.total_pnl,
                            adxRewards: trader.adx_reward,
                            jtoRewards: trader.jto_reward ?? 0,
                        };
                    });

                    return acc;
                },
                {},
            );

            setWeek(0);
            setAchievements(achievements);
            setData(formattedData);
        } catch (error) {
            console.error(error);
        }
    };

    if (!data || !achievements) {
        return (
            <div className="m-auto">
                <Loader />
            </div>
        );
    }

    const daysUntilNextWeek = getDaysBetweenDates(
        new Date(),
        new Date(achievements.biggest_liquidation.week_ends[week]),
    );

    const hoursUntilNextWeek = getHoursBetweenDates(
        new Date(),
        new Date(achievements.biggest_liquidation.week_ends[week]),
    );

    return (
        <div className="flex flex-col gap-6 pb-20 relative overflow-hidden bg-[#070E18]">
            <div className='bg-[#FF35382A] bottom-[-17%] absolute h-[20%] w-full blur-3xl backdrop-opacity-10 rounded-full'></div>

            <div className="relative">
                <div className="relative flex flex-col items-center w-full h-[25em] p-[2em] border-b">
                    <div className='mt-[7em]'>
                        <Image
                            src={banner}
                            alt="competition banner"
                            className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute bottom-0 left-0 w-full h-[10em] bg-gradient-to-b from-transparent to-secondary z-10" />
                        <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
                        <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
                    </div>

                    <div className="z-10 text-center">
                        <p className="text-lg tracking-[0.2rem]">PRE-SEASON</p>
                        <h1 className="text-[3em] md:text-[4em] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)] bg-[length:250%_100%]">
                            AWAKENING
                        </h1>
                    </div>

                    <div className="flex flex-row items-center gap-3 z-10 mt-[4em]">
                        <p className="tracking-[0.2rem] uppercase">Sponsored by</p>
                        <Image
                            src={jitoLogo}
                            alt="jito logo"
                            className="w-[4em] md:w-[5em]"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <p className="absolute -translate-y-0.5 font-mono z-10 flex items-center justify-center">
                        {endDate.getTime() > Date.now() ? <>
                            <RemainingTimeToDate
                                timestamp={
                                    endDate.getTime() / 1000
                                }
                                className="items-center text-base"
                                tippyText=""
                            />
                            <span className='ml-2 text-base font-boldy tracking-widest'>left</span></> :
                            'Competition has ended'}
                    </p>

                    <Image
                        src={timerBg}
                        alt="background graphic"
                        className="w-[300px] rotate-[180deg]"
                    />
                </div>
            </div>

            <div className="px-4 sm:px-8">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-12">
                    <div className='flex flex-col items-center lg:items-start'>
                        <h1 className="font-boldy text-3xl capitalize">
                            Adrena Trading Competition
                        </h1>
                        <p className="text-base text-txtfade mb-2">
                            From Nov 11 - Dec 23, 2024
                        </p>
                        <div className="text-sm max-w-[70em] text-justify flex flex-col items-center lg:items-start">
                            <span className='text-txtfade text-center lg:text-left'>Welcome to Adrena&apos;s trading pre-season, anon! This six-week event is the introduction to our upcoming recurring trading seasons.</span>
                            <span className='text-txtfade text-center lg:text-left'>From November 11th 12pm UTC to December 23rd 12pm UTC, traders will vie for PnL-based ranks in one of four volume-based divisions.</span>
                            <span className='text-txtfade text-center lg:text-left'>Your total trading volume during the six-week event determines your division qualification.</span>
                            <span className='text-txtfade text-center lg:text-left'>Check out the divisions below, continuously updated based on onchain events.</span>

                            <span className='text-txtfade text-center lg:text-left mt-2'>Only positions open after the start date and closed before the end date qualify.</span>
                            <span className='text-txtfade text-center lg:text-left'>Each weekly periods ends on Monday 12am UTC, except the last one ending at 12pm UTC.</span>
                            <span className='text-txtfade text-center lg:text-left'>Volume is determined by Open/Increase and Close positions. It&apos;s accounted for when the position closes (close or liquidation).</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full items-center lg:w-[15em]">
                        <h4 className="font-boldy text-base">Total Rewards</h4>
                        <div className="flex flex-row gap-2 items-center justify-center bg-[#111923] border rounded-lg pl-6 pt-4 pb-4 w-full">
                            <Image
                                src={window.adrena.client.adxToken.image}
                                alt="adx logo"
                                width={18}
                                height={18}
                            />
                            <p className="text-xl font-boldy w-[7em]">
                                2.095M ADX
                            </p>
                        </div>

                        <div className="flex flex-row gap-2 items-center justify-center bg-[#111923] border rounded-lg pl-6 pt-4 pb-4 w-full">
                            <Image src={jitoLogo2} alt="adx logo" width={22} height={22} />

                            <p className="text-xl font-boldy w-[7em]">
                                25,000 JTO
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-8">
                <div className="flex flex-col md:flex-row gap-3 w-full mb-3">
                    <h1 className="font-boldy flex-none capitalize">Weekly Rewards</h1>

                    <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center w-full">
                        <div className="flex flex-row gap-3 items-center">
                            <p className="opacity-50">
                                (
                                {new Date(
                                    achievements.biggest_liquidation.week_starts[week],
                                ).toLocaleDateString()}{' '}
                                –{' '}
                                {new Date(
                                    achievements.biggest_liquidation.week_ends[week],
                                ).toLocaleDateString()}
                                )
                            </p>

                            <p className="text-xs font-mono z-10">
                                {hoursUntilNextWeek > 0 &&
                                    `${daysUntilNextWeek}d ${hoursUntilNextWeek}h left`}
                            </p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            {Array.from({ length: 6 }, (_, i) => i).map((i) => (
                                <div
                                    className={twMerge(
                                        'rounded-lg p-1 px-2 transition border border-transparent duration-300 cursor-pointer select-none',
                                        i === week ? 'bg-[#364250] border-white/25 ' : 'bg-third',
                                        i !== 0 && 'cursor-not-allowed opacity-25',
                                    )}
                                    onClick={() => {
                                        if (i > 0) {
                                            // Only allow the first week to be selected for now
                                            return;
                                        }
                                        setWeek(i);
                                    }}
                                    key={i}
                                >
                                    <p className="text-xxs sm:text-sm">Week {i + 1}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <WeeklyReward
                    rewards={[
                        {
                            title: 'Biggest Liquidation',
                            trader: achievements.biggest_liquidation.addresses[week],
                            result: achievements.biggest_liquidation.liquidation_amounts[week],
                            type: 'reward',
                            reward: 10000,
                            rewardToken: 'ADX',
                            rewardImage: window.adrena.client.adxToken.image,
                        },
                        {
                            title: 'Fees Prize',
                            trader: achievements.fees_tickets.addresses[week],
                            totalTickets: achievements.fees_tickets.total_tickets[week],
                            connectedWalletTickets: connectedWalletTickets?.fees ?? null,
                            type: 'ticket',
                            reward: 10000,
                            rewardToken: 'ADX',
                            rewardImage: window.adrena.client.adxToken.image,
                        },
                        {
                            title: 'Top Degen',
                            trader: achievements.top_degen.addresses[week],
                            result: achievements.top_degen.pnl_amounts[week],
                            type: 'reward',
                            reward: 10000,
                            rewardToken: 'ADX',
                            rewardImage: window.adrena.client.adxToken.image,
                        },
                        {
                            title: 'SOL Trading Volume Prize',
                            trader: achievements.jitosol_tickets.addresses[week],
                            totalTickets: achievements.jitosol_tickets.total_tickets[week],
                            connectedWalletTickets: connectedWalletTickets?.jito ?? null,
                            type: 'ticket',
                            reward: 1000,
                            rewardToken: 'JITO',
                            rewardImage: jtoImage,
                        }
                    ]}
                />
            </div>

            <div className="w-full h-[1px] bg-[#1F2730] bg-gradient-to-r from-[#1F2730] to-[#1F2730] opacity-50 px-4 sm:px-8 my-3" />

            <div className="px-4 sm:px-8">
                <h1 className="font-boldy mb-6 capitalize">The leaderboard</h1>

                <div className="grid lg:grid-cols-2 gap-[50px]">
                    {division.slice(0, -1).map((division, index) => {
                        return (
                            <LeaderboardTable
                                division={division}
                                data={data}
                                key={division}
                                index={index + 1}
                                nbItemPerPage={10}
                                myDivision={division === myDivision}
                            />
                        );
                    })}
                </div>

                <div className='h-[1px] mt-8 mb-4 bg-bcolor' />

                <div className='w-full flex items-center justify-center'>
                    <LeaderboardTable
                        className="w-full max-w-[40em]"
                        division={division[4]}
                        data={data}
                        key={division[4]}
                        nbItemPerPage={20}
                        index={5}
                        myDivision={division[4] === myDivision}
                    />
                </div>
            </div>
        </div>
    );
}
