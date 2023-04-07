import Tippy from '@tippyjs/react';
import { twMerge } from 'tailwind-merge';

import { ALPIndexComposition } from '@/hooks/useALPIndexComposition';
import { formatPercentage, formatPriceInfo } from '@/utils';

export default function ALPIndexCompositionBlocs({
  alpIndexComposition,
  className,
}: {
  alpIndexComposition: ALPIndexComposition | null;
  className?: string;
}) {
  if (!alpIndexComposition) return null;

  return (
    <div className={twMerge('flex', 'flex-wrap', 'justify-evenly', className)}>
      {alpIndexComposition.map((composition) => (
        <div
          key={composition.token.name}
          className="flex flex-col w-[45%] bg-secondary border border-grey justify-evenly mt-4 p-4"
        >
          <div className="flex items-center border-b border-grey pb-2">
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="w-6 h-6"
                src={composition.token.image}
                alt={`${composition.token.name} logo`}
              />
            }
            <span className="ml-4">{composition.token.name}</span>
          </div>

          <div className="flex flex-col w-full mt-4">
            <div className="flex w-full justify-between">
              <div>Price</div>
              <div className="flex">
                {composition.price ? formatPriceInfo(composition.price) : '-'}
              </div>
            </div>

            <div className="flex w-full justify-between">
              <div>Pool</div>
              <div className="flex">
                {composition.custodyUsdValue
                  ? formatPriceInfo(composition.custodyUsdValue)
                  : '-'}
              </div>
            </div>

            <div className="flex w-full justify-between">
              <div>Weight</div>

              <Tippy
                content={
                  <div className="text-sm w-60 flex flex-col justify-around">
                    <div className="flex w-full justify-between">
                      <div className="text-txtfade">Current Weight:</div>
                      <div>{formatPercentage(composition.currentRatio)}</div>
                    </div>
                    <div className="flex w-full justify-between">
                      <div className="text-txtfade">Target Weight:</div>
                      <div>{formatPercentage(composition.targetRatio)}</div>
                    </div>
                    <div className="flex w-full justify-between">
                      <div className="text-txtfade">Minimum Weight:</div>
                      <div>{formatPercentage(composition.minRatio)}</div>
                    </div>
                    <div className="flex w-full justify-between">
                      <div className="text-txtfade">Maximum Weight:</div>
                      <div>{formatPercentage(composition.maxRatio)}</div>
                    </div>
                  </div>
                }
                placement="bottom"
              >
                <div className="flex">
                  <div className="flex tooltip-target">
                    <span>{formatPercentage(composition.currentRatio)}</span>
                    <span className="ml-1 mr-1">/</span>
                    <span>{formatPercentage(composition.targetRatio)}</span>
                  </div>
                </div>
              </Tippy>
            </div>

            <div className="flex w-full justify-between">
              <div>Utilization</div>
              <div className="flex justify-end">
                {formatPercentage(composition.utilization, 4)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
