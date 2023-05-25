import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import Link from 'next/link';

import { AdrenaClient } from '@/AdrenaClient';
import { PageProps } from '@/types';

export default function OnchainInfo({ client }: PageProps) {
  const tableClasses =
    'flex flex-col border border-grey mt-4 grow w-[90%] max-w-[50em]';
  const titleClasses = 'text-md font-bold border-b border-grey p-2';
  const rowClasses =
    'flex flex-row w-full justify-between flex-wrap max-w-full grow items-center pl-4 pt-2 pb-2 pr-4';
  const subtitleClasses = 'w-[10em] shrink-0 flex text-sm';
  const infoClasses =
    'w-[calc(100% - 10em)] text-txtfade text-sm hover:text-white flex';

  const solanaExplorerLink = (pubkey: PublicKey): JSX.Element => (
    <Link
      href={`https://explorer.solana.com/address/${pubkey.toBase58()}?cluster=devnet`}
      target="_blank"
    >
      {pubkey.toBase58()}
    </Link>
  );

  if (!client) return <div className="w-full h-full bg-main"></div>;

  return (
    <>
      <div className={tableClasses}>
        <div className={titleClasses}>Main Information</div>

        <div className={rowClasses}>
          <div className={subtitleClasses}>Cluster</div>
          <div className={infoClasses}>{client.cluster}</div>
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
            {solanaExplorerLink(AdrenaClient.mainPoolAddress)}
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
            {solanaExplorerLink(AdrenaClient.alpToken.mint)}
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

      {client?.custodies.map((custody) => {
        const token = client.tokens.find((token) =>
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
