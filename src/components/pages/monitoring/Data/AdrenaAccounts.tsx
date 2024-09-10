import { AdrenaClient } from '@/AdrenaClient';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { Cortex, CustodyExtended, PoolExtended } from '@/types';

import InfoAnnotation from '../InfoAnnotation';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../Table';
import TitleAnnotation from '../TitleAnnotation';

export default function AdrenaAccounts({
  cortex,
  mainPool,
  custodies,
  titleClassName,
}: {
  cortex: Cortex;
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
  titleClassName?: string;
}) {
  return (
    <StyledContainer
      title="Adrena Accounts"
      subTitle="Adrena Program on-chain accounts (PDAs)."
      className="w-auto grow min-w-[45%]"
      titleClassName={titleClassName}
    >
      <Table
        breakpoint="767px"
        rowTitleWidth="30%"
        data={[
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
                Program
                <InfoAnnotation
                  text="Account containing the source code of the Adrena smart contract."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={AdrenaClient.programId}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
                Admin
                <InfoAnnotation
                  text="The program's administrator account, authorized to modify settings and upgrade the program."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={cortex.admin}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
                Cortex
                <TitleAnnotation text="PDA" />
                <InfoAnnotation
                  text="Top-level account managing Adrena access, owned by the governance."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={AdrenaClient.cortexPda}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
                Pool
                <TitleAnnotation text="PDA" />
                <InfoAnnotation
                  text="Top-level account with information on custodies and their associated ratios."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={mainPool.pubkey}
              />
            ),
          },
          ...custodies
            .map((custody) => ({
              rowTitle: (
                <div className="flex items-center">
                  {custody.tokenInfo.symbol} Custody
                  <TitleAnnotation text="PDA" />
                  <InfoAnnotation
                    text={`Manages ${custody.tokenInfo.symbol} assets within Adrena's ecosystem, tracking balances, fees, and transactions.`}
                    className="mr-1"
                  />
                </div>
              ),
              value: (
                <OnchainAccountInfo
                  className="md:ml-auto"
                  address={custody.pubkey}
                />
              ),
            }))
            .flat(),
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
                Transfer Authority
                <TitleAnnotation text="PDA" />
                <InfoAnnotation
                  text="Serves as the designated authority for managing custodies' token accounts, facilitating secure asset transfers."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={AdrenaClient.transferAuthorityAddress}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
                ADX Staking <TitleAnnotation text="PDA" />
                <InfoAnnotation
                  text="Top-level account holding details on ADX token staking, tracking participation and rewards."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={window.adrena.client.getStakingPda(
                  window.adrena.client.lmTokenMint,
                )}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
                ALP Staking <TitleAnnotation text="PDA" />
                <InfoAnnotation
                  text="Top-level account holding details on ALP token staking, tracking participation and rewards."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={window.adrena.client.getStakingPda(
                  window.adrena.client.lpTokenMint,
                )}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-boldy">
                Genesis Lock <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={window.adrena.client.getGenesisLockPda()}
              />
            ),
          },
        ]}
      />
    </StyledContainer>
  );
}
