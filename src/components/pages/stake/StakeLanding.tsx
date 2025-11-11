import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import { ADX_LOCK_PERIODS, ADX_STAKE_MULTIPLIERS } from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useDispatch } from '@/store/store';

import adxLogo from '../../../../public/images/adrena_logo_adx_white.svg';
import adxMonster from '../../../../public/images/ADX_monster.png';
import governanceIcon from '../../../../public/images/governance.svg';
import Table from '../monitoring/TableLegacy';

export default function StakeLanding({
  handleClickOnStakeMoreADX,
  connected,
}: {
  connected: boolean;
  handleClickOnStakeMoreADX: () => void;
}) {
  const [selectedAdxDays, setSelectedAdxDays] = useState('180d');

  const dispatch = useDispatch();

  const handleClick = () => {
    if (!connected) {
      return dispatch(openCloseConnectionModalAction(true));
    }
    return handleClickOnStakeMoreADX();
  };

  const token = useMemo(
    () => ({
      name: 'ADX',
      desc: "Own a share of the protocol: Adx governance token provides yield and voting power when staked. Align with the protocol's long term success and earn more. 20% of the protocol fees and revenues are distributed to stakers.",
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
    }),
    [selectedAdxDays],
  );

  const isMobile = useBetterMediaQuery('(max-width: 640px)');

  return (
    <div className="flex h-full flex-col sm:flex-row justify-between">
      <Image
        src={adxMonster}
        alt="ADX Monster"
        className="absolute bottom-10 right-32 grayscale select-none opacity-40 w-[100px] h-[100px]"
        width={100}
        height={100}
      />

      <div
        className="hidden sm:block absolute right-0 top-0 h-full flex-1 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 100%, #050D14 50%, #2A1010 100%)',
        }}
      ></div>

      <div
        className="flex-1 p-[30px] lg:px-[50px] z-20 h-full"
        style={
          isMobile
            ? {
                backgroundImage:
                  'radial-gradient(circle at bottom, #050F19 50%, #2A1010 100%)',
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
              width={40}
              height={40}
            />
          </div>
          <p
            className={twMerge(
              'text-base',
              token.name === 'ALP' && 'mb-[41px]',
            )}
          >
            {token.desc}
          </p>
        </div>

        <Button
          size="lg"
          title={`Stake ${token.name}`}
          className={twMerge(
            'mt-5 px-16 text-white border border-white/10',
            'bg-gradient-to-r from-[#DA1A31] to-[#DE1933]',
          )}
          onClick={() => handleClick()}
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
              <Image
                src={sp.icon}
                alt="icon"
                className="w-4 h-4"
                width={16}
                height={16}
              />
              <div>
                <h3 className="text-lg mb-1">{sp.title}</h3>
                <p className="text-base opacity-75">{sp.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div
          className={twMerge(
            'bg-secondary rounded-md border p-1 mt-10',
            'border-double border-[#da1a305f]',
          )}
        >
          <Table
            className="bg-transparent border-none"
            columnsTitles={token.days.map((d) =>
              d === 0 ? 'liquid' : `${d}d`,
            )}
            columnTitlesClassName="text-lg sm:text-sm text-white sm:opacity-50"
            rowTitleClassName="text-base sm:text-sm text-white opacity-50 uppercase font-semibold"
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
    </div>
  );
}
