import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import FormatNumber from '@/components/Number/FormatNumber';
import { LockedStakeExtended } from '@/types';
import { nativeToUi } from '@/utils';

import chevronDownIcon from '../../../../public/images/chevron-down.svg';
import lockIcon from '../../../../public/images/Icons/lock.svg';
import votingIcon from '../../../../public/images/voting.png';
import weightIcon from '../../../../public/images/weight.png';
import RemainingTimeToDate from '../monitoring/RemainingTimeToDate';
import LockedStake from './LockedStake';

export default function LockedStakesDuration({
  lockedStakes,
  readonly = false,
  className,
  handleRedeem,
  handleClickOnUpdateLockedStake,
}: {
  lockedStakes: LockedStakeExtended[];
  readonly?: boolean;
  className?: string;
  handleRedeem: (lockedStake: LockedStakeExtended) => void;
  handleClickOnUpdateLockedStake: (lockedStake: LockedStakeExtended) => void;
}) {
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [showWeights, setShowWeight] = useState<boolean>(readonly);
  const [lockedStakesPage, setLockedStakesPage] = useState(1);
  const lockedStakesPerPage = 3;

  const decimals = lockedStakes[0].tokenSymbol === 'ADX' ? window.adrena.client.adxToken.decimals : window.adrena.client.alpToken.decimals;

  const totalStaked = lockedStakes.reduce((acc, lockedStake) => {
    acc += nativeToUi(lockedStake.amount, decimals);
    return acc;
  }, 0);

  const rewardMultiplier = lockedStakes[0].rewardMultiplier / 10000;
  const lmRewardMultiplier = lockedStakes[0].lmRewardMultiplier / 10000;
  const votingMultiplier = lockedStakes[0].voteMultiplier / 10000;

  const totalWeight = {
    ...lockedStakes.reduce((acc, lockedStake) => {
      return {
        amountWithRewardMultiplier: acc.amountWithRewardMultiplier + nativeToUi(lockedStake.amountWithRewardMultiplier, decimals),
        amountWithLmRewardMultiplier: acc.amountWithLmRewardMultiplier + nativeToUi(lockedStake.amountWithLmRewardMultiplier, decimals),
      };
    }, {
      amountWithRewardMultiplier: 0,
      amountWithLmRewardMultiplier: 0,
    }),

    votingPower: votingMultiplier * totalStaked,
  };

  const lockDuration = lockedStakes[0].lockDuration;
  const token = lockedStakes[0].tokenSymbol;

  const firstUnlock = lockedStakes.reduce((first, lockedStake) => first === null || first > lockedStake.endTime.toNumber() ? lockedStake.endTime.toNumber() : first, null as null | number);

  const paginatedLockedStakes = lockedStakes.slice(
    (lockedStakesPage - 1) * lockedStakesPerPage,
    lockedStakesPage * lockedStakesPerPage,
  );

  const [timeRemainingFirstUnlock, setTimeRemainingFirstUnlock] = useState<number | null>(null);

  const calculateTimeRemainingFirstUnlock = useCallback(() => {
    if (firstUnlock === null) return;

    const timeRemaining = firstUnlock * 1000 - Date.now();

    setTimeRemainingFirstUnlock(timeRemaining);
  }, [firstUnlock]);

  useEffect(() => {
    calculateTimeRemainingFirstUnlock();

    const interval = setInterval(() => {
      calculateTimeRemainingFirstUnlock();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [calculateTimeRemainingFirstUnlock]);

  if (lockedStakes.length === 0) {
    return null;
  }

  return (
    <div
      className={twMerge(
        'flex flex-col w-full border-2 border-bcolor rounded-md overflow-hidden bg-secondary',
        className,
      )}
    >
      <div className={twMerge('flex flex-col w-full items-center bg-secondary', lockedStakes.length > 1 ? 'cursor-pointer' : '')} onClick={() => {
        if (lockedStakes.length > 1) {
          setDetailOpen(!detailOpen);
        }
      }}>
        <div className={twMerge('border-b items-center justify-center bg-secondary w-full flex pl-4 pt-2 pb-2 pr-4')}>
          <div className='flex gap-1'>
            <Image src={lockIcon} width={14} height={14} alt="Lock icon" />

            <div className='text-sm flex gap-1 font-boldy text-txtfade cursor-pointer'>
              {Number(lockDuration) / 3600 / 24} days lock
            </div>

            {lockedStakes.length > 1 ? <div className='text-sm flex gap-1 '>
              <div className='hidden sm:block text-txtfade font-boldy'>|</div>
              <div className='flex'>
                <div className='sm:hidden text-txtfade font-boldy'>{"("}</div>
                <div className='text-txtfade font-boldy'>{lockedStakes.length}</div>
                <div className='sm:hidden text-txtfade'>{")"}</div>
              </div>
              <div className='hidden sm:block text-txtfade font-boldy'>stakes</div>
            </div> : null}
          </div>

          {firstUnlock !== null ? <div className='flex items-center justify-center ml-auto flex-col sm:flex-row sm:gap-2'>
            <div className='text-xs font-boldy text-txtfade'>{lockedStakes.length > 1 ? 'First unlock in' : 'Unlocks in'}</div>
            <RemainingTimeToDate timestamp={firstUnlock} className='text-xs' />
          </div> : null}
        </div>

        <div className='flex flex-col pt-2 pb-2 items-center relative w-full'>
          <div className='flex gap-x-2 items-center justify-center font-boldy'>
            {lockedStakes.length > 1 ? 'Total:' : null}
            <FormatNumber
              nb={totalStaked}
              className='text-xl'
              isAbbreviate={true}
              isAbbreviateIcon={false}
              isDecimalDimmed={false}
            />

            <div className='text-xl font-boldy'>{token}</div>
          </div>

          {lockedStakes.length === 1 && lockedStakes[0].isGenesis ?
            <div className='text-xxs bg-[#068862a0] font-boldy pt-[0.1em] pb-[0.1em] px-2 mt-1 rounded w-14 text-center'>genesis</div> : null}

          <div className='sm:absolute right-2 bottom-2 text-xs text-txtfade underline opacity-40 hover:opacity-100 transition-opacity cursor-pointer p-1' onClick={(e) => {
            e.stopPropagation();

            setShowWeight(!showWeights)
          }}>{showWeights ? 'hide' : 'show'} weights</div>
        </div>

        {showWeights ? <div className='flex border-t pt-2 pb-2 w-full justify-evenly flex-wrap gap-y-4 gap-x-4'>
          <div className='flex items-center gap-2'>
            <Image src={weightIcon} width={20} height={6} alt="Weight icon" className='mr-1 h-5 w-5 opacity-10' />

            <Tippy
              content={
                <div className="text-sm w-60 flex flex-col">
                  <span>USDC rewards are distributed based on the amount of {token} staked and the duration of the lock using a weight system.</span>
                  <span className='mt-2 mb-2'>Example:</span>
                  <span>
                    There are 1 USDC to redistribute and 2 {token} staked. 1 {token} is staked with x4 multiplier and 1 {token} is staked with x1 multiplier.
                  </span>
                  <span className='mt-1'>
                    Total Weight is 5. Reward rate is 0.2 USDC per weight. The first {token} will get 0.8 USDC and the second {token} will get 0.2 USDC.
                  </span>
                </div>
              }
              placement="auto"
            >
              <div className='flex items-center flex-col'>
                <div className='text-xs text-txtfade font-boldy underline decoration-dotted'>USDC Reward Weight</div>
                <div className='flex items-center justify-center gap-1'>
                  <FormatNumber
                    nb={totalWeight.amountWithRewardMultiplier}
                    className='text-sm'
                    precision={0}
                    isDecimalDimmed={true}
                    isAbbreviate={true}
                    isAbbreviateIcon={false}
                  />

                  <div className='text-sm text-txtfade font-mono'>{'('}{rewardMultiplier}x{')'}</div>
                </div>
              </div>
            </Tippy>
          </div>

          <div className='flex items-center gap-2'>
            <Image src={weightIcon} width={20} height={6} alt="Weight icon" className='mr-1 h-5 w-5 opacity-10' />

            <Tippy
              content={
                <div className="text-sm w-60 flex flex-col">
                  <span>ADX rewards are distributed based on the amount of {token} staked and the duration of the lock using a weight system.</span>
                  <span className='mt-2 mb-2'>Example:</span>
                  <span>
                    There are 1 USDC to redistribute and 2 {token} staked. 1 {token} is staked with x4 multiplier and 1 {token} is staked with x1 multiplier.
                  </span>
                  <span className='mt-1'>
                    Total Weight is 5. Reward rate is 0.2 USDC per weight. The first {token} will get 0.8 USDC and the second {token} will get 0.2 USDC.
                  </span>
                </div>
              }
              placement="auto"
            >
              <div className='flex items-center flex-col'>
                <div className='text-xs text-txtfade font-boldy underline decoration-dotted'>ADX Reward Weight</div>
                <div className='flex items-center justify-center gap-1'>
                  <FormatNumber
                    nb={totalWeight.amountWithLmRewardMultiplier}
                    className='text-sm'
                    precision={0}
                    isDecimalDimmed={true}
                    isAbbreviate={true}
                    isAbbreviateIcon={false}
                  />

                  <div className='text-sm text-txtfade font-mono'>{'('}{lmRewardMultiplier}x{')'}</div>
                </div>
              </div>
            </Tippy>
          </div>

          {totalWeight.votingPower ? <div className='flex items-center gap-2'>
            <Image src={votingIcon} width={20} height={6} alt="Voting icon" className='mr-1 h-8 w-8 opacity-10' />

            <div className='flex items-center flex-col'>
              <div className='text-xs text-txtfade font-boldy'>Voting Power</div>
              <div className='flex items-center justify-center gap-1'>
                <FormatNumber
                  nb={totalWeight.votingPower}
                  className='text-sm'
                  precision={0}
                  isDecimalDimmed={true}
                  isAbbreviate={true}
                  isAbbreviateIcon={false}
                />

                <div className='text-sm text-txtfade font-mono'>{'('}{votingMultiplier}x{')'}</div>
              </div>
            </div>
          </div> : null}
        </div> : null}
      </div>

      {
        detailOpen ? <div className='border-t-1'>
          {paginatedLockedStakes.map((lockedStake, i) => <LockedStake
            lockedStake={lockedStake}
            readonly={readonly}
            key={i}
            className="border-t"
            handleRedeem={handleRedeem}
            handleClickOnUpdateLockedStake={handleClickOnUpdateLockedStake}
          />)}

          <Pagination
            currentPage={lockedStakesPage}
            totalPages={lockedStakes ? Math.ceil(lockedStakes.length / lockedStakesPerPage) : 0}
            onPageChange={setLockedStakesPage}
            itemsPerPage={lockedStakesPerPage}
            totalItems={lockedStakes.length}
          />
        </div> : null
      }

      {
        lockedStakes.length > 1 ? <div className='w-full items-center justify-center flex flex-col border-t  cursor-pointer'>
          <div className='flex items-center pb-2 justify-center w-full  pt-1' onClick={() => {
            setDetailOpen(!detailOpen)
          }}>
            <div className='flex gap-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity justify-center items-center'>
              <div className='text-txtfade underline  text-xs'>{!detailOpen ? 'See' : 'Hide'} all stakes</div>

              {lockedStakes.length > 1 ? <div className='text-xs flex gap-1 font-boldy text-txtfade'>
                ({lockedStakes.length})
              </div> : null}
            </div>

            <Image src={chevronDownIcon} width={20} height={20} alt="Chevron icon" className={twMerge('opacity-20', detailOpen ? 'rotate-180' : '')} />
          </div>

          {!readonly ? <div className='flex w-full'>
            {!lockedStakes[0].isGenesis && (
              <Tippy
                disabled={lockedStakes.some(lockedStake => lockedStake.qualifiedForRewardsInResolvedRoundCount > 0)}
                content={
                  <div className="flex flex-col justify-around items-center">
                    No locked stake eligible. To upgrade a locked stake, it must have been locked for at least one round, generated rewards, and had those rewards claimed. This process can take up to 12 hours.
                  </div>
                }
                placement="auto"
              >
                <div className='flex grow'>
                  <Button
                    variant="outline"
                    size="xs"
                    className="rounded-none py-2 w-20 border-b-0 border-l-0 border-r-0 text-txtfade border-bcolor bg-[#a8a8a810] grow h-8"
                    title="Quick Upgrade"
                    disabled={lockedStakes.every(lockedStake => lockedStake.qualifiedForRewardsInResolvedRoundCount === 0)}
                    onClick={() => {
                      handleClickOnUpdateLockedStake(
                        lockedStakes.reduce((last, lockedStake) => last.endTime.toNumber() > lockedStake.endTime.toNumber() ? last : lockedStake),
                      )
                    }}
                  />
                </div>
              </Tippy>
            )}
          </div> : null}
        </div> : !readonly ? <div className='flex w-full'>
          {timeRemainingFirstUnlock !== null && timeRemainingFirstUnlock <= 0 ? <Button
            variant="outline"
            size="xs"
            title="Redeem"
            className="rounded-none py-2 border-b-0 border-l-0 w-20 text-txtfade border-bcolor bg-[#a8a8a810] grow h-8"
            onClick={() => {
              handleRedeem(lockedStakes[0])
            }}
          /> : null}

          {!lockedStakes[0].isGenesis && (timeRemainingFirstUnlock === null || timeRemainingFirstUnlock > 0) ? (
            <Tippy
              disabled={lockedStakes[0].qualifiedForRewardsInResolvedRoundCount !== 0}
              content={
                <div className="flex flex-col justify-around items-center">
                  To upgrade a locked stake, it must have been locked for at least one round, generated rewards, and had those rewards claimed. This process can take up to 12 hours.
                </div>
              }
              placement="auto"
            >
              <div className='flex grow'>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={lockedStakes[0].qualifiedForRewardsInResolvedRoundCount === 0}
                  className="rounded-none py-2 w-20 border-b-0 border-l-0 border-r-0 text-txtfade border-bcolor bg-[#a8a8a810] grow h-8"
                  title="Upgrade"
                  onClick={() => {
                    handleClickOnUpdateLockedStake(lockedStakes[0])
                  }}
                />
              </div>
            </Tippy>) : null}
        </div> : null}
    </div>
  );
}
