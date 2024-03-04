import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import Select from '@/components/common/Select/Select';
import { RATE_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

import arrowRightIcon from '../../../../../public/images/arrow-right.svg';
import InfoAnnotation from '../../monitoring/InfoAnnotation';

export default function PositionInfos({
  className,
  positionInfos,
  tokenB,
  leverage,
  openedPosition,
  allowedTokenB,
  inputB,
  priceB,
  setTokenB,
  handleInputBChange,
}: {
  className?: string;
  positionInfos: {
    collateralUsd: number;
    sizeUsd: number;
    size: number;
    swapFeeUsd: number | null;
    openPositionFeeUsd: number;
    totalOpenPositionFeeUsd: number;
    entryPrice: number;
    liquidationPrice: number;
    exitFeeUsd: number;
    liquidationFeeUsd: number;
  } | null;
  tokenB: Token;
  leverage: number;
  openedPosition: PositionExtended | null;
  allowedTokenB: Token[];
  inputB: number | null;
  priceB: null | number;
  setTokenB: (t: Token | null) => void;
  handleInputBChange: (n: number) => void;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const tokenPriceB = tokenPrices?.[tokenB.symbol];

  const custody = window.adrena.client.getCustodyByMint(tokenB.mint) ?? null;

  const infoRowStyle = 'w-full flex justify-between items-center mt-1';

  return (
    <div
      className={twMerge(
        'flex flex-col bg-secondary border rounded-2xl',
        className,
      )}
    >
      <div className="flex items-center border-b h-12 pr-4 pl-3">
        <Select
          className="shrink-0 bg-secondary h-full flex items-center pl-2 pr-2 pt-1 pb-1 rounded-tr-2xl rounded-br-2xl"
          selected={tokenB.symbol}
          options={allowedTokenB.map((token) => ({
            title: token.symbol,
            img: token.image,
          }))}
          onSelect={(name) => {
            // Force linting, you cannot not find the token in the list
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const token = allowedTokenB.find((t) => t.symbol === name)!;
            setTokenB(token);

            // if the prev value has more decimals than the new token, we need to adjust the value
            const newTokenDecimals = token.decimals ?? 18;
            const decimals = inputB?.toString().split('.')[1]?.length;

            if (Number(decimals) > Number(newTokenDecimals)) {
              handleInputBChange(Number(inputB?.toFixed(newTokenDecimals)));
            }
          }}
        />

        <div className="flex ml-auto">
          <InfoAnnotation
            text="Amount of tokens being traded."
            className="w-3 grow-0 mr-3 mb-4"
          />

          {openedPosition && tokenPriceB && inputB ? (
            <>
              {/* Opened position */}
              <div className="flex flex-col">
                <div>
                  {inputB !== null && tokenPriceB
                    ? formatNumber(
                        openedPosition.sizeUsd / tokenPriceB,
                        tokenB.decimals,
                      )
                    : '-'}
                </div>

                <div className="text-sm text-txtfade">
                  {formatPriceInfo(openedPosition.sizeUsd, false, 2)}
                </div>
              </div>

              <Image
                className="ml-2 mr-2"
                src={arrowRightIcon}
                height={16}
                width={16}
                alt="Arrow"
              />
            </>
          ) : null}

          <div className="relative flex flex-col">
            <div className="flex flex-col items-end">
              <div>
                {inputB !== null ? formatNumber(inputB, tokenB.decimals) : '-'}
              </div>
              <div className="text-sm text-txtfade">
                {formatPriceInfo(priceB, false, 2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col pt-2 pb-2 pl-4 pr-4">
        <div className={infoRowStyle}>
          <span className="text-txtfade text-sm flex">
            <InfoAnnotation
              text="Tokens provided to set up the position. They're used as a guarantee to cover potential losses and pay borrow fees. If the position runs out of collateral, it gets liquidated."
              className="mr-1 w-3"
            />
            Collateral
          </span>

          <span className="font-mono text-sm flex">
            {(() => {
              if (!positionInfos) return '-';

              if (openedPosition) {
                return (
                  <>
                    {/* Opened position */}
                    <div>{formatPriceInfo(openedPosition.collateralUsd)}</div>

                    <Image
                      className="ml-2 mr-2"
                      src={arrowRightIcon}
                      height={16}
                      width={16}
                      alt="Arrow"
                    />

                    {/* New position */}
                    <div>
                      {formatPriceInfo(
                        positionInfos.collateralUsd +
                          openedPosition.collateralUsd,
                      )}
                    </div>
                  </>
                );
              }

              return formatPriceInfo(positionInfos.collateralUsd);
            })()}
          </span>
        </div>

        <div className={infoRowStyle}>
          <span className="text-txtfade text-sm flex">
            <InfoAnnotation
              text="Multiplier applied to the collateral to determine the size of the position."
              className="mr-1 w-3"
            />
            Leverage
          </span>

          <span className="font-mono text-sm flex">
            {(() => {
              if (!positionInfos || !tokenPriceB) return '-';

              if (openedPosition) {
                const newLeverage =
                  (openedPosition.sizeUsd * openedPosition.leverage +
                    positionInfos.sizeUsd * leverage) /
                  (openedPosition.sizeUsd + positionInfos.sizeUsd);

                return (
                  <>
                    {/* Opened position */}
                    <div>{formatNumber(openedPosition.leverage, 2)}x</div>

                    <Image
                      className="ml-2 mr-2"
                      src={arrowRightIcon}
                      height={16}
                      width={16}
                      alt="Arrow"
                    />

                    {/* New position */}
                    <div>{formatNumber(newLeverage, 2)}x</div>
                  </>
                );
              }

              return <div>{formatNumber(leverage, 2)}x</div>;
            })()}
          </span>
        </div>

        <div className={infoRowStyle}>
          <span className="text-txtfade text-sm flex">
            <InfoAnnotation
              text="Token's price at which the trade begins."
              className="mr-1 w-3"
            />
            Entry Price
          </span>

          <span className="flex font-mono text-sm">
            {(() => {
              if (!positionInfos || !tokenPriceB) return '-';

              if (openedPosition) {
                const newEntryPrice =
                  (openedPosition.sizeUsd * openedPosition.price +
                    positionInfos.sizeUsd * tokenPriceB) /
                  (openedPosition.sizeUsd + positionInfos.sizeUsd);

                return (
                  <>
                    {/* Opened position */}
                    <div>{formatPriceInfo(openedPosition.price)}</div>

                    <Image
                      className="ml-2 mr-2"
                      src={arrowRightIcon}
                      height={16}
                      width={16}
                      alt="Arrow"
                    />

                    {/* New position */}
                    <div>{formatPriceInfo(newEntryPrice)}</div>
                  </>
                );
              }

              return formatPriceInfo(positionInfos.entryPrice);
            })()}
          </span>
        </div>

        <div className={infoRowStyle}>
          <span className="text-txtfade text-sm flex">
            <InfoAnnotation
              text="If the token's price hits this point, the position is automatically closed to prevent further losses."
              className="mr-1 w-3"
            />
            Liquidation Price
          </span>

          <span className="flex font-mono text-sm">
            {(() => {
              if (!positionInfos) return '-';

              if (openedPosition) {
                if (!openedPosition.liquidationPrice) return '-';

                const newLiquidationPrice =
                  (openedPosition.sizeUsd * openedPosition.liquidationPrice +
                    positionInfos.sizeUsd * positionInfos.liquidationPrice) /
                  (openedPosition.sizeUsd + positionInfos.sizeUsd);

                return (
                  <>
                    {/* Opened position */}
                    <div>
                      {formatPriceInfo(openedPosition.liquidationPrice)}
                    </div>

                    <Image
                      className="ml-2 mr-2"
                      src={arrowRightIcon}
                      height={16}
                      width={16}
                      alt="Arrow"
                    />

                    {/* New position */}
                    <div>{formatPriceInfo(newLiquidationPrice)}</div>
                  </>
                );
              }

              return formatPriceInfo(positionInfos.liquidationPrice);
            })()}
          </span>
        </div>

        <div className={infoRowStyle}>
          <span className="text-txtfade text-sm flex">
            <InfoAnnotation
              text="Amount of funds available to enter new trades."
              className="mr-1 w-3"
            />
            Available Liquidity
          </span>

          <span className="font-mono text-sm">
            {custody && tokenPriceB
              ? formatPriceInfo(custody.liquidity * tokenPriceB)
              : '-'}
          </span>
        </div>

        <div className="h-[1px] bg-gray-200 w-full mt-4 mb-2" />

        <div className={infoRowStyle}>
          <span className="text-txtfade text-sm flex">
            <InfoAnnotation
              text={`Fees paid when ${
                openedPosition ? 'increasing' : 'opening'
              } the position.`}
              className="mr-1 w-3"
            />
            {openedPosition ? 'Increase' : 'Open'} Position Fees
          </span>

          <span className="font-mono text-sm">
            {positionInfos && positionInfos?.swapFeeUsd ? (
              <Tippy
                content={
                  <ul className="flex flex-col gap-2">
                    <li className="flex flex-row gap-2 justify-between">
                      <p className="text-sm text-txtfade">Swap fees:</p>
                      <p className="text-sm font-mono">
                        {`${formatPriceInfo(positionInfos.swapFeeUsd)}`}
                      </p>
                    </li>

                    <li className="flex flex-row gap-2 justify-between">
                      <p className="text-sm text-txtfade">
                        Open position fees:
                      </p>
                      <p className="text-sm font-mono">
                        {`${formatPriceInfo(positionInfos.openPositionFeeUsd)}`}
                      </p>
                    </li>

                    <div className="w-full h-[1px] bg-gray-300" />

                    <li className="flex flex-row gap-2 justify-between">
                      <p className="text-sm text-txtfade">Total fees:</p>
                      <p className="text-sm font-mono">
                        {`${formatPriceInfo(
                          positionInfos.totalOpenPositionFeeUsd,
                        )}`}
                      </p>
                    </li>
                  </ul>
                }
                placement="bottom"
              >
                <div className="tooltip-target">
                  {formatPriceInfo(positionInfos.totalOpenPositionFeeUsd)}
                </div>
              </Tippy>
            ) : positionInfos ? (
              formatPriceInfo(positionInfos.totalOpenPositionFeeUsd)
            ) : (
              '-'
            )}
          </span>
        </div>

        <div className={infoRowStyle}>
          <span className="text-txtfade text-sm relative flex">
            <InfoAnnotation
              text="Fees paid when closing the position."
              className="mr-1 w-3"
            />
            Exit Position Fees
          </span>

          <span className="font-mono text-sm flex">
            {(() => {
              if (!positionInfos) return '-';

              if (openedPosition) {
                if (!openedPosition.nativeObject.exitFeeUsd) return '-';

                return (
                  <>
                    {/* Opened position */}
                    <div>{formatPriceInfo(openedPosition.exitFeeUsd)}</div>

                    <Image
                      className="ml-2 mr-2"
                      src={arrowRightIcon}
                      height={16}
                      width={16}
                      alt="Arrow"
                    />

                    {/* New position */}
                    <div>
                      {formatPriceInfo(
                        openedPosition.exitFeeUsd + positionInfos.exitFeeUsd,
                      )}
                    </div>
                  </>
                );
              }

              return formatPriceInfo(positionInfos.exitFeeUsd);
            })()}
          </span>
        </div>

        <div className={infoRowStyle}>
          <span className="text-txtfade text-sm relative flex">
            <InfoAnnotation
              text="Fees paid when the position is liquidated."
              className="mr-1 w-3"
            />
            Liquidation Fees
          </span>

          <span className="font-mono text-sm flex">
            {(() => {
              if (!positionInfos) return '-';

              if (openedPosition) {
                if (!openedPosition.nativeObject.liquidationFeeUsd) return '-';

                return (
                  <>
                    {/* Opened position */}
                    <div>
                      {formatPriceInfo(openedPosition.liquidationFeeUsd)}
                    </div>

                    <Image
                      className="ml-2 mr-2"
                      src={arrowRightIcon}
                      height={16}
                      width={16}
                      alt="Arrow"
                    />

                    {/* New position */}
                    <div>
                      {formatPriceInfo(
                        openedPosition.liquidationFeeUsd +
                          positionInfos.liquidationFeeUsd,
                      )}
                    </div>
                  </>
                );
              }

              return formatPriceInfo(positionInfos.liquidationFeeUsd);
            })()}
          </span>
        </div>

        <div className={infoRowStyle}>
          <span className="text-txtfade text-sm relative flex">
            <InfoAnnotation
              text="Fees charged for borrowing funds for the position. Greater leverage means borrowing more tokens, resulting in higher fees."
              className="mr-1 w-3"
            />
            Current Borrow Fees
          </span>

          <span className="font-mono text-sm">
            {custody && tokenB
              ? `${formatNumber(custody.borrowFee, RATE_DECIMALS)}%/hr`
              : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}
