import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import adxLogo from '@/../public/images/adx.svg';
import banner from '@/../public/images/comp-banner.png';
import discordIcon from '@/../public/images/discord-black.svg';
import firstImage from '@/../public/images/first-place.svg';
import timerBg from '@/../public/images/genesis-timer-bg.png';
import jitoLogo from '@/../public/images/jito-logo.svg';
import jitoLogo2 from '@/../public/images/jito-logo-2.png';
import jtoImage from '@/../public/images/jito-logo-2.png';
import secondImage from '@/../public/images/second-place.svg';
import thirdImage from '@/../public/images/third-place.svg';
import xIcon from '@/../public/images/x-black-bg.png';
import Button from '@/components/common/Button/Button';
import LiveIcon from '@/components/common/LiveIcon/LiveIcon';
import Modal from '@/components/common/Modal/Modal';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import LeaderboardTable from '@/components/pages/competition/LeaderboardTable';
import WeeklyReward from '@/components/pages/competition/WeeklyReward';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import ViewProfileModal from '@/components/pages/user_profile/ViewProfileModal';
import { DIVISIONS } from '@/constants/divisions';
import { useAllUserProfiles } from '@/hooks/useAllUserProfiles';
import { useSelector } from '@/store/store';
import {
    TradingCompetitionAchievementsAPI,
    TradingCompetitionLeaderboardAPI,
    UserProfileExtended,
} from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

import infoIcon from '../../../public/images/Icons/info.svg';

const division = [
    'Leviathan',
    'Abomination',
    'Mutant',
    'Spawn',
    'No Division',
] as const;

const adxRewardsPlaceholder = {
    Leviathan: [
        320000, 240000, 160000, 40000, 40000, 40000, 40000, 40000, 40000, 40000,
    ],
    Abomination: [
        160000, 120000, 80000, 20000, 20000, 20000, 20000, 20000, 20000, 20000,
    ],
    Mutant: [
        80000, 60000, 40000, 10000, 10000, 10000, 10000, 10000, 10000, 10000,
    ],
    Spawn: [40000, 30000, 20000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
    'No Division': [],
};

const jtoRewardsPlaceholder = {
    Leviathan: [3200, 2400, 1600, 400, 400, 400, 400, 400, 400, 400],
    Abomination: [1600, 1200, 800, 200, 200, 200, 200, 200, 200, 200],
    Mutant: [800, 600, 400, 100, 100, 100, 100, 100, 100, 100],
    Spawn: [400, 300, 200, 50, 50, 50, 50, 50, 50, 50],
    'No Division': [],
};

export default function Competition({ showFeesInPnl }: { showFeesInPnl: boolean }) {
    const wallet = useSelector((state) => state.walletState.wallet);
    const { allUserProfiles } = useAllUserProfiles();
    const [data, setData] = useState<TradingCompetitionLeaderboardAPI | null>(
        null,
    );
    const [achievements, setAchievements] =
        useState<TradingCompetitionAchievementsAPI | null>(null);
    const [week, setWeek] = useState(0);
    const [myDivision, setMyDivision] = useState<
        keyof TradingCompetitionLeaderboardAPI | null
    >(null);
    const [myRank, setMyRank] = useState<number | null>(null);
    const [myVolume, setMyVolume] = useState<number | null>(null);
    const [myPnl, setMyPnl] = useState<number | null>(null);
    const [myProvisionalAdxRewards, setMyProvisionalAdxRewards] = useState<number | null>(null);
    const [myProvisionalJtoRewards, setMyProvisionalJtoRewards] = useState<number | null>(null);
    const [activeProfile, setActiveProfile] =
        useState<UserProfileExtended | null>(null);
    const [tradersCount, setTradersCount] = useState<number | null>(null);
    const [totalVolume, setTotalVolume] = useState<number | null>(null);

    const startDate = new Date('11/11/2024');
    const endDate = new Date('12/23/2024');
    const weeksPassedSinceStartDate = Math.floor(
        (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
    );

    useEffect(() => {
        getData();

        const interval = setInterval(() => {
            getData();
        }, 10000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allUserProfiles, wallet]);

    const [connectedWalletTickets, setConnectedWalletTickets] = useState<{
        fees: number | null;
        jito: number | null;
    } | null>(null);

    useEffect(() => {
        if (!wallet || !achievements || !data)
            return setConnectedWalletTickets(null);

        // Find user in the data
        const userIndex = achievements.fees_tickets.addresses[week].findIndex(
            (x) => x === wallet.walletAddress,
        );

        // Not a part of the competition yet
        if (userIndex === -1) {
            setConnectedWalletTickets({
                fees: 0,
                jito: 0,
            });
            return;
        }

        setConnectedWalletTickets({
            fees: achievements.fees_tickets.tickets_count[week]?.[userIndex] ?? 0,
            jito: achievements.jitosol_tickets.tickets_count[week]?.[userIndex] ?? 0,
        });
    }, [wallet, data, achievements, week]);

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

            {
                const tradersCount: number = trader_divisions.reduce((acc: number, { traders }: any) => acc + traders.length, 0);
                const volume: number = trader_divisions.reduce((acc: number, { traders }: any) => acc + traders.reduce((acc2: number, { total_volume }: any) => acc2 + (total_volume ?? 0), 0), 0);
                setTradersCount(tradersCount);
                setTotalVolume(volume);
            }

            if (wallet) {
                const f = trader_divisions.find(({ traders }: any) => {
                    return traders.some(
                        ({ address }: { address: string }) =>
                            address === wallet.walletAddress,
                    );
                });

                setMyDivision(f ? f.division ?? null : null);
                setMyRank(
                    f?.traders.find(
                        ({ address }: { address: string }) =>
                            address === wallet.walletAddress,
                    )?.rank_in_division ?? null,
                );
                setMyVolume(
                    f?.traders.find(
                        ({ address }: { address: string }) =>
                            address === wallet.walletAddress,
                    )?.total_volume ?? null,
                );
                setMyPnl(
                    f?.traders.find(
                        ({ address }: { address: string }) =>
                            address === wallet.walletAddress,
                    )?.total_pnl ?? null,
                );

                setMyProvisionalAdxRewards(
                    f?.traders.find(
                        ({ address }: { address: string }) =>
                            address === wallet.walletAddress,
                    )?.adx_reward ?? null,
                );

                setMyProvisionalJtoRewards(
                    f?.traders.find(
                        ({ address }: { address: string }) =>
                            address === wallet.walletAddress,
                    )?.jto_reward ?? null,
                );
            } else {
                setMyDivision(null);
            }

            division.forEach((divisionName) => {
                let divisionIndex = trader_divisions.findIndex(
                    ({ division }: any) => division === divisionName,
                );

                if (
                    divisionIndex === -1 ||
                    trader_divisions[divisionIndex].traders.length < 10
                ) {
                    const nbMissing =
                        10 - (trader_divisions[divisionIndex]?.traders.length ?? 0);

                    if (divisionIndex === -1) {
                        trader_divisions.push({
                            division: divisionName,
                            traders: [],
                        });

                        divisionIndex = trader_divisions.length - 1;
                    }

                    for (let i = 0; i < nbMissing; i++) {
                        const rank = 10 - nbMissing + (i + 1);
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
                    acc[division as keyof TradingCompetitionLeaderboardAPI] = traders.map(
                        (trader: any) => {
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
                        },
                    );

                    return acc;
                },
                {},
            );

            achievements.biggest_liquidation.addresses =
                achievements.biggest_liquidation.addresses.map((address: string) => {
                    return (
                        allUserProfiles.find(
                            (profile) => profile.owner.toBase58() === address,
                        )?.nickname ?? address
                    );
                });

            achievements.top_degen.addresses = achievements.top_degen.addresses.map(
                (address: string) => {
                    return (
                        allUserProfiles.find(
                            (profile) => profile.owner.toBase58() === address,
                        )?.nickname ?? address
                    );
                },
            );

            // Only do once
            if (week === 0) {
                setWeek(weeksPassedSinceStartDate);
            }
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

    const handleProfileView = (nickname: string) => {
        const profile = allUserProfiles.find((p) => p.nickname === nickname);

        if (profile) {
            setActiveProfile(profile);
        }
    };

    const twitterText = `Join the Adrena Trading Competition! 🚀📈🏆 @adrenaprotocol`;

    const userProfile: UserProfileExtended | undefined = allUserProfiles.find((p) => p.owner.toBase58() === wallet?.walletAddress);

    const hasProfile = userProfile !== undefined;

    const userName = hasProfile ? userProfile?.nickname : getAbbrevWalletAddress(wallet?.walletAddress.toString() ?? 'undefined');



    return (
        <>
            <div className="flex flex-col gap-6 pb-20 relative overflow-hidden bg-[#070E18]">
                <div className="bg-[#FF35382A] bottom-[-17%] absolute h-[20%] w-full blur-3xl backdrop-opacity-10 rounded-full"></div>

                <div className="relative">
                    <div className="relative flex flex-col items-center w-full h-[25em] p-[2em] border-b">
                        <div className="mt-[7em]">
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
                            <h1 className="text-[3em] md:text-[4em] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)] bg-[length:250%_100%] tracking-[-3px]">
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
                        <div className="absolute -translate-y-0.5 font-mono z-10 flex items-center justify-center">
                            {endDate.getTime() > Date.now() ? (
                                <>
                                    <RemainingTimeToDate
                                        timestamp={endDate.getTime() / 1000}
                                        className="items-center text-base"
                                        tippyText=""
                                    />
                                    <span className="ml-2 text-base font-boldy tracking-widest">
                                        left
                                    </span>
                                </>
                            ) : (
                                'Competition has ended'
                            )}
                        </div>

                        <Image
                            src={timerBg}
                            alt="background graphic"
                            className="w-[300px] rotate-[180deg]"
                        />
                    </div>
                </div>

                <div className="px-4 sm:px-8">
                    <div className="flex flex-col xl:flex-row justify-between md:items-center gap-6 mb-12">
                        <div className="flex flex-col items-center xl:items-start">
                            <h1 className="font-boldy text-3xl capitalize">
                                Adrena Trading Competition
                            </h1>
                            <p className="text-base text-txtfade mb-2">
                                From Nov 11 - Dec 23, 2024
                            </p>

                            <div className="text-sm max-w-[70em] text-justify flex flex-col items-center xl:items-start mt-2 sm:mt-0 pb-2 sm:pb-0">
                                <span className="text-txtfade text-center xl:text-left">
                                    Welcome to Adrena&apos;s trading pre-season, anon! This
                                    six-week event is the introduction to our upcoming recurring
                                    trading seasons.
                                </span>
                                <span className="text-txtfade text-center xl:text-left">
                                    From November 11th 12pm UTC to December 23rd 12pm UTC, traders
                                    will vie for PnL-based ranks in one of four volume-based
                                    divisions.
                                </span>
                                <span className="text-txtfade text-center xl:text-left">
                                    Your total trading volume during the six-week event determines
                                    your division qualification.
                                </span>
                                <span className="text-txtfade text-center xl:text-left">
                                    Check out the divisions below, continuously updated based on
                                    onchain events.
                                </span>

                                <span className="text-txtfade text-center xl:text-left mt-2">
                                    Only positions open after the start date and closed before the
                                    end date qualify.
                                </span>
                                <span className="text-txtfade text-center xl:text-left">
                                    Each weekly periods ends on Monday 12am UTC, except the last
                                    one ending at 12pm UTC.
                                </span>
                                <span className="text-txtfade text-center xl:text-left">
                                    Volume is determined by Open/Increase and Close positions.
                                    It&apos;s accounted for when the position closes (close or
                                    liquidation).
                                </span>
                            </div>

                            <div className="flex gap-4 mt-4 flex-col sm:flex-row">
                                <Button
                                    title="Join Discord"
                                    className="text-sm px-8 w-[15em]"
                                    href={`https://discord.gg/adrena`}
                                    isOpenLinkInNewTab
                                    rightIcon={discordIcon}
                                    rightIconClassName="w-3 h-3"
                                />

                                <Button
                                    title="Share on"
                                    className="text-sm px-8 w-[15em]"
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                        twitterText,
                                    )}&url=${encodeURIComponent(
                                        `https://${window.location.hostname}/competition`,
                                    )}`}
                                    isOpenLinkInNewTab
                                    rightIcon={xIcon}
                                    rightIconClassName="w-3 h-3"
                                />
                                <Button
                                    title="Trade Now"
                                    className="text-sm px-8 w-[15em]"
                                    href="/trade"
                                    rightIconClassName="w-3 h-3"
                                />
                            </div>
                        </div>

                        <div className='flex gap-4 flex-row flex-wrap sm:flex-nowrap'>
                            <div className="flex flex-col items-center justify-between bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl relative gap-1 grow sm:grow-0 w-[10em] sm:w-[12em] h-[7.5em]">
                                <h4 className="font-boldy text-base p-2 flex gap-2">Traders <LiveIcon className='absolute right-2' /></h4>

                                <div className='h-[1px] bg-bcolor w-full' />

                                <div className='flex items-center justify-center w-full h-full pl-2 pr-2'>
                                    <FormatNumber
                                        nb={tradersCount}
                                        format="number"
                                        className={'text-3xl font-boldy'}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-between bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl relative gap-1 grow sm:grow-0 w-[10em] sm:w-[12em] h-[7.5em]">
                                <h4 className="font-boldy text-base p-2 flex gap-2">Volume <LiveIcon className='absolute right-2' /></h4>

                                <div className='h-[1px] bg-bcolor w-full' />

                                <div className='flex items-center justify-center w-full h-full pl-2 pr-2'>
                                    <FormatNumber
                                        nb={totalVolume}
                                        format="currency"
                                        isDecimalDimmed={false}
                                        isAbbreviate={true}
                                        className={'text-3xl font-boldy'}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-between bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl relative gap-1 grow sm:grow-0 sm:w-[12em] h-[7.5em]">
                                <h4 className="font-boldy text-base p-2">Total Rewards</h4>

                                <div className='h-[1px] bg-bcolor w-full' />

                                <div className='flex flex-col h-full justify-evenly items-center pl-2 pr-2 pb-2'>
                                    <div className="flex gap-2 items-center justify-center w-full">
                                        <Image
                                            src={window.adrena.client.adxToken.image}
                                            alt="adx logo"
                                            width={18}
                                            height={18}
                                        />
                                        <div className="text-lg font-boldy w-[6.2em]">2.27M ADX</div>
                                    </div>

                                    <div className="flex gap-2 items-center justify-center w-full">
                                        <Image src={jitoLogo2} alt="adx logo" width={22} height={22} />

                                        <div className="text-lg font-boldy w-[6.2em]">25,000 JTO</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-8">
                    <div className="flex flex-col lg:flex-row gap-3 w-full mb-3">
                        <h1 className="font-boldy flex-none capitalize">Weekly Rewards</h1>

                        <div className="flex flex-col md:flex-row gap-3 justify-between md:items-center w-full">
                            <div className="flex flex-row gap-3 min-w-[17em]">
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

                                <div className='flex text-xs gap-1'>
                                    {Date.now() < new Date(achievements.biggest_liquidation.week_ends[week]).getTime() ? (
                                        <>
                                            <RemainingTimeToDate timestamp={new Date(achievements.biggest_liquidation.week_ends[week]).getTime() / 1000} stopAtZero={true} />
                                            <span className="text-xs font-boldy">left</span>
                                        </>
                                    ) : (
                                        'Week has ended'
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-row gap-2 items-center">
                                {Array.from({ length: 6 }, (_, i) => i).map((i) => (
                                    <div
                                        className={twMerge(
                                            'rounded-lg p-1 whitespace-nowrap px-2 transition border border-transparent duration-300 cursor-pointer select-none',
                                            i === week ? 'bg-[#364250] border-white/25 ' : 'bg-third',
                                            i > weeksPassedSinceStartDate && 'cursor-not-allowed opacity-25',
                                        )}
                                        onClick={() => {
                                            if (i > weeksPassedSinceStartDate) return;
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
                                title: 'Top Liquidation',
                                trader: achievements.biggest_liquidation.addresses[week],
                                result:
                                    achievements.biggest_liquidation.liquidation_amounts[week],
                                type: 'reward',
                                reward: 10000,
                                rewardToken: 'ADX',
                                rewardImage: window.adrena.client.adxToken.image,
                                description:
                                    'The trader with the single highest liquidation amount for the week.',
                            },
                            {
                                title: 'Fees Raffle',
                                trader: achievements.fees_tickets.addresses[week],
                                totalTickets: achievements.fees_tickets.total_tickets[week],
                                connectedWalletTickets: connectedWalletTickets?.fees ?? null,
                                type: 'ticket',
                                reward: 10000,
                                rewardToken: 'ADX',
                                rewardImage: window.adrena.client.adxToken.image,
                                description:
                                    'Each $50 fees paid give you an entry. Winner picked at the end of the week.',
                            },
                            {
                                title: 'Leverage Monster',
                                trader: achievements.top_degen.addresses[week],
                                result: achievements.top_degen.pnl_amounts[week],
                                type: 'reward',
                                reward: 10000,
                                rewardToken: 'ADX',
                                rewardImage: window.adrena.client.adxToken.image,
                                description:
                                    'Highest PnL on a 100x initial-leverage position, w/o further increase. Add/remove collateral accepted.',
                            },
                            {
                                title: 'SOL Volume Raffle',
                                trader: achievements.jitosol_tickets.addresses[week],
                                totalTickets: achievements.jitosol_tickets.total_tickets[week],
                                connectedWalletTickets: connectedWalletTickets?.jito ?? null,
                                type: 'ticket',
                                reward: 30000,
                                rewardToken: 'ADX',
                                rewardImage: adxLogo,
                                description:
                                    'Each $100k volume of SOL traded give you an entry. Winner picked at the end of the week.',
                            },
                        ]}
                        handleProfileView={handleProfileView}
                    />
                </div>

                <div className="w-full h-[1px] bg-[#1F2730] bg-gradient-to-r from-[#1F2730] to-[#1F2730] opacity-50 px-4 sm:px-8 my-3" />

                <div className="px-4 sm:px-8">
                    <div className="flex flex-col sm:flex-row mb-5 gap-4">
                        <div className='flex flex-row gap-3 items-center'>
                            <h1 className="font-boldy capitalize">Leaderboards</h1>
                        </div>

                        {!hasProfile && (
                            <div className="flex flex-col sm:flex-row items-center bg-blue/30 p-2 border-dashed border-blue rounded text-sm text-center sm:text-left">
                                <div className='flex flex-row items-center'>
                                    <Image
                                        className="opacity-70 mr-2 mb-2 sm:mb-0"
                                        src={infoIcon}
                                        height={16}
                                        width={16}
                                        alt="Info icon"
                                    />
                                    <p className="mr-2 mb-2 sm:mb-0 flex items-center">
                                        Create an on-chain profile to track your all-time stats.
                                    </p>

                                </div>
                                <Button
                                    title="Go!"
                                    className="text-xs px-4 py-1 h-[2em] w-full sm:w-auto"
                                    onClick={() => {
                                        window.location.href = '/my_dashboard';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {wallet && data && myDivision ? (
                        <div className="flex bg-yellow-900 bg-opacity-40 rounded-lg border border-yellow-900 p-2 mx-0 mb-8 flex-col items-center lg:flex-row lg:items-center justify-between gap-2 lg:gap-12">
                            <div className="flex items-center">
                                <div className="hidden sm:flex text-[1em] md:text-[1em] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)] bg-[length:250%_100%]">
                                    {userName}
                                </div>

                                <span className="hidden sm:flex text-sm text-txtfade mx-4"> | </span>

                                <span className="text-base font-boldy mr-2">
                                    {myRank && myRank < 4 && myDivision !== 'No Division' ? (
                                        <Image
                                            src={
                                                myRank === 1
                                                    ? firstImage
                                                    : myRank === 2
                                                        ? secondImage
                                                        : myRank === 3
                                                            ? thirdImage
                                                            : ''
                                            }
                                            width={20}
                                            height={20}
                                            alt="rank"
                                            key={`rank-${myRank}`}
                                        />
                                    ) : (
                                        <div className="text-base font-boldy text-center" key={`rank-${myRank}`}>
                                            # {myRank}
                                        </div>
                                    )}
                                </span>

                                <span className={`text-base flex items-center justify-center font-archivo ${DIVISIONS[myDivision]?.color ?? 'default-text-color'}`}>
                                    {myDivision}
                                </span>
                            </div>

                            <div className='flex gap-2 items-center w-full justify-between lg:w-auto lg:justify-center'>
                                <span className="text-sm text-txtfade font-boldy">PnL:</span>

                                <FormatNumber
                                    nb={myPnl ?? 0}
                                    format="currency"
                                    isDecimalDimmed={false}
                                    className={twMerge(
                                        'text-base font-boldy',
                                        (myPnl ?? 0) >= 0 ? 'text-green' : 'text-red',
                                    )}
                                    precision={myPnl && myPnl >= 50 ? 0 : 2}
                                    minimumFractionDigits={myPnl && myPnl >= 50 ? 0 : 2}
                                />
                            </div>

                            <div className='flex gap-2 items-center w-full justify-between lg:w-auto lg:justify-center'>
                                <span className="text-sm text-txtfade">Volume:</span>

                                <FormatNumber
                                    nb={myVolume ?? 0}
                                    format="currency"
                                    isAbbreviate={true}
                                    isDecimalDimmed={false}
                                    isAbbreviateIcon={false}
                                    className="text-base font-boldy"
                                />
                            </div>

                            <div className='flex gap-2 items-center w-full justify-between lg:w-auto lg:justify-center'>
                                <span className="text-sm text-txtfade"> Rank rewards: </span>

                                <div className='flex flex-row gap-3 items-center'>
                                    <div className='flex gap-2 items-center justify-center pl-8 lg:pl-0'>
                                        <FormatNumber
                                            nb={myProvisionalAdxRewards ?? 0}
                                            format="number"
                                            isDecimalDimmed={false}
                                            className="text-base font-boldy"
                                        />

                                        <Image
                                            src={adxLogo}
                                            width={16}
                                            height={16}
                                            className='w-5 h-5'
                                            alt="ADX"
                                        />
                                    </div>

                                    <div className='flex gap-2 items-center justify-center'>
                                        <FormatNumber
                                            nb={myProvisionalJtoRewards ?? 0}
                                            format="number"
                                            isDecimalDimmed={false}
                                            className="text-base font-boldy"
                                        />
                                        <Image
                                            src={jtoImage}
                                            className='w-6 h-6'
                                            width={22}
                                            height={22}
                                            alt="JTO"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* <span className="text-sm text-txtfade mx-4"> | </span> */}

                        </div>
                    ) : null}

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
                                    handleProfileView={handleProfileView}
                                />
                            );
                        })}
                    </div>

                    <div className="h-[1px] mt-8 mb-4 bg-bcolor" />

                    <div className="w-full flex items-center justify-center">
                        <LeaderboardTable
                            className="w-full max-w-[40em]"
                            division={division[4]}
                            data={data}
                            key={division[4]}
                            nbItemPerPage={20}
                            index={5}
                            myDivision={division[4] === myDivision}
                            handleProfileView={handleProfileView}
                        />
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {activeProfile && (
                    <Modal
                        className="h-[80vh] overflow-y-scroll w-full"
                        wrapperClassName="items-start w-full max-w-[55em] sm:mt-0"
                        close={() => setActiveProfile(null)}
                    >
                        <ViewProfileModal profile={activeProfile} showFeesInPnl={showFeesInPnl} />
                    </Modal>
                )}
            </AnimatePresence>
        </>
    );
}
