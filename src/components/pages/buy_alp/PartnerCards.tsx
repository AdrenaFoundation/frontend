import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface Partner {
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  buttonBgColor: string;
  icon: string;
  gradientColors: string;
  bgColor: string;
  link: string;
}

const PartnerCard: React.FC<Partner> = ({
  gradientColors,
  bgColor,
  icon,
  title,
  description,
  buttonText,
  buttonColor,
  buttonBgColor,
  link,
}) => (
  <div className={twMerge('relative p-[1px] rounded-xl', gradientColors)}>
    <div
      className={twMerge(
        'flex flex-row items-center justify-between p-4 rounded-xl h-15 relative z-10',
        bgColor,
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <Image
          src={icon}
          alt={`${title} icon`}
          width={title ? 20 : 80}
          height={title ? 20 : 24}
          className={title ? 'w-5 h-5' : 'h-4 w-auto'}
        />
        <p className="text-sm text-white">{description}</p>
      </div>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={twMerge(
          'w-fit px-3 py-1 rounded-full text-sm font-interMedium',
          buttonBgColor,
          buttonColor,
        )}
      >
        {buttonText}
      </a>
    </div>
  </div>
);

const PARTNERS: Partner[] = [
  {
    title: '',
    description: 'Boost your ALP with leverage loop',
    buttonText: 'Loop Now',
    buttonColor: 'text-orange',
    buttonBgColor: 'bg-orange/20',
    icon: '/images/carrot.svg',
    gradientColors:
      'bg-[linear-gradient(110deg,#17E400,#f77f00,#17E400)] animate-text-shimmer bg-[length:250%_100%]',
    bgColor: 'bg-secondary/[0.99]',
    link: 'https://boost.deficarrot.com/tokens/GyTsdytwPU2oRK9YfpJz8Nb5auxuPegSPrTA5gWTb2o',
  },
  {
    title: '',
    description: 'Multiply your yield with low-risk looping',
    buttonText: 'Loop Now',
    buttonColor: 'text-[#908dff]',
    buttonBgColor: 'bg-[#908dff]/20',
    icon: '/images/kamino.svg',
    gradientColors:
      'bg-[linear-gradient(110deg,#2b5dff,#001763,#2b5dff)] animate-text-shimmer bg-[length:250%_100%]',
    bgColor: 'bg-secondary/[0.99]',
    link: 'https://app.kamino.finance/multiply/CTthJu49dgPkCgu9TKQProuaQnkHsRPQV33sSJ96vxpG/D1ZdZSNfn6nfzEyK6uvFCcRi8SzihnPdYHLtnjBjwxGn/5bgPMvzZv29jkFEuMwxQRJQf64gKcPfLEEUHhyrP8tce',
  },
  {
    title: '',
    description: 'Loop your ALP with loop vaults',
    buttonText: 'Loop Now',
    buttonColor: 'text-blue',
    buttonBgColor: 'bg-blue/20',
    icon: '/images/loopscale.svg',
    gradientColors:
      'bg-[linear-gradient(110deg,#1e56ff,#7e9eff,#1e56ff)] animate-text-shimmer bg-[length:250%_100%]',
    bgColor: 'bg-secondary/[0.99]',
    link: 'https://app.loopscale.com/loops/alpLi5yWGzpTWMQ1iWHG5CrGYAdBkhyEdsuSugjDUqwj',
  },
];

export default function PartnerCards({ className }: { className?: string }) {
  return (
    <div className={twMerge('w-full', className)}>
      <div className="grid grid-cols-1 gap-3">
        {PARTNERS.map((partner) => (
          <PartnerCard key={partner.title} {...partner} />
        ))}
      </div>
    </div>
  );
}
