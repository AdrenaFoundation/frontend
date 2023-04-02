import { AdrenaClient } from '@/AdrenaClient';
import Select from '@/components/Select/Select';
import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';
import { twMerge } from 'tailwind-merge';

export default function TradingInputs({
  className,
  tokenList,
  selected,
  onChange,
  client,
}: {
  className?: string;
  tokenList: Token[];
  selected: Token;
  onChange: (t: Token) => void;
  client: AdrenaClient | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const stats = useDailyStats(client);

  const infoStyle = 'flex w-1/5 flex-col ml-[5%] items-center justify-center';

  return (
    <div
      className={twMerge(
        'flex',
        'h-14',
        'bg-secondary',
        'border',
        'border-grey',
        'items-center',
        className,
      )}
    >
      <Select
        selected={`${selected.name} / USD`}
        options={tokenList
          .filter((token) => token.name !== selected.name)
          .map((token) => `${token.name} / USD`)}
        onSelect={(opt: string) => {
          const selectedTokenName = opt.slice(0, opt.length - ' / USD'.length);
          // Force linting, you cannot not find the token in the list
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const token = tokenList.find((t) => t.name === selectedTokenName)!;

          // Should never happens
          if (!token) return;

          onChange(token);
        }}
      />

      <div className={infoStyle}>
        {tokenPrices && tokenPrices[selected.name]
          ? // Force linting, we check it just bellow
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            formatPriceInfo(tokenPrices[selected.name]!)
          : null}
      </div>

      <div className={infoStyle}>
        <span className="text-sm text-txtfade">24h Change</span>
        <span
          className={twMerge(
            'mt-0.5',
            stats && stats[selected.name].dailyChange > 0
              ? 'text-green-400'
              : 'text-red-400',
          )}
        >
          {stats
            ? `${formatNumber(stats[selected.name].dailyChange, 2)}%`
            : '-'}
        </span>
      </div>

      <div className={infoStyle}>
        <span className="text-sm text-txtfade">24h Volume</span>
        <span className="mt-0.5">
          {stats ? formatPriceInfo(stats[selected.name].dailyVolume) : '-'}
        </span>
      </div>
    </div>
  );
}
