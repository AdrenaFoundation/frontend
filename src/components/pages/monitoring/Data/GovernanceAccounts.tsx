import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
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
    <StyledContainer
      title="Governance Accounts"
      subTitle="List on-chain accounts related to Governance."
      className="w-[37em] grow md:min-w-[37em]"
      titleClassName={titleClassName}
    >
      <Table
        breakpoint="767px"
        rowTitleWidth="30%"
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
    </StyledContainer>
  );
}
