import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { ALPIndexComposition } from '@/hooks/useALPIndexComposition';
import { formatPercentage, formatPriceInfo } from '@/utils';

export default function ALPIndexCompositionArray({
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
  return (
    <div
      className={twMerge(
        'border-gray-200 bg-gray-300/85 backdrop-blur-md rounded-lg border pb-2',
        className,
      )}
    >
      <div className="flex h-12 w-full items-center pl-4 font-medium border-b border-b-gray-200">
        ALP Index Composition
      </div>

      <div className="flex h-12 w-full items-center pl-4 pr-4">
        {['Token', 'Price', 'Pool', 'Weight', 'Utilization'].map(
          (columnName) => (
            <div
              key={columnName}
              className="flex w-40 shrink-0 grow uppercase first:justify-start justify-end text-txtfade text-sm"
            >
              {columnName}
            </div>
          ),
        )}
      </div>

      <>
        {alpIndexComposition ? (
          <div className="flex flex-col pl-4 pr-4">
            {alpIndexComposition.map((composition) => (
              <div
                key={composition.token.symbol}
                className="flex h-12 w-full items-center"
              >
                <div className="flex items-center w-40 shrink-0 grow">
                  {
                    <Image
                      src={composition.token.image}
                      alt={`${composition.token.symbol} logo`}
                      width={32}
                      height={32}
                    />
                  }
                  <div>
                    <p className="ml-4 font-mono capitalize font-medium">
                      {composition.token.symbol}
                    </p>
                    <p className="ml-4 font-mono text-sm opacity-50">
                      {composition.token.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end w-40 shrink-0 grow font-mono text-base">
                  {formatPriceInfo(composition.price)}
                </div>

                <div className="flex items-center justify-end w-40 shrink-0 grow font-mono text-base">
                  {formatPriceInfo(composition.custodyUsdValue)}
                </div>

                <Tippy
                  content={
                    <div className="text-sm w-60 flex flex-col justify-between">
                      <div className="flex w-full justify-between">
                        <div className="text-txtfade">Current Weight:</div>
                        <div className="font-mono">
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
                  <div className="flex items-center justify-end w-40 shrink-0 grow text-base">
                    <div className="flex tooltip-target">
                      <span
                        className={`font-mono ${calculateOffset(
                          composition.targetRatio,
                          composition.currentRatio,
                        )}`}
                      >
                        {formatPercentage(composition.currentRatio)}
                      </span>
                      <span className="ml-1 mr-1">/</span>
                      <span className="font-mono">
                        {formatPercentage(composition.targetRatio)}
                      </span>
                    </div>
                  </div>
                </Tippy>

                <div className="flex items-center w-40 shrink-0 grow justify-end font-mono text-base">
                  {formatPercentage(composition.utilization, 4)}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </>
    </div>
  );
}
