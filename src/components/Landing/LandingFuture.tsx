import Image from 'next/image';

import adrenasinoIllustration from '/public/images/adrenasino-illustration.svg';
import betsIllustration from '/public/images/bets-illustration.svg';
import dexAggIllustration from '/public/images/dex-agg-illustration.svg';
import adrenasinoIcon from '/public/images/Icons/adrenasino-icon.svg';
import betsIcon from '/public/images/Icons/bets-icon.svg';
import dexAggIcon from '/public/images/Icons/dex-agg-icon.svg';
import unificationIcon from '/public/images/Icons/unification-icon.svg';
import unificationIllustration from '/public/images/unification-illustration.svg';
import { ImageRef } from '@/types';

import LiveIcon from '../common/LiveIcon/LiveIcon';

type CardInfo = {
  category: string;
  title: string;
  description: string;
  icon: ImageRef;
  illustration: ImageRef;
};
export default function LandingFuture() {
  const CARD_INFO: CardInfo[] = [
    {
      category: 'Trading',
      title: 'Dex Aggregator',
      description:
        'Plug into Hyperliquid, dYdX, Aster or any new platform — giving traders deep liquidity and the lowest fees through a single, unified interface. ',
      icon: dexAggIcon,
      illustration: dexAggIllustration,
    },
    {
      category: 'Gamification',
      title: 'Adrenasino',
      description:
        'A permissionless-style casino where builders can launch their own games, powered by a new Gambling Liquidity Pool. ',
      icon: adrenasinoIcon,
      illustration: adrenasinoIllustration,
    },
    {
      category: 'UI/UX',
      title: 'Unification',
      description:
        'One trade history, one tax export, one airdrop claim page. Trading isn’t just numbers, it’s also UX.  ',
      icon: unificationIcon,
      illustration: unificationIllustration,
    },
    {
      category: 'Diversity',
      title: 'Bets',
      description:
        'From prediction markets to sports bets, Adrena expands beyond trading into markets where anything can be wagered. ',
      icon: betsIcon,
      illustration: betsIllustration,
    },
  ];

  return (
    <div className="flex flex-col gap-[3.125rem] items-center w-full">
      <div>
        <h2 className="text-[3.3125rem] capitalize text-center bg-gradient-to-r from-[#959DF5] to-white bg-clip-text text-transparent">
          Leverage On Everything
        </h2>
        <p className="opacity-50 max-w-[37.5rem] text-center">
          Consolidate specs, milestones, tasks, and other documentation in one
          centralized location.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 flex-wrap gap-3 w-full">
        {CARD_INFO.map((data) => (
          <Card key={data.title} data={data} />
        ))}
      </div>
    </div>
  );
}

const Card = ({ data }: { data: CardInfo }) => {
  return (
    <div className="w-full border border-dashed rounded-lg">
      <div
        className="p-2 px-3 w-full border-b border-dashed"
        style={{
          background:
            'repeating-linear-gradient(-45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 1px, transparent 1px, transparent 6px)',
        }}
      >
        <div className="flex flex-row gap-2 items-center opacity-50">
          <LiveIcon />
          <p className="text-base font-semibold">{data.category}</p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex flex-row items-center gap-2">
          <Image src={data.icon} alt={data.title} className="w-4 h-4" />
          <h2 className="font-semibold cap">{data.title}</h2>
        </div>
        <div className="mt-2">
          <p className="opacity-75 max-w-[37.5rem]">{data.description}</p>
        </div>
        <div className="py-5 px-6 flex justify-center h-full items-center">
          <Image
            src={data.illustration}
            alt={data.title + ' illustration'}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
