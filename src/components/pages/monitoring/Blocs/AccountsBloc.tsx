import { PublicKey } from '@solana/web3.js';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import { Cortex, CustodyExtended, Perpetuals, PoolExtended } from '@/types';

import Bloc from '../Bloc';
import InfoAnnotation from '../InfoAnnotation';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../Table';
import TitleAnnotation from '../TitleAnnotation';

export default function AccountsBloc({
  className,
  perpetuals,
  cortex,
  mainPool,
  custodies,
}: {
  className?: string;
  perpetuals: Perpetuals;
  cortex: Cortex;
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
}) {
  return (
    <Bloc title="Accounts" className={twMerge('min-w-[30em]', className)}>
      <Table
        rowTitleWidth="30%"
        data={[
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Account containing the source code of the Adrena smart contract."
                  className="mr-1"
                />
                Program
              </div>
            ),
            value: <OnchainAccountInfo address={AdrenaClient.programId} />,
          },
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="The program's administrator account, authorized to modify settings and upgrade the program."
                  className="mr-1"
                />
                Admin
              </div>
            ),
            value: <OnchainAccountInfo address={perpetuals.admin} />,
          },
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Manages the DAO's operations as the official Solana governance smart contract."
                  className="mr-1"
                />
                Governance Program
              </div>
            ),
            value: <OnchainAccountInfo address={cortex.governanceProgram} />,
          },
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Represents Adrena's DAO within the Solana DAO program."
                  className="mr-1"
                />
                Governance Realm <TitleAnnotation text="PDA" />
              </div>
            ),
            value: <OnchainAccountInfo address={cortex.governanceRealm} />,
          },
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Top-level account with information on custodies and their associated ratios."
                  className="mr-1"
                />
                Pool
                <TitleAnnotation text="PDA" />
              </div>
            ),
            value: <OnchainAccountInfo address={mainPool.pubkey} />,
          },
          ...custodies
            .map((custody) => ({
              rowTitle: (
                <div className="flex items-center">
                  <InfoAnnotation
                    text={`Manages ${custody.tokenInfo.symbol} assets within Adrena's ecosystem, tracking balances, fees, and transactions.`}
                    className="mr-1"
                  />
                  {custody.tokenInfo.symbol} Custody
                  <TitleAnnotation text="PDA" />
                </div>
              ),
              value: <OnchainAccountInfo address={custody.pubkey} />,
            }))
            .flat(),
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Top-level account managing Adrena access, including admin and permissions."
                  className="mr-1"
                />
                Perpetuals
                <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo address={AdrenaClient.perpetualsAddress} />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Serves as the designated authority for managing custody token accounts, facilitating secure asset transfers."
                  className="mr-1"
                />
                Transfer Authority
                <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                address={AdrenaClient.transferAuthorityAddress}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Governance token mint for Adrena, used to vote on proposals and collect protocol revenue shares."
                  className="mr-1"
                />
                ADX <TitleAnnotation text="Mint" />
              </div>
            ),
            value: (
              <OnchainAccountInfo address={window.adrena.client.lmTokenMint} />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Liquidity pool token mint, representing a user's share in Adrena's pool."
                  className="mr-1"
                />
                ALP <TitleAnnotation text="Mint" />
              </div>
            ),
            value: (
              <OnchainAccountInfo address={window.adrena.client.lpTokenMint} />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Top-level account holding details on ADX token staking, tracking participation and rewards."
                  className="mr-1"
                />
                ADX Staking <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                address={window.adrena.client.getStakingPda(
                  window.adrena.client.lmTokenMint,
                )}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center">
                <InfoAnnotation
                  text="Top-level account holding details on ALP token staking, tracking participation and rewards."
                  className="mr-1"
                />
                ALP Staking <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                address={window.adrena.client.getStakingPda(
                  window.adrena.client.lpTokenMint,
                )}
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
            value: <OnchainAccountInfo address={custody.mint} />,
          })),
        ]}
      />
    </Bloc>
  );
}
