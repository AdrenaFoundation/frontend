import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import FormatNumber from '@/components/Number/FormatNumber';

import adxLogo from '../../../../public/images/adrena_logo_adx_white.svg';
import StakingRanking from './StakingRanking';

interface TokenInfoHeaderProps {
  totalStakeAmount: number;
  walletAddress: string | null;
}

export default function TokenInfoHeader({
  totalStakeAmount,
  walletAddress,
}: TokenInfoHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="p-5 pb-0">
      <div className="flex flex-col w-full bg-gradient-to-br from-[#07111A] to-[#0B1722] border rounded-md shadow-lg">
        <div className="flex items-center justify-between w-full rounded-t-md p-3 bg-gradient-to-r from-red via-rose-600 to-pink-600">
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <p className="opacity-50 text-base">{t('stake.totalStaked')}</p>
              <div className="text-base sm:text-2xl">
                <FormatNumber
                  nb={totalStakeAmount}
                  minimumFractionDigits={0}
                  precision={0}
                  precisionIfPriceDecimalsBelow={0}
                  isAbbreviate={false}
                  suffix=" ADX"
                />
              </div>
            </div>

            {/* Staking Ranking */}
            {walletAddress && <StakingRanking walletAddress={walletAddress} />}
          </div>

          <Image
            src={adxLogo}
            width={50}
            height={50}
            className="opacity-10 hidden sm:block w-[50px] h-[50px]"
            alt="ADX logo"
          />
        </div>

        <div className="p-3">
          <p className="opacity-75 text-base">
            {t('stake.alignWithProtocolSuccess')}
          </p>
        </div>
      </div>
    </div>
  );
}
