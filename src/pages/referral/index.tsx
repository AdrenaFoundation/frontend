import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import Image from 'next/image';
import React, { useState } from 'react';

import Button from '@/components/common/Button/Button';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import { formatPriceInfo } from '@/utils';

import copyIcon from '../../../public/images/copy.svg';
import monsterImage from '../../../public/images/monster-1.png';

export default function Referral() {
  const [referred, setReferred] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [totalClaimable, setTotalClaimable] = useState(0);
  const [tradingVolum, setTradingVolum] = useState(0);
  const [totalReferred, setTotalReferred] = useState(0);
  const [referralCode, setReferralCode] = useState('');

  const link = 'https://alpha.adrena.xyz/?ref=';

  return (
    <>
      <RiveAnimation
        src="./rive/btm-monster.riv"
        layout={
          new Layout({ fit: Fit.Contain, alignment: Alignment.BottomRight })
        }
        className={
          'fixed lg:absolute right-0 bottom-0 w-full h-full overflow-hidden'
        }
      />

      <div className="flex flex-col gap-8 z-20">
        <div className="bg-gray-300/85 backdrop-blur-md border border-gray-200 rounded-2xl p-5">
          <h2>Referral</h2>
          <p className="max-w-lg opacity-75 mt-2">
            Unlock ADX Tokens! 🚀 Refer friends to the Adrena platform and earn
            ADX tokens. Check out the referral program details for more info.
          </p>

          <div className="flex flex-row gap-3 w-full">
            <div className="w-full">
              <p className="opacity-50 mt-6 mb-3">Your Referral Link</p>

              <div className="flex flex-row gap-3 w-full">
                <div className="flex flex-row justify-between items-center bg-gray-200 border border-gray-400 rounded-xl px-3 p-2 w-full">
                  <p className="opacity-50">{link + referralCode}</p>
                  <Button
                    leftIcon={copyIcon}
                    variant="secondary"
                    className="w-8 h-8 rounded-lg"
                    size="sm"
                    onClick={() => console.log('hello')}
                  />
                </div>
              </div>
            </div>

            <div className="w-full">
              <p className="opacity-50 mt-6 mb-3">Your Referral Code</p>
              <div className="flex flex-row justify-between items-center bg-gray-200 border border-gray-400 rounded-xl px-3 p-2 w-full">
                <p className="opacity-50">
                  {referralCode === '' ? '-' : referralCode}
                </p>
                <Button
                  leftIcon={copyIcon}
                  variant="secondary"
                  className="w-8 h-8 rounded-lg"
                  size="sm"
                  onClick={() => console.log('hello')}
                />
              </div>
            </div>
          </div>

          <p className="mt-6 text-blue-700 hover:opacity-50 transition-opacity duration-300 cursor-pointer">
            Have you been referred? Enter code here
          </p>
        </div>

        <div className="flex flex-row gap-3 justify-between bg-gray-300/85 backdrop-blur-md border border-gray-200 rounded-2xl">
          <div className="flex flex-col gap-3 w-full p-5">
            <p className="opacity-50">Est. Earnings</p>
            <p className="text-3xl font-mono">{earnings} ADX</p>
          </div>

          <div className="flex flex-col gap-3  w-full p-5 border-x border-x-gray-200">
            <p className="opacity-50">Active Referrals</p>
            <p className="text-3xl font-mono">{totalReferred}</p>
          </div>

          <div className="flex flex-col gap-3 w-full p-5">
            <p className="opacity-50">Trading volum from referrals</p>
            <p className="text-3xl font-mono">
              {formatPriceInfo(tradingVolum)}
            </p>
          </div>
        </div>

        <div className="bg-gray-300 border border-gray-200 rounded-2xl">
          <div className="flex flex-row gap-3 justify-between items-center p-5 border-b border-b-gray-200">
            <div>
              <p className="opacity-50 mb-1">Total claimable reward</p>
              <p className="text-2xl font-mono">{totalClaimable} ADX</p>
            </div>
            <Button
              title="Claim all tokens"
              disabled={totalClaimable === 0}
              className="bg-white hover:bg-transparent text-dark hover:text-white border border-gray-200 rounded-xl px-12 py-3"
              size="lg"
            />
          </div>

          <div className="p-5">
            <p className="opacity-50 mt-3">Referred</p>

            <div className="flex flex-col gap-5 rounded-xl p-5 border border-gray-400 mt-3">
              <div className="flex flex-row gap-3 justify-between items-center ">
                <div className="flex flex-row gap-12 items-center">
                  <div className="flex flex-row gap-3 items-center">
                    <Image
                      className="rounded-full bg-white overflow-hidden shadow-lg shadow-[#ffffff50]"
                      src={monsterImage}
                      alt="profile picture"
                      width={40}
                      height={40}
                    />

                    <div>
                      <p className="opacity-50 text-sm mb-1">name</p>
                      <p className="font-medium">Orex</p>
                    </div>
                  </div>

                  <div>
                    <p className="opacity-50 text-sm mb-1">Current level</p>
                    <p className="font-medium">Sage</p>
                  </div>

                  <div>
                    <p className="opacity-50 text-sm mb-1">Referred</p>
                    <p className="font-medium">10/10/23</p>
                  </div>

                  <div>
                    <p className="opacity-50 text-sm mb-1">Trading volum</p>
                    <p className="font-medium font-mono">$10,391</p>
                  </div>

                  <div>
                    <p className="opacity-50 text-sm mb-1">Claimable ADX</p>
                    <p className="font-medium font-mono">1 ADX</p>
                  </div>
                </div>

                <Button
                  title="Claim"
                  variant="outline"
                  className="border border-gray-400 hover:border-gray-400 rounded-xl"
                  size="lg"
                />
              </div>

              <div className="flex items-center bg-gray-200 w-full h-2 rounded-full">
                <div className="bg-purple-800 w-[300px] h-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
