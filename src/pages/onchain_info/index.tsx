import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import Link from 'next/link';

import { AdrenaClient } from '@/AdrenaClient';
import { PageProps } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

export default function OnchainInfo({}: PageProps) {
  const tableClasses =
    'flex flex-col bg-gray-200 border border-gray-300 rounded-lg m-auto w-full max-w-[600px] mb-5';
  const titleClasses = 'text-md font-normal border-b border-gray-300 p-2';
  const rowClasses = 'flex flex-row gap-1 w-full justify-between flex-wrap p-2';
  const subtitleClasses = 'w-[10em] shrink-0 flex text-sm opacity-50';
  const infoClasses = 'flex w-[calc(100% - 10em)] text-sm font-mono';

  const solanaExplorerLink = (pubkey: PublicKey): JSX.Element => (
    <Link
      href={`https://explorer.solana.com/address/${pubkey.toBase58()}?cluster=devnet`}
      target="_blank"
    >
      {getAbbrevWalletAddress(pubkey.toBase58())}
    </Link>
  );

  return (
    <>
      <div className={tableClasses}>
        <div className={titleClasses}>Main Information</div>

        <div className={rowClasses}>
          <div className={subtitleClasses}>Cluster</div>
          <div className={infoClasses}>{window.adrena.cluster}</div>
        </div>

        <div className={rowClasses}>
          <div className={subtitleClasses}>Program</div>
          <div className={infoClasses}>
            {solanaExplorerLink(AdrenaClient.programId)}
          </div>
        </div>

        <div className={rowClasses}>
          <div className={subtitleClasses}>Pool</div>
          <div className={infoClasses}>
            {solanaExplorerLink(window.adrena.client.mainPool.pubkey)}
          </div>
        </div>

        <div className={rowClasses}>
          <div className={subtitleClasses}>Perpetuals</div>
          <div className={infoClasses}>
            {solanaExplorerLink(AdrenaClient.perpetualsAddress)}
          </div>
        </div>

        <div className={rowClasses}>
          <div className={subtitleClasses}>Multisig</div>
          <div className={infoClasses}>
            {solanaExplorerLink(AdrenaClient.multisigAddress)}
          </div>
        </div>

        <div className={rowClasses}>
          <div className={subtitleClasses}>Transfer Authority</div>
          <div className={infoClasses}>
            {solanaExplorerLink(AdrenaClient.transferAuthorityAddress)}
          </div>
        </div>

        <div className={rowClasses}>
          <div className={subtitleClasses}>Program Data</div>
          <div className={infoClasses}>
            {solanaExplorerLink(AdrenaClient.programData)}
          </div>
        </div>

        <div className={rowClasses}>
          <div className={subtitleClasses}>ALP Mint</div>
          <div className={infoClasses}>
            {solanaExplorerLink(window.adrena.client.alpToken.mint)}
          </div>
        </div>

        <div className={rowClasses}>
          <div className={subtitleClasses}>ADX Mint</div>
          <div className={infoClasses}>
            {
              // @TODO
              '-'
            }
          </div>
        </div>
      </div>

      {window.adrena.client.custodies.map((custody) => {
        const token = window.adrena.client.tokens.find((token) =>
          token.custody?.equals(custody.pubkey),
        );

        return (
          <div className={tableClasses} key={custody.mint.toBase58()}>
            <div className={titleClasses}>
              {token?.name ? (
                <div className="flex flex-row">
                  {token.name} Custody
                  <Image
                    src={token.image}
                    alt="logo"
                    width="25"
                    height="25"
                    className="ml-2"
                  />
                </div>
              ) : (
                `Custody ${custody.mint.toBase58().slice(0, 4)}`
              )}
            </div>

            <div className={rowClasses}>
              <div className={subtitleClasses}>Address</div>
              <div className={infoClasses}>
                {solanaExplorerLink(custody.pubkey)}
              </div>
            </div>

            {token ? (
              <div className={rowClasses}>
                <div className={subtitleClasses}>{token.name} Mint</div>
                <div className={infoClasses}>
                  {solanaExplorerLink(token.mint)}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
