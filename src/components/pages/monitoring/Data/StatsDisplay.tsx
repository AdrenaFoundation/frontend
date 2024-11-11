import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';

import liveIcon from '../../../../../public/images/Icons/live-icon.svg';

export default function StatsDisplay({
  stats,
  title,
  isLive,
  className,
}: {
  stats: {
    name: string;
    value: number;
    format: 'number' | 'currency' | 'percentage';
    precision?: number;
    suffix?: string;
    bodyClassName?: string;
    isDecimalDimmed?: boolean;
  }[];
  title?: string;
  isLive?: boolean;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        'bg-[#050D14] border rounded-lg flex-1 shadow-xl',
        className,
      )}
    >
      <div className="flex flex-row gap-2 w-full border-b p-3">
        <p className="text-lg">{title}</p>

        {isLive && (
          <Image
            src={liveIcon}
            alt="Live icon"
            width={12}
            height={12}
            className="animate-pulse"
          />
        )}
      </div>

      <div className="grid sm:grid-cols-2">
        <NumberDisplay
          title={stats[0].name}
          nb={stats[0].value}
          precision={stats[0].precision}
          format={stats[0].format}
          suffix={stats[0].suffix}
          className="rounded-none border-t-0 border-l-0 border-r-0 border-b sm:border-r"
          bodyClassName={stats[0].bodyClassName}
          isDecimalDimmed={stats[0].isDecimalDimmed}
        />

        <NumberDisplay
          title={stats[1].name}
          nb={stats[1].value}
          precision={stats[1].precision}
          format={stats[1].format}
          suffix={stats[1].suffix}
          className="rounded-none border-t-0 border-l-0 border-r-0 border-b"
          bodyClassName={stats[1].bodyClassName}
          isDecimalDimmed={stats[1].isDecimalDimmed}
        />

        <NumberDisplay
          title={stats[2].name}
          nb={stats[2].value}
          precision={stats[2].precision}
          format={stats[2].format}
          suffix={stats[2].suffix}
          className="rounded-none border-t-0 border-l-0 border-r-0 border-b sm:border-r"
          bodyClassName={stats[2].bodyClassName}
          isDecimalDimmed={stats[2].isDecimalDimmed}
        />

        <NumberDisplay
          title={stats[3].name}
          nb={stats[3].value}
          precision={stats[3].precision}
          format={stats[3].format}
          suffix={stats[3].suffix}
          className="rounded-none border-t-0 border-l-0 border-r-0 border-b"
          bodyClassName={stats[3].bodyClassName}
          isDecimalDimmed={stats[3].isDecimalDimmed}
        />

        <NumberDisplay
          title={stats[4].name}
          nb={stats[4].value}
          precision={stats[4].precision}
          format={stats[4].format}
          suffix={stats[4].suffix}
          className="rounded-none border-t-0 border-l-0 border-r-0 border-b-0 sm:border-r"
          bodyClassName={stats[4].bodyClassName}
          isDecimalDimmed={stats[4].isDecimalDimmed}
        />

        <NumberDisplay
          title={stats[5].name}
          nb={stats[5].value}
          precision={stats[5].precision}
          format={stats[5].format}
          suffix={stats[5].suffix}
          className="rounded-none border-t border-l-0 border-r-0 border-b-0 sm:border-t-0"
          bodyClassName={stats[5].bodyClassName}
          isDecimalDimmed={stats[5].isDecimalDimmed}
        />
      </div>
    </div>
  );
}
