import Image from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import {
  ADX_LOCK_PERIODS,
  ADX_STAKE_MULTIPLIERS,
  ALP_LOCK_PERIODS,
  ALP_STAKE_MULTIPLIERS,
} from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useDispatch } from '@/store/store';

import adxLogo from '../../../../public/images/adrena_logo_adx_white.svg';
import alpLogo from '../../../../public/images/adrena_logo_alp_white.svg';
import adxMonster from '../../../../public/images/ADX_monster.png';
import alpMonster from '../../../../public/images/ALP_monster.png';
import governanceIcon from '../../../../public/images/governance.svg';
import Table from '../monitoring/Table';

export default function StakeLanding({
  handleClickOnStakeMoreALP,
  handleClickOnStakeMoreADX,
  connected,
}: {
  connected: boolean;
  handleClickOnStakeMoreALP: () => void;
  handleClickOnStakeMoreADX: () => void;
}) {
  const [selectedAdxDays, setSelectedAdxDays] = useState('180d');
  const [selectedAlpDays, setSelectedAlpDays] = useState('180d');

  const dispatch = useDispatch();

  const handleClick = (token: 'ALP' | 'ADX') => {
    if (!connected) {
      return dispatch(openCloseConnectionModalAction(true));
    }
    token === 'ADX' ? handleClickOnStakeMoreADX() : handleClickOnStakeMoreALP();
  };

  const TOKENS = [
    {
      name: 'ALP',
      desc: 'Provide liquidities long term: the longer the period, the higher the rewards. 70% of protocol fees are distributed to ALP holder and stakers.',
      logo: alpLogo,
      sellingPoints: [
        {
          title: 'USDC yield',
          desc: 'Base yield for all holders in the form of USDC. They originate from platform fees and revenues (70%), and are continuously being distributed to the pool, growing the value of your ALP shares automatically.',
          icon: window.adrena.client.tokens.find((t) => t.symbol === 'USDC')
            ?.image,
        },
        {
          title: 'ADX yield',
          desc: 'For the most committed users who Lock Stake their ALP, an extra yield distributed as ADX token. The yield amount is a function of the lock duration.',
          icon: window.adrena.client.adxToken.image,
        },
      ],
      days: ALP_LOCK_PERIODS,
      benefits: ALP_STAKE_MULTIPLIERS,
      selectedDay: selectedAlpDays,
      setSelectedDay: setSelectedAlpDays,
    },
    {
      name: 'ADX',
      desc: 'Own a share of the protocol: Adx governance token provides yield and voting power when staked. Align with the protocol long term success and earn more. 20% of the protocol fees and revenues are distributed to stakers.',
      logo: adxLogo,
      sellingPoints: [
        {
          title: 'USDC yield',
          desc: 'Base yield for all staker in the form of USDC. They originate from platform fees and revenues (20%)',
          icon: window.adrena.client.tokens.find((t) => t.symbol === 'USDC')
            ?.image,
        },
        {
          title: 'ADX yield',
          desc: 'For the most committed users who Lock Stake their ALP, an extra yield distributed as ADX token. The yield amount is a function of the lock duration.',
          icon: window.adrena.client.adxToken.image,
        },
        {
          title: 'Governance Boost',
          desc: 'Lock Stake your ADX and receive amplified voting rights to influence the protocol. The additional voting rights is a function of the lock duration, and only available during the lock duration.',
          icon: governanceIcon,
        },
      ],
      days: ADX_LOCK_PERIODS,
      benefits: ADX_STAKE_MULTIPLIERS,
      selectedDay: selectedAdxDays,
      setSelectedDay: setSelectedAdxDays,
    },
  ];

  const isMobile = useBetterMediaQuery('(max-width: 640px)');

  const LANDING = (token: (typeof TOKENS)[0]) => {
    return (
      <div
        className="flex-1 p-[30px] sm:px-[50px] sm:py-0 z-20 h-full"
        style={
          isMobile
            ? {
                backgroundImage: `${
                  token.name === 'ALP'
                    ? 'radial-gradient(circle at bottom, #050F19 50%, #10112A 100%)'
                    : 'radial-gradient(circle at bottom, #050F19 50%, #2A1010 100%)'
                }`,
              }
            : {}
        }
      >
        <div>
          <div className="flex flex-row gap-3 items-center">
            <h1 className="text-[3rem]">{token.name}</h1>
            <Image
              src={token.logo}
              alt="logo"
              className="w-10 h-10 opacity-10"
            />
          </div>
          <p className="text-base">{token.desc}</p>
        </div>

        <Button
          size="lg"
          title={`Stake ${token.name}`}
          className={twMerge(
            'mt-5 px-16 text-white border border-white/10',
            token.name === 'ALP'
              ? 'bg-gradient-to-r from-[#3B2ED2] to-[#5A2ABE]'
              : 'bg-gradient-to-r from-[#DA1A31] to-[#DE1933]',
          )}
          onClick={() => handleClick(token.name as 'ALP' | 'ADX')}
        />

        <div className="w-full h-[1px] bg-bcolor my-[30px]" />

        <ul>
          {token.sellingPoints.map((sp, idx) => (
            <li
              key={idx}
              className={twMerge(
                'flex flex-row gap-3 items-center',
                idx !== token.sellingPoints.length - 1 && 'mb-5',
              )}
            >
              <Image src={sp.icon} alt="icon" className="w-4 h-4" />
              <div>
                <h3 className="text-lg mb-1">{sp.title}</h3>
                <p className="text-base opacity-75">{sp.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div
          className={twMerge(
            'bg-secondary rounded-lg border p-1 mt-10',
            token.name === 'ALP'
              ? 'border-double border-[#3c2ed25f]'
              : 'border-double border-[#da1a305f]',
          )}
        >
          <Table
            className="bg-transparent border-none"
            columnsTitles={token.days.map((d) =>
              d === 0 ? 'liquid' : `${d}d`,
            )}
            columnTitlesClassName="text-lg sm:text-sm text-white sm:opacity-50"
            rowTitleClassName="text-base sm:text-sm text-white opacity-50 uppercase font-boldy"
            columnWrapperClassName="ml-1"
            data={[
              {
                rowTitle: 'USDC yield',
                values: Object.values(token.benefits).map((v) => `${v.usdc}x`),
              },
              {
                rowTitle: 'ADX yield',
                values: Object.values(token.benefits).map((v) => `${v.adx}x`),
              },
            ].concat(
              token.name === 'ADX'
                ? {
                    rowTitle: 'Voting power',
                    values: Object.values(ADX_STAKE_MULTIPLIERS).map(
                      (v) => `${v.votes}x`,
                    ),
                  }
                : [],
            )}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col sm:flex-row justify-between">
      <>
        <Image
          src={alpMonster}
          alt="ALP Monster"
          className="absolute bottom-0 left-0 w-1/2 grayscale scale-[0.75]"
        />
        <div
          className="hidden sm:block absolute left-0 top-0 w-1/2 h-full flex-1 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 100%, #050D14 50%, #10112A 100%)',
          }}
        ></div>

        {LANDING(TOKENS[0])}
      </>

      <div className="w-full h-[2px] sm:w-[1px] sm:h-full bg-gradient-to-r sm:bg-gradient-to-t from-[#307BEB] to-[#F05634] z-10 opacity-50" />

      <>
        <Image
          src={adxMonster}
          alt="ADX Monster"
          className="absolute bottom-10 right-32 w-1/2 grayscale"
        />
        <div
          className="hidden sm:block absolute right-0 top-0 w-1/2 h-full flex-1 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 100%, #050D14 50%, #2A1010 100%)',
          }}
        ></div>

        {LANDING(TOKENS[1])}
      </>
    </div>
  );
}
