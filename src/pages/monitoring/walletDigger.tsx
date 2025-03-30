import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputString from '@/components/common/inputString/InputString';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import Pagination from '@/components/common/Pagination/Pagination';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import TradingStats from '@/components/pages/profile/TradingStats';
import UserRelatedAdrenaAccounts from '@/components/pages/profile/UserRelatedAdrenaAccounts';
import VestStats from '@/components/pages/profile/VestStats';
import ClaimBlock from '@/components/pages/stake/ClaimBlock';
import LockedStakes from '@/components/pages/stake/LockedStakes';
import PositionBlock from '@/components/pages/trading/Positions/PositionBlock';
import PositionsHistory from '@/components/pages/trading/Positions/PositionsHistory';
import useClaimHistory from '@/hooks/useClaimHistory';
import usePositionsByAddress from '@/hooks/usePositionsByAddress';
import useTraderInfo from '@/hooks/useTraderInfo';
import useUserProfile from '@/hooks/useUserProfile';
import useUserVest from '@/hooks/useUserVest';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { ClaimHistoryExtended, LockedStakeExtended, PageProps } from '@/types';
import { getAdxLockedStakes, getAlpLockedStakes, nativeToUi } from '@/utils';

import chevronDown from '../../../public/images/chevron-down.svg';
import shovelMonster from '../../../public/images/shovel-monster.png';
import Achievements from '../achievements';

const claimHistoryItemsPerPage = 4;

export default function WalletDigger({
    view,
    ...props
}: {
    view: string;
} & PageProps) {
    const [moreStakingInfo, setMoreStakingInfo] = useState(false);
    const [morePositionInfo, setMorePositionInfo] = useState(false);

    const [targetWallet, setTargetWallet] = useState<string | null>(null);
    const [targetWalletPubkey, setTargetWalletPubkey] = useState<PublicKey | null>(null);

    const { userProfile } = useUserProfile(targetWalletPubkey ? targetWalletPubkey.toBase58() : null);
    const { userVest } = useUserVest(targetWalletPubkey ? targetWalletPubkey.toBase58() : null);

    const positions = usePositionsByAddress({
        walletAddress: targetWalletPubkey ? targetWalletPubkey.toBase58() : null,
    });

    const { traderInfo } = useTraderInfo({
        walletAddress: targetWalletPubkey ? targetWalletPubkey.toBase58() : null,
    });

    //
    // Staking
    //
    const {
        stakingAccounts,
    } = useWalletStakingAccounts(targetWalletPubkey ? targetWalletPubkey.toBase58() : null);

    const adxLockedStakes: LockedStakeExtended[] | null =
        getAdxLockedStakes(stakingAccounts);

    const alpLockedStakes: LockedStakeExtended[] | null =
        getAlpLockedStakes(stakingAccounts);

    const {
        claimsHistoryAdx,
        claimsHistoryAlp,
    } = useClaimHistory(targetWalletPubkey ? targetWalletPubkey.toBase58() : null);

    const allTimeClaimedUsdc =
        useMemo(() => (claimsHistoryAdx?.reduce((sum, claim) => sum + claim.rewards_usdc, 0) ?? 0) + (claimsHistoryAlp?.reduce((sum, claim) => sum + claim.rewards_usdc, 0) ?? 0), [claimsHistoryAdx, claimsHistoryAlp]);

    const allTimeClaimedAdx = useMemo(() =>
        (claimsHistoryAdx?.reduce(
            (sum, claim) => sum + claim.rewards_adx,
            0,
        ) ?? 0) + (claimsHistoryAlp?.reduce(
            (sum, claim) => sum + claim.rewards_adx + claim.rewards_adx_genesis,
            0,
        ) ?? 0), [claimsHistoryAdx, claimsHistoryAlp]);

    const totalStakedAdx = useMemo(() => adxLockedStakes?.reduce((sum, stake) => sum + nativeToUi(stake.amount, window.adrena.client.adxToken.decimals), 0) ?? 0, [adxLockedStakes]);
    const totalStakedAlp = useMemo(() => alpLockedStakes?.reduce((sum, stake) => sum + nativeToUi(stake.amount, window.adrena.client.alpToken.decimals), 0) ?? 0, [alpLockedStakes]);

    const [adxClaimHistoryCurrentPage, setAdxClaimHistoryCurrentPage] = useState(1);
    const [paginatedAdxClaimsHistory, setPaginatedAdxClaimsHistory] = useState<ClaimHistoryExtended[]>([]);

    useEffect(() => {
        if (view !== 'walletDigger') return;

        if (!claimsHistoryAdx) {
            return setPaginatedAdxClaimsHistory([]);
        }

        const startIndex = (adxClaimHistoryCurrentPage - 1) * claimHistoryItemsPerPage;
        const endIndex = startIndex + claimHistoryItemsPerPage;
        setPaginatedAdxClaimsHistory(claimsHistoryAdx.slice(startIndex, endIndex));
    }, [claimsHistoryAdx, adxClaimHistoryCurrentPage, view]);

    //

    const [alpClaimHistoryCurrentPage, setAlpClaimHistoryCurrentPage] = useState(1);
    const [paginatedAlpClaimsHistory, setPaginatedAlpClaimsHistory] = useState<ClaimHistoryExtended[]>([]);

    useEffect(() => {
        if (view !== 'walletDigger') return;

        if (!claimsHistoryAlp) {
            return setPaginatedAlpClaimsHistory([]);
        }

        const startIndex = (alpClaimHistoryCurrentPage - 1) * claimHistoryItemsPerPage;
        const endIndex = startIndex + claimHistoryItemsPerPage;
        setPaginatedAlpClaimsHistory(claimsHistoryAlp.slice(startIndex, endIndex));
    }, [claimsHistoryAlp, alpClaimHistoryCurrentPage, view]);

    //
    //
    //

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        // Load `wallet` from URL when the page loads
        if (searchParams.has('wallet')) {
            const walletFromURL = searchParams.get('wallet');
            if (walletFromURL) {
                setTargetWallet(walletFromURL);

                try {
                    const pubkey = new PublicKey(walletFromURL);
                    setTargetWalletPubkey(pubkey);
                } catch {
                    setTargetWalletPubkey(null);
                }
            }
        }
    }, []);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        if (targetWallet) {
            // Update the URL with the `wallet` query parameter
            searchParams.set('wallet', targetWallet);
            window.history.replaceState(
                null,
                '',
                `${window.location.pathname}?${searchParams.toString()}`
            );
        } else {
            // Remove the `wallet` query parameter if the wallet is cleared
            searchParams.delete('wallet');
            window.history.replaceState(
                null,
                '',
                `${window.location.pathname}?${searchParams.toString()}`
            );
        }
    }, [targetWallet]);

    useEffect(() => {
        if (targetWallet) {
            try {
                const pubkey = new PublicKey(targetWallet);
                setTargetWalletPubkey(pubkey);
            } catch {
                setTargetWalletPubkey(null);
            }
        } else {
            setTargetWalletPubkey(null);
        }
    }, [targetWallet]);

    const seeDetails = (v: boolean, setV: (v: boolean) => void) => <div className='bg-third flex items-center justify-center text-sm p-1 cursor-pointer opacity-90 hover:opacity-100 mt-2' onClick={() => {
        setV(!v);
    }}>
        {v ? 'hide' : 'see'} details

        <Image
            className={twMerge(
                `h-6 w-6`,
                v ? 'transform rotate-180 transition-all duration-1000 ease-in-out' : '',
            )}
            src={chevronDown}
            height={60}
            width={60}
            alt="Chevron down"
        />
    </div>;

    return <div className="flex flex-col gap-2 p-2 w-full">
        <StyledContainer className="p-4 w-full relative overflow-hidden">
            <div className="flex flex-col w-full items-center justify-center gap-2 relative h-[15em]">
                <div>Target Wallet</div>

                {targetWalletPubkey ? <OnchainAccountInfo iconClassName="w-[0.7em] h-[0.7em] ml-4" address={targetWalletPubkey} noAddress={true} className='absolute right-2 top-2' /> : null}

                <InputString
                    value={targetWallet ?? ''}
                    onChange={setTargetWallet}
                    placeholder="i.e 9zXR1TckFZRt6aVnJZfJ4JrG6WQFr4YZ3ouAgz9AcfST"
                    className="text-center w-[40em] max-w-full bg-inputcolor border rounded-xl p-2"
                    inputFontSize="0.7em"
                />

                <div className={twMerge('text-sm', !targetWallet?.length ? 'opacity-0' : 'opacity-50 hover:opacity-100 cursor-pointer')} onClick={() => {
                    setTargetWalletPubkey(null);
                    setTargetWallet(null);
                }}>reset</div>
            </div>

            <Image
                className="h-[15em] w-[15em] absolute -bottom-2 right-0 -z-10 opacity-40 grayscale"
                src={shovelMonster}
                height={600}
                width={600}
                alt="Shovel monster"
            />
        </StyledContainer >

        {targetWalletPubkey ? <StyledContainer className="p-2 w-full" bodyClassName='gap-1'>
            <UserRelatedAdrenaAccounts
                className="h-auto flex mt-auto rounded-lg"
                userProfile={userProfile ?? false}
                userVest={userVest ? userVest : null}
                positions={positions}
                stakingAccounts={stakingAccounts}
            />
        </StyledContainer > : null}

        {
            targetWalletPubkey ? <StyledContainer className="p-2 w-full relative" bodyClassName='gap-1'>
                <h1 className='ml-auto mr-auto'>STAKING</h1>

                {moreStakingInfo ? <div className='absolute top-2 right-2 cursor-pointer text-txtfade text-sm underline pr-2' onClick={() => setMoreStakingInfo(false)}>hide details</div> : null}

                <div className='w-full h-[1px] bg-bcolor mt-2' />

                <div className='flex gap-y-4 mt-2 flex-wrap'>
                    <NumberDisplay
                        title="LIQUID STAKED ADX"
                        nb={stakingAccounts?.ADX?.liquidStake.amount ? nativeToUi(stakingAccounts.ADX.liquidStake.amount, window.adrena.client.adxToken.decimals) : 0}
                        format="number"
                        suffix='ADX'
                        precision={0}
                        className='border-0 min-w-[12em]'
                        bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
                        headerClassName='pb-2'
                        titleClassName='text-[0.7em] sm:text-[0.7em]'
                    />

                    <NumberDisplay
                        title="LOCKED STAKED ADX"
                        nb={totalStakedAdx}
                        format="number"
                        suffix='ADX'
                        precision={0}
                        className='border-0 min-w-[12em]'
                        bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
                        headerClassName='pb-2'
                        titleClassName='text-[0.7em] sm:text-[0.7em]'
                    />

                    <NumberDisplay
                        title="LOCKED STAKED ALP"
                        nb={totalStakedAlp}
                        format="number"
                        suffix='ALP'
                        precision={0}
                        className='border-0 min-w-[12em]'
                        bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
                        headerClassName='pb-2'
                        titleClassName='text-[0.7em] sm:text-[0.7em]'
                    />

                    <NumberDisplay
                        title="TOTAL CLAIMED USDC"
                        nb={allTimeClaimedUsdc}
                        format="currency"
                        precision={0}
                        className='border-0 min-w-[12em]'
                        bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
                        headerClassName='pb-2'
                        titleClassName='text-[0.7em] sm:text-[0.7em]'
                    />

                    <NumberDisplay
                        title="TOTAL CLAIMED ADX"
                        nb={allTimeClaimedAdx}
                        format="number"
                        suffix='ADX'
                        precision={0}
                        className='border-0 min-w-[12em]'
                        bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
                        headerClassName='pb-2'
                        titleClassName='text-[0.7em] sm:text-[0.7em]'
                    />
                </div>

                {moreStakingInfo ? <>
                    <div className='w-full h-[1px] bg-bcolor mt-2' />

                    <h4 className='ml-4 mt-4'>Staking List</h4>

                    <div className='flex w-full pl-4 pr-4'>
                        <div className='flex flex-col w-full'>
                            <div className='flex w-full gap-4 flex-wrap'>
                                {adxLockedStakes ? <LockedStakes
                                    readonly={true}
                                    lockedStakes={adxLockedStakes}
                                    className='gap-3 mt-4 w-[25em] grow'
                                    handleRedeem={() => { /* readonly */ }}
                                    handleClickOnFinalizeLockedRedeem={() => { /* readonly */ }}
                                    handleClickOnUpdateLockedStake={() => { /* readonly */ }}
                                /> : null}

                                {alpLockedStakes ? <LockedStakes
                                    readonly={true}
                                    lockedStakes={alpLockedStakes}
                                    className='gap-3 mt-4 w-[25em] grow'
                                    handleRedeem={() => { /* readonly */ }}
                                    handleClickOnFinalizeLockedRedeem={() => { /* readonly */ }}
                                    handleClickOnUpdateLockedStake={() => { /* readonly */ }}
                                /> : null}
                            </div>

                            <div className='flex w-full gap-4 mt-2 flex-wrap'>
                                <div className='flex flex-col w-[30em] grow'>
                                    <h4 className='ml-4 mt-4 mb-4'>ADX Staking claim history</h4>

                                    {paginatedAdxClaimsHistory?.map((claim) => <ClaimBlock key={claim.claim_id} claim={claim} />)}

                                    <Pagination
                                        currentPage={adxClaimHistoryCurrentPage}
                                        totalItems={claimsHistoryAdx ? claimsHistoryAdx.length : 0}
                                        itemsPerPage={claimHistoryItemsPerPage}
                                        onPageChange={setAdxClaimHistoryCurrentPage}
                                    />
                                </div>

                                <div className='flex flex-col w-[30em] grow'>
                                    <h4 className='ml-4 mt-4 mb-4'>ALP Staking claim history</h4>

                                    {paginatedAlpClaimsHistory?.map((claim) => <ClaimBlock key={claim.claim_id} claim={claim} />)}

                                    <Pagination
                                        currentPage={alpClaimHistoryCurrentPage}
                                        totalItems={claimsHistoryAlp ? claimsHistoryAlp.length : 0}
                                        itemsPerPage={claimHistoryItemsPerPage}
                                        onPageChange={setAlpClaimHistoryCurrentPage}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </> : null}

                {seeDetails(moreStakingInfo, setMoreStakingInfo)}
            </StyledContainer> : null
        }

        {
            targetWalletPubkey ? <StyledContainer className="p-2 w-full relative" bodyClassName='gap-1'>
                <h1 className='ml-auto mr-auto'>POSITIONS</h1>

                {morePositionInfo ? <div className='absolute top-2 right-2 cursor-pointer text-txtfade text-sm underline pr-2' onClick={() => setMorePositionInfo(false)}>hide details</div> : null}

                {userProfile ? <>
                    <TradingStats
                        traderInfo={traderInfo}
                        livePositionsNb={positions === null ? null : positions.length}
                        className="gap-y-4 mb-2"
                    />

                    <div className='w-full h-[1px] bg-bcolor mt-2' />
                </> : null}

                {morePositionInfo ? <>
                    <div className='w-full h-[1px] bg-bcolor mt-2' />

                    <h4 className='ml-4 mt-4 mb-4'>Live Positions</h4>

                    <div className='flex flex-col w-full pl-4 pr-4'>
                        <div className="flex flex-wrap justify-between gap-2">
                            {positions !== null && positions.length ? (
                                <div className="flex flex-col w-full gap-2">
                                    {positions.map((position) => (
                                        <PositionBlock
                                            readOnly={true}
                                            key={position.pubkey.toBase58()}
                                            position={position}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center w-full py-4 opacity-50">
                                    No positions 📭
                                </div>
                            )}
                        </div>
                    </div>

                    <h4 className='ml-4 mt-4 mb-4'>History</h4>

                    <div className='flex flex-col w-full pl-4 pr-4'>
                        <PositionsHistory
                            walletAddress={targetWalletPubkey?.toBase58() ?? null}
                            connected={true}
                            exportButtonPosition='bottom-left'
                        />
                    </div></> : null}

                {seeDetails(morePositionInfo, setMorePositionInfo)}
            </StyledContainer> : null
        }

        {
            targetWalletPubkey && userVest ? <StyledContainer className="p-2 w-full" bodyClassName='gap-1'>
                <VestStats vest={userVest} readonly={true} />
            </StyledContainer> : null
        }

        {targetWalletPubkey && userProfile ? <Achievements {...props} userProfile={userProfile} defaultSort='points' defaultShowOwned={true} defaultShowNotOwned={false} /> : null}
    </div >;
}
