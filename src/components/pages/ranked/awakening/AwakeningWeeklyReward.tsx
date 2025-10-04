import { StaticRequire } from 'next/dist/shared/lib/get-img-props';
import Image, { StaticImageData } from 'next/image';
import { memo, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import diceImage from '@/../public/images/dice.svg';
import firstImage from '@/../public/images/first-place.svg';
import ticketImage from '@/../public/images/tickets.png';
import FormatNumber from '@/components/Number/FormatNumber';
import { WalletAdapterName } from '@/hooks/useWalletAdapters';
import { PreSeasonLeaderboardReturnTypeAPI } from '@/types';
import { getAbbrevWalletAddress, isValidPublicKey } from '@/utils';

type Award = {
    title: string;
    trader: string | null;
    result?: number | null;
    type: 'reward' | 'ticket';
    reward: number | null;
    rewardToken: string | null;
    rewardImage: string | StaticImageData | StaticRequire;
    description: string;
    allTraders?: (string | null)[]
    totalTickets?: number;
    connectedWalletTickets?: number | null;
};

type WeeklyRewardProps = {
    allAchievements: PreSeasonLeaderboardReturnTypeAPI<{
        showAchievements: true;
    }>['achievements'] & {
        feesTickets: {
            winner: (string | null)[];
        };
        jitosolTickets: {
            winner: (string | null)[];
        };
    };
    week: number;
    wallet: {
        adapterName: WalletAdapterName;
        walletAddress: string;
    } | null;
    handleProfileView: (username: string) => void;
};

const TicketBackground = memo(() => (
    <div
        className='absolute w-full h-full mb-3 z-10'
        style={{
            backgroundImage: 'url(images/interrogation.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '20px 20px',
            opacity: 0.05,
        }}
    />
));
TicketBackground.displayName = 'TicketBackground';

const AwardHeader = memo(({ title, type }: { title: string; type: 'reward' | 'ticket' }) => (
    <div className="flex flex-col items-center gap-2">
        <Image
            src={type === 'ticket' ? diceImage : firstImage}
            alt="first place logo"
            className={twMerge(
                'h-10',
                type === 'ticket' ? 'opacity-80' : '',
            )}
            width={40}
            height={40}
        />
        <p className="text-base sm:text-lg text-center font-semibold mb-0.5">
            {title}
        </p>
    </div>
));
AwardHeader.displayName = 'AwardHeader';

const TicketCount = memo(({ connectedWalletTickets, totalTickets, trader, handleProfileView }: { connectedWalletTickets: number | null; totalTickets: number; trader: string | null; handleProfileView: (address: string) => void }) => (
    <div className="flex items-center justify-center h-[3em]">
        {trader === null || trader === '' ? (
            <>
                <div className="mb-0 gap-1 items-center justify-center flex ml-4">
                    <FormatNumber
                        nb={connectedWalletTickets}
                        className="text-lg text-center font-semibold"
                        isAbbreviate={true}
                        isAbbreviateIcon={false}
                    />
                    <span>/</span>
                    <FormatNumber
                        nb={totalTickets}
                        className="text-lg text-center font-semibold"
                        isAbbreviate={true}
                        isAbbreviateIcon={false}
                        isDecimalDimmed={false}
                    />
                </div>
                <Image
                    src={ticketImage}
                    alt="ticket image"
                    className="w-10 h-8"
                    width={40}
                    height={40}
                />
            </>
        ) : (
            <div className="flex items-center justify-center opacity-75 w-full">
                {isValidPublicKey(trader) ? (
                    <p className={twMerge('text-base font-semibold opacity-50')}>
                        {getAbbrevWalletAddress(trader)}
                    </p>
                ) : (
                    <p
                        className={twMerge(
                            'text-base font-semibold whitespace-nowrap max-w-full text-ellipsis overflow-hidden hover:underline transition duration-300 cursor-pointer',
                        )}
                        onClick={() => handleProfileView(trader as string)}
                    >
                        {trader}
                    </p>
                )}
            </div>
        )}
    </div>
));
TicketCount.displayName = 'TicketCount';

const RewardCard = memo(({ award, handleProfileView }: { award: Award; handleProfileView: (address: string) => void }) => (
    <div
        className={twMerge(
            'flex flex-col items-center justify-between bg-[#111922] border border-[#1F252F] rounded-md shadow-xl grow relative',
        )}
    >
        {award.type === 'ticket' && <TicketBackground />}
        <div className="flex flex-col gap-2 items-center justify-between p-3 z-20">

            <AwardHeader title={award.title} type={award.type} />

            {award.type === 'ticket' && award.totalTickets && (
                <TicketCount
                    connectedWalletTickets={award.connectedWalletTickets ?? null}
                    totalTickets={award.totalTickets}
                    trader={award.trader}
                    handleProfileView={handleProfileView}
                />
            )}

            {award.type === 'reward' && award.result && award.trader && (
                <>
                    <div className="flex flex-col items-center">
                        <FormatNumber
                            nb={Number(award.result)}
                            format={'currency'}
                            className={Number(award.result) >= 0 ? 'text-green font-bold' : 'text-red font-bold'}
                            isDecimalDimmed={false}
                        />
                    </div>
                    <div className="flex items-center justify-center opacity-75 w-full">
                        {isValidPublicKey(award.trader) ? (
                            <p className={twMerge('text-base font-semibold opacity-50')}>
                                {getAbbrevWalletAddress(award.trader)}
                            </p>
                        ) : (
                            <p
                                className={twMerge(
                                    'text-base font-semibold whitespace-nowrap max-w-full text-ellipsis overflow-hidden hover:underline transition duration-300 cursor-pointer',
                                )}
                                onClick={() => handleProfileView(award.trader as string)}
                            >
                                {award.trader}
                            </p>
                        )}
                    </div>
                </>
            )}

            <div className="flex flex-row gap-2 items-center justify-center bg-[#1B212A] border rounded-md p-2 px-3 sm:px-8">
                <Image
                    src={award.rewardImage}
                    alt="adx logo"
                    className="w-3 h-3 sm:w-5 sm:h-5"
                    width={20}
                    height={20}
                />
                <FormatNumber
                    nb={award.reward}
                    className="text-sm sm:text-2xl font-semibold"
                    suffixClassName="text-sm sm:text-2xl font-semibold"
                    suffix={` ${award.rewardToken}`}
                />
            </div>
            <p className="opacity-50 text-center">{award.description}</p>
        </div>
    </div>
));
RewardCard.displayName = 'RewardCard';

export default function AwakeningWeeklyReward({
    allAchievements,
    week,
    wallet,
    handleProfileView,
}: WeeklyRewardProps) {
    const connectedWalletTickets = useMemo(() => {
        if (!wallet) {
            return { fees: 0, jito: 0 };
        }

        const userIndex = allAchievements.feesTickets.addresses[week].findIndex(
            (x) => x === wallet.walletAddress,
        );

        if (userIndex === -1) {
            return { fees: 0, jito: 0 };
        }

        return {
            fees: allAchievements.feesTickets.ticketsCount[week]?.[userIndex] ?? 0,
            jito: allAchievements.jitosolTickets.ticketsCount[week]?.[userIndex] ?? 0,
        };
    }, [wallet, allAchievements, week]);

    const rewards = useMemo(() => [
        {
            title: 'Top Liquidation',
            trader: allAchievements.biggestLiquidation.addresses[week],
            result: allAchievements.biggestLiquidation.liquidationAmounts[week] ?
                Number(allAchievements.biggestLiquidation.liquidationAmounts[week]) :
                null,
            type: 'reward' as const,
            reward: allAchievements.biggestLiquidation.reward,
            rewardToken: allAchievements.biggestLiquidation.rewardToken,
            rewardImage: window.adrena.client.adxToken.image,
            description: 'The trader with the single highest liquidation amount for the week.',
        },
        {
            title: 'Fees Raffle',
            allTraders: allAchievements.feesTickets.addresses[week],
            trader: (allAchievements.feesTickets.winner ?? [])[week] ?? null,
            totalTickets: allAchievements.feesTickets.totalTickets[week],
            connectedWalletTickets: connectedWalletTickets.fees,
            type: 'ticket' as const,
            reward: allAchievements.feesTickets.reward,
            rewardToken: allAchievements.feesTickets.rewardToken,
            rewardImage: window.adrena.client.adxToken.image,
            description: 'Each $50 fees paid give you an entry. Winner picked at the end of the week.',
        },
        {
            title: 'Leverage Monster',
            trader: allAchievements.topDegen.addresses[week],
            result: allAchievements.topDegen.pnlAmounts[week] ?
                Number(allAchievements.topDegen.pnlAmounts[week]) :
                null,
            type: 'reward' as const,
            reward: allAchievements.topDegen.reward,
            rewardToken: allAchievements.topDegen.rewardToken,
            rewardImage: window.adrena.client.adxToken.image,
            description: 'Highest PnL on a 100x initial-leverage position, w/o further increase. Add/remove collateral accepted.',
        },
        {
            title: 'SOL Volume Raffle',
            allTraders: allAchievements.jitosolTickets.addresses[week],
            trader: (allAchievements.jitosolTickets.winner ?? [])[week] ?? null,
            totalTickets: allAchievements.jitosolTickets.totalTickets[week],
            connectedWalletTickets: connectedWalletTickets.jito,
            type: 'ticket' as const,
            reward: allAchievements.jitosolTickets.reward,
            rewardToken: allAchievements.jitosolTickets.rewardToken,
            rewardImage: window.adrena.client.adxToken.image,
            description: 'Each $100k volume of SOL traded give you an entry. Winner picked at the end of the week.',
        },
    ], [allAchievements, week, connectedWalletTickets]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {rewards.map((award) => (
                <RewardCard
                    key={award.title}
                    award={award}
                    handleProfileView={handleProfileView}
                />
            ))}
        </div>
    );
}
