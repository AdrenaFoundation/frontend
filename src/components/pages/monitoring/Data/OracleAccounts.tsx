import { PublicKey } from '@solana/web3.js';

import { AdrenaClient } from '@/AdrenaClient';
import { CustodyExtended } from '@/types';

import InfoAnnotation from '../InfoAnnotation';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../Table';
import TitleAnnotation from '../TitleAnnotation';

export default function OracleAccounts({
  custodies,
  titleClassName,
}: {
  custodies: CustodyExtended[];
  titleClassName?: string;
}) {
  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>Oracle Accounts</p>
        <p className="text-base opacity-50">
          Oracle on-chain accounts (PDAs).
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
                Pyth Program
                <InfoAnnotation
                  text="Account containing the source code of the Pyth smart contract."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={
                  new PublicKey('rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ')
                }
              />
            ),
          },
          ...custodies
            .map((custody) => {
              const rows = [
                {
                  rowTitle: (
                    <div className="flex items-center">
                      {custody.tokenInfo.symbol} Oracle
                      <TitleAnnotation text="PDA" />
                    </div>
                  ),
                  value: (
                    <OnchainAccountInfo
                      className="md:ml-auto"
                      address={AdrenaClient.oraclePda}
                    />
                  ),
                },
              ];

              if (custody.tradeTokenInfo.symbol !== custody.tokenInfo.symbol) {
                rows.push({
                  rowTitle: (
                    <div className="flex items-center">
                      {custody.tradeTokenInfo.symbol} Oracle
                      <TitleAnnotation text="PDA" />
                    </div>
                  ),
                  value: (
                    <OnchainAccountInfo
                      className="md:ml-auto"
                      address={AdrenaClient.oraclePda}
                    />
                  ),
                });
              }

              return rows.flat();
            })
            .flat(),
        ]}
      />
    </div>
  );
}
