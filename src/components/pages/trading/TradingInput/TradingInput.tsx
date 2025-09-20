import Image from 'next/image';
import { ReactNode, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import chevronDownIcon from '@/../public/images/Icons/chevron-down.svg';
import { Token } from '@/types';

import InputNumber from '../../../common/InputNumber/InputNumber';
import { PickTokenModal } from './PickTokenModal';

export default function TradingInput({
  className,
  inputClassName,
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
  recommendedToken,
  isDisplayAllTokens = false,
  inputContainerClassName,
}: {
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  subText?: ReactNode;
  value?: number | null;
  selectedToken?: Token;
  tokenList: Token[];
  prefix?: ReactNode;
  placeholder?: string;
  recommendedToken?: Token;
  onTokenSelect?: (t: Token) => void;
  onChange: (v: number | null) => void;
  isDisplayAllTokens?: boolean;
  inputContainerClassName?: string;
}) {
  const decimalConstraint = selectedToken?.decimals ?? 18;
  const [isPickTokenModalOpen, setIsPickTokenModalOpen] = useState(false);

  const pick = useCallback(
    (token: Token) => {
      onTokenSelect?.(token);

      // if the prev value has more decimals than the new token, we need to adjust the value
      const newTokenDecimals = token.decimals ?? 18;
      const decimals = value?.toString().split('.')[1]?.length;

      if (Number(decimals) > Number(newTokenDecimals)) {
        onChange(Number(value?.toFixed(newTokenDecimals)));
      }

      setIsPickTokenModalOpen(false);
    },
    [onChange, onTokenSelect, value],
  );

  return (
    <>
      <div className={twMerge('relative flex flex-col', className)}>
        <div
          className={twMerge(
            'rounded-lg flex w-full border h-12',
            inputClassName,
            inputContainerClassName,
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

          <div className="flex flex-row gap-3 items-center w-[15em] justify-end pr-4">
            {selectedToken ? (
              <div
                className={twMerge(
                  'flex items-center gap-2',
                  tokenList.length > 1 ? 'cursor-pointer' : '',
                )}
                onClick={() =>
                  tokenList.length > 1 && setIsPickTokenModalOpen(true)
                }
              >
                {tokenList.length > 1 ? (
                  <div
                    className={twMerge(
                      'flex h-2 w-2 items-center justify-center shrink-0',
                    )}
                  >
                    <Image src={chevronDownIcon} alt="chevron down" />
                  </div>
                ) : null}

                <div className="text-base">
                  {selectedToken.symbol ?? '-'}
                </div>

                <Image
                  className="h-4 w-4"
                  src={selectedToken?.image}
                  alt="logo"
                  width="20"
                  height="20"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <PickTokenModal
        recommendedToken={recommendedToken}
        isPickTokenModalOpen={isPickTokenModalOpen}
        setIsPickTokenModalOpen={setIsPickTokenModalOpen}
        tokenList={tokenList}
        pick={pick}
        isDisplayAllTokens={isDisplayAllTokens}
      />
    </>
  );
}
