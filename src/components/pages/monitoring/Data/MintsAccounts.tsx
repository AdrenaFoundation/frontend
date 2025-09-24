import CopyButton from '@/components/common/CopyButton/CopyButton';
import { CustodyExtended } from '@/types';

import InfoAnnotation from '../InfoAnnotation';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../TableLegacy';
import TitleAnnotation from '../TitleAnnotation';

export default function MintAccounts({
  custodies,
  titleClassName,
}: {
  custodies: CustodyExtended[];
  titleClassName?: string;
}) {
  return (
    <div className="bg-[#050D14] border rounded-md flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>Mints</p>
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
                  textToCopy={window.adrena.client.lmTokenMint.toBase58()}
                  notificationTitle="ADX Mint address copied to clipboard"
                  className="mr-2"
                />
                ADX <TitleAnnotation text="Mint" />
                <InfoAnnotation
                  text="Adrena's Governance token mint, can be staked for governance and revenue share access."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={window.adrena.client.lmTokenMint}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={window.adrena.client.lpTokenMint.toBase58()}
                  notificationTitle="ALP Mint address copied to clipboard"
                  className="mr-2"
                />
                ALP <TitleAnnotation text="Mint" />
                <InfoAnnotation
                  text="Adrena's Liquidity Pool token mint, represents a share of the pool."
                  className="mr-1"
                />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={window.adrena.client.lpTokenMint}
              />
            ),
          },

          ...custodies
            .map((custody) => {
              const rows = [
                {
                  rowTitle: (
                    <div className="flex items-center font-semibold">
                      <CopyButton
                        textToCopy={custody.mint.toBase58()}
                        notificationTitle={`${custody.tokenInfo.symbol} Mint address copied to clipboard`}
                        className="mr-2"
                      />
                      {custody.tokenInfo.symbol}
                      <TitleAnnotation text="Mint" />
                    </div>
                  ),
                  value: (
                    <OnchainAccountInfo
                      className="md:ml-auto"
                      address={custody.mint}
                    />
                  ),
                },
              ];

              if (
                custody.tradeTokenInfo.symbol !== custody.tokenInfo.symbol &&
                custody.tradeTokenInfo.symbol !== 'BTC' // Hardcoded exception
              ) {
                rows.push({
                  rowTitle: (
                    <div className="flex items-center font-semibold">
                      <CopyButton
                        textToCopy={custody.tradeMint.toBase58()}
                        notificationTitle={`${custody.tradeTokenInfo.symbol} Mint address copied to clipboard`}
                        className="mr-2"
                      />
                      {custody.tradeTokenInfo.symbol}
                      <TitleAnnotation text="Mint" />
                    </div>
                  ),
                  value: (
                    <OnchainAccountInfo
                      className="md:ml-auto"
                      address={custody.tradeMint}
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
