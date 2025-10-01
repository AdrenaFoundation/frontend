import Tippy from '@tippyjs/react';
import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import useStakingAccount from '@/hooks/useStakingAccount';
import { getNextStakingRoundStartTime } from '@/utils';

import adxTokenLogo from '../../../../public/images/adx.svg';
import infoIcon from '../../../../public/images/Icons/info.svg';
import usdcTokenLogo from '../../../../public/images/usdc.svg';

interface PendingRewardsSectionProps {
  userPendingUsdcRewards: number;
  userPendingAdxRewards: number;
  pendingGenesisAdxRewards: number;
  isClaimingRewards: boolean;
  isClaimingAndBuyAdxRewards: boolean;
  roundPassed: boolean;
  onClaim: () => Promise<void>;
  onResolveStakingRound: () => Promise<void>;
  onClaimAndBuyAdx: () => Promise<void>;
}

export default function PendingRewardsSection({
  userPendingUsdcRewards,
  userPendingAdxRewards,
  pendingGenesisAdxRewards,
  isClaimingRewards,
  isClaimingAndBuyAdxRewards,
  roundPassed,
  onClaim,
  onResolveStakingRound,
  onClaimAndBuyAdx,
}: PendingRewardsSectionProps) {
  const { stakingAccount } = useStakingAccount(
    window.adrena.client.lmTokenMint,
  );

  return (
    <div className="px-5">
      <div
        className={twMerge(
          'flex flex-col sm:flex-row mb-2 items-center justify-between w-full',
        )}
      >
        <div className="flex items-center gap-1">
          <h3 className="text-lg font-semibold">Pending Rewards</h3>
          <Tippy
            content={
              <div className="p-2">
                <p className="text-sm mb-1">
                  ADX rewards automatically accrue at the end of every staking
                  round.
                </p>
                <p className="text-sm">
                  Liquid staked ADX can be unstaked at any time. Locked ADX can
                  be retrieved once the locking period is over.
                </p>
              </div>
            }
            placement="auto"
          >
            <Image
              src={infoIcon}
              width={16}
              height={16}
              alt="info icon"
              className="inline-block ml-2 cursor-pointer txt op center"
            />
          </Tippy>
        </div>

        <div
          className={twMerge(
            'flex flex-col sm:flex-row gap-4 my-2 sm:my-0 w-full sm:w-auto flex-none',
          )}
        >
          <Button
            variant="danger"
            size="sm"
            title={
              isClaimingAndBuyAdxRewards
                ? 'Claiming & buying ADX...'
                : 'Claim & Buy ADX'
            }
            className={twMerge('px-5 w-full sm:w-auto')}
            onClick={onClaimAndBuyAdx}
            disabled={
              userPendingUsdcRewards +
                userPendingAdxRewards +
                pendingGenesisAdxRewards <=
              0
            }
          />

          <Button
            variant="danger"
            size="sm"
            title={isClaimingRewards ? 'Claiming...' : 'Claim'}
            className={twMerge('px-5 w-full sm:w-auto')}
            onClick={onClaim}
            disabled={
              userPendingUsdcRewards +
                userPendingAdxRewards +
                pendingGenesisAdxRewards <=
              0
            }
          />
        </div>
      </div>

      <div className="flex flex-col border bg-secondary rounded-md shadow-lg overflow-hidden">
        {/* Pending rewards block */}
        <div className="flex-grow"></div>
        <div className="flex flex-col border p-3 bg-secondary rounded-md shadow-lg">
          <div className="flex flex-col gap-3 sm:gap-1 flex-grow">
            <div className="flex flex-col sm:flex-row justify-between">
              <span className="text-txtfade">
                Your share of 20% platform&apos;s revenue:
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
            <div className="flex flex-col sm:flex-row justify-between">
              <span className="text-txtfade">
                LM rewards
                <span className="text-txtfade ">
                  {' '}
                  (see
                  <Link
                    href="https://docs.adrena.xyz/tokenomics/adx/staked-adx-rewards-emissions-schedule"
                    className="underline ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    schedule
                  </Link>
                  ):
                </span>
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
                        These rewards accrue over time for the first 180 days of
                        the protocol. The amount is proportional to your
                        participation in the Genesis Liquidity campaign. <br />
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

      {/* Bottom line */}
      <div className="flex flex-col gap-2 text-sm ">
        <div className="flex items-center justify-between mt-2">
          <span className="text-txtfade flex items-center">
            <Tippy
              content={
                <p className="font-regular">
                  Each round duration is ~6h (+/- some jitter due to Sablier on
                  chain decentralized execution).
                  <br />
                  At the end of a round, the accrued rewards become claimable,
                  and a new round starts.
                  <br />
                  The ADX and ALP rounds are not necessarily in sync.
                </p>
              }
              placement="auto"
            >
              <Image
                src={infoIcon}
                width={14}
                height={14}
                alt="info icon"
                className="inline-block mr-1"
              />
            </Tippy>
            New rewards unlocking in:
          </span>

          <div className="flex items-center">
            {stakingAccount && (
              <div className="flex items-center justify-center w-[7em]">
                <RemainingTimeToDate
                  timestamp={
                    getNextStakingRoundStartTime(
                      stakingAccount.currentStakingRound.startTime,
                    ).getTime() / 1000
                  }
                  className="inline-flex items-center text-nowrap"
                  tippyText=""
                />
              </div>
            )}

            <div className="justify-end ml-2 hidden sm:flex">
              <Link
                href="https://docs.adrena.xyz/tokenomics/adx/staking-and-duration-locked-parameters-for-adx"
                className="text-xs text-txtfade underline opacity-40 hover:opacity-100 transition-opacity"
                target="_blank"
                rel="noopener noreferrer"
              >
                learn more &gt;
              </Link>
            </div>
          </div>
        </div>

        {roundPassed ? (
          <Button
            variant="outline"
            className="text-xs"
            title="Trigger Resolve Staking Round"
            onClick={onResolveStakingRound}
          />
        ) : null}
      </div>
    </div>
  );
}
