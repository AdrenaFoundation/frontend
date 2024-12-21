import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputString from '@/components/common/inputString/InputString';
import Pagination from '@/components/common/Pagination/Pagination';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import UserRelatedAdrenaAccounts from '@/components/pages/my_dashboard/UserRelatedAdrenaAccounts';
import ClaimBlock from '@/components/pages/stake/ClaimBlock';
import LockedStakes from '@/components/pages/stake/LockedStakes';
import Positions from '@/components/pages/trading/Positions/Positions';
import PositionsHistory from '@/components/pages/trading/Positions/PositionsHistory';
import VestStats from '@/components/pages/user_profile/Veststats';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useClaimHistory from '@/hooks/useClaimHistory';
import usePositions from '@/hooks/usePositions';
import useUserProfile from '@/hooks/useUserProfile';
import useUserVest from '@/hooks/useUserVest';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { ClaimHistoryExtended, LockedStakeExtended } from '@/types';
import { getAdxLockedStakes, getAlpLockedStakes } from '@/utils';

import chevronDown from '../../../public/images/chevron-down.svg';

const claimHistoryItemsPerPage = 4;

export default function WalletDigger({
    showFeesInPnl
}: {
    showFeesInPnl: boolean;
}) {
    const [moreStakingInfo, setMoreStakingInfo] = useState(false);
    const [morePositionInfo, setMorePositionInfo] = useState(false);
    const isBigScreen = useBetterMediaQuery('(min-width: 1100px)');

    const [targetWallet, setTargetWallet] = useState<string | null>(null);
    const [targetWalletPubkey, setTargetWalletPubkey] = useState<PublicKey | null>(null);

    const { userProfile } = useUserProfile(targetWalletPubkey ? targetWalletPubkey.toBase58() : null);
    const { userVest } = useUserVest(targetWalletPubkey ? targetWalletPubkey.toBase58() : null);

    const positions = usePositions(targetWalletPubkey ? targetWalletPubkey.toBase58() : null);

    //
    // Staking
    //
    const {
        stakingAccounts,
    } = useWalletStakingAccounts();

    const adxLockedStakes: LockedStakeExtended[] | null =
        getAdxLockedStakes(stakingAccounts);

    const alpLockedStakes: LockedStakeExtended[] | null =
        getAlpLockedStakes(stakingAccounts);

    const {
        claimsHistoryAdx,
        claimsHistoryAlp,
    } = useClaimHistory();

    const [adxClaimHistoryCurrentPage, setAdxClaimHistoryCurrentPage] = useState(1);
    const [paginatedAdxClaimsHistory, setPaginatedAdxClaimsHistory] = useState<ClaimHistoryExtended[]>([]);

    useEffect(() => {
        if (!claimsHistoryAdx) {
            return setPaginatedAdxClaimsHistory([]);
        }

        const startIndex = (adxClaimHistoryCurrentPage - 1) * claimHistoryItemsPerPage;
        const endIndex = startIndex + claimHistoryItemsPerPage;
        setPaginatedAdxClaimsHistory(claimsHistoryAdx.slice(startIndex, endIndex));
    }, [claimsHistoryAdx, adxClaimHistoryCurrentPage]);

    //

    const [alpClaimHistoryCurrentPage, setAlpClaimHistoryCurrentPage] = useState(1);
    const [paginatedAlpClaimsHistory, setPaginatedAlpClaimsHistory] = useState<ClaimHistoryExtended[]>([]);

    useEffect(() => {
        if (!claimsHistoryAlp) {
            return setPaginatedAlpClaimsHistory([]);
        }

        const startIndex = (alpClaimHistoryCurrentPage - 1) * claimHistoryItemsPerPage;
        const endIndex = startIndex + claimHistoryItemsPerPage;
        setPaginatedAlpClaimsHistory(claimsHistoryAlp.slice(startIndex, endIndex));
    }, [claimsHistoryAlp, alpClaimHistoryCurrentPage]);

    //
    //
    //

    console.log('VEST', userVest)

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
        <StyledContainer className="p-4 w-full">
            <div className="flex flex-col w-full items-center justify-center gap-2 relative">
                <div>Target Wallet</div>

                {targetWalletPubkey ? <OnchainAccountInfo iconClassName="w-[0.7em] h-[0.7em] ml-4" address={targetWalletPubkey} noAddress={true} className='absolute right-2 top-2' /> : null}

                <InputString
                    value={targetWallet ?? ''}
                    onChange={setTargetWallet}
                    placeholder="i.e 9zXR1TckFZRt6aVnJZfJ4JrG6WQFr4YZ3ouAgz9AcfST"
                    className="text-center w-[40em] max-w-full bg-inputcolor border rounded-xl p-2"
                    inputFontSize="0.7em"
                />
            </div>
        </StyledContainer>

        {!targetWalletPubkey ?
            <StyledContainer className="p-4 w-full h-[15em] items-center justify-center">
                <h4 className='m-auto'>Enter a valid wallet address to start digging</h4>
            </StyledContainer> : null}

        {targetWalletPubkey ? <StyledContainer className="p-2 w-full" bodyClassName='gap-1'>
            <UserRelatedAdrenaAccounts
                className="h-auto flex mt-auto rounded-lg"
                userProfile={userProfile ?? false}
                userVest={userVest ? userVest : null}
                positions={positions}
            />
        </StyledContainer> : null}

        {targetWalletPubkey ? <StyledContainer className="p-2 w-full relative" bodyClassName='gap-1'>
            <h1 className='ml-auto mr-auto'>STAKING</h1>

            {moreStakingInfo ? <div className='absolute top-2 right-2 cursor-pointer text-txtfade text-sm underline pr-2' onClick={() => setMoreStakingInfo(false)}>hide details</div> : null}

            {moreStakingInfo ? <>
                <div className='w-full h-[1px] bg-bcolor mt-2' />

                <h4 className='ml-4 mt-4'>Staking List</h4>

                <div className='flex w-full pl-4 pr-4'>
                    <div className='flex flex-col w-full'>
                        <div className='flex w-full gap-4'>
                            {adxLockedStakes ? <LockedStakes
                                readonly={true}
                                lockedStakes={adxLockedStakes}
                                className='gap-3 mt-4 w-full'
                                handleRedeem={() => { /* readonly */ }}
                                handleClickOnFinalizeLockedRedeem={() => { /* readonly */ }}
                                handleClickOnUpdateLockedStake={() => { /* readonly */ }}
                            /> : null}

                            {alpLockedStakes ? <LockedStakes
                                readonly={true}
                                lockedStakes={alpLockedStakes}
                                className='gap-3 mt-4 w-full'
                                handleRedeem={() => { /* readonly */ }}
                                handleClickOnFinalizeLockedRedeem={() => { /* readonly */ }}
                                handleClickOnUpdateLockedStake={() => { /* readonly */ }}
                            /> : null}
                        </div>

                        <div className='flex w-full gap-4 mt-2'>
                            <div className='flex flex-col w-full'>
                                <h4 className='ml-4 mt-4 mb-4'>ADX Staking claim history</h4>

                                {paginatedAdxClaimsHistory?.map((claim) => <ClaimBlock key={claim.claim_id} claim={claim} />)}

                                <Pagination
                                    currentPage={adxClaimHistoryCurrentPage}
                                    totalItems={claimsHistoryAdx ? claimsHistoryAdx.length : 0}
                                    itemsPerPage={claimHistoryItemsPerPage}
                                    onPageChange={setAdxClaimHistoryCurrentPage}
                                />
                            </div>

                            <div className='flex flex-col w-full'>
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
        </StyledContainer> : null}

        {targetWalletPubkey ? <StyledContainer className="p-2 w-full relative" bodyClassName='gap-1'>
            <h1 className='ml-auto mr-auto'>POSITIONS</h1>

            {morePositionInfo ? <div className='absolute top-2 right-2 cursor-pointer text-txtfade text-sm underline pr-2' onClick={() => setMorePositionInfo(false)}>hide details</div> : null}

            {morePositionInfo ? <>
                <div className='w-full h-[1px] bg-bcolor mt-2' />

                <h4 className='ml-4 mt-4 mb-4'>Live Positions</h4>

                <div className='flex flex-col w-full pl-4 pr-4'>
                    <Positions
                        connected={false}
                        positions={positions}
                        triggerUserProfileReload={() => {/* readonly */ }}
                        isBigScreen={isBigScreen}
                        showFeesInPnl={showFeesInPnl}
                    />
                </div>

                <h4 className='ml-4 mt-4 mb-4'>History</h4>

                <div className='flex flex-col w-full pl-4 pr-4'>
                    <PositionsHistory
                        connected={true}
                        showFeesInPnl={showFeesInPnl}
                    />
                </div></> : null}

            {seeDetails(morePositionInfo, setMorePositionInfo)}
        </StyledContainer> : null}

        {targetWalletPubkey && userVest ? <StyledContainer className="p-2 w-full" bodyClassName='gap-1'>
            <VestStats vest={userVest} readonly={true} />
        </StyledContainer> : null}
    </div >;
}
