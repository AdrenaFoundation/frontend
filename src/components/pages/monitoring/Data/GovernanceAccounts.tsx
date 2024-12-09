import { Cortex } from '@/types';

import InfoAnnotation from '../InfoAnnotation';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../Table';
import TitleAnnotation from '../TitleAnnotation';

export default function GovernanceAccounts({
  cortex,
  titleClassName,
}: {
  cortex: Cortex;
  titleClassName?: string;
}) {
  return (
    <div className="bg-mainDark border rounded-lg flex-1 shadow-xl">
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
        className='rounded-none bg-transparent border-none'
        data={[
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
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
