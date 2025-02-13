import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { memo, useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import adxLogo from '@/../../public/images/adx.svg';
import discordIcon from '@/../../public/images/discord-black.svg';
import firstImage from '@/../../public/images/first-place.svg';
import infoIcon from '@/../../public/images/Icons/info.svg';
import jitoLogo from '@/../../public/images/jito-logo.svg';
import jtoImage from '@/../../public/images/jito-logo-2.png';
import secondImage from '@/../../public/images/second-place.svg';
import thirdImage from '@/../../public/images/third-place.svg';
import xIcon from '@/../../public/images/x-black-bg.png';
import Button from '@/components/common/Button/Button';
import LiveIcon from '@/components/common/LiveIcon/LiveIcon';
import Modal from '@/components/common/Modal/Modal';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import LeaderboardTable from '@/components/pages/ranked/AwakeningLeaderboardTable';
import WeeklyReward from '@/components/pages/ranked/AwakeningWeeklyReward';
import { TRADING_COMPETITION_SEASONS } from '@/constant';
import { DIVISIONS } from '@/constants/divisions';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import useAwakeningV2 from '@/hooks/useAwakeningV2';
import { useSelector } from '@/store/store';
import { UserProfileExtended, UserStats } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

const CompetitionStats = memo(
    ({
        tradersCount,
        totalVolume,
        eligibleJitosolAirdropWallets,
        wallet,
    }: {
        tradersCount: number | null;
        totalVolume: number | null;
        eligibleJitosolAirdropWallets: string[];
        wallet: {
            walletAddress: string;
        } | null;
    }) => (
        <div className="flex gap-4 flex-col flex-wrap sm:flex-nowrap">
            <div className="flex gap-4 flex-row flex-wrap sm:flex-nowrap">
                <div className="flex flex-col items-center justify-between bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl relative gap-1 grow sm:grow-0 w-[10em] sm:w-[12em] h-[7.5em]">
                    <h4 className="font-boldy text-base p-2 flex gap-2">
                        Traders <LiveIcon className="absolute right-2" />
                    </h4>

                    <div className="h-[1px] bg-bcolor w-full" />

                    <div className="flex items-center justify-center w-full h-full pl-2 pr-2">
                        <FormatNumber
                            nb={tradersCount}
                            format="number"
                            className={'text-3xl font-boldy'}
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl relative gap-1 grow sm:grow-0 w-[10em] sm:w-[12em] h-[7.5em]">
                    <h4 className="font-boldy text-base p-2 flex gap-2">
                        Volume <LiveIcon className="absolute right-2" />
                    </h4>

                    <div className="h-[1px] bg-bcolor w-full" />

                    <div className="flex items-center justify-center w-full h-full pl-2 pr-2">
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

                    <div className="h-[1px] bg-bcolor w-full" />

                    <div className="flex flex-col h-full justify-evenly items-center pl-2 pr-2 pb-2">
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
                            <Image src={jtoImage} alt="adx logo" width={22} height={22} />

                            <div className="text-lg font-boldy w-[6.2em]">25,000 JTO</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center bg-[#111922] border border-[#1F252F] rounded-lg shadow-xl relative gap-1 grow h-[7.5em]">
                <div className="flex flex-col w-full items-center h-auto grow-0">
                    <div className="flex items-center p-2">
                        <Image src={jitoLogo} alt="jito logo" width={24} height={24} />
                        <div className="font-boldy text-base ml-1">Airdrop</div>
                        <span className="text-sm text-txtfade font-boldy ml-1">(6,000</span>
                        <Image src={jtoImage} alt="JTOlogo" width={24} height={24} />
                        <span className="text-sm text-txtfade font-boldy">)</span>
                        {eligibleJitosolAirdropWallets.includes(
                            wallet?.walletAddress ?? '',
                        ) ? (
                            <span className="ml-2 font-boldy text-green">You qualify!</span>
                        ) : (
                            <Tippy
                                content={
                                    <p className="font-medium">
                                        To qualify your wallet must have been one of the recipient
                                        of the JTO airdrop, and you must have made at least one $10k
                                        size trade. The first 600 participants will qualify, if less
                                        they will split the rewards.
                                    </p>
                                }
                                placement="auto"
                            >
                                <span className="ml-2  text-sm text-txtfade underline decoration-dotted">
                                    Who qualifies?
                                </span>
                            </Tippy>
                        )}
                    </div>

                    <div className="h-[1px] bg-bcolor w-full" />
                </div>

                <div className="flex flex-col gap-2 items-center justify-center h-full pb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-txtfade">Recipients</span>
                        <span className="text-sm font-boldy">
                            {eligibleJitosolAirdropWallets.length} / 600
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-txtfade">Reward per recipient</span>
                        <span className="text-sm font-boldy">
                            {Math.round(6000 / eligibleJitosolAirdropWallets.length)} JTO
                        </span>
                    </div>
                </div>
            </div>
        </div>
    ),
);
CompetitionStats.displayName = 'CompetitionStats';

const CompetitionLeaderboard = memo(
    ({ hasProfile }: { hasProfile: boolean }) => (
        <div className="flex flex-col sm:flex-row mb-5 gap-4">
            <div className="flex flex-row gap-3 items-center">
                <h1 className="font-boldy capitalize">Leaderboards</h1>
            </div>

            {!hasProfile && (
                <div className="flex flex-col sm:flex-row items-center bg-blue/30 p-2 border-dashed border-blue rounded text-sm text-center sm:text-left">
                    <div className="flex flex-row items-center">
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
    ),
);
CompetitionLeaderboard.displayName = 'CompetitionLeaderboard';

const WeekSelector = memo(
    ({
        currentWeek,
        maxWeek,
        setWeek,
        weekDates,
    }: {
        currentWeek: number;
        maxWeek: number;
        setWeek: (week: number) => void;
        weekDates: {
            start: string;
            end: string;
        };
    }) => (
        <div className="flex flex-col md:flex-row gap-3 justify-between md:items-center w-full">
            <div className="flex flex-row gap-3 min-w-[17em]">
                <p className="opacity-50">
                    ({new Date(weekDates.start).toLocaleDateString()} –{' '}
                    {new Date(weekDates.end).toLocaleDateString()})
                </p>

                {currentWeek === maxWeek ? (
                    <div className="flex text-xs gap-1">
                        <RemainingTimeToDate
                            timestamp={new Date(weekDates.end).getTime() / 1000}
                            stopAtZero={true}
                        />
                        <span className="text-xs font-boldy">left</span>
                    </div>
                ) : (
                    <p className="text-xs font-boldy">Week has ended</p>
                )}
            </div>

            <div className="flex flex-row gap-2 items-center">
                {Array.from({ length: 6 }, (_, i) => (
                    <div
                        key={i}
                        className={twMerge(
                            'rounded-lg p-1 whitespace-nowrap px-2 transition border border-transparent duration-300 cursor-pointer select-none',
                            i === currentWeek ? 'bg-[#364250] border-white/25' : 'bg-third',
                            i > maxWeek && 'cursor-not-allowed opacity-25',
                        )}
                        onClick={() => {
                            if (i > maxWeek) return;
                            setWeek(i);
                        }}
                    >
                        <p className="text-xxs sm:text-sm">Week {i + 1}</p>
                    </div>
                ))}
            </div>
        </div>
    ),
);
WeekSelector.displayName = 'WeekSelector';

export const CompetitionHeader = memo(
    ({
        startDate,
        endDate,
        description,
    }: {
        startDate: Date | null;
        endDate: Date | null;
        description: string[];
    }) => (
        <>
            <h1 className="font-boldy text-3xl capitalize">
                Adrena Trading Competition
            </h1>
            <p className="text-base text-txtfade mb-2">
                From{' '}
                {startDate?.toLocaleString('en-US', { month: 'short', day: 'numeric' })}{' '}
                -{' '}
                {endDate?.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })}
            </p>
            <div className="text-sm max-w-[70em] text-justify flex flex-col gap-3 items-center xl:items-start mt-2 sm:mt-0 pb-2 sm:pb-0">
                {description.map((text, index) => (
                    <span key={index} className="text-txtfade text-center xl:text-left">
                        {text}
                    </span>
                ))}
            </div>
        </>
    ),
);
CompetitionHeader.displayName = 'CompetitionHeader';

export const SocialButtons = memo(
    ({ twitterText, docsLink }: { twitterText: string; docsLink?: string }) => (
        <div
            className={twMerge(
                'flex gap-4 mt-4 flex-col sm:flex-row',
                docsLink ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : '',
            )}
        >
            <Button
                title="Join Discord"
                className="text-sm px-8 w-[15em]"
                href="https://discord.gg/adrena"
                isOpenLinkInNewTab
                rightIcon={discordIcon}
                rightIconClassName="w-3 h-3"
            />
            <Button
                title="Share on"
                className="text-sm px-8 w-[15em]"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(`https://${window.location.hostname}/competition`)}`}
                isOpenLinkInNewTab
                rightIcon={xIcon}
                rightIconClassName="w-3 h-3"
            />

            {docsLink && (
                <Button
                    title="Docs"
                    className="text-sm px-8 w-[15em]"
                    href={docsLink}
                    isOpenLinkInNewTab
                    rightIconClassName="w-3 h-3"
                />
            )}

            <Button
                title="Trade Now"
                className="text-sm px-8 w-[15em]"
                href="/trade"
                rightIconClassName="w-3 h-3"
            />
        </div>
    ),
);
SocialButtons.displayName = 'SocialButtons';

const ProfileBanner = memo(
    ({
        userName,
        currentUserData,
    }: {
        userName: string;
        currentUserData: UserStats;
    }) => {
        if (!currentUserData) return null;

        return (
            <div className="flex bg-yellow-900 bg-opacity-40 rounded-lg border border-yellow-900 p-2 mx-0 mb-8 flex-col items-center lg:flex-row lg:items-center justify-between gap-2 lg:gap-12">
                <div className="flex items-center">
                    <div className="hidden sm:flex text-[1em] md:text-[1em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)] bg-[length:250%_100%]">
                        {userName}
                    </div>

                    <span className="hidden sm:flex text-sm text-txtfade mx-4"> | </span>

                    <span className="text-base font-boldy mr-2">
                        {currentUserData.rank &&
                            currentUserData.rank < 4 &&
                            currentUserData.division !== 'No Division' ? (
                            <Image
                                src={
                                    currentUserData.rank === 1
                                        ? firstImage
                                        : currentUserData.rank === 2
                                            ? secondImage
                                            : currentUserData.rank === 3
                                                ? thirdImage
                                                : ''
                                }
                                width={20}
                                height={20}
                                alt="rank"
                                key={`rank-${currentUserData.rank}`}
                            />
                        ) : (
                            <div
                                className="text-base font-boldy text-center"
                                key={`rank-${currentUserData.rank}`}
                            >
                                # {currentUserData.rank}
                            </div>
                        )}
                    </span>

                    <span
                        className={`text-base flex items-center justify-center font-archivoblack ${DIVISIONS[currentUserData.division]?.color ?? 'default-text-color'}`}
                    >
                        {currentUserData.division}
                    </span>
                </div>

                <div className="flex gap-2 items-center w-full justify-between lg:w-auto lg:justify-center">
                    <span className="text-sm text-txtfade font-boldy">PnL:</span>

                    <FormatNumber
                        nb={currentUserData.pnl ?? 0}
                        format="currency"
                        isDecimalDimmed={false}
                        className={twMerge(
                            'text-base font-boldy',
                            (currentUserData.pnl ?? 0) >= 0 ? 'text-green' : 'text-red',
                        )}
                        precision={currentUserData.pnl && currentUserData.pnl >= 50 ? 0 : 2}
                        minimumFractionDigits={
                            currentUserData.pnl && currentUserData.pnl >= 50 ? 0 : 2
                        }
                    />
                </div>

                <div className="flex gap-2 items-center w-full justify-between lg:w-auto lg:justify-center">
                    <span className="text-sm text-txtfade">Volume:</span>

                    <FormatNumber
                        nb={currentUserData.volume ?? 0}
                        format="currency"
                        isAbbreviate={true}
                        isDecimalDimmed={false}
                        isAbbreviateIcon={false}
                        className="text-base font-boldy"
                    />
                </div>

                <div className="flex gap-2 items-center w-full justify-between lg:w-auto lg:justify-center">
                    <span className="text-sm text-txtfade"> Rank rewards: </span>

                    <div className="flex flex-row gap-3 items-center">
                        <div className="flex gap-2 items-center justify-center pl-8 lg:pl-0">
                            <FormatNumber
                                nb={currentUserData.adxRewards ?? 0}
                                format="number"
                                isDecimalDimmed={false}
                                className="text-base font-boldy"
                            />

                            <Image
                                src={adxLogo}
                                width={16}
                                height={16}
                                className="w-5 h-5"
                                alt="ADX"
                            />
                        </div>

                        <div className="flex gap-2 items-center justify-center">
                            <FormatNumber
                                nb={currentUserData.jtoRewards ?? 0}
                                format="number"
                                isDecimalDimmed={false}
                                className="text-base font-boldy"
                            />
                            <Image
                                src={jtoImage}
                                className="w-6 h-6"
                                width={22}
                                height={22}
                                alt="JTO"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);
ProfileBanner.displayName = 'ProfileBanner';

export default function Awakening({
    showFeesInPnl,
}: {
    showFeesInPnl: boolean;
}) {
    // states
    const [week, setWeek] = useState<number>(0);
    const [profile, setProfile] = useState<UserProfileExtended | null>(null);

    // hooks
    const wallet = useSelector((state) => state.walletState.wallet);
    const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
    const awakeningData = useAwakeningV2({ wallet, allUserProfilesMetadata });

    // effects
    useEffect(() => {
        if (typeof awakeningData?.weeksPassedSinceStartDate !== 'undefined') {
            setWeek(5);
        }
    }, [awakeningData?.weeksPassedSinceStartDate]);

    // variables
    const achievementsData = {
        achievements: awakeningData?.achievements,
        weeksPassedSinceStartDate: awakeningData?.weeksPassedSinceStartDate ?? 0,
        weekDates: {
            start:
                awakeningData?.achievements?.biggestLiquidation?.weekStarts[week] ?? '',
            end:
                awakeningData?.achievements?.biggestLiquidation?.weekEnds[week] ?? '',
        },
    };

    const userProfile = allUserProfilesMetadata.find(
        (p) => p.owner.toBase58() === wallet?.walletAddress,
    );

    const weekDates = {
        start:
            awakeningData?.achievements?.biggestLiquidation?.weekStarts[week] ?? '',
        end: awakeningData?.achievements?.biggestLiquidation?.weekEnds[week] ?? '',
    };

    const userName = userProfile
        ? userProfile.nickname
        : getAbbrevWalletAddress(wallet?.walletAddress ?? 'undefined');

    const hasProfile = userProfile !== undefined;

    const handleProfileView = useCallback(
        async (username: string) => {
            const profile = allUserProfilesMetadata.find((p) => p.nickname === username);

            if (profile) {
                const p = await window.adrena.client.loadUserProfile(profile.owner);

                setProfile(p !== false ? p : null);
            }
        },
        [allUserProfilesMetadata],
    );

    if (awakeningData === null)
        return (
            <div className="flex justify-center items-center">
                <Loader />
            </div>
        );

    const {
        startDate,
        endDate,
        weeksPassedSinceStartDate,
        eligibleJitosolAirdropWallets,
        tradersCount,
        totalVolume,
        currentUserData,
        data,
        rankedRewards,
    } = awakeningData;

    const twitterText = `Join the Adrena Trading Competition! 🚀📈🏆 @adrenaprotocol`;

    return (
        <>
            <div className="flex flex-col gap-6 pb-20 relative overflow-hidden bg-[#070E18]">
                <div className="bg-[#FF35382A] bottom-[-17%] absolute h-[20%] w-full blur-3xl backdrop-opacity-10 rounded-full"></div>

                <div className="px-4 sm:px-8">
                    <div className="flex flex-col xl:flex-row justify-between md:items-center gap-6 mb-12">
                        <div className="flex flex-col items-center xl:items-start">
                            <CompetitionHeader
                                startDate={startDate}
                                endDate={endDate}
                                description={
                                    TRADING_COMPETITION_SEASONS['awakening'].description
                                }
                            />
                            <SocialButtons twitterText={twitterText} />
                        </div>

                        <CompetitionStats
                            tradersCount={tradersCount}
                            totalVolume={totalVolume}
                            eligibleJitosolAirdropWallets={eligibleJitosolAirdropWallets}
                            wallet={wallet}
                        />
                    </div>
                </div>

                <div className="px-4 sm:px-8">
                    <div className="flex flex-col lg:flex-row gap-3 w-full mb-3">
                        <h1 className="font-boldy flex-none capitalize">Weekly Rewards</h1>

                        <WeekSelector
                            currentWeek={week}
                            maxWeek={weeksPassedSinceStartDate ?? 0}
                            setWeek={setWeek}
                            weekDates={weekDates}
                        />
                    </div>

                    {achievementsData.achievements && (
                        <WeeklyReward
                            allAchievements={{
                                ...achievementsData.achievements,
                            }}
                            week={week}
                            wallet={wallet}
                            handleProfileView={handleProfileView}
                        />
                    )}
                </div>

                <div className="w-full h-[1px] bg-[#1F2730] bg-gradient-to-r from-[#1F2730] to-[#1F2730] opacity-50 px-4 sm:px-8 my-3" />

                <div className="px-4 sm:px-8">
                    <CompetitionLeaderboard hasProfile={hasProfile} />

                    {wallet && data && currentUserData ? (
                        <ProfileBanner
                            userName={userName}
                            currentUserData={currentUserData}
                        />
                    ) : null}

                    <div className="grid lg:grid-cols-2 gap-[50px]">
                        {rankedRewards.slice(0, -1).map((_, index) => {
                            return (
                                <LeaderboardTable
                                    division={Object.keys(data)[index]}
                                    data={data}
                                    key={Object.keys(data)[index]}
                                    index={index + 1}
                                    nbItemPerPage={10}
                                    myDivision={
                                        Object.keys(data)[index] === currentUserData?.division
                                    }
                                    handleProfileView={handleProfileView}
                                />
                            );
                        })}
                    </div>

                    <div className="h-[1px] mt-8 mb-4 bg-bcolor" />

                    <div className="w-full flex items-center justify-center">
                        <LeaderboardTable
                            className="w-full max-w-[40em]"
                            division={Object.keys(data)[4]}
                            data={data}
                            key={Object.keys(data)[4]}
                            nbItemPerPage={20}
                            index={5}
                            myDivision={Object.keys(data)[4] === currentUserData?.division}
                            handleProfileView={handleProfileView}
                        />
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {profile && (
                    <Modal
                        className="h-[80vh] w-full overflow-y-auto"
                        wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper-1.jpg')]"
                        isWrapped={false}
                        close={() => setProfile(null)}
                    >
                        <ViewProfileModal profile={profile} showFeesInPnl={showFeesInPnl} close={() => setProfile(null)} />
                    </Modal>
                )}
            </AnimatePresence>
        </>
    );
}
