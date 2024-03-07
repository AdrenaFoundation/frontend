import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { ALPIndexComposition } from '@/hooks/useALPIndexComposition';
import { formatPercentage, formatPriceInfo } from '@/utils';

export default function ALPIndexCompositionBlocs({
  alpIndexComposition,
  calculateOffset,
  className,
}: {
  alpIndexComposition: ALPIndexComposition | null;
  calculateOffset: (
    targetRatio: number | null,
    currentRatio: number | null,
  ) => string;
  className?: string;
}) {
  if (!alpIndexComposition) return null;

  return (
    <div
      className={twMerge(
        'grid grid-cols-1 sm:grid-cols-2 sm:flex-row flex-wrap gap-3 w-full z-20',
        className,
      )}
    >
      {alpIndexComposition.map((composition) => (
        <div
          key={composition.token.symbol}
          className="flex flex-col w-full border-gray-200 bg-gray-300/85 backdrop-blur-md rounded-lg border justify-evenly p-4"
        >
          <div className="flex items-center border-b border-grey-200 pb-2">
            {
              <Image
                src={composition.token.image}
                alt={`${composition.token.symbol} logo`}
                width={24}
                height={24}
              />
            }
            <span className="ml-4">{composition.token.symbol}</span>
          </div>

          <div className="flex flex-col w-full mt-4">
            <div className="flex w-full justify-between">
              <div className="text-txtfade text-base">Price</div>

              <div className="font-mono text-base">
                {formatPriceInfo(composition.price)}
              </div>
            </div>

            <div className="flex w-full justify-between">
              <div className="text-txtfade text-base">Pool</div>

              <div className="font-mono text-base">
                {formatPriceInfo(composition.custodyUsdValue)}
              </div>
            </div>

            <div className="flex w-full justify-between">
              <div className="text-txtfade text-base">Weight</div>

              <Tippy
                content={
                  <div className="text-sm w-60 flex flex-col justify-around">
                    <div className="flex w-full justify-between">
                      <div className="text-txtfade">Current Weight:</div>
                      <div
                        className={`font-mono ${calculateOffset(
                          composition.targetRatio,
                          composition.currentRatio,
                        )}`}
                      >
                        {formatPercentage(composition.currentRatio)}
                      </div>
                    </div>
                    <div className="flex w-full justify-between">
                      <div className="text-txtfade">Target Weight:</div>
                      <div className="font-mono">
                        {formatPercentage(composition.targetRatio)}
                      </div>
                    </div>
                    <div className="flex w-full justify-between">
                      <div className="text-txtfade">Minimum Weight:</div>
                      <div className="font-mono">
                        {formatPercentage(composition.minRatio)}
                      </div>
                    </div>
                    <div className="flex w-full justify-between">
                      <div className="text-txtfade">Maximum Weight:</div>
                      <div className="font-mono">
                        {formatPercentage(composition.maxRatio)}
                      </div>
                    </div>
                  </div>
                }
                placement="bottom"
              >
                <div className="flex">
                  <div className="flex tooltip-target">
                    <div
                      className={`font-mono text-base ${calculateOffset(
                        composition.targetRatio,
                        composition.currentRatio,
                      )}`}
                    >
                      {formatPercentage(composition.currentRatio)}
                    </div>
                    <div className="ml-1 mr-1 text-base">/</div>
                    <div className="font-mono text-base">
                      {formatPercentage(composition.targetRatio)}
                    </div>
                  </div>
                </div>
              </Tippy>
            </div>

            <div className="flex w-full justify-between">
              <div className="text-txtfade text-base">Utilization</div>

              <div className="flex justify-end font-mono text-base">
                {formatPercentage(composition.utilization, 4)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
