import 'tippy.js/dist/tippy.css';

import { useTranslation } from 'react-i18next';

export default function FactionsDocs({
  showLegacySections = true,
}: {
  showLegacySections?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      {showLegacySections && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 border border-[#333] rounded-md p-5 hover:border-[#444] transition-colors">
            <div className="flex items-center gap-2">
              <div className="text-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 3.75V6a4.5 4.5 0 01-9 0V3.75m9 0h2.25A2.25 2.25 0 0120.25 6c0 3.728-2.94 6.75-6.75 6.75S6.75 9.728 6.75 6A2.25 2.25 0 019 3.75h7.5zm-9 0V6a4.5 4.5 0 009 0V3.75M12 15v4.5m0 0h3.75m-3.75 0H8.25"
                  />
                </svg>
              </div>
              <div className="font-bold text-lg text-white">{t('ranked.docsRewards')}</div>
            </div>

            <div className="w-full h-[1px] bg-[#333]" />

            <div className="flex flex-col text-base gap-2">
              <div className="text-[#bbb] leading-relaxed">
                {t('ranked.docsRewardsDescription1Part1')}{' '}
                <span className="text-yellow-400 font-bold">
                  {t('ranked.docsRewardsDescription1Doubled')}
                </span>
                {t('ranked.docsRewardsDescription1Part2')}
              </div>

              <div className="text-[#bbb] leading-relaxed">
                {t('ranked.docsRewardsDescription2')}
              </div>

              <div className="text-[#bbb] leading-relaxed">
                {t('ranked.docsRewardsDescription3')}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border border-[#333] rounded-md p-5 hover:border-[#444] transition-colors">
            <div className="flex items-center gap-2">
              <div className="text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
                    clipRule="evenodd"
                  />
                  <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                </svg>
              </div>
              <div className="font-bold text-lg text-white">
                {t('ranked.docsOfficers')}
              </div>
            </div>

            <div className="w-full h-[1px] bg-[#333]" />

            <div className="flex flex-col text-base gap-2">
              <div className="text-[#bbb] leading-relaxed">
                {t('ranked.docsOfficersDescription1Part1')}{' '}
                <span className="text-blue-400">
                  {t('ranked.docsOfficersGeneral')}
                </span>
                {t('ranked.docsOfficersDescription1Part2')}{' '}
                <span className="text-blue-300">
                  {t('ranked.docsOfficersLieutenant')}
                </span>
                {t('ranked.docsOfficersDescription1Part3')}{' '}
                <span className="text-blue-200">
                  {t('ranked.docsOfficersSergeant')}
                </span>
                {t('ranked.docsOfficersDescription1Part4')}
              </div>

              <div className="text-[#bbb] leading-relaxed">
                {t('ranked.docsOfficersDescription2')}
              </div>

              <div className="text-[#bbb] leading-relaxed">
                {t('ranked.docsOfficersDescription3')}
              </div>

              <div className="text-[#bbb] leading-relaxed mt-1">
                {t('ranked.docsOfficersDescription4')}
              </div>
              <div className="text-[#bbb] leading-relaxed pl-4">
                {t('ranked.docsOfficersPromotion1')}
              </div>
              <div className="text-[#bbb] leading-relaxed pl-4">
                {t('ranked.docsOfficersPromotion2')}
              </div>
              <div className="text-[#bbb] leading-relaxed pl-4">
                {t('ranked.docsOfficersPromotion3')}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border border-[#333] rounded-md p-5 hover:border-[#444] transition-colors">
            <div className="flex items-center gap-2">
              <div className="text-[#cec161f0]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="font-bold text-lg text-white">{t('ranked.docsWeeklyTrading')}</div>
            </div>

            <div className="w-full h-[1px] bg-[#333]" />

            <div className="flex flex-col text-base gap-2">
              <div className="text-[#bbb] leading-relaxed">
                {t('ranked.docsWeeklyTradingDescription1Part1')}{' '}
                <span className="text-yellow-400 font-bold">
                  {t('ranked.docsWeeklyTradingOpenedAndClosed')}
                </span>{' '}
                {t('ranked.docsWeeklyTradingDescription1Part2')}
                <span className="text-yellow-400">
                  {t('ranked.docsWeeklyTradingPeriod')}
                </span>
                {t('ranked.docsWeeklyTradingDescription1Part3')}
              </div>

              <div className="text-[#bbb] leading-relaxed">
                {t('ranked.docsWeeklyTradingDescription2')}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border border-[#333] rounded-md p-5 hover:border-[#444] transition-colors">
            <div className="flex items-center gap-2">
              <div className="text-[#e47dbb]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12V6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25V12m-19.5 0v4.5A2.25 2.25 0 004.5 18.75h15a2.25 2.25 0 002.25-2.25V12m-19.5 0h19.5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 12V9.75A2.25 2.25 0 019 7.5h6a2.25 2.25 0 012.25 2.25V12"
                  />
                </svg>
              </div>
              <div className="font-bold text-lg text-white">{t('ranked.docsPillage')}</div>
            </div>

            <div className="w-full h-[1px] bg-[#333]" />

            <div className="flex flex-col text-base gap-2">
              <div className="text-[#bbb] leading-relaxed">
                {t('ranked.docsPillageDescription1Part1')}{' '}
                <span className="text-white font-bold">
                  {t('ranked.docsPillage30Percent')}
                </span>{' '}
                {t('ranked.docsPillageDescription1Part2')}
              </div>

              <div className="p-3 rounded-md mt-1 border border-[#222]">
                <div className="text-white mb-1">{t('ranked.docsExample1Title')}</div>
                <div
                  className="text-[#bbb] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: t('ranked.docsExample1Description1') }}
                />
                <div
                  className="text-[#bbb] leading-relaxed pl-4"
                  dangerouslySetInnerHTML={{ __html: t('ranked.docsExample1Description2') }}
                />
                <div
                  className="text-[#bbb] leading-relaxed pl-4"
                  dangerouslySetInnerHTML={{ __html: t('ranked.docsExample1Description3') }}
                />
              </div>

              <div className="p-3 rounded-md mt-1 border border-[#222]">
                <div className="text-white mb-1">
                  {t('ranked.docsExample2Title')}
                </div>
                <div
                  className="text-[#bbb] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: t('ranked.docsExample2Description1') }}
                />
                <div
                  className="text-[#bbb] leading-relaxed pl-4"
                  dangerouslySetInnerHTML={{ __html: t('ranked.docsExample2Description2') }}
                />
                <div
                  className="text-[#bbb] leading-relaxed pl-4"
                  dangerouslySetInnerHTML={{ __html: t('ranked.docsExample2Description3') }}
                />
              </div>

              <div className="p-3 rounded-md mt-1 border border-[#222]">
                <div className="text-white mb-1">
                  {t('ranked.docsExample3Title')}
                </div>
                <div
                  className="text-[#bbb] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: t('ranked.docsExample3Description1') }}
                />
                <div
                  className="text-[#bbb] leading-relaxed pl-4"
                  dangerouslySetInnerHTML={{ __html: t('ranked.docsExample3Description2') }}
                />
                <div
                  className="text-[#bbb] leading-relaxed pl-4"
                  dangerouslySetInnerHTML={{ __html: t('ranked.docsExample3Description3') }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
