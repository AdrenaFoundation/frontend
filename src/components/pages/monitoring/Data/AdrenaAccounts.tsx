import { useTranslation } from 'react-i18next';

import { AdrenaClient } from '@/AdrenaClient';
import CopyButton from '@/components/common/CopyButton/CopyButton';
import { Cortex, CustodyExtended, PoolExtended } from '@/types';

import InfoAnnotation from '../InfoAnnotation';
import OnchainAccountInfo from '../OnchainAccountInfo';
import Table from '../TableLegacy';
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
  const { t } = useTranslation();
  const lmStakingPda = window.adrena.client.getStakingPda(
    window.adrena.client.lmTokenMint,
  );

  const lpStakingPda = window.adrena.client.getStakingPda(
    window.adrena.client.lpTokenMint,
  );

  const lmStakingRewardTokenVaultPda =
    window.adrena.client.getStakingRewardTokenVaultPda(lmStakingPda);

  const lmStakingLmRewardTokenVaultPda =
    window.adrena.client.getStakingLmRewardTokenVaultPda(lmStakingPda);

  const lpStakingRewardTokenVaultPda =
    window.adrena.client.getStakingRewardTokenVaultPda(lpStakingPda);

  const lpStakingLmRewardTokenVaultPda =
    window.adrena.client.getStakingLmRewardTokenVaultPda(lpStakingPda);

  return (
    <div className="bg-[#050D14] border rounded-md flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>{t('monitoring.adrenaAccounts')}</p>
        <p className="text-base opacity-50">
          {t('monitoring.adrenaProgramOnchainAccounts')}
        </p>
      </div>

      <Table
        rowHovering={true}
        breakpoint="767px"
        rowTitleWidth="50%"
        className="rounded-none bg-transparent border-none"
        data={[
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={AdrenaClient.programId.toBase58()}
                  notificationTitle="Program address copied to clipboard"
                  className="mr-2"
                />
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
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={cortex.admin.toBase58()}
                  notificationTitle="Admin address copied to clipboard"
                  className="mr-2"
                />
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
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={AdrenaClient.cortexPda.toBase58()}
                  notificationTitle="Cortex PDA address copied to clipboard"
                  className="mr-2"
                />
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
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={mainPool.pubkey.toBase58()}
                  notificationTitle="Pool PDA address copied to clipboard"
                  className="mr-2"
                />
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
                  <CopyButton
                    textToCopy={custody.pubkey.toBase58()}
                    notificationTitle={`${custody.tokenInfo.symbol} Custody address copied to clipboard`}
                    className="mr-2"
                  />
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
          ...custodies
            .map((custody) => ({
              rowTitle: (
                <div className="flex items-center">
                  <CopyButton
                    textToCopy={window.adrena.client
                      .findCustodyTokenAccountAddress(custody.mint)
                      .toBase58()}
                    notificationTitle={`${custody.tokenInfo.symbol} Custody ATA address copied to clipboard`}
                    className="mr-2"
                  />
                  {custody.tokenInfo.symbol} Custody ATA
                  <TitleAnnotation text="PDA" />
                  <InfoAnnotation
                    text={`Store ${custody.tokenInfo.symbol} assets within Adrena's ecosystem.`}
                    className="mr-1"
                  />
                </div>
              ),
              value: (
                <OnchainAccountInfo
                  className="md:ml-auto"
                  address={window.adrena.client.findCustodyTokenAccountAddress(
                    custody.mint,
                  )}
                />
              ),
            }))
            .flat(),
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={AdrenaClient.transferAuthorityAddress.toBase58()}
                  notificationTitle="Transfer Authority PDA address copied to clipboard"
                  className="mr-2"
                />
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
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={lmStakingPda.toBase58()}
                  notificationTitle="ADX Staking PDA address copied to clipboard"
                  className="mr-2"
                />
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
                address={lmStakingPda}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={lmStakingRewardTokenVaultPda.toBase58()}
                  notificationTitle="ADX Staking USDC Rewards Vault address copied to clipboard"
                  className="mr-2"
                />
                ADX Staking USDC Rewards Vault
                <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={lmStakingRewardTokenVaultPda}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={lmStakingLmRewardTokenVaultPda.toBase58()}
                  notificationTitle="ADX Staking ADX Rewards Vault address copied to clipboard"
                  className="mr-2"
                />
                ADX Staking ADX Rewards Vault
                <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={lmStakingLmRewardTokenVaultPda}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={lpStakingPda.toBase58()}
                  notificationTitle="ALP Staking PDA address copied to clipboard"
                  className="mr-2"
                />
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
                address={lpStakingPda}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={lpStakingRewardTokenVaultPda.toBase58()}
                  notificationTitle="ALP Staking USDC Rewards Vault address copied to clipboard"
                  className="mr-2"
                />
                ALP Staking USDC Rewards Vault
                <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={lpStakingRewardTokenVaultPda}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={lpStakingLmRewardTokenVaultPda.toBase58()}
                  notificationTitle="ALP Staking ADX Rewards Vault address copied to clipboard"
                  className="mr-2"
                />
                ALP Staking ADX Rewards Vault
                <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={lpStakingLmRewardTokenVaultPda}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={window.adrena.client
                    .getGenesisLockPda()
                    .toBase58()}
                  notificationTitle="Genesis Lock PDA address copied to clipboard"
                  className="mr-2"
                />
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
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={AdrenaClient.vestRegistryPda.toBase58()}
                  notificationTitle="Vest Registry PDA address copied to clipboard"
                  className="mr-2"
                />
                Vest Registry <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={AdrenaClient.vestRegistryPda}
              />
            ),
          },
          {
            rowTitle: (
              <div className="flex items-center font-semibold">
                <CopyButton
                  textToCopy={window.adrena.client.lmTokenTreasury.toBase58()}
                  notificationTitle="ADX Token Treasury PDA address copied to clipboard"
                  className="mr-2"
                />
                ADX Token Treasury <TitleAnnotation text="PDA" />
              </div>
            ),
            value: (
              <OnchainAccountInfo
                className="md:ml-auto"
                address={window.adrena.client.lmTokenTreasury}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
