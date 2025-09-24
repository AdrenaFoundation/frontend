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
  return (
    <div className="bg-[#050D14] border rounded-md flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>Governance Accounts</p>
        <p className="text-base opacity-50">
          List on-chain accounts related to Governance.
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
              <div className="flex items-center font-boldy">
                <CopyButton
                  textToCopy={cortex.governanceProgram.toBase58()}
                  notificationTitle="Governance Program address copied to clipboard"
                  className="mr-2"
                />
                Governance Program
                <InfoAnnotation
                  text="Manages the DAO's operations as the official Solana governance smart contract."
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
              <div className="flex items-center font-boldy">
                <CopyButton
                  textToCopy={cortex.governanceRealm.toBase58()}
                  notificationTitle="Governance Realm PDA address copied to clipboard"
                  className="mr-2"
                />
                Governance Realm <TitleAnnotation text="PDA" />
                <InfoAnnotation
                  text="Represents Adrena's DAO within the Solana DAO program."
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
