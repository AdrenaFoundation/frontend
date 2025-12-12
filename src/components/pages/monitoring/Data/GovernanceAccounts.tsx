import { useTranslation } from 'react-i18next';

import CopyButton from '@/components/common/CopyButton/CopyButton';
import { Cortex } from '@/types';

import InfoAnnotation from '../InfoAnnotation';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../TableLegacy';
import TitleAnnotation from '../TitleAnnotation';

export default function GovernanceAccounts({
  cortex,
  titleClassName,
}: {
  cortex: Cortex;
  titleClassName?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-[#050D14] border rounded-md flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>{t('monitoring.governanceAccounts')}</p>
        <p className="text-base opacity-50">
          {t('monitoring.governanceAccountsDesc')}
        </p>
      </div>

      <Table
        rowHovering={true}
        breakpoint="767px"
        rowTitleWidth="30%"
        className="rounded-none bg-transparent border-none"
        data={[
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={cortex.governanceProgram.toBase58()}
                  notificationTitle="Governance Program address copied to clipboard"
                  className="mr-2"
                />
                {t('monitoring.governanceProgram')}
                <InfoAnnotation
                  text={t('monitoring.governanceProgramDesc')}
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={cortex.governanceProgram}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={cortex.governanceRealm.toBase58()}
                  notificationTitle="Governance Realm PDA address copied to clipboard"
                  className="mr-2"
                />
                {t('monitoring.governanceRealm')} <TitleAnnotation text="PDA" />
                <InfoAnnotation
                  text={t('monitoring.governanceRealmDesc')}
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={cortex.governanceRealm}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
