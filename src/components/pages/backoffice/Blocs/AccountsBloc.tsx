import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import { Cortex, CustodyExtended, Perpetuals, PoolExtended } from '@/types';

import Bloc from '../Bloc';
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
            rowTitle: 'Admin',
            value: <OnchainAccountInfo address={perpetuals.admin} />,
          },
          {
            rowTitle: 'Governance Program',
            value: <OnchainAccountInfo address={cortex.governanceProgram} />,
          },
          {
            rowTitle: (
              <div>
                Governance Realm <TitleAnnotation text="PDA" />
              </div>
            ),
            value: <OnchainAccountInfo address={cortex.governanceRealm} />,
          },
          {
            rowTitle: (
              <div>
                Pool <TitleAnnotation text="PDA" />
              </div>
            ),
            value: <OnchainAccountInfo address={mainPool.pubkey} />,
          },
          ...custodies.map((custody) => ({
            rowTitle: (
              <div>
                {custody.tokenInfo.symbol} Custody{' '}
                <TitleAnnotation text="PDA" />
              </div>
            ),
            value: <OnchainAccountInfo address={custody.pubkey} />,
          })),
          {
            rowTitle: (
              <div>
                Perpetuals <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo address={AdrenaClient.perpetualsAddress} />
            ),
          },
          {
            rowTitle: (
              <div>
                ADX <TitleAnnotation text="Mint" />
              </div>
            ),
            value: (
              <OnchainAccountInfo address={window.adrena.client.lmTokenMint} />
            ),
          },
          {
            rowTitle: (
              <div>
                ALP <TitleAnnotation text="Mint" />
              </div>
            ),
            value: (
              <OnchainAccountInfo address={window.adrena.client.lpTokenMint} />
            ),
          },
          {
            rowTitle: (
              <div>
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
              <div>
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
        ]}
      />
    </Bloc>
  );
}
