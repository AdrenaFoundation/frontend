import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import FormatNumber from '@/components/Number/FormatNumber';
import { LockedStakeExtended } from '@/types';
import { nativeToUi } from '@/utils';

import chevronDownIcon from '../../../../public/images/chevron-down.svg';
import lockIcon from '../../../../public/images/Icons/lock.svg';
import plusIcon from '../../../../public/images/plus.png';
import votingIcon from '../../../../public/images/voting.png';
import weightIcon from '../../../../public/images/weight.png';
import RemainingTimeToDate from '../monitoring/RemainingTimeToDate';
import LockedStake from './LockedStake';

export default function LockedStakesDuration({
  lockedStakes,
  className,
  handleRedeem,
  handleClickOnFinalizeLockedRedeem,
  handleClickOnUpdateLockedStake,
}: {
  lockedStakes: LockedStakeExtended[];
  className?: string;
  handleRedeem: (lockedStake: LockedStakeExtended, earlyExit: boolean) => void;
  handleClickOnFinalizeLockedRedeem: (
    lockedStake: LockedStakeExtended,
    earlyExit: boolean,
  ) => void;
  handleClickOnUpdateLockedStake: (lockedStake: LockedStakeExtended) => void;
}) {
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [lockedStakesPage, setLockedStakesPage] = useState(1);
  const lockedStakesPerPage = 3;

  if (lockedStakes.length === 0) {
    return null;
  }

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

  return (
    <div
      className={twMerge(
        'flex flex-col w-full border-2 border-bcolor rounded-xl overflow-hidden bg-secondary',
        className,
      )}
    >
      <div className={twMerge('flex flex-col w-full items-center bg-secondary', lockedStakes.length > 1 ? 'cursor-pointer' : '')} onClick={() => {
        if (lockedStakes.length > 1) {
          setDetailOpen(!detailOpen);
        }
      }}>
        <div className={twMerge('border-b items-center justify-center bg-secondary w-full flex pl-4 pt-1 pb-1 pr-4')} >
          <Image src={lockIcon} width={14} height={14} alt="Lock icon" className='mr-1' />

          <div className='text-sm flex gap-1 font-boldy text-txtfade cursor-pointer'>
            {Number(lockDuration) / 3600 / 24} days lock
          </div>

          {lockedStakes.length > 1 ? <div className='text-sm flex gap-1 font-boldy text-txtfade ml-1'>
            ({lockedStakes.length})
          </div> : null}

          {firstUnlock !== null ? <div className='flex items-center justify-center ml-auto flex-col sm:flex-row sm:gap-2'>
            <div className='text-xs font-boldy text-txtfade'>{lockedStakes.length > 1 ? 'First unlock in' : 'Unlock in'}</div>
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
              isDecimalDimmed={true}
            />

            <div className='text-xl font-boldy'>{token}</div>

            {lockedStakes.some(l => !l.isGenesis) ? <Tippy
              content={
                <div className="flex flex-col">
                  Add more {token} to the last added/upgraded stake.
                </div>
              }
              placement="auto"
            >
              <div className='w-6 h-8 flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer' onClick={(e) => {
                e.stopPropagation();
                handleClickOnUpdateLockedStake(lockedStakes.reduce((last, current) => last.endTime.toNumber() > current.endTime.toNumber() ? last : current));
              }}>
                <Image src={plusIcon} width={16} height={16} alt="Plus icon" />
              </div>
            </Tippy> : null}
          </div>

          {lockedStakes.length === 1 && lockedStakes[0].isGenesis ?
            <div className='text-xxs bg-[#068862a0] font-boldy pt-[0.1em] pb-[0.1em] px-2 mt-1 rounded w-14 text-center'>genesis</div> : null}
        </div>

        <div className='flex border-t pt-2 pb-2 w-full justify-evenly flex-wrap gap-y-4 gap-x-4'>
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
        </div>
      </div>

      {detailOpen ? <div className='border-t-1'>
        {paginatedLockedStakes.map((lockedStake, i) => <LockedStake
          lockedStake={lockedStake}
          key={i}
          className="border-t"
          handleRedeem={handleRedeem}
          handleClickOnFinalizeLockedRedeem={handleClickOnFinalizeLockedRedeem}
          handleClickOnUpdateLockedStake={handleClickOnUpdateLockedStake}
        />)}

        <Pagination
          currentPage={lockedStakesPage}
          totalItems={lockedStakes ? lockedStakes.length : 0}
          itemsPerPage={lockedStakesPerPage}
          onPageChange={setLockedStakesPage}
        />
      </div> : null}

      {lockedStakes.length > 1 ? <div className='w-full items-center justify-center flex border-t bg-[#a8a8a810] cursor-pointer hover:opacity-100' onClick={() => {
        setDetailOpen(!detailOpen)
      }}>
        <Image src={chevronDownIcon} width={20} height={20} alt="Chevron icon" className={twMerge('opacity-40', detailOpen ? 'rotate-180' : '')} />
      </div> :
        <div className='flex w-full'>
          <Button
            variant="outline"
            size="xs"
            title="Early Exit"
            className="rounded-none py-2 border-b-0 border-l-0 w-20 text-txtfade border-bcolor bg-[#a8a8a810] grow h-8"
            onClick={() => {
              handleClickOnFinalizeLockedRedeem(lockedStakes[0], true)
            }}
          />

          {!lockedStakes[0].isGenesis && (
            <Button
              variant="outline"
              size="xs"
              className="rounded-none py-2 w-20 border-b-0 border-l-0 border-r-0 text-txtfade border-bcolor bg-[#a8a8a810] grow h-8"
              title="Upgrade"
              onClick={() => {
                handleClickOnUpdateLockedStake(lockedStakes[0])
              }}
            />
          )}
        </div>}
    </div>
  );
}
