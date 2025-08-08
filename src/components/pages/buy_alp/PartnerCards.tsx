import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface Partner {
  description: string;
  icon: string;
  gradientColors: string;
  bgColor: string;
  link: string;
}

const PartnerCard: React.FC<Partner> = ({
  gradientColors,
  bgColor,
  icon,
  description,
  link,
}) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className={twMerge('relative p-[1px] rounded-xl block', gradientColors)}
  >
    <div
      className={twMerge(
        'flex flex-row items-center justify-between pt-3 pb-3 pl-5 pr-5 rounded-xl relative z-10 hover:opacity-90 transition-opacity duration-300 min-h-[2.75rem] max-h-[2.75rem]',
        bgColor,
      )}
    >
      <div className="flex-1">
        <p className="text-sm text-white">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        |
        <Image
          src={icon}
          alt="Partner logo"
          width={20}
          height={20}
          className={twMerge(
            'w-[5rem] h-auto object-contain',
            icon.includes('carrot') && 'translate-y-[-0.16rem]',
          )}
        />
        <Image
          src="/images/Icons/arrow-sm-45.svg"
          alt="External link"
          width={6}
          height={6}
          className="w-3 h-3"
        />
      </div>
    </div>
  </a>
);

const PARTNERS: Partner[] = [
  {
    description: 'Boost your ALP with leverage loop',
    icon: '/images/carrot.svg',
    gradientColors:
      'bg-[linear-gradient(110deg,#34D399,#F98635,#34D399)] animate-text-shimmer bg-[length:250%_100%]',
    bgColor: 'bg-secondary/[0.99]',
    link: 'https://boost.deficarrot.com/tokens/GyTsdytwPU2oRK9YfpJz8Nb5auxuPegSPrTA5gWTb2o',
  },
  {
    description: 'Multiply your yield with low-risk',
    icon: '/images/kamino.svg',
    gradientColors:
      'bg-[linear-gradient(110deg,#2b5dff,#001763,#2b5dff)] animate-text-shimmer bg-[length:250%_100%]',
    bgColor: 'bg-secondary/[0.99]',
    link: 'https://app.kamino.finance/multiply/CTthJu49dgPkCgu9TKQProuaQnkHsRPQV33sSJ96vxpG/D1ZdZSNfn6nfzEyK6uvFCcRi8SzihnPdYHLtnjBjwxGn/5bgPMvzZv29jkFEuMwxQRJQf64gKcPfLEEUHhyrP8tce',
  },
  {
    description: 'Loop your ALP up to 6x',
    icon: '/images/loopscale.svg',
    gradientColors:
      'bg-[linear-gradient(110deg,#c9c8ff,#0075ff,#c9c8ff)] animate-text-shimmer bg-[length:250%_100%]',
    bgColor: 'bg-secondary/[0.99]',
    link: 'https://app.loopscale.com/loops/alpLi5yWGzpTWMQ1iWHG5CrGYAdBkhyEdsuSugjDUqwj',
  },
  {
    description: 'Earn Fixed Yield on ALP',
    icon: '/images/exponent.svg',
    gradientColors:
      'bg-[linear-gradient(110deg,#001b03,#00ee1a,#001b03)] animate-text-shimmer bg-[length:250%_100%]',
    bgColor: 'bg-secondary/[0.99]',
    link: 'https://www.exponent.finance/liquidity/alp-20Oct25',
  },
  {
    description: 'Incentives for ALP-SOL providers',
    icon: '/images/meteora.svg',
    gradientColors:
      'bg-[linear-gradient(110deg,#ff7800,#5601d1,#ff7800)] animate-text-shimmer bg-[length:250%_100%]',
    bgColor: 'bg-secondary/[0.99]',
    link: 'https://www.meteora.ag/dlmm/39xxvte8BMaW7qBxeedFk9iauG42vxFsTA7yzM9X9cQN',
  },
  {
    description: 'Incentives for ALP-USDC providers',
    icon: '/images/meteora.svg',
    gradientColors:
      'bg-[linear-gradient(110deg,#5601d1,#ff7800,#5601d1)] animate-text-shimmer bg-[length:250%_100%]',
    bgColor: 'bg-secondary/[0.99]',
    link: 'https://www.meteora.ag/dlmm/4wM3eJMduZBFytW6VqV5DC2CaSovRrM2RJG8bJkroqLD',
  },
];

export default function PartnerCards({ className }: { className?: string }) {
  return (
    <div className={twMerge('w-full', className)}>
      <div className="grid grid-cols-1 gap-2">
        {PARTNERS.map((partner, index) => (
          <PartnerCard key={index} {...partner} />
        ))}
      </div>
    </div>
  );
}
