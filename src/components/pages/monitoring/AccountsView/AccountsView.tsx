import { AdrenaClient } from '@/AdrenaClient';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { Cortex, CustodyExtended, PoolExtended } from '@/types';

import InfoAnnotation from '../InfoAnnotation';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../Table';
import TitleAnnotation from '../TitleAnnotation';

export default function AccountsView({
  cortex,
  mainPool,
  custodies,
}: {
  cortex: Cortex;
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
}) {
  return (
    <>
      <StyledContainer
        title="Adrena Accounts"
        subTitle="Adrena Program on-chain accounts (PDAs)."
        className="w-[40em] grow"
      >
        <Table
          rowTitleWidth="30%"
          data={[
            {
              rowTitle: (
                <div className="flex items-center">
                  Program
                  <InfoAnnotation
                    text="Account containing the source code of the Adrena smart contract."
                    className="mr-1"
                  />
                </div>
              ),
              value: (
                <OnchainAccountInfo
                  className="ml-auto"
                  address={AdrenaClient.programId}
                />
              ),
            },
            {
              rowTitle: (
                <div className="flex items-center">
                  Admin
                  <InfoAnnotation
                    text="The program's administrator account, authorized to modify settings and upgrade the program."
                    className="mr-1"
                  />
                </div>
              ),
              value: (
                <OnchainAccountInfo
                  className="ml-auto"
                  address={cortex.admin}
                />
              ),
            },
            {
              rowTitle: (
                <div className="flex items-center">
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
                  className="ml-auto"
                  address={AdrenaClient.cortexPda}
                />
              ),
            },
            {
              rowTitle: (
                <div className="flex items-center">
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
                  className="ml-auto"
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
                    className="ml-auto"
                    address={custody.pubkey}
                  />
                ),
              }))
              .flat(),
            {
              rowTitle: (
                <div className="flex items-center">
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
                  className="ml-auto"
                  address={AdrenaClient.transferAuthorityAddress}
                />
              ),
            },
            {
              rowTitle: (
                <div className="flex items-center">
                  ADX Staking <TitleAnnotation text="PDA" />
                  <InfoAnnotation
                    text="Top-level account holding details on ADX token staking, tracking participation and rewards."
                    className="mr-1"
                  />
                </div>
              ),
              value: (
                <OnchainAccountInfo
                  className="ml-auto"
                  address={window.adrena.client.getStakingPda(
                    window.adrena.client.lmTokenMint,
                  )}
                />
              ),
            },
            {
              rowTitle: (
                <div className="flex items-center">
                  ALP Staking <TitleAnnotation text="PDA" />
                  <InfoAnnotation
                    text="Top-level account holding details on ALP token staking, tracking participation and rewards."
                    className="mr-1"
                  />
                </div>
              ),
              value: (
                <OnchainAccountInfo
                  className="ml-auto"
                  address={window.adrena.client.getStakingPda(
                    window.adrena.client.lpTokenMint,
                  )}
                />
              ),
            },
          ]}
        />
      </StyledContainer>

      <StyledContainer title="Mints" className="w-[40em] grow">
        <Table
          rowTitleWidth="30%"
          data={[
            {
              rowTitle: (
                <div className="flex items-center">
                  ADX <TitleAnnotation text="Mint" />
                  <InfoAnnotation
                    text="Adrena's Governance token mint, can be staked for governance and revenue share access."
                    className="mr-1"
                  />
                </div>
              ),
              value: (
                <OnchainAccountInfo
                  className="ml-auto"
                  address={window.adrena.client.lmTokenMint}
                />
              ),
            },
            {
              rowTitle: (
                <div className="flex items-center">
                  ALP <TitleAnnotation text="Mint" />
                  <InfoAnnotation
                    text="Adrena's Liquidity Pool token mint, represents a share of the pool."
                    className="mr-1"
                  />
                </div>
              ),
              value: (
                <OnchainAccountInfo
                  className="ml-auto"
                  address={window.adrena.client.lpTokenMint}
                />
              ),
            },

            ...custodies.map((custody) => ({
              rowTitle: (
                <div>
                  {custody.tokenInfo.symbol}
                  <TitleAnnotation text="Mint" />
                </div>
              ),
              value: (
                <OnchainAccountInfo
                  className="ml-auto"
                  address={custody.mint}
                />
              ),
            })),
          ]}
        />
      </StyledContainer>

      <StyledContainer
        title="Governance Accounts"
        subTitle="List on-chain accounts related to Governance."
        className="w-full"
      >
        <Table
          rowTitleWidth="30%"
          data={[
            {
              rowTitle: (
                <div className="flex items-center">
                  Governance Program
                  <InfoAnnotation
                    text="Manages the DAO's operations as the official Solana governance smart contract."
                    className="mr-1"
                  />
                </div>
              ),
              value: (
                <OnchainAccountInfo
                  className="ml-auto"
                  address={cortex.governanceProgram}
                />
              ),
            },
            {
              rowTitle: (
                <div className="flex items-center">
                  Governance Realm <TitleAnnotation text="PDA" />
                  <InfoAnnotation
                    text="Represents Adrena's DAO within the Solana DAO program."
                    className="mr-1"
                  />
                </div>
              ),
              value: (
                <OnchainAccountInfo
                  className="ml-auto"
                  address={cortex.governanceRealm}
                />
              ),
            },
          ]}
        />
      </StyledContainer>
    </>
  );
}
