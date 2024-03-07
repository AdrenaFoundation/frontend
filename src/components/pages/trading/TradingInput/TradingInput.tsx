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
  value,
  subText,
  maxButton,
  selectedToken,
  tokenList,
  prefix,
  placeholder = '0.00',
  onTokenSelect,
  onChange,
  onMaxButtonClick,
}: {
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  subText?: ReactNode;
  value?: number | null;
  maxButton?: boolean;
  selectedToken?: Token;
  tokenList: Token[];
  prefix?: ReactNode;
  placeholder?: string;
  onTokenSelect: (t: Token) => void;
  onChange: (v: number | null) => void;
  onMaxButtonClick?: () => void;
}) {
  const decimalConstraint = selectedToken?.decimals ?? 18;

  return (
    <div className={twMerge('relative flex flex-col', className)}>
      <div
        className={twMerge(
          'rounded-2xl flex w-full border h-16',
          disabled ? 'bg-transparent' : 'bg-dark',
          inputClassName,
        )}
        style={
          disabled
            ? {
                backgroundImage:
                  'linear-gradient(45deg, rgba(3, 6, 9, 0.1) 25%, transparent 25%, transparent 50%, rgba(3, 6, 9, 0.1) 50%, rgba(3, 6, 9, 0.1) 75%, transparent 75%, transparent)',
                backgroundSize: '10px 10px',
                backgroundColor: '#21272d',
                cursor: 'not-allowed',
              }
            : {}
        }
      >
        <div className="flex items-center w-full justify-center flex-col pl-4">
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
                      disabled ? 'bg-transparent' : 'bg-dark',
                    )}
                    onChange={onChange}
                    decimalConstraint={decimalConstraint}
                  />

                  {subText ? subText : null}
                </div>
              </>
            )}

            {maxButton ? (
              <Button
                title="MAX"
                variant="secondary"
                className="mx-2 text-sm h-6"
                onClick={() => onMaxButtonClick?.()}
              />
            ) : null}
          </div>
        </div>

        {tokenList.length ? (
          <Select
            className={twMerge(
              'shrink-0 bg-secondary h-full flex items-center rounded rounded-tr-2xl rounded-br-2xl w-24',
              tokenList.length > 1 ? 'justify-end' : 'justify-center',
            )}
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
          <div className="flex items-center mr-4">
            {selectedToken?.symbol ?? '-'}
          </div>
        )}
      </div>
    </div>
  );
}
