import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import arrowIcon from '../../../../public/images/Icons/arrow-sm-45.svg';
import { AprLpChart } from '../global/Apr/AprLpChart';
import ALPHeader from './ALPHeader';

export default function ALPDetails({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div className={twMerge(className, 'flex flex-col gap-3')}>
      <ALPHeader />

      <div>
        <div className="flex flex-col gap-3 p-4 border rounded-md">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm opacity-75">
                {t('alp.liquidityPoolDescription')}
              </p>

              <p className="text-sm opacity-75 mt-4">
                <span className="font-semibold">{t('alp.alpTokenRepresents')}</span>{' '}
                {t('alp.alpTokenBackedBy')}
              </p>

              <ul>
                <li className="text-sm opacity-75 list-disc ml-4 mt-1">
                  {t('alp.diversifiedIndexFund')}{' '}
                  <span className="font-semibold">
                    {t('alp.diversifiedTokens')}
                  </span>
                  .
                </li>
                <li className="text-sm opacity-75 list-disc ml-4 mt-1">
                  {t('alp.netProfitAndLoss')}{' '}
                  <span className="font-semibold">{t('alp.profitAndLoss')}</span>{' '}
                  {t('alp.tradersEcosystem')}
                </li>
                <li className="text-sm opacity-75 list-disc ml-4 mt-1">
                  <span className="font-semibold">{t('alp.feesGenerated')}</span>{' '}
                  {t('alp.feesGeneratedBy')}
                  <ul className="flex flex-col gap-1">
                    <li className="text-sm list-disc ml-4 mt-1">
                      {t('alp.openingClosingFees')}
                    </li>
                    <li className="text-sm list-disc ml-4 mt-1">
                      {t('alp.borrowingFees')}
                    </li>
                    <li className="text-sm list-disc ml-4 mt-1">
                      {t('alp.alpMintingRedeemingFees')}
                    </li>
                  </ul>
                </li>
              </ul>

              <p className="text-sm opacity-75 mt-4">
                {t('alp.alpStructureEnsures')}
              </p>

              <p className="text-sm mt-2 bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]">
                {t('alp.feesAccrue')}
              </p>

              <p className="text-sm mt-2 bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]">
                {t('alp.jitosolYield')}
              </p>
            </div>
          </div>

          <div className="w-full h-[15em] -mb-5">
            <AprLpChart isSmallScreen={false} isAlpPage />
          </div>

          <Link
            href="https://docs.adrena.trade/tokenomics/alp"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit opacity-50 hover:opacity-100 transition-opacity duration-300 flex flex-row gap-2 items-center mt-3 cursor-pointer"
          >
            <p className="text-sm">{t('alp.learnMore')}</p>
            <Image src={arrowIcon} alt="arrow icon" className="w-2 h-2" width={8} height={8} />
          </Link>
        </div>
      </div>
    </div>
  );
}
