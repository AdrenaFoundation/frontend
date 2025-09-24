import '../../../styles/Animation.css';

import Tippy from '@tippyjs/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import FormatNumber from '@/components/Number/FormatNumber';
import useClaimHistory from '@/hooks/useClaimHistory';
import {
    LockedStakeExtended,
} from '@/types';
import { formatMilliseconds, formatNumber, nativeToUi } from '@/utils';

import alpLogo from '../../../../public/images/adrena_logo_alp_white.svg';
import adxTokenLogo from '../../../../public/images/adx.svg';
import infoIcon from '../../../../public/images/Icons/info.svg';
import usdcTokenLogo from '../../../../public/images/usdc.svg';
import { fullyLiquidALPStaking } from '../global/Emissions/EmissionsChart';
import ClaimHistorySection from './ClaimHistorySection';
import LockedStakes from './LockedStakes';

interface SortConfig {
    size: 'asc' | 'desc';
    duration: 'asc' | 'desc';
    lastClicked: 'size' | 'duration';
}

export default function FullyLiquidALPStaking({
    totalLockedStake,
    lockedStakes,
    handleLockedStakeRedeem,
    handleClickOnClaimRewardsAndRedeem,
    userPendingUsdcRewards,
    userPendingAdxRewards,
    pendingGenesisAdxRewards,
    walletAddress,
}: {
    totalLockedStake: number | null;
    lockedStakes: LockedStakeExtended[] | null;
    handleLockedStakeRedeem: (
        lockedStake: LockedStakeExtended,
    ) => void;
    handleClickOnClaimRewardsAndRedeem: () => Promise<void>;
    userPendingUsdcRewards: number;
    userPendingAdxRewards: number;
    roundPendingUsdcRewards: number;
    roundPendingAdxRewards: number;
    pendingGenesisAdxRewards: number;
    walletAddress: string | null;
}) {
    const [showMoreStakingInfo, setShowMoreStakingInfo] = useState(false);
    const storageKey = 'alpStakeSortConfig';
    const [isClaimingRewardsAndRedeeming, setIsClaimingRewardsAndRedeeming] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
        const savedConfig = localStorage.getItem(storageKey);
        return savedConfig
            ? JSON.parse(savedConfig)
            : {
                size: 'desc',
                duration: 'asc',
                lastClicked: 'size',
            };
    });

    const { claimsHistory } = useClaimHistory({
        walletAddress,
        symbol: 'ALP',
        interval: 100000000,
    });

    const alpClaimHistory = claimsHistory?.symbols.find(s => s.symbol === 'ALP');

    const sortedLockedStakes = lockedStakes
        ? lockedStakes.sort((a: LockedStakeExtended, b: LockedStakeExtended) => {
            const sizeModifier = sortConfig.size === 'asc' ? 1 : -1;
            const durationModifier = sortConfig.duration === 'asc' ? 1 : -1;

            const sizeDiff = (Number(a.amount) - Number(b.amount)) * sizeModifier;
            const durationDiff = ((Number(a.endTime) * 1000) - (Number(b.endTime) * 1000)) * durationModifier;

            if (sortConfig.lastClicked === 'size') {
                return sizeDiff !== 0 ? sizeDiff : durationDiff; // If sizeDiff is zero, fall back to durationDiff.
            }

            if (sortConfig.lastClicked === 'duration') {
                return durationDiff !== 0 ? durationDiff : sizeDiff; // If durationDiff is zero, fall back to sizeDiff.
            }

            // Fallback sorting by duration or size if none was clicked
            return durationDiff || sizeDiff;
        })
        : [];

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(sortConfig));
    }, [sortConfig, storageKey]);

    const handleClaim = async () => {
        setIsClaimingRewardsAndRedeeming(true);

        try {
            await handleClickOnClaimRewardsAndRedeem();
        } finally {
            setIsClaimingRewardsAndRedeeming(false);
        }
    };

    const handleSort = (key: 'size' | 'duration') => {
        setSortConfig((prev) => ({
            ...prev,
            [key]: prev[key] === 'desc' ? 'asc' : 'desc',
            lastClicked: key,
        }));
    };

    const totalStakeAmount = totalLockedStake ?? 0;
    const isBigStakeAmount = totalStakeAmount > 1000000;

    const allTimeClaimedUsdc =
        alpClaimHistory?.allTimeRewardsUsdc ?? 0;
    const allTimeClaimedAdx =
        (alpClaimHistory?.allTimeRewardsAdx ?? 0) + (alpClaimHistory?.allTimeRewardsAdxGenesis ?? 0);

    const adxValueAtClaim = alpClaimHistory?.claims.reduce(
        (sum, claim) => sum + (claim.rewards_adx + claim.rewards_adx_genesis) * claim.adx_price_at_claim,
        0,
    ) ?? 0;

    const calculateMedianStakedTime = sortedLockedStakes.reduce((median, lockedStake) => {
        const amount = nativeToUi(lockedStake.amount, 6);
        return {
            acc: median.acc + amount * (fullyLiquidALPStaking.getTime() - lockedStake.stakeTime.toNumber() * 1000),
            total: median.total + amount,
        };
    }, {
        acc: 0,
        total: 0,
    });

    const medianStakedTime = calculateMedianStakedTime.total ? calculateMedianStakedTime.acc / calculateMedianStakedTime.total : 0;

    return (
        <div className="flex flex-col bg-main rounded-md border">
            <div className="p-5 pb-0">
                <div className="flex flex-col h-full w-full bg-gradient-to-br from-[#07111A] to-[#0B1722] border rounded-md shadow-lg">
                    <span className='text-lg font-boldy ml-auto mr-auto mt-2'>Attention: ALP is becoming fully liquid</span>

                    <div className="h-[1px] bg-bcolor w-full my-2" />

                    <p className="opacity-75 text-base p-3 flex flex-col gap-2 text-center">
                        <span className='text-base'>Starting 19th march 2025, 12:00 UTC, ALP becomes fully liquid and ALP staking system is discontinued.</span>

                        <span className='text-base'>All existing stakes to be unlocked for free (no more liquidity mining nor USDC yield redistributed).</span>

                        <span className='text-base'>Fully liquid ALP will enable DeFi integrations like looping and other strategies while boosting native yield through autocompounding.</span>
                    </p>

                    <div className="h-[1px] bg-bcolor w-full my-2" />

                    <Link
                        href="https://discord.com/channels/1231790358988455986/1336166417027825724"
                        target='_blank'
                        className='mb-4 flex items-center justify-center cursor-pointer '
                    >
                        <span className='text-sm border-dashed border-b w-auto text-white border-white opacity-40 hover:opacity-100'>Read discord conversation</span>
                    </Link>

                    <div
                        className={twMerge(
                            'flex w-full rounded-bl-lg rounded-br-lg p-3 items-center justify-center flex-none border-t bg-[#130AAA] relative overflow-hidden',
                        )}
                    >
                        <div className="flex flex-row items-center gap-6">
                            <div>
                                <p className="opacity-50 text-base">Total staked</p>
                                <FormatNumber
                                    nb={totalStakeAmount}
                                    minimumFractionDigits={totalStakeAmount < 1000 ? 2 : 0}
                                    precision={totalStakeAmount < 1000 ? 2 : 0}
                                    precisionIfPriceDecimalsBelow={
                                        totalStakeAmount < 1000 ? 2 : 0
                                    }
                                    isAbbreviate={isBigStakeAmount}
                                    suffix={'ALP'}
                                    className="text-2xl cursor-pointer"
                                    info={
                                        isBigStakeAmount
                                            ? formatNumber(totalStakeAmount, 2, 2)
                                            : undefined
                                    }
                                />
                            </div>

                            <Image
                                src={alpLogo}
                                width={100}
                                height={100}
                                className="opacity-10 absolute right-0 top-0"
                                alt={`ALP logo`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='w-full items-center justify-center flex mt-6'>
                <Button
                    variant="primary"
                    size="sm"
                    title={isClaimingRewardsAndRedeeming ? 'Claiming and redeeming...' : 'Claim rewards and redeem'}
                    className="px-5 w-[90%]"
                    onClick={handleClaim}
                />
            </div>

            {/* Pending rewards block */}
            <div className="h-[1px] bg-bcolor w-full my-3" />

            <div className="px-5">
                <div className="flex items-center mb-4 justify-center">
                    <h3 className="text-lg font-semibold">Pending Rewards</h3>
                </div>

                <div className="flex flex-col border bg-secondary rounded-md shadow-lg overflow-hidden">
                    {/* Pending rewards block */}
                    <div className="flex-grow"></div>
                    <div className="flex flex-col border p-3 bg-secondary rounded-md shadow-lg">
                        <div className="flex flex-col space-y-1 flex-grow">
                            <div className="flex justify-between">
                                <span className="text-txtfade">
                                    Your share of 70% platform&apos;s
                                    revenue:
                                </span>
                                <div className="flex items-center">
                                    <FormatNumber nb={userPendingUsdcRewards} />
                                    <Image
                                        src={usdcTokenLogo}
                                        width={16}
                                        height={16}
                                        className="ml-1 opacity-50"
                                        alt="usdc token logo"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-txtfade">
                                    LM rewards
                                </span>
                                <div className="flex items-center">
                                    <FormatNumber nb={userPendingAdxRewards} />
                                    <Image
                                        src={adxTokenLogo}
                                        width={16}
                                        height={16}
                                        className="ml-1 opacity-50"
                                        alt="adx token logo"
                                    />
                                </div>
                            </div>
                            {pendingGenesisAdxRewards > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-txtfade">
                                        Genesis campaign LM rewards bonus
                                        <Tippy
                                            content={
                                                <p>
                                                    These rewards accrue over time for the first 180
                                                    days of the protocol. The amount is proportional to
                                                    your participation in the Genesis Liquidity
                                                    campaign. <br />
                                                    <br /> Thank you for being an early supporter of the
                                                    protocol! 🎊 🎁
                                                </p>
                                            }
                                            placement="auto"
                                        >
                                            <Image
                                                src={infoIcon}
                                                width={14}
                                                height={14}
                                                alt="info icon"
                                                className="inline-block ml-1 mr-1 cursor-pointer"
                                            />
                                        </Tippy>
                                        :
                                    </span>
                                    <div className="flex items-center">
                                        <FormatNumber
                                            nb={pendingGenesisAdxRewards}
                                            className="text-green"
                                            prefix="+"
                                            isDecimalDimmed={false}
                                        />
                                        <Image
                                            src={adxTokenLogo}
                                            width={16}
                                            height={16}
                                            className="ml-1 opacity-50"
                                            alt="adx token logo"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className='mt-4'>
                <div className="px-4 flex justify-center">
                    <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold">Your ALP STATISTICS</h3>
                    </div>
                </div>

                <Tippy
                    trigger='mouseenter'
                    content='Median staked time.'>
                    <div className='text-txtfade text-sm w-full flex items-center justify-center mb-4'>
                        Staked for {formatMilliseconds(medianStakedTime)}
                    </div>
                </Tippy>

                <div className='flex pr-4 pl-4 gap-4 mb-4'>
                    <NumberDisplay
                        title='Total Rewards'
                        nb={allTimeClaimedUsdc + adxValueAtClaim}
                        precision={0}
                        format='number'
                        suffix='USDC'
                        className=''
                        bodyClassName='text-base'
                    />

                    <NumberDisplay
                        title='One ALP Yield'
                        nb={(allTimeClaimedUsdc + adxValueAtClaim) / totalStakeAmount}
                        precision={5}
                        format='number'
                        suffix='USDC'
                        className=''
                        bodyClassName='text-base'
                    />
                </div>

                <div className='flex pr-4 pl-4 gap-4 flex-wrap'>
                    <NumberDisplay
                        title='USDC Rewards'
                        nb={allTimeClaimedUsdc}
                        precision={0}
                        format='number'
                        suffix='USDC'
                        className=''
                        bodyClassName='text-base'
                    />

                    <NumberDisplay
                        title='LM Rewards'
                        nb={allTimeClaimedAdx}
                        precision={0}
                        format='number'
                        suffix='ADX'
                        className=''
                        bodyClassName='text-base'
                    />

                    <NumberDisplay
                        tippyInfo="The value of the ADX rewards at the time of claim."
                        title='LM Usd Value'
                        nb={adxValueAtClaim}
                        precision={0}
                        format='currency'
                        className=''
                        bodyClassName='text-base'
                    />
                </div>
            </div>

            <div className="h-[1px] bg-bcolor w-full my-4" />

            <div className='text-xs ml-auto mr-auto cursor-pointer text-txtfade hover:text-white mt-2 mb-6' onClick={() => setShowMoreStakingInfo(!showMoreStakingInfo)}>
                {!showMoreStakingInfo ? 'Show more information about my stakes' : 'Hide additional information about my stakes'}
            </div>

            {showMoreStakingInfo ? <div className="h-[1px] bg-bcolor w-full my-2" /> : null}

            {
                showMoreStakingInfo ? <div className="flex flex-col h-full mt-4">
                    {/* Claims history section */}
                    {/* ok to do double call to the data here since it should not be used anymore */}
                    <ClaimHistorySection
                        token="ALP"
                        walletAddress={walletAddress}
                    />

                    <div className="h-[1px] bg-bcolor w-full my-4" />

                    {/* Locked stakes section */}
                    <div className="px-5 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold mr-2">My Locked Stakes</h3>
                                <h3 className="text-lg font-semibold text-txtfade">
                                    {lockedStakes?.length ? ` (${lockedStakes.length})` : ''}
                                </h3>
                            </div>

                            <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-col sm:flex-row w-full sm:w-auto">
                                <div className="flex items-center text-xs bg-secondary rounded-full p-[2px] border border-bcolor">
                                    <button
                                        className="px-2 py-1 rounded-full transition-colors flex items-center"
                                        onClick={() => handleSort('size')}
                                    >
                                        Amount
                                        <span className="ml-1 text-txtfade text-[10px]">
                                            {sortConfig.size === 'asc' ? '↑' : '↓'}
                                        </span>
                                    </button>
                                    <div className="w-px h-4 bg-bcolor mx-[1px]"></div>
                                    <button
                                        className="px-2 py-1 rounded-full transition-colors flex items-center"
                                        onClick={() => handleSort('duration')}
                                    >
                                        Unlock Date
                                        <span className="ml-1 text-txtfade text-[10px]">
                                            {sortConfig.duration === 'asc' ? '↑' : '↓'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <LockedStakes
                            lockedStakes={sortedLockedStakes}
                            className='gap-3 mt-4'
                            handleRedeem={handleLockedStakeRedeem}
                            handleClickOnUpdateLockedStake={
                                () => {
                                    // Nothing
                                }
                            }
                        />
                    </div>
                </div> : null
            }
        </div >
    );
}
