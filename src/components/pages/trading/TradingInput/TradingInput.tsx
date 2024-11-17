import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { Token } from '@/types';

import InputNumber from '../../../common/InputNumber/InputNumber';
import Select from '../../../common/Select/Select';

export default function TradingInput({
  className,
  inputClassName,
  tokenListClassName,
  menuClassName,
  menuOpenBorderClassName,
  disabled,
  loading,
  value,
  subText,
  selectedToken,
  tokenList,
  prefix,
  placeholder = '0.00',
  onTokenSelect,
  onChange,
}: {
  className?: string;
  inputClassName?: string;
  tokenListClassName?: string;
  menuClassName?: string;
  menuOpenBorderClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  subText?: ReactNode;
  value?: number | null;
  selectedToken?: Token;
  tokenList: Token[];
  prefix?: ReactNode;
  placeholder?: string;
  onTokenSelect?: (t: Token) => void;
  onChange: (v: number | null) => void;
}) {
  const decimalConstraint = selectedToken?.decimals ?? 18;

  return (
    <div className={twMerge('relative flex flex-col', className)}>
      <div
        className={twMerge(
          'rounded-lg flex w-full border h-16',
          inputClassName,
        )}
        style={
          disabled
            ? {
              backgroundSize: '10px 10px',
              cursor: 'not-allowed',
            }
            : {}
        }
      >
        <div
          className={twMerge(
            'flex items-center w-full justify-center flex-col pl-4',
            disabled ? 'opacity-60' : '',
          )}
        >
          <div className="flex w-full items-center">
            {loading ? (
              <span className="w-full text-txtfade">loading ...</span>
            ) : (
              <>
                {prefix ? prefix : null}

                <div className="flex flex-col">
                  <InputNumber
                    disabled={disabled}
                    value={value ?? undefined}
                    placeholder={placeholder}
                    className={twMerge(
                      'font-mono border-0 text-lg outline-none w-full',
                      inputClassName,
                      disabled ? 'bg-transparent' : '',
                    )}
                    onChange={onChange}
                    decimalConstraint={decimalConstraint}
                  />

                  {subText ? subText : null}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-row gap-3 items-center">
          {tokenList.length ? (
            <Select
              className={twMerge(
                'shrink-0 bg-third h-full flex items-center w-[10em] rounded-tr-lg',
                tokenList.length > 1 ? 'justify-end' : 'justify-center',
                tokenListClassName,
              )}
              menuClassName={menuClassName}
              menuOpenBorderClassName={menuOpenBorderClassName}
              selected={selectedToken?.symbol ?? ''}
              options={tokenList.map((token) => ({
                title: token.symbol,
                img: token.image,
              }))}
              onSelect={(name) => {
                // Force linting, you cannot not find the token in the list
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const token = tokenList.find((t) => t.symbol === name)!;
                onTokenSelect?.(token);

                // if the prev value has more decimals than the new token, we need to adjust the value
                const newTokenDecimals = token.decimals ?? 18;
                const decimals = value?.toString().split('.')[1]?.length;

                if (Number(decimals) > Number(newTokenDecimals)) {
                  onChange(Number(value?.toFixed(newTokenDecimals)));
                }
              }}
            />
          ) : (
            <div className="flex items-center mr-4">
              {selectedToken?.symbol ?? '-'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
