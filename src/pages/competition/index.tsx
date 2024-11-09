import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import banner from '@/../public/images/comp-banner.png';
import timerBg from '@/../public/images/genesis-timer-bg.png';
import jitoLogo from '@/../public/images/jito-logo.svg';
import jitoLogo2 from '@/../public/images/jito-logo-2.png';
import Loader from '@/components/Loader/Loader';
import LeaderboardTable from '@/components/pages/competition/LeaderboardTable';
import WeeklyReward from '@/components/pages/competition/WeeklyReward';
import { useAllUserProfiles } from '@/hooks/useAllUserProfiles';
import { TradingCompetitionAchievementsAPI } from '@/types';

export default function Competition() {
    const { allUserProfiles } = useAllUserProfiles();

    const [data, setData] = useState<
        | {
            [key in
            | 'Abomination'
            | 'Chimera'
            | 'Morph'
            | 'Spawn'
            | 'No Division']: {
                rank: number;
                username: string;
                volume: number;
                pnl: number;
                rewards: number;
            }[];
        }
        | null
    >(null);
    const [achievements, setAchievements] =
        useState<TradingCompetitionAchievementsAPI | null>(null);
    const [week, setWeek] = useState(5);

    useEffect(() => {
        getData();
    }, [allUserProfiles]);

    const getData = async () => {
        try {
            const response = await fetch(
                'https://datapi.adrena.xyz/awakening?season=preseason&show_achievements=true&show_trader_divisions=true',
            );
            const { data } = await response.json();
            const { trader_divisions, achievements } = data;

            if (!trader_divisions || !achievements) {
                return;
            }

            console.log(data);
            const formattedData = trader_divisions.reduce(
                (acc: any, { division, traders }: any) => {
                    acc[division] = traders.map((trader: any) => {
                        let username = trader.address;
                        if (allUserProfiles && allUserProfiles.length > 0) {
                            const user = allUserProfiles.find(
                                (profile) => profile.pubkey.toBase58() === trader.address,
                            );

                            if (user) {
                                username = user.nickname;
                            }
                        }
                        return {
                            username,
                            rank: trader.rank_in_division,
                            volume: trader.total_volume,
                            pnl: trader.total_pnl,
                            rewards: trader.adx_reward,
                        };
                    });
                    return acc;
                },
                {} as {
                    [key in
                    | 'Abomination'
                    | 'Chimera'
                    | 'Morph'
                    | 'Spawn'
                    | 'No Division']: {
                        rank: number;
                        username: string;
                        volume: number;
                        pnl: number;
                        rewards: number;
                    }[];
                },
            );

            setWeek(0);
            setAchievements(achievements);
            setData(formattedData);
        } catch (error) {
            console.error(error);
        }
    };
    console.log(allUserProfiles);

    if (!data || !achievements) {
        return (
            <div className="m-auto">
                <Loader />
            </div>
        );
    }

    const division = [
        'Morph',
        'Abomination',
        'Chimera',
        'Spawn',
        'No Division',
    ] as const;

    const hasCampaignEnded = new Date().getTime() >= 1671868800000;
    const days = Math.floor(
        (1734804623141 - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    const hours = Math.floor(
        ((1734804623141 - new Date().getTime()) % (1000 * 60 * 60 * 24)) /
        (1000 * 60 * 60),
    );
    const minutes = Math.floor(
        ((1734804623141 - new Date().getTime()) % (1000 * 60 * 60)) / (1000 * 60),
    );
    const seconds = Math.floor(
        ((1734804623141 - new Date().getTime()) % (1000 * 60)) / 1000,
    );

    return (
        <div className="flex flex-col gap-[50px] pb-[50px]">
            <div className="relative">
                <div className="relative flex flex-col justify-between items-center w-full h-[400px] p-[50px] border-b">
                    <div>
                        <Image
                            src={banner}
                            alt="competition banner"
                            className="absolute top-0 left-0 w-full h-full object-cover opacity-75"
                        />
                        <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-b from-transparent to-secondary z-10" />
                        <div className="absolute top-0 right-0 w-[100px] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
                        <div className="absolute top-0 left-0 w-[100px] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
                    </div>
                    <div className="z-10 text-center">
                        <p className="text-lg tracking-[0.2rem]">PRE-SEASON</p>
                        <h1 className="text-[46px] md:text-[70px] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)] bg-[length:250%_100%]">
                            AWAKENING
                        </h1>
                    </div>
                    <div className="flex flex-row items-center gap-3 z-10">
                        <p className="tracking-[0.2rem]">Sponsored by</p>
                        <Image
                            src={jitoLogo}
                            alt="jito logo"
                            className="w-[50px] md:w-[100px]"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <p className="absolute -translate-y-0.5 font-mono z-10">
                        {hasCampaignEnded
                            ? `${days}d ${hours}h ${minutes}m ${seconds}s left`
                            : 'Campaign has ended'}
                    </p>
                    <Image
                        src={timerBg}
                        alt="background graphic"
                        className="w-[300px] rotate-[180deg]"
                    />
                </div>
            </div>

            <div className="px-[20px] sm:px-[50px]">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-12">
                    <div>
                        <h1 className="font-boldy">Adrena Trading Competition</h1>
                        <p className="text-base text-txtfade mt-1 mb-3">
                            From Nov 11 - Nov 23, 2024
                        </p>
                        <p className="text-base max-w-[640px] text-txtfade">
                            Adrena&apos;s first trading competition. A 6 week long competition
                            that is an intro to the upcoming recurring trading seasons.
                            Starting November 11th and ending December 23rd. There will be 4
                            separate divisions. You&apos;ll be qualifying for a given division
                            based on your total trading volume during the 6 week event.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full lg:w-auto">
                        <h4 className="font-boldy">Total Contest Rewards</h4>
                        <div className="flex flex-row gap-2 items-center justify-center bg-[#111923] border rounded-lg p-4 px-12">
                            <Image
                                src={window.adrena.client.adxToken.image}
                                alt="adx logo"
                                width={18}
                                height={18}
                            />
                            <p className="text-xl font-boldy">
                                178,000 ADX <span className="">Rewards</span>
                            </p>
                        </div>
                        <div className="flex flex-row gap-2 items-center justify-center bg-[#111923] border rounded-lg p-4 px-12">
                            <Image src={jitoLogo2} alt="adx logo" width={18} height={18} />
                            <p className="text-xl font-boldy">
                                25,000 JTO <span className="">Rewards</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-[20px] sm:px-[50px]">
                <div className="flex flex-col md:flex-row gap-3 w-full mb-3">
                    <h1 className="font-boldy flex-none">Weekly Rewards</h1>

                    <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center w-full">
                        <div className="flex flex-row gap-3 items-center">
                            <p className="opacity-50">
                                (
                                {new Date(
                                    achievements.biggest_jito_sol_pnl.week_starts[week],
                                ).toLocaleDateString()}{' '}
                                –{' '}
                                {new Date(
                                    achievements.biggest_jito_sol_pnl.week_ends[week],
                                ).toLocaleDateString()}
                                )
                            </p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            {Array.from({ length: 6 }, (_, i) => i).map((i) => (
                                <div
                                    className={twMerge(
                                        'rounded-lg p-1 px-2 transition border border-transparent duration-300 cursor-pointer',
                                        i === week ? 'bg-[#364250] border-white/25 ' : 'bg-third',
                                    )}
                                    onClick={() => setWeek(i)}
                                    key={i}
                                >
                                    <p className="text-xxs sm:text-sm">Week {i + 1}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <WeeklyReward
                    rewards={{
                        'biggest liquidation': {
                            trader: achievements.biggest_liquidation.addresses[week],
                            result:
                                achievements.biggest_liquidation.liquidation_amounts[week],
                        },
                        'top pnl position': {
                            trader: achievements.top_percentage_position.addresses[week],
                            result:
                                achievements.top_percentage_position.pnl_percentages[week],
                        },
                        'top degen': {
                            trader: achievements.top_degen.addresses[week],
                            result: achievements.top_degen.pnl_amounts[week],
                        },
                        'partner sponsored trade': {
                            trader: achievements.biggest_jito_sol_pnl.addresses[week],
                            result: achievements.biggest_jito_sol_pnl.pnl_amounts[week],
                        },
                    }}
                />
            </div>
            <div className="w-full h-[1px] bg-[#1F2730] bg-gradient-to-r from-[#1F2730] to-[#1F2730] opacity-50 px-[20px] sm:px-[50px] my-3" />
            <div className="px-[20px] sm:px-[50px]">
                <h1 className="font-boldy mb-6">The leaderboard</h1>

                <div className="grid lg:grid-cols-2 gap-[50px]">
                    {division.map((division) => {
                        return (
                            <LeaderboardTable
                                division={division}
                                data={data[division]}
                                key={division}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
