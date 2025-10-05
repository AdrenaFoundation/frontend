import '../../../styles/Animation.css';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import useClaimHistory from '@/hooks/useClaimHistory';

import alpLogo from '../../../../public/images/adrena_logo_alp_white.svg';
import ClaimHistorySection from './ClaimHistorySection';

export default function ALPStakingRecap({
  walletAddress,
}: {
  walletAddress: string | null;
}) {
  const { claimsHistory, isLoadingClaimHistory } = useClaimHistory({
    walletAddress,
    symbol: 'ALP',
    interval: 100000000,
  });

  const alpClaimHistory = claimsHistory?.symbols.find(
    (c) => c.symbol === 'ALP',
  );

  const allTimeClaimedUsdc = claimsHistory?.allTimeUsdcClaimed ?? 0;
  const allTimeClaimedAdx =
    (claimsHistory?.allTimeAdxClaimed ?? 0) +
    (claimsHistory?.allTimeAdxGenesisClaimed ?? 0);

  const adxValueAtClaim =
    alpClaimHistory?.claims.reduce(
      (sum, claim) =>
        sum +
        (claim.rewards_adx + claim.rewards_adx_genesis) *
          claim.adx_price_at_claim,
      0,
    ) ?? 0;

  if (
    !claimsHistory ||
    (claimsHistory?.allTimeUsdcClaimed === 0 &&
      claimsHistory?.allTimeAdxClaimed === 0)
  ) {
    return null;
  }

  return (
    <div className="pl-4 pr-4 w-full">
      <div className="flex flex-col bg-main rounded-2xl border">
        <div className="p-5 pb-0">
          <div className="flex flex-col h-full w-full bg-gradient-to-br from-[#07111A] to-[#0B1722] border rounded-lg shadow-lg">
            <p className="opacity-75 text-base p-3 flex flex-col gap-2 text-center">
              <span className="text-base">
                Starting March 19th, 2025, at 12:00 UTC, ALP is now fully
                liquid. But before that date, you were there and had some ALP
                staked!
              </span>
            </p>

            <div
              className={twMerge(
                'flex w-full rounded-bl-lg rounded-br-lg p-3 items-center justify-center flex-none border-t bg-[#130AAA] relative overflow-hidden',
              )}
            >
              <div className="flex flex-row items-center gap-6">
                <div className="flex flex-col items-center">
                  <p className="opacity-50 text-base">
                    Historical Staked ALP Rewards
                  </p>
                  {isLoadingClaimHistory ? (
                    <div className="flex items-center justify-center">
                      <Loader />
                    </div>
                  ) : (
                    <FormatNumber
                      nb={allTimeClaimedUsdc + adxValueAtClaim}
                      minimumFractionDigits={0}
                      precision={0}
                      precisionIfPriceDecimalsBelow={0}
                      isAbbreviate={false}
                      prefix="$"
                      className="text-2xl"
                    />
                  )}
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

        <div className="mt-4">
          {isLoadingClaimHistory ? (
            <div className="flex w-full justify-center items-center">
              <Loader />
            </div>
          ) : (
            <>
              <div className="flex pr-4 pl-4 gap-4 flex-wrap">
                <NumberDisplay
                  title="USDC Rewards"
                  nb={allTimeClaimedUsdc}
                  precision={0}
                  format="number"
                  suffix="USDC"
                  className=""
                  bodyClassName="text-base"
                />

                <NumberDisplay
                  title="LM Rewards"
                  nb={allTimeClaimedAdx}
                  precision={0}
                  format="number"
                  suffix="ADX"
                  className=""
                  bodyClassName="text-base"
                />

                <NumberDisplay
                  tippyInfo="The value of the ADX rewards at the time of claim."
                  title="LM Usd Value"
                  nb={adxValueAtClaim}
                  precision={0}
                  format="currency"
                  className=""
                  bodyClassName="text-base"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col h-full mt-4 relative">
          <ClaimHistorySection token="ALP" walletAddress={walletAddress} />
        </div>
      </div>
    </div>
  );
}
