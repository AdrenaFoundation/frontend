import BN from 'bn.js';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Menu from '@/components/common/Menu/Menu';
import MenuItem from '@/components/common/Menu/MenuItem';
import MenuItems from '@/components/common/Menu/MenuItems';
import Modal from '@/components/common/Modal/Modal';
import { UserStaking } from '@/types';
import { formatNumber, formatPriceInfo, nativeToUi } from '@/utils';

export default function StakeList({
  stakePositions,
  handleRemoveLiquidStake,
  totalLiquidStaked,
}: {
  stakePositions: UserStaking | null;
  handleRemoveLiquidStake: (amount: number) => void;
  totalLiquidStaked: number;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [adxAmount, setAdxAmount] = useState<number | null>(null);

  if (!stakePositions) {
    return <div className="text-center">Loading...</div>;
  }

  const { amount, stakeTime, claimTime, overlapAmount, overlapTime } =
    stakePositions.liquidStake;
  return (
    <table className="w-full">
      <thead>
        <tr>
          {[
            'Amount',
            'Stake Time',
            'Claim Time',
            'Overlap Time',
            'Overlap Amount',
            'Actions',
          ].map((header) => (
            <th className="text-xs text-left opacity-50 pb-2" key={header}>
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        <tr>
          <td className="text-sm font-mono">
            {formatNumber(
              nativeToUi(amount, window.adrena.client.adxToken.decimals),
              2,
            )}{' '}
            ADX
          </td>

          <td className="text-sm font-mono">
            {new Date(Number(stakeTime) * 1000).toLocaleString('en', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </td>

          <td className="text-sm font-mono">
            {Number(claimTime) !== 0
              ? new Date(Number(claimTime) * 1000).toLocaleString('en', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '–'}
          </td>

          <td className="text-sm font-mono">
            {Number(overlapTime) !== 0
              ? new Date(Number(overlapTime) * 1000).toLocaleString('en', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '–'}
          </td>

          <td className="text-sm font-mono">
            {nativeToUi(overlapAmount, window.adrena.client.adxToken.decimals)}
            ADX
          </td>

          <td className="text-sm">
            <Button
              className="w-full"
              variant="secondary"
              title={'Redeem'}
              onClick={() => setIsModalOpen(true)}
              size="sm"
            />

            {isModalOpen ? (
              <Modal
                title="Remove Stake"
                close={() => setIsModalOpen(false)}
                className="flex flex-col items-center  px-3 pb-3"
              >
                <div>
                  <div className="flex flex-row justify-between mb-2">
                    <p className="text-xs opacity-50 font-medium">
                      {' '}
                      Enter Amount
                    </p>
                    <p className="text-xs font-medium">
                      <span className="opacity-50"> Total reedemable · </span>
                      {totalLiquidStaked
                        ? `${formatNumber(totalLiquidStaked, 2)} ADX`
                        : '–'}
                    </p>
                  </div>
                  <div className="relative flex flex-row w-full">
                    <div className="flex items-center bg-[#242424] border border-gray-300 rounded-l-lg px-3  border-r-none">
                      <p className="opacity-50 font-mono text-sm">ADX</p>
                    </div>
                    <input
                      className="w-full bg-dark border border-gray-300 rounded-lg rounded-l-none p-3 px-4 text-xl font-mono"
                      type="number"
                      value={adxAmount ?? ''}
                      onChange={(e) => {
                        if (!e.target.value) {
                          setAdxAmount(null);
                          return;
                        }
                        setAdxAmount(Number(e.target.value));
                      }}
                      placeholder="0.00"
                    />

                    <Button
                      className="absolute right-2 bottom-[20%]"
                      title="MAX"
                      variant="text"
                      onClick={() => {
                        if (!totalLiquidStaked) {
                          return;
                        }
                        setAdxAmount(totalLiquidStaked);
                      }}
                    />
                  </div>
                </div>

                <Button
                  className="w-full mt-3"
                  size="lg"
                  title="Redeem"
                  disabled={!adxAmount}
                  onClick={() => {
                    if (!adxAmount) {
                      return;
                    }
                    handleRemoveLiquidStake(adxAmount);
                    setIsModalOpen(false);
                  }}
                />
              </Modal>
            ) : null}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
