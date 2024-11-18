import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { ReactNode, useCallback, useEffect, useState } from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { SOL_DECIMALS } from '@/constant';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { PositionExtended, UserProfileExtended, VestExtended } from '@/types';
import { getTokenSymbol, nativeToUi } from '@/utils';

import InfoAnnotation from '../monitoring/InfoAnnotation';
import OnchainAccountInfo from '../monitoring/OnchainAccountInfo';
import Table from '../monitoring/Table';
import TitleAnnotation from '../monitoring/TitleAnnotation';

// Utility function to reduce boilerplate
function onchainAccountData({
  title,
  address,
  program,
}: {
  title: ReactNode;
  address: PublicKey;
  program: 'Adrena';
}) {
  return {
    rowTitle: (
      <div className="flex items-center font-boldy">
        {title} <TitleAnnotation text={program} />
      </div>
    ),
    value: (
      <OnchainAccountInfo className="md:ml-auto text-sm" address={address} />
    ),
  };
}

export default function UserRelatedAdrenaAccounts({
  userProfile,
  userVest,
  positions,
  className,
}: {
  userProfile: false | UserProfileExtended;
  userVest: VestExtended | null;
  positions: PositionExtended[] | null;
  className?: string;
}) {
  const { stakingAccounts } = useWalletStakingAccounts();
  const [rent, setRent] = useState<number | null>(null);
  const [data, setData] = useState<
    | {
      rowTitle: ReactNode;
      value: ReactNode;
    }[]
    | null
  >(null);

  const [accounts, setAccounts] = useState<PublicKey[] | null>(null);

  useEffect(() => {
    const data: {
      rowTitle: ReactNode;
      value: ReactNode;
    }[] = [];
    const accounts: PublicKey[] = [];

    if (stakingAccounts?.ADX) {
      data.push(
        onchainAccountData({
          title: 'ADX Staking Account',
          address: stakingAccounts.ADX.pubkey,
          program: 'Adrena',
        }),
      );
    }

    if (stakingAccounts?.ALP) {
      data.push(
        onchainAccountData({
          title: 'ALP Staking Account',
          address: stakingAccounts.ALP.pubkey,
          program: 'Adrena',
        }),
      );
    }

    if (userProfile) {
      data.push(
        onchainAccountData({
          title: 'Profile',
          address: userProfile.pubkey,
          program: 'Adrena',
        }),
      );

      accounts.push(userProfile.pubkey);
    }

    if (userVest) {
      data.push(
        onchainAccountData({
          title: 'Vest',
          address: userVest.pubkey,
          program: 'Adrena',
        }),
      );

      accounts.push(userVest.pubkey);
    }

    positions?.forEach((position) => {
      data.push(
        onchainAccountData({
          title: `${getTokenSymbol(position.token.symbol)} ${position.side === 'long' ? 'Long' : 'Short'
            } Position`,
          address: position.pubkey,
          program: 'Adrena',
        }),
      );

      accounts.push(position.pubkey);
    });

    setData(data);
    setAccounts(accounts);
  }, [positions, stakingAccounts, userProfile, userVest]);

  // Calculate rent for all accounts
  const calculateRent = useCallback(async () => {
    if (!window.adrena.client.connection || accounts === null)
      return setRent(null);

    if (!accounts.length) {
      return setRent(0);
    }

    const accountsInfo =
      await window.adrena.client.connection.getMultipleAccountsInfo(accounts);

    const rent = accountsInfo.reduce((acc, account) => {
      if (!account) return acc;

      return acc + nativeToUi(new BN(account.lamports), SOL_DECIMALS);
    }, 0);

    setRent(rent);
  }, [accounts]);

  useEffect(() => {
    calculateRent();
  }, [calculateRent]);

  if (!data) return null;

  return (
    <Table
      className={className}
      rowHovering={true}
      breakpoint="650px"
      rowTitleWidth="50%"
      data={data}
      rowTitleClassName="text-sm"
      pagination={true}
      nbItemPerPage={10}
    />
  );
}
