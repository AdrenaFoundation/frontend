import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputString from '@/components/common/inputString/InputString';
import Modal from '@/components/common/Modal/Modal';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import Pagination from '@/components/common/Pagination/Pagination';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import Loader from '@/components/Loader/Loader';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import RankingStats from '@/components/pages/profile/RankingStats';
import TradingStats from '@/components/pages/profile/TradingStats';
import UserRelatedAdrenaAccounts from '@/components/pages/profile/UserRelatedAdrenaAccounts';
import VestStats from '@/components/pages/profile/VestStats';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import ClaimBlock from '@/components/pages/stake/ClaimBlock';
import LockedStakes from '@/components/pages/stake/LockedStakes';
import PositionBlock from '@/components/pages/trading/Positions/PositionBlock';
import PositionsHistory from '@/components/pages/trading/Positions/PositionsHistory';
import { useAllUserProfiles } from '@/hooks/useAllUserProfiles';
import useClaimHistory from '@/hooks/useClaimHistory';
import usePositionsByAddress from '@/hooks/usePositionsByAddress';
import useSNSPrimaryDomain from '@/hooks/useSNSPrimaryDomain';
import useTraderInfo from '@/hooks/useTraderInfo';
import useUserProfile from '@/hooks/useUserProfile';
import useUserVest from '@/hooks/useUserVest';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import {
  ClaimHistoryExtended,
  LockedStakeExtended,
  PageProps,
  UserProfileExtended,
} from '@/types';
import { getAdxLockedStakes, getAlpLockedStakes, nativeToUi } from '@/utils';

import chevronDown from '../../../public/images/chevron-down.svg';
import shovelMonster from '../../../public/images/shovel-monster.png';
import snsBadgeIcon from '../../../public/images/sns-badge.svg';
import Achievements from '../achievements';

const claimHistoryItemsPerPage = 4;

export default function WalletDigger({
  view,
  ...props
}: {
  view: string;
} & PageProps) {
  const [activeProfile, setActiveProfile] =
    useState<UserProfileExtended | null>(null);
  const [moreStakingInfo, setMoreStakingInfo] = useState(false);
  const [morePositionInfo, setMorePositionInfo] = useState(false);

  const [targetWallet, setTargetWallet] = useState<string | null>(null);
  const [targetWalletPubkey, setTargetWalletPubkey] =
    useState<PublicKey | null>(null);
  const snsDomain = useSNSPrimaryDomain(targetWalletPubkey?.toBase58());

  const { userProfile } = useUserProfile(
    targetWalletPubkey ? targetWalletPubkey.toBase58() : null,
  );
  const { userVest } = useUserVest(
    targetWalletPubkey ? targetWalletPubkey.toBase58() : null,
  );

  const { allUserProfiles: allRefereesProfiles } = useAllUserProfiles({
    referrerProfileFilter: userProfile ? userProfile.pubkey : null,
  });

  const positions = usePositionsByAddress({
    walletAddress: targetWalletPubkey ? targetWalletPubkey.toBase58() : null,
  });

  const { traderInfo, expanseRanking, awakeningRanking } = useTraderInfo({
    walletAddress: targetWalletPubkey ? targetWalletPubkey.toBase58() : null,
  });

  //
  // Staking
  //
  const { stakingAccounts } = useWalletStakingAccounts(
    targetWalletPubkey ? targetWalletPubkey.toBase58() : null,
  );

  const adxLockedStakes: LockedStakeExtended[] | null =
    getAdxLockedStakes(stakingAccounts);

  const alpLockedStakes: LockedStakeExtended[] | null =
    getAlpLockedStakes(stakingAccounts);

  const {
    claimsHistory: claimsHistoryAdxApi,
    isLoadingClaimHistory: isLoadingClaimHistoryAdx,
  } = useClaimHistory({
    walletAddress: targetWalletPubkey ? targetWalletPubkey.toBase58() : null,
    symbol: 'ADX',
    interval: 100000000,
  });

  const {
    claimsHistory: claimsHistoryAlpApi,
    isLoadingClaimHistory: isLoadingClaimHistoryAlp,
  } = useClaimHistory({
    walletAddress: targetWalletPubkey ? targetWalletPubkey.toBase58() : null,
    symbol: 'ALP',
    interval: 100000000,
  });

  // get totals for ADX stakes
  const allTimeClaimedUsdcAdx = claimsHistoryAdxApi?.allTimeUsdcClaimed ?? 0;
  const allTimeClaimedUsdcAlp = claimsHistoryAlpApi?.allTimeUsdcClaimed ?? 0;
  const allTimeClaimedUsdc = allTimeClaimedUsdcAdx + allTimeClaimedUsdcAlp;

  // get totals for ALP stakes
  const allTimeClaimedAdxAdx =
    (claimsHistoryAdxApi?.allTimeAdxClaimed ?? 0) +
    (claimsHistoryAdxApi?.allTimeAdxGenesisClaimed ?? 0);
  const allTimeClaimedAdxAlp =
    (claimsHistoryAlpApi?.allTimeAdxClaimed ?? 0) +
    (claimsHistoryAlpApi?.allTimeAdxGenesisClaimed ?? 0);
  const allTimeClaimedAdx = allTimeClaimedAdxAdx + allTimeClaimedAdxAlp;

  const claimsHistoryAdx = claimsHistoryAdxApi?.symbols.find(
    (c) => c.symbol === 'ADX',
  )?.claims;
  const claimsHistoryAlp = claimsHistoryAlpApi?.symbols.find(
    (c) => c.symbol === 'ALP',
  )?.claims;

  const totalStakedAdx = useMemo(
    () =>
      adxLockedStakes?.reduce(
        (sum, stake) =>
          sum +
          nativeToUi(stake.amount, window.adrena.client.adxToken.decimals),
        0,
      ) ?? 0,
    [adxLockedStakes],
  );
  const totalStakedAlp = useMemo(
    () =>
      alpLockedStakes?.reduce(
        (sum, stake) =>
          sum +
          nativeToUi(stake.amount, window.adrena.client.alpToken.decimals),
        0,
      ) ?? 0,
    [alpLockedStakes],
  );

  const [adxClaimHistoryCurrentPage, setAdxClaimHistoryCurrentPage] =
    useState(1);
  const [paginatedAdxClaimsHistory, setPaginatedAdxClaimsHistory] = useState<
    ClaimHistoryExtended[]
  >([]);

  useEffect(() => {
    if (view !== 'walletDigger') return;

    if (!claimsHistoryAdx) {
      return setPaginatedAdxClaimsHistory([]);
    }

    const startIndex =
      (adxClaimHistoryCurrentPage - 1) * claimHistoryItemsPerPage;
    const endIndex = startIndex + claimHistoryItemsPerPage;
    setPaginatedAdxClaimsHistory(claimsHistoryAdx.slice(startIndex, endIndex));
  }, [claimsHistoryAdx, adxClaimHistoryCurrentPage, view]);

  const [alpClaimHistoryCurrentPage, setAlpClaimHistoryCurrentPage] =
    useState(1);
  const [paginatedAlpClaimsHistory, setPaginatedAlpClaimsHistory] = useState<
    ClaimHistoryExtended[]
  >([]);

  useEffect(() => {
    if (view !== 'walletDigger') return;

    if (!claimsHistoryAlp) {
      return setPaginatedAlpClaimsHistory([]);
    }

    const startIndex =
      (alpClaimHistoryCurrentPage - 1) * claimHistoryItemsPerPage;
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
        `${window.location.pathname}?${searchParams.toString()}`,
      );
    } else {
      // Remove the `wallet` query parameter if the wallet is cleared
      searchParams.delete('wallet');
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}?${searchParams.toString()}`,
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

  const seeDetails = (v: boolean, setV: (v: boolean) => void) => (
    <div
      className="bg-third flex items-center justify-center text-sm p-1 cursor-pointer opacity-90 hover:opacity-100 mt-2"
      onClick={() => {
        setV(!v);
      }}
    >
      {v ? 'hide' : 'see'} details
      <Image
        className={twMerge(
          `h-6 w-6`,
          v
            ? 'transform rotate-180 transition-all duration-1000 ease-in-out'
            : '',
        )}
        src={chevronDown}
        height={60}
        width={60}
        alt="Chevron down"
      />
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-2 p-2 w-full">
        <StyledContainer className="p-4 w-full relative overflow-hidden">
          <div className="flex flex-col w-full items-center justify-center gap-2 relative h-[15em]">
            {snsDomain ? (
              <Tippy
                content="Registered Domain through Solana Name Service (SNS)"
                className="!text-xs !font-boldy"
                placement="auto"
              >
                <div className="absolute left-2 top-2 flex flex-row gap-1 items-center">
                  <Image
                    src={snsBadgeIcon}
                    alt="SNS badge"
                    className="w-3 h-3"
                  />
                  <p className="text-[0.625rem] font-mono bg-[linear-gradient(110deg,#96B47C_40%,#C8E3B0_60%,#96B47C)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]">
                    {snsDomain}.sol
                  </p>
                </div>
              </Tippy>
            ) : null}
            <div>Target Wallet</div>

            {targetWalletPubkey ? (
              <OnchainAccountInfo
                iconClassName="w-[0.7em] h-[0.7em] ml-4"
                address={targetWalletPubkey}
                noAddress={true}
                className="absolute right-2 top-2"
              />
            ) : null}

            <InputString
              value={targetWallet ?? ''}
              onChange={setTargetWallet}
              placeholder="i.e 9zXR1TckFZRt6aVnJZfJ4JrG6WQFr4YZ3ouAgz9AcfST"
              className="text-center w-[40em] max-w-full bg-inputcolor border rounded-xl p-2"
              inputFontSize="0.7em"
            />

            <div
              className={twMerge(
                'text-sm',
                !targetWallet?.length
                  ? 'opacity-0'
                  : 'opacity-50 hover:opacity-100 cursor-pointer',
              )}
              onClick={() => {
                setTargetWalletPubkey(null);
                setTargetWallet(null);
              }}
            >
              reset
            </div>
          </div>

          <Image
            className="h-[15em] w-[15em] absolute -bottom-2 right-0 -z-10 opacity-40 grayscale"
            src={shovelMonster}
            height={600}
            width={600}
            alt="Shovel monster"
          />
        </StyledContainer>

        {targetWalletPubkey ? (
          <StyledContainer className="p-2 w-full" bodyClassName="gap-1">
            <UserRelatedAdrenaAccounts
              className="h-auto flex mt-auto rounded-lg"
              userProfile={userProfile ?? false}
              userVest={userVest ? userVest : null}
              positions={positions}
              stakingAccounts={stakingAccounts}
            />
          </StyledContainer>
        ) : null}

        {targetWalletPubkey ? (
          <StyledContainer
            className="p-2 w-full relative"
            bodyClassName="gap-1"
          >
            <h1 className="ml-auto mr-auto">STAKING</h1>

            {moreStakingInfo ? (
              <div
                className="absolute top-2 right-2 cursor-pointer text-txtfade text-sm underline pr-2"
                onClick={() => setMoreStakingInfo(false)}
              >
                hide details
              </div>
            ) : null}

            <div className="w-full h-[1px] bg-bcolor mt-2" />

            <div className="flex gap-y-4 mt-2 flex-wrap">
              <NumberDisplay
                title="LIQUID STAKED ADX"
                nb={
                  stakingAccounts?.ADX?.liquidStake.amount
                    ? nativeToUi(
                        stakingAccounts.ADX.liquidStake.amount,
                        window.adrena.client.adxToken.decimals,
                      )
                    : 0
                }
                format="number"
                suffix="ADX"
                precision={0}
                className="border-0 min-w-[12em]"
                bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                headerClassName="pb-2"
                titleClassName="text-[0.7em] sm:text-[0.7em]"
              />

              <NumberDisplay
                title="LOCKED STAKED ADX"
                nb={totalStakedAdx}
                format="number"
                suffix="ADX"
                precision={0}
                className="border-0 min-w-[12em]"
                bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                headerClassName="pb-2"
                titleClassName="text-[0.7em] sm:text-[0.7em]"
              />

              {totalStakedAlp > 0 ? (
                <NumberDisplay
                  title="LOCKED STAKED ALP"
                  nb={totalStakedAlp}
                  format="number"
                  suffix="ALP"
                  precision={0}
                  className="border-0 min-w-[12em]"
                  bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                  headerClassName="pb-2"
                  titleClassName="text-[0.7em] sm:text-[0.7em]"
                />
              ) : null}

              {isLoadingClaimHistoryAdx && isLoadingClaimHistoryAlp ? (
                <>
                  <div className="flex-col w-full rounded-lg p-3 z-20 relative flex items-center flex-1 min-h-[2em] bg-transparent border-0 min-w-[12em]">
                    <Loader />
                  </div>
                  <div className="flex-col w-full rounded-lg p-3 z-20 relative flex items-center flex-1 min-h-[2em] bg-transparent border-0 min-w-[12em]">
                    <Loader />
                  </div>
                </>
              ) : (
                <>
                  <NumberDisplay
                    title="TOTAL CLAIMED USDC"
                    nb={allTimeClaimedUsdc}
                    format="currency"
                    precision={0}
                    className="border-0 min-w-[12em]"
                    bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                    headerClassName="pb-2"
                    titleClassName="text-[0.7em] sm:text-[0.7em]"
                    tippyInfo={`Total amount of USDC that has been claimed by the wallet.
                                ADX: ${Math.round(allTimeClaimedUsdcAdx)} | ALP: ${Math.round(allTimeClaimedUsdcAlp)}`}
                  />
                  <NumberDisplay
                    title="TOTAL CLAIMED ADX"
                    nb={allTimeClaimedAdx}
                    format="number"
                    suffix="ADX"
                    precision={0}
                    className="border-0 min-w-[12em]"
                    bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                    headerClassName="pb-2"
                    titleClassName="text-[0.7em] sm:text-[0.7em]"
                    tippyInfo={`Total amount of ADX that has been claimed by the wallet.
                                ADX: ${Math.round(allTimeClaimedAdxAdx)} | ALP: ${Math.round(allTimeClaimedAdxAlp)}`}
                  />
                </>
              )}
            </div>

            {moreStakingInfo ? (
              <>
                <div className="w-full h-[1px] bg-bcolor mt-2" />

                <h4 className="ml-4 mt-4">Staking List</h4>

                <div className="flex w-full pl-4 pr-4">
                  <div className="flex flex-col w-full">
                    <div className="flex w-full gap-4 flex-wrap">
                      {adxLockedStakes ? (
                        <LockedStakes
                          readonly={true}
                          lockedStakes={adxLockedStakes}
                          className="gap-3 mt-4 w-[25em] grow"
                          handleRedeem={() => {
                            /* readonly */
                          }}
                          handleClickOnFinalizeLockedRedeem={() => {
                            /* readonly */
                          }}
                          handleClickOnUpdateLockedStake={() => {
                            /* readonly */
                          }}
                        />
                      ) : null}

                      {alpLockedStakes && alpLockedStakes.length ? (
                        <LockedStakes
                          readonly={true}
                          lockedStakes={alpLockedStakes}
                          className="gap-3 mt-4 w-[25em] grow"
                          handleRedeem={() => {
                            /* readonly */
                          }}
                          handleClickOnFinalizeLockedRedeem={() => {
                            /* readonly */
                          }}
                          handleClickOnUpdateLockedStake={() => {
                            /* readonly */
                          }}
                        />
                      ) : null}
                    </div>

                    <div className="flex w-full gap-4 mt-2 flex-wrap">
                      <div className="flex flex-col w-[30em] grow">
                        <h4 className="ml-4 mt-4 mb-4">
                          ADX Staking claim history
                        </h4>

                        {paginatedAdxClaimsHistory?.map((claim) => (
                          <ClaimBlock key={claim.claim_id} claim={claim} />
                        ))}

                        <Pagination
                          currentPage={adxClaimHistoryCurrentPage}
                          totalPages={
                            claimsHistoryAdx
                              ? Math.ceil(
                                  claimsHistoryAdx.length /
                                    claimHistoryItemsPerPage,
                                )
                              : 0
                          }
                          onPageChange={setAdxClaimHistoryCurrentPage}
                          itemsPerPage={claimHistoryItemsPerPage}
                          totalItems={claimsHistoryAdx?.length ?? 0}
                        />
                      </div>

                      <div className="flex flex-col w-[30em] grow">
                        <h4 className="ml-4 mt-4 mb-4">
                          ALP Staking claim history
                        </h4>

                        {paginatedAlpClaimsHistory?.map((claim) => (
                          <ClaimBlock key={claim.claim_id} claim={claim} />
                        ))}

                        <Pagination
                          currentPage={alpClaimHistoryCurrentPage}
                          totalPages={
                            claimsHistoryAlp
                              ? Math.ceil(
                                  claimsHistoryAlp.length /
                                    claimHistoryItemsPerPage,
                                )
                              : 0
                          }
                          onPageChange={setAlpClaimHistoryCurrentPage}
                          itemsPerPage={claimHistoryItemsPerPage}
                          totalItems={claimsHistoryAlp?.length ?? 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {seeDetails(moreStakingInfo, setMoreStakingInfo)}
          </StyledContainer>
        ) : null}

        {targetWalletPubkey ? (
          <StyledContainer
            className="p-2 w-full relative"
            bodyClassName="gap-1"
          >
            <h1 className="ml-auto mr-auto">POSITIONS</h1>

            {morePositionInfo ? (
              <div
                className="absolute top-2 right-2 cursor-pointer text-txtfade text-sm underline pr-2"
                onClick={() => setMorePositionInfo(false)}
              >
                hide details
              </div>
            ) : null}

            {userProfile ? (
              <>
                <TradingStats
                  traderInfo={traderInfo}
                  livePositionsNb={positions === null ? null : positions.length}
                  className="gap-y-4 mb-2"
                />

                <div className="w-full h-[1px] bg-bcolor mt-2" />
              </>
            ) : null}

            {morePositionInfo ? (
              <>
                <div className="w-full h-[1px] bg-bcolor mt-2" />

                <h4 className="ml-4 mt-4 mb-4">Live Positions</h4>

                <div className="flex flex-col w-full pl-4 pr-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    {positions !== null && positions.length ? (
                      <div className="flex flex-col w-full gap-2">
                        {positions.map((position) => (
                          <PositionBlock
                            readOnly={true}
                            key={position.pubkey.toBase58()}
                            position={position}
                            setTokenB={() => {}}
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

                <h4 className="ml-4 mt-4 mb-4">History</h4>

                <div className="flex flex-col w-full pl-4 pr-4">
                  <PositionsHistory
                    walletAddress={targetWalletPubkey?.toBase58() ?? null}
                    connected={true}
                    exportButtonPosition="bottom"
                  />
                </div>
              </>
            ) : null}

            {seeDetails(morePositionInfo, setMorePositionInfo)}
          </StyledContainer>
        ) : null}

        {targetWalletPubkey && userVest ? (
          <StyledContainer className="p-2 w-full" bodyClassName="gap-1">
            <VestStats vest={userVest} readonly={true} />
          </StyledContainer>
        ) : null}

        {targetWalletPubkey && expanseRanking && awakeningRanking ? (
          <StyledContainer className="p-2 w-full" bodyClassName="gap-1">
            <h1 className="ml-auto mr-auto">TRADING COMPETITION</h1>

            <RankingStats
              expanseRanking={expanseRanking}
              awakeningRanking={awakeningRanking}
              className="gap-y-4 pt-2 pb-2"
              userProfile={userProfile}
            />
          </StyledContainer>
        ) : null}

        {targetWalletPubkey && allRefereesProfiles !== null ? (
          <StyledContainer className="p-2 w-full" bodyClassName="gap-1">
            <h1 className="ml-auto mr-auto">REFERRALS</h1>

            <div className="w-full h-[1px] bg-bcolor mt-2" />

            <div className="flex w-full">
              <NumberDisplay
                title="REFERRED PROFILES"
                nb={allRefereesProfiles.length}
                format="number"
                precision={0}
                className="border-0 min-w-[12em]"
                bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                headerClassName="pb-2"
                titleClassName="text-[0.7em] sm:text-[0.7em]"
              />

              <NumberDisplay
                title="CLAIMABLE REWARDS"
                nb={userProfile ? userProfile.claimableReferralFeeUsd : 0}
                format="currency"
                precision={2}
                className="border-0 min-w-[12em]"
                bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                headerClassName="pb-2"
                titleClassName="text-[0.7em] sm:text-[0.7em]"
              />

              <NumberDisplay
                title="TOTAL GENERATED"
                nb={userProfile ? userProfile.totalReferralFeeUsd : 0}
                format="currency"
                precision={2}
                className="border-0 min-w-[12em]"
                bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                headerClassName="pb-2"
                titleClassName="text-[0.7em] sm:text-[0.7em]"
              />
            </div>

            <div className="flex flex-col gap-2 items-center w-full border pt-2 pb-2 bg-third/40">
              {allRefereesProfiles !== null ? (
                allRefereesProfiles.map((referee, i) => (
                  <div
                    key={`one-referee-${i}`}
                    className="w-full gap-2 flex flex-col"
                  >
                    {i > 0 ? (
                      <div className="w-full h-[1px] bg-bcolor" />
                    ) : null}

                    <div
                      className="w-full items-center justify-center flex flex-col gap-2  opacity-70 hover:opacity-100 cursor-pointer"
                      onClick={() => {
                        setActiveProfile(referee);
                      }}
                    >
                      <div className="flex text-sm text-white">
                        {referee.nickname.length
                          ? referee.nickname
                          : referee.owner.toBase58()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <></>
              )}

              {allRefereesProfiles !== null &&
              allRefereesProfiles.length === 0 ? (
                <div className="w-full items-center justify-center flex font-archivo text-sm opacity-80 pt-8 pb-8">
                  No referee yet.
                </div>
              ) : null}
            </div>
          </StyledContainer>
        ) : null}

        {targetWalletPubkey && userProfile ? (
          <Achievements
            {...props}
            userProfile={userProfile}
            defaultSort="points"
            defaultShowOwned={true}
            defaultShowNotOwned={false}
          />
        ) : null}
      </div>

      <AnimatePresence>
        {activeProfile && (
          <Modal
            className="h-[80vh] w-full overflow-y-auto"
            wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]"
            title=""
            close={() => setActiveProfile(null)}
            isWrapped={false}
          >
            <ViewProfileModal
              profile={activeProfile}
              close={() => setActiveProfile(null)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
