import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { Token } from '@/types';

import Button from '../../../common/Button/Button';
import InputNumber from '../../../common/InputNumber/InputNumber';
import Select from '../../../common/Select/Select';

export default function TradingInput({
  className,
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
  return (
    <div className={twMerge('relative', 'flex', 'flex-col', className)}>
      {/* Input A */}
      <div
        className={twMerge(
          'h-24 p-4  border border-gray-300 rounded-lg flex items-center w-full justify-between flex-col',
          disabled ? 'bg-gray-200' : 'bg-dark',
        )}
      >
        <div className="shrink-0 flex items-center w-full justify-between">
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
                disabled ? 'bg-gray-200' : 'bg-dark',
              )}
              onChange={onChange}
            />
          )}

          {maxButton ? (
            <Button
              title="MAX"
              className="bg-gray-300 opacity-50 hover:opacity-100 border-grey mr-2 text-sm h-6"
              onClick={() => onMaxButtonClick?.()}
            />
          ) : null}

          {tokenList.length ? (
            <Select
              className="shrink-0 text-2xl"
              selected={selectedToken?.symbol ?? ''}
              options={tokenList.map((v) => v.symbol)}
              onSelect={(name) => {
                // Force linting, you cannot not find the token in the list
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                onTokenSelect(
                  tokenList.find((token) => token.symbol === name)!,
                );
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
