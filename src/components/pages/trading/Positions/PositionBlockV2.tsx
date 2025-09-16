import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import shareIcon from '@/../public/images/Icons/share-fill.svg';
import Button from '@/components/common/Button/Button';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { PROFILE_PICTURES } from '@/constant';
import useUserProfile from '@/hooks/useUserProfile';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import {
  formatTimeDifference,
  getAbbrevWalletAddress,
  getFullTimeDifference,
  getTokenImage,
  getTokenSymbol,
} from '@/utils';

interface PositionBlockProps {
  position: PositionExtended;
  triggerClosePosition?: (p: PositionExtended) => void;
  triggerStopLossTakeProfit?: (p: PositionExtended) => void;
  triggerEditPositionCollateral?: (p: PositionExtended) => void;
  readOnly?: boolean;
  setTokenB: (token: Token) => void;
}

export default function PositionBlockV2({
  position,
  triggerClosePosition,
  triggerStopLossTakeProfit,
  triggerEditPositionCollateral,
  readOnly = false,
  setTokenB,
}: PositionBlockProps) {
  const { userProfile } = useUserProfile(position.owner.toBase58());

  const borrowRate = useSelector(
    (s) =>
      s.borrowRates[
        position.side === 'long'
          ? position.custody.toBase58()
          : position.collateralCustody.toBase58()
      ],
  );

  return (
    <div className="bg-[#0B131D] border border-bcolor rounded-xl">
      <div className="flex flex-row items-center justify-between p-2 border-b">
        <TokenDetails position={position} setTokenB={setTokenB} />
        <PnLDetails position={position} showAfterFees={true} />
        <NetValue position={position} />
      </div>

      <div
        className={twMerge(
          'flex flex-row items-center flex-wrap xl:flex-nowrap xl:gap-3 xl:p-2',
          !readOnly && 'border-b',
        )}
      >
        <PositionDetail
          data={[
            {
              title: 'Duration',
              value: formatTimeDifference(
                getFullTimeDifference(position.openDate, new Date(Date.now())),
              ),
              format: 'time',
            },
          ]}
          className="xl:w-auto xl:flex-none"
        />

        <PositionDetail
          data={[
            {
              title: 'Cur. Lev',
              value: position.currentLeverage ?? 0, // fix
              format: 'number',
              suffix: 'x',
              precision: 1,
            },
            {
              title: 'Collateral',
              value: position.collateralUsd,
              format: 'currency',
            },
            {
              title: 'Size',
              value: position.sizeUsd,
              format: 'currency',
            },
          ]}
        />
        <PositionDetail
          data={[
            {
              title: 'Entry',
              value: position.price,
              format: 'currency',
            },
            {
              title: 'Market',
              value: 200, // fix
              format: 'currency',
            },
          ]}
        />

        <PositionDetail
          data={[
            {
              title: 'Liquidation',
              value: position.liquidationPrice ?? 0,
              format: 'currency',
              color: 'text-orange',
            },
            {
              title: 'Break Even',
              value: position.breakEvenPrice ?? 0,
              format: 'currency',
              color: 'text-[#965DFF]',
            },
          ]}
        />

        {!readOnly ? (
          <PositionDetail
            data={[
              {
                title: 'Borrow Rate',
                value: borrowRate,
                format: 'percentage',
                suffix: '/hr',
                precision: 6,
              },
            ]}
            className="xl:w-auto xl:flex-none"
          />
        ) : null}

        <PositionDetail
          data={[
            {
              title: 'Stop Loss',
              value:
                typeof position.stopLossLimitPrice !== 'undefined'
                  ? position.stopLossLimitPrice
                  : null,
              format: 'currency',
              color: 'text-blue',
            },
            {
              title: 'Take Profit',
              value:
                typeof position.takeProfitLimitPrice !== 'undefined'
                  ? position.takeProfitLimitPrice
                  : null,
              format: 'currency',
              color: 'text-blue',
            },
          ]}
        />
      </div>
      {!readOnly ? (
        <div className="flex flex-row items-center justify-between">
          <div
            className={
              'flex flex-row items-center gap-2 p-1.5 px-2 border-r border-r-bcolor'
            }
          >
            {readOnly ? (
              <div className="flex flex-row items-center gap-2 pr-2">
                <Image
                  src={
                    PROFILE_PICTURES[
                      userProfile ? userProfile.profilePicture : 0
                    ]
                  }
                  alt="profile pic"
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full border border-inputcolor"
                />
                <p className="text-sm font-mono underline-dashed">
                  {userProfile
                    ? userProfile.nickname
                    : getAbbrevWalletAddress(position.owner.toBase58())}
                </p>
              </div>
            ) : (
              <>
                <Button
                  title="Edit"
                  size="sm"
                  className="flex-1 h-auto px-2 py-0.5 rounded-lg bg-[#142030] border border-inputcolor text-white text-opacity-50 hover:text-opacity-100 duration-300"
                  onClick={() => triggerEditPositionCollateral?.(position)}
                />
                <Button
                  title="SL/TP"
                  size="sm"
                  className="flex-1 h-auto px-2 py-0.5 rounded-lg bg-[#142030] border border-inputcolor text-white text-opacity-50 hover:text-opacity-100 duration-300"
                  onClick={() => triggerStopLossTakeProfit?.(position)}
                />
                <Button
                  title="Close"
                  size="sm"
                  className="flex-1 h-auto px-2 py-0.5 rounded-lg bg-[#142030] border border-inputcolor text-white text-opacity-50 hover:text-opacity-100 duration-300"
                  onClick={() => triggerClosePosition?.(position)}
                />
              </>
            )}
          </div>

          <div className="flex flex-row items-center">
            <div className="flex flex-row items-center gap-3 p-2 px-3 border-l border-l-bcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300">
              <Switch
                checked={true}
                size="small"
                onChange={() => {
                  // handle toggle in parent div
                }}
              />
              <p className="text-sm font-interMedium opacity-50">PnL w/ fees</p>
            </div>

            <div
              className="flex flex-row items-center gap-3 p-2 px-3 border-l border-l-bcolor cursor-pointer hover:bg-[#131D2C] transition-colors duration-300"
              // onClick={() => setIsNative(!isNative)}
            >
              <Switch
                checked={false}
                size="small"
                onChange={() => {
                  // handle toggle in parent div
                }}
              />
              <p className="text-sm font-interMedium opacity-50">Native</p>
            </div>

            <div
              className="flex flex-row items-center gap-3 p-2.5 px-3 border-l border-l-bcolor cursor-pointer opacity-50 hover:bg-[#131D2C] transition-colors duration-300"
              // onClick={onDownloadClick}
            >
              <Image
                src={shareIcon}
                alt="Share"
                width={16}
                height={16}
                className="w-3 h-3"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const TokenDetails = ({
  position,
  setTokenB,
}: {
  position: PositionBlockProps['position'];
  setTokenB?: (token: Token) => void;
}) => {
  return (
    <div
      className="flex flex-row gap-2 items-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
      onClick={() => setTokenB?.(position.token)}
    >
      <Image
        src={getTokenImage(position.token)}
        alt="token"
        height={30}
        width={30}
        className="w-9 h-9 border border-bcolor rounded-full"
      />
      <div>
        <div className="flex flex-row items-center gap-2 mb-0.5">
          <p className="font-interSemibold text-base">
            {getTokenSymbol(position.token.symbol)}
          </p>
          <p
            className={twMerge(
              'text-xs p-0.5 px-1.5 rounded-md font-mono capitalize',
              position.side === 'long'
                ? 'bg-green/10 text-greenSide'
                : 'bg-red/10 text-redSide',
            )}
          >
            {position.side}
          </p>
          <FormatNumber
            nb={position.initialLeverage}
            suffix="x"
            className="opacity-50 text-xs"
            precision={0}
            isDecimalDimmed={false}
          />
        </div>
        <p className="text-xs opacity-50 font-boldy">
          {new Date(position.openDate).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
};

const PnLDetails = ({
  position,
  showAfterFees,
}: {
  position: PositionBlockProps['position'];
  showAfterFees: boolean;
}) => {
  if (!position.pnl) return null;

  const fees = -(position.exitFeeUsd + (position.borrowFeeUsd ?? 0));

  return (
    <div className="flex flex-col">
      <p className="text-xs opacity-50 text-center font-interMedium">PnL</p>
      <div className="flex flex-row items-center gap-2">
        <FormatNumber
          nb={position.pnl}
          format="currency"
          className={twMerge(
            'text-base font-mono',
            position.pnl >= 0 ? 'text-[#35C488]' : 'text-redbright',
          )}
          isDecimalDimmed={false}
        />
        <div className="opacity-50">
          <FormatNumber
            nb={
              ((showAfterFees ? position.pnl : position.pnl - fees) /
                position.collateralUsd) *
              100
            }
            format="percentage"
            prefix="("
            suffix=")"
            prefixClassName="text-sm"
            suffixClassName={`ml-0 text-sm ${(showAfterFees ? position.pnl : position.pnl - fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
            precision={2}
            minimumFractionDigits={2}
            isDecimalDimmed={false}
            className={`text-sm ${(showAfterFees ? position.pnl : position.pnl - fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
          />
        </div>
      </div>
    </div>
  );
};

const NetValue = ({
  position,
}: {
  position: PositionBlockProps['position'];
}) => {
  if (!position.pnl) return null;

  return (
    <div className="flex flex-col items-end">
      <p className="text-xs opacity-50 text-right font-interMedium">
        Net Value
      </p>
      <div className="underline-dashed">
        <FormatNumber
          nb={position.collateralUsd + position.pnl}
          format="currency"
          className={twMerge('text-base font-mono items-end justify-end')}
          isDecimalDimmed={false}
        />
      </div>
    </div>
  );
};

const PositionDetail = ({
  data,
  className,
}: {
  data: {
    title: string;
    value: string | number | null;
    format?: 'number' | 'currency' | 'percentage' | 'time';
    color?: string;
    precision?: number;
    suffix?: string;
  }[];
  className?: string;
}) => {
  return (
    <div
      className={twMerge(
        'flex flex-col xl:flex-row gap-2 xl:gap-0 items-center xl:bg-secondary border-b xl:border border-bcolor xl:rounded-xl w-full p-3 py-2',
        className,
      )}
    >
      {data.map((d, i) => (
        <div
          key={i}
          className={twMerge(
            'flex flex-row xl:flex-col justify-between xl:justify-normal flex-1 xl:border-r border-inputcolor xl:last:border-r-0 xl:px-6 xl:first:pl-0 last:pr-0 w-full xl:w-auto',
            data.length === 1 && '!px-0',
          )}
        >
          <p className="text-sm xl:text-xs opacity-50 whitespace-nowrap font-interMedium">
            {d.title}
          </p>
          {typeof d.value !== 'string' ? (
            <FormatNumber
              nb={d.value}
              format={d.format}
              precision={d.precision}
              suffix={d.suffix}
              className={twMerge('text-sm flex', d.value && d.color)}
            />
          ) : (
            <p className="text-sm font-mono">{d.value}</p>
          )}
        </div>
      ))}
    </div>
  );
};
