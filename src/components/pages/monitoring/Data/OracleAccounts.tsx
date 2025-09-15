import { PublicKey } from '@solana/web3.js';

import { AdrenaClient } from '@/AdrenaClient';
import CopyButton from '@/components/common/CopyButton/CopyButton';
import { CustodyExtended } from '@/types';

import InfoAnnotation from '../InfoAnnotation';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../TableLegacy';
import TitleAnnotation from '../TitleAnnotation';

export default function OracleAccounts({
  custodies,
  titleClassName,
}: {
  custodies: CustodyExtended[];
  titleClassName?: string;
}) {
  const pythProgramId = new PublicKey(
    'rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ',
  );

  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>Oracle Accounts</p>
        <p className="text-base opacity-50">Oracle on-chain accounts (PDAs).</p>
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
                  textToCopy={pythProgramId.toBase58()}
                  notificationTitle="Pyth Program address copied to clipboard"
                  className="mr-2"
                />
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
                address={pythProgramId}
              />
            ),
          },
          ...custodies
            .map((custody) => {
              const rows = [
                {
                  rowTitle: (
                    <div className="flex items-center">
                      <CopyButton
                        textToCopy={AdrenaClient.oraclePda.toBase58()}
                        notificationTitle={`${custody.tokenInfo.symbol} Oracle PDA address copied to clipboard`}
                        className="mr-2"
                      />
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
                      <CopyButton
                        textToCopy={AdrenaClient.oraclePda.toBase58()}
                        notificationTitle={`${custody.tradeTokenInfo.symbol} Oracle PDA address copied to clipboard`}
                        className="mr-2"
                      />
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
