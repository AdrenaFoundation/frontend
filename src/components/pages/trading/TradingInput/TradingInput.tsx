import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { Token } from '@/types';

import Button from '../../../common/Button/Button';
import InputNumber from '../../../common/InputNumber/InputNumber';
import Select from '../../../common/Select/Select';

export default function TradingInput({
  className,
  inputClassName,
  disabled,
  loading,
  textTopLeft,
  textTopRight,
  value,
  maxButton,
  selectedToken,
  tokenList,
  onTokenSelect,
  onChange,
  onMaxButtonClick,
}: {
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  textTopLeft?: ReactNode;
  textTopRight?: ReactNode;
  value?: number | null;
  maxButton?: boolean;
  selectedToken?: Token;
  tokenList: Token[];
  onTokenSelect: (t: Token) => void;
  onChange: (v: number | null) => void;
  onMaxButtonClick?: () => void;
}) {
  const decimalConstraint = selectedToken?.decimals ?? 18;

  return (
    <div className={twMerge('relative', 'flex', 'flex-col', className)}>
      <div
        className={twMerge(
          'h-24 p-4  border border-gray-200 rounded-2xl flex items-center w-full justify-between flex-col',
          disabled ? 'bg-transparent' : 'bg-[#030609]',
          inputClassName,
        )}
        style={{
          background: disabled
            ? `repeating-linear-gradient(
            45deg,
            #0f1418,
            #0f1418 10px,
            #1b2126 10px,
            #1b2126 20px
          )`
            : '',
        }}
      >
        <div className="shrink-0 flex gap-3 items-center w-full justify-between">
          <div className="text-txtfade text-xs font-mono">{textTopLeft}</div>
          <div className="text-txtfade text-xs font-mono">{textTopRight}</div>
        </div>

        <div className="flex w-full items-center">
          {loading ? (
            <span className="w-full text-txtfade">loading ...</span>
          ) : (
            <InputNumber
              disabled={disabled}
              value={value ?? undefined}
              placeholder="0.00"
              className={twMerge(
                'font-mono font-medium border-0 text-lg outline-none w-full',
                disabled ? 'bg-transparent' : 'bg-[#030609]',
              )}
              onChange={onChange}
              decimalConstraint={decimalConstraint}
            />
          )}

          {maxButton ? (
            <Button
              title="MAX"
              variant="secondary"
              className="mx-2 text-sm h-6"
              onClick={() => onMaxButtonClick?.()}
            />
          ) : null}

          {tokenList.length ? (
            <Select
              className="shrink-0 text-2xl"
              selected={selectedToken?.symbol ?? ''}
              options={tokenList.map((token) => ({
                title: token.symbol,
                img: token.image,
              }))}
              onSelect={(name) => {
                // Force linting, you cannot not find the token in the list
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const token = tokenList.find((t) => t.symbol === name)!;
                onTokenSelect(token);

                // if the prev value has more decimals than the new token, we need to adjust the value
                const newTokenDecimals = token.decimals ?? 18;
                const decimals = value?.toString().split('.')[1]?.length;

                if (Number(decimals) > Number(newTokenDecimals)) {
                  onChange(Number(value?.toFixed(newTokenDecimals)));
                }
              }}
            />
          ) : (
            <div>{selectedToken?.symbol ?? '-'}</div>
          )}
        </div>
      </div>
    </div>
  );
}
