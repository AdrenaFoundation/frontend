import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import downloadIcon from '@/../public/images/download.png';
import FormatNumber from '@/components/Number/FormatNumber';
import { normalize } from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';

export const TotalRewardsCell = ({
  totalRewards,
  maxValue,
  minValue,
  isIndicator,
}: {
  totalRewards: number;
  maxValue: number;
  minValue: number;
  isIndicator: boolean;
}) => {
  const scaleMax = Math.max(Math.abs(maxValue), Math.abs(minValue)) || 1;
  const heightPct = normalize(totalRewards, 10, 100, 0, scaleMax);

  return (
    <div>
      <FormatNumber
        nb={totalRewards}
        precision={2}
        isDecimalDimmed={false}
        format="currency"
        suffixClassName="text-sm text-green"
        prefix="+ "
        className="text-sm text-green"
      />
      {isIndicator ? (
        <div
          className={twMerge(
            'absolute bottom-0 left-0 bg-green/10 w-full pointer-events-none z-0',
          )}
          style={{ height: `${heightPct}%` }}
        />
      ) : null}
    </div>
  );
};

export const BottomBar = ({
  stats,
  onDownloadClick,
}: {
  stats: {
    title: string;
    value: number;
    format?: 'currency' | 'number';
  }[];
  onDownloadClick: () => void;
}) => {
  const isMobile = useBetterMediaQuery('(max-width: 640px)');

  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row items-center gap-2 sm:gap-5 p-1.5 px-2 sm:px-3 border-r border-r-inputcolor">
        {stats.map((stat) => (
          <div key={stat.title} className="flex flex-row gap-2 items-center">
            <p className="text-xs font-mono opacity-50">{stat.title}</p>
            <FormatNumber
              nb={stat.value}
              format={stat.format}
              isDecimalDimmed={false}
              className="text-xs font-semibold"
              isAbbreviate={!!isMobile}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-row items-center">
        <div
          className="flex flex-row items-center p-1.5 px-2 sm:px-3 border-l border-l-inputcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300"
          onClick={onDownloadClick}
        >
          <Image
            src={downloadIcon}
            alt="Download"
            width={16}
            height={16}
            className="w-4 h-4"
          />
        </div>
      </div>
    </div>
  );
};
