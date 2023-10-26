export type Perpetuals = {
  version: '0.1.0';
  name: 'perpetuals';
  instructions: [
    {
      name: 'init';
      accounts: [
        {
          name: 'upgradeAuthority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStakingStakedTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStakingLmRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetualsProgramData';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceRealm';
          isMut: false;
          isSigner: false;
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ];
        },
        {
          name: 'governanceProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'InitParams';
          };
        },
      ];
    },
    {
      name: 'addVest';
      accounts: [
        {
          name: 'admin';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vest';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceRealm';
          isMut: false;
          isSigner: false;
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ];
        },
        {
          name: 'governanceRealmConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceGoverningTokenHolding';
          isMut: true;
          isSigner: false;
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: 'governanceGoverningTokenOwnerRecord';
          isMut: true;
          isSigner: false;
          docs: ['Account owned by governance storing user informations'];
        },
        {
          name: 'governanceProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'AddVestParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'claimVest';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'receivingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vest';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceRealm';
          isMut: false;
          isSigner: false;
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ];
        },
        {
          name: 'governanceRealmConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceGoverningTokenHolding';
          isMut: true;
          isSigner: false;
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: 'governanceGoverningTokenOwnerRecord';
          isMut: true;
          isSigner: false;
          docs: ['Account owned by governance storing user informations'];
        },
        {
          name: 'governanceProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
      returns: 'u64';
    },
    {
      name: 'addPool';
      accounts: [
        {
          name: 'admin';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'AddPoolParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'removePool';
      accounts: [
        {
          name: 'admin';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'RemovePoolParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'addCustody';
      accounts: [
        {
          name: 'admin';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'AddCustodyParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'removeCustody';
      accounts: [
        {
          name: 'admin';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'RemoveCustodyParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'setAdminSigners';
      accounts: [
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'SetAdminSignersParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'setCustodyConfig';
      accounts: [
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'SetCustodyConfigParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'setPermissions';
      accounts: [
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'SetPermissionsParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'withdrawFees';
      accounts: [
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'receivingTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'WithdrawFeesParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'withdrawSolFees';
      accounts: [
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'receivingAccount';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'WithdrawSolFeesParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'upgradeCustody';
      accounts: [
        {
          name: 'admin';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'UpgradeCustodyParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'setCustomOraclePrice';
      accounts: [
        {
          name: 'admin';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'oracleAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'SetCustomOraclePriceParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'setTestTime';
      accounts: [
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'SetTestTimeParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'testAdminRemoveCollateral';
      accounts: [
        {
          name: 'admin';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'multisig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'receivingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'position';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'TestAdminRemoveCollateralParams';
          };
        },
      ];
    },
    {
      name: 'swap';
      accounts: [
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'fundingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'receivingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'receivingCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'receivingCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'receivingCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'dispensingCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'dispensingCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'dispensingCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'SwapParams';
          };
        },
      ];
    },
    {
      name: 'addLiquidity';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'fundingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'AddLiquidityParams';
          };
        },
      ];
    },
    {
      name: 'addGenesisLiquidity';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'fundingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lpUserStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStakingStakedTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceRealm';
          isMut: false;
          isSigner: false;
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ];
        },
        {
          name: 'governanceRealmConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceGoverningTokenHolding';
          isMut: true;
          isSigner: false;
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: 'governanceGoverningTokenOwnerRecord';
          isMut: true;
          isSigner: false;
          docs: ['Account owned by governance storing user informations'];
        },
        {
          name: 'lpStakeResolutionThread';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakesClaimCronThread';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpUserStakingThreadAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'clockworkProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'AddGenesisLiquidityParams';
          };
        },
      ];
    },
    {
      name: 'removeLiquidity';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'receivingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'RemoveLiquidityParams';
          };
        },
      ];
    },
    {
      name: 'openPosition';
      accounts: [
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
          docs: ['Check: any user account'];
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'fundingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'position';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'OpenPositionParams';
          };
        },
      ];
    },
    {
      name: 'openPositionWithSwap';
      accounts: [
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'fundingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collateralAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'receivingCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'receivingCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'receivingCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'principalCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'principalCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'principalCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'position';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'OpenPositionWithSwapParams';
          };
        },
      ];
    },
    {
      name: 'addCollateral';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'fundingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'position';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'AddCollateralParams';
          };
        },
      ];
    },
    {
      name: 'removeCollateral';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'receivingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'position';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'RemoveCollateralParams';
          };
        },
      ];
    },
    {
      name: 'closePosition';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'receivingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'position';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpStakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'ClosePositionParams';
          };
        },
      ];
    },
    {
      name: 'liquidate';
      accounts: [
        {
          name: 'signer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'receivingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewardsReceivingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'position';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'LiquidateParams';
          };
        },
      ];
    },
    {
      name: 'updatePoolAum';
      accounts: [
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
      returns: 'u128';
    },
    {
      name: 'getAddLiquidityAmountAndFee';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lpTokenMint';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GetAddLiquidityAmountAndFeeParams';
          };
        },
      ];
      returns: {
        defined: 'AmountAndFee';
      };
    },
    {
      name: 'getRemoveLiquidityAmountAndFee';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lpTokenMint';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GetRemoveLiquidityAmountAndFeeParams';
          };
        },
      ];
      returns: {
        defined: 'AmountAndFee';
      };
    },
    {
      name: 'getEntryPriceAndFee';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GetEntryPriceAndFeeParams';
          };
        },
      ];
      returns: {
        defined: 'NewPositionPricesAndFee';
      };
    },
    {
      name: 'getExitPriceAndFee';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'position';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GetExitPriceAndFeeParams';
          };
        },
      ];
      returns: {
        defined: 'PriceAndFee';
      };
    },
    {
      name: 'getPnl';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'position';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GetPnlParams';
          };
        },
      ];
      returns: {
        defined: 'ProfitAndLoss';
      };
    },
    {
      name: 'getLiquidationPrice';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'position';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GetLiquidationPriceParams';
          };
        },
      ];
      returns: 'u64';
    },
    {
      name: 'getLiquidationState';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'position';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GetLiquidationStateParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'getOraclePrice';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GetOraclePriceParams';
          };
        },
      ];
      returns: 'u64';
    },
    {
      name: 'getSwapAmountAndFees';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'receivingCustody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'receivingCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'dispensingCustody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'dispensingCustodyOracleAccount';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GetSwapAmountAndFeesParams';
          };
        },
      ];
      returns: {
        defined: 'SwapAmountAndFees';
      };
    },
    {
      name: 'getAssetsUnderManagement';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GetAssetsUnderManagementParams';
          };
        },
      ];
      returns: 'u128';
    },
    {
      name: 'initUserStaking';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'rewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingLmRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userStakingThreadAuthority';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakesClaimCronThread';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakesClaimPayer';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'staking';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'clockworkProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'InitUserStakingParams';
          };
        },
      ];
    },
    {
      name: 'initStaking';
      accounts: [
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'multisig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'staking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingStakedTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingLmRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'stakingStakedTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'InitStakingParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'addLiquidStake';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'fundingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingStakedTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingLmRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'staking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceRealm';
          isMut: false;
          isSigner: false;
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ];
        },
        {
          name: 'governanceRealmConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceGoverningTokenHolding';
          isMut: true;
          isSigner: false;
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: 'governanceGoverningTokenOwnerRecord';
          isMut: true;
          isSigner: false;
          docs: ['Account owned by governance storing user informations'];
        },
        {
          name: 'stakesClaimCronThread';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userStakingThreadAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'clockworkProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'AddLiquidStakeParams';
          };
        },
      ];
    },
    {
      name: 'addLockedStake';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'fundingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingStakedTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'staking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceRealm';
          isMut: false;
          isSigner: false;
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ];
        },
        {
          name: 'governanceRealmConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceGoverningTokenHolding';
          isMut: true;
          isSigner: false;
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: 'governanceGoverningTokenOwnerRecord';
          isMut: true;
          isSigner: false;
          docs: ['Account owned by governance storing user informations'];
        },
        {
          name: 'stakeResolutionThread';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakesClaimCronThread';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userStakingThreadAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'clockworkProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'AddLockedStakeParams';
          };
        },
      ];
    },
    {
      name: 'removeLiquidStake';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'stakedTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingStakedTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingLmRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'staking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceRealm';
          isMut: false;
          isSigner: false;
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ];
        },
        {
          name: 'governanceRealmConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceGoverningTokenHolding';
          isMut: true;
          isSigner: false;
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: 'governanceGoverningTokenOwnerRecord';
          isMut: true;
          isSigner: false;
          docs: ['Account owned by governance storing user informations'];
        },
        {
          name: 'stakesClaimCronThread';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userStakingThreadAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'clockworkProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'RemoveLiquidStakeParams';
          };
        },
      ];
    },
    {
      name: 'removeLockedStake';
      accounts: [
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'lmTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingStakedTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingLmRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'staking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceRealm';
          isMut: false;
          isSigner: false;
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ];
        },
        {
          name: 'governanceRealmConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceGoverningTokenHolding';
          isMut: true;
          isSigner: false;
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: 'governanceGoverningTokenOwnerRecord';
          isMut: true;
          isSigner: false;
          docs: ['Account owned by governance storing user informations'];
        },
        {
          name: 'stakesClaimCronThread';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userStakingThreadAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'clockworkProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'RemoveLockedStakeParams';
          };
        },
      ];
    },
    {
      name: 'claimStakes';
      accounts: [
        {
          name: 'caller';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lmTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingLmRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'staking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'finalizeLockedStake';
      accounts: [
        {
          name: 'caller';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userStaking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'staking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'governanceRealm';
          isMut: false;
          isSigner: false;
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ];
        },
        {
          name: 'governanceRealmConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'governanceGoverningTokenHolding';
          isMut: true;
          isSigner: false;
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: 'governanceGoverningTokenOwnerRecord';
          isMut: true;
          isSigner: false;
          docs: ['Account owned by governance storing user informations'];
        },
        {
          name: 'governanceProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'FinalizeLockedStakeParams';
          };
        },
      ];
    },
    {
      name: 'resolveStakingRound';
      accounts: [
        {
          name: 'caller';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'stakingStakedTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingLmRewardTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'staking';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stakingRewardTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'perpetualsProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'getLpTokenPrice';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lpTokenMint';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'GetLpTokenPriceParams';
          };
        },
      ];
      returns: 'u64';
    },
    {
      name: 'mintLmTokensFromBucket';
      accounts: [
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'receivingAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'transferAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'cortex';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lmTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'MintLmTokensFromBucketParams';
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'setCustomOraclePricePermissionless';
      accounts: [
        {
          name: 'perpetuals';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'custody';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'oracleAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ixSysvar';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: 'SetCustomOraclePricePermissionlessParams';
          };
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'cortex';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'lmTokenBump';
            type: 'u8';
          },
          {
            name: 'governanceTokenBump';
            type: 'u8';
          },
          {
            name: 'inceptionEpoch';
            type: 'u64';
          },
          {
            name: 'governanceProgram';
            type: 'publicKey';
          },
          {
            name: 'governanceRealm';
            type: 'publicKey';
          },
          {
            name: 'vests';
            type: {
              vec: 'publicKey';
            };
          },
          {
            name: 'coreContributorBucketAllocation';
            type: 'u64';
          },
          {
            name: 'coreContributorBucketMintedAmount';
            type: 'u64';
          },
          {
            name: 'daoTreasuryBucketAllocation';
            type: 'u64';
          },
          {
            name: 'daoTreasuryBucketMintedAmount';
            type: 'u64';
          },
          {
            name: 'polBucketAllocation';
            type: 'u64';
          },
          {
            name: 'polBucketMintedAmount';
            type: 'u64';
          },
          {
            name: 'ecosystemBucketAllocation';
            type: 'u64';
          },
          {
            name: 'ecosystemBucketMintedAmount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'custody';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pool';
            type: 'publicKey';
          },
          {
            name: 'mint';
            type: 'publicKey';
          },
          {
            name: 'tokenAccount';
            type: 'publicKey';
          },
          {
            name: 'decimals';
            type: 'u8';
          },
          {
            name: 'isStable';
            type: 'bool';
          },
          {
            name: 'isVirtual';
            type: 'bool';
          },
          {
            name: 'oracle';
            type: {
              defined: 'OracleParams';
            };
          },
          {
            name: 'pricing';
            type: {
              defined: 'PricingParams';
            };
          },
          {
            name: 'permissions';
            type: {
              defined: 'Permissions';
            };
          },
          {
            name: 'fees';
            type: {
              defined: 'Fees';
            };
          },
          {
            name: 'borrowRate';
            type: {
              defined: 'BorrowRateParams';
            };
          },
          {
            name: 'assets';
            type: {
              defined: 'Assets';
            };
          },
          {
            name: 'collectedFees';
            type: {
              defined: 'FeesStats';
            };
          },
          {
            name: 'distributedRewards';
            type: {
              defined: 'RewardsStats';
            };
          },
          {
            name: 'volumeStats';
            type: {
              defined: 'VolumeStats';
            };
          },
          {
            name: 'tradeStats';
            type: {
              defined: 'TradeStats';
            };
          },
          {
            name: 'longPositions';
            type: {
              defined: 'PositionStats';
            };
          },
          {
            name: 'shortPositions';
            type: {
              defined: 'PositionStats';
            };
          },
          {
            name: 'borrowRateState';
            type: {
              defined: 'BorrowRateState';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'tokenAccountBump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'deprecatedCustody';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pool';
            type: 'publicKey';
          },
          {
            name: 'mint';
            type: 'publicKey';
          },
          {
            name: 'tokenAccount';
            type: 'publicKey';
          },
          {
            name: 'decimals';
            type: 'u8';
          },
          {
            name: 'isStable';
            type: 'bool';
          },
          {
            name: 'oracle';
            type: {
              defined: 'OracleParams';
            };
          },
          {
            name: 'pricing';
            type: {
              defined: 'PricingParams';
            };
          },
          {
            name: 'permissions';
            type: {
              defined: 'Permissions';
            };
          },
          {
            name: 'fees';
            type: {
              defined: 'Fees';
            };
          },
          {
            name: 'borrowRate';
            type: {
              defined: 'BorrowRateParams';
            };
          },
          {
            name: 'assets';
            type: {
              defined: 'Assets';
            };
          },
          {
            name: 'collectedFees';
            type: {
              defined: 'FeesStats';
            };
          },
          {
            name: 'distributedRewards';
            type: {
              defined: 'RewardsStats';
            };
          },
          {
            name: 'volumeStats';
            type: {
              defined: 'VolumeStats';
            };
          },
          {
            name: 'tradeStats';
            type: {
              defined: 'TradeStats';
            };
          },
          {
            name: 'longPositions';
            type: {
              defined: 'PositionStats';
            };
          },
          {
            name: 'shortPositions';
            type: {
              defined: 'PositionStats';
            };
          },
          {
            name: 'borrowRateState';
            type: {
              defined: 'BorrowRateState';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'tokenAccountBump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'multisig';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'numSigners';
            type: 'u8';
          },
          {
            name: 'numSigned';
            type: 'u8';
          },
          {
            name: 'minSignatures';
            type: 'u8';
          },
          {
            name: 'instructionAccountsLen';
            type: 'u8';
          },
          {
            name: 'instructionDataLen';
            type: 'u16';
          },
          {
            name: 'instructionHash';
            type: 'u64';
          },
          {
            name: 'signers';
            type: {
              array: ['publicKey', 6];
            };
          },
          {
            name: 'signed';
            type: {
              array: ['u8', 6];
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'customOracle';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'expo';
            type: 'i32';
          },
          {
            name: 'conf';
            type: 'u64';
          },
          {
            name: 'ema';
            type: 'u64';
          },
          {
            name: 'publishTime';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'perpetuals';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'permissions';
            type: {
              defined: 'Permissions';
            };
          },
          {
            name: 'pools';
            type: {
              vec: 'publicKey';
            };
          },
          {
            name: 'transferAuthorityBump';
            type: 'u8';
          },
          {
            name: 'perpetualsBump';
            type: 'u8';
          },
          {
            name: 'inceptionTime';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'pool';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'custodies';
            type: {
              vec: 'publicKey';
            };
          },
          {
            name: 'ratios';
            type: {
              vec: {
                defined: 'TokenRatios';
              };
            };
          },
          {
            name: 'aumUsd';
            type: 'u128';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'lpTokenBump';
            type: 'u8';
          },
          {
            name: 'inceptionTime';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'position';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'pool';
            type: 'publicKey';
          },
          {
            name: 'custody';
            type: 'publicKey';
          },
          {
            name: 'collateralCustody';
            type: 'publicKey';
          },
          {
            name: 'openTime';
            type: 'i64';
          },
          {
            name: 'updateTime';
            type: 'i64';
          },
          {
            name: 'side';
            type: {
              defined: 'Side';
            };
          },
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'sizeUsd';
            type: 'u64';
          },
          {
            name: 'borrowSizeUsd';
            type: 'u64';
          },
          {
            name: 'collateralUsd';
            type: 'u64';
          },
          {
            name: 'unrealizedProfitUsd';
            type: 'u64';
          },
          {
            name: 'unrealizedLossUsd';
            type: 'u64';
          },
          {
            name: 'cumulativeInterestSnapshot';
            type: 'u128';
          },
          {
            name: 'lockedAmount';
            type: 'u64';
          },
          {
            name: 'collateralAmount';
            type: 'u64';
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'staking';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'stakingType';
            type: {
              defined: 'StakingType';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'stakedTokenVaultBump';
            type: 'u8';
          },
          {
            name: 'rewardTokenVaultBump';
            type: 'u8';
          },
          {
            name: 'lmRewardTokenVaultBump';
            type: 'u8';
          },
          {
            name: 'nbLockedTokens';
            type: 'u64';
          },
          {
            name: 'stakedTokenMint';
            type: 'publicKey';
          },
          {
            name: 'stakedTokenDecimals';
            type: 'u8';
          },
          {
            name: 'rewardTokenMint';
            type: 'publicKey';
          },
          {
            name: 'rewardTokenDecimals';
            type: 'u8';
          },
          {
            name: 'resolvedRewardTokenAmount';
            type: 'u64';
          },
          {
            name: 'resolvedStakedTokenAmount';
            type: 'u64';
          },
          {
            name: 'resolvedLmRewardTokenAmount';
            type: 'u64';
          },
          {
            name: 'resolvedLmStakedTokenAmount';
            type: 'u64';
          },
          {
            name: 'currentStakingRound';
            type: {
              defined: 'StakingRound';
            };
          },
          {
            name: 'nextStakingRound';
            type: {
              defined: 'StakingRound';
            };
          },
          {
            name: 'resolvedStakingRounds';
            type: {
              vec: {
                defined: 'StakingRound';
              };
            };
          },
        ];
      };
    },
    {
      name: 'userStaking';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'threadAuthorityBump';
            type: 'u8';
          },
          {
            name: 'stakesClaimCronThreadId';
            type: 'u64';
          },
          {
            name: 'liquidStake';
            type: {
              defined: 'LiquidStake';
            };
          },
          {
            name: 'lockedStakes';
            type: {
              vec: {
                defined: 'LockedStake';
              };
            };
          },
        ];
      };
    },
    {
      name: 'vest';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'unlockStartTimestamp';
            type: 'i64';
          },
          {
            name: 'unlockEndTimestamp';
            type: 'i64';
          },
          {
            name: 'claimedAmount';
            type: 'u64';
          },
          {
            name: 'lastClaimTimestamp';
            type: 'i64';
          },
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'AddCollateralParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'collateral';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'AddCustodyParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isStable';
            type: 'bool';
          },
          {
            name: 'isVirtual';
            type: 'bool';
          },
          {
            name: 'oracle';
            type: {
              defined: 'OracleParams';
            };
          },
          {
            name: 'pricing';
            type: {
              defined: 'PricingParams';
            };
          },
          {
            name: 'permissions';
            type: {
              defined: 'Permissions';
            };
          },
          {
            name: 'fees';
            type: {
              defined: 'Fees';
            };
          },
          {
            name: 'borrowRate';
            type: {
              defined: 'BorrowRateParams';
            };
          },
          {
            name: 'ratios';
            type: {
              vec: {
                defined: 'TokenRatios';
              };
            };
          },
        ];
      };
    },
    {
      name: 'AddGenesisLiquidityParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'lpStakeResolutionThreadId';
            type: 'u64';
          },
          {
            name: 'amountIn';
            type: 'u64';
          },
          {
            name: 'minLpAmountOut';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'AddLiquidStakeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'AddLiquidityParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amountIn';
            type: 'u64';
          },
          {
            name: 'minLpAmountOut';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'AddLockedStakeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'stakeResolutionThreadId';
            type: 'u64';
          },
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'lockedDays';
            type: 'u32';
          },
        ];
      };
    },
    {
      name: 'AddPoolParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'name';
            type: 'string';
          },
        ];
      };
    },
    {
      name: 'AddVestParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'unlockStartTimestamp';
            type: 'i64';
          },
          {
            name: 'unlockEndTimestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'ClosePositionParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'FinalizeLockedStakeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'threadId';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'GetAddLiquidityAmountAndFeeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amountIn';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'GetAssetsUnderManagementParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'GetEntryPriceAndFeeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'collateral';
            type: 'u64';
          },
          {
            name: 'size';
            type: 'u64';
          },
          {
            name: 'side';
            type: {
              defined: 'Side';
            };
          },
        ];
      };
    },
    {
      name: 'GetExitPriceAndFeeParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'GetLiquidationPriceParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'addCollateral';
            type: 'u64';
          },
          {
            name: 'removeCollateral';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'GetLiquidationStateParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'GetLpTokenPriceParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'GetOraclePriceParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'ema';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'GetPnlParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'GetRemoveLiquidityAmountAndFeeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'lpAmountIn';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'GetSwapAmountAndFeesParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amountIn';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'InitStakingParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'stakingType';
            type: {
              defined: 'StakingType';
            };
          },
        ];
      };
    },
    {
      name: 'InitUserStakingParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'stakesClaimCronThreadId';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'InitParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'minSignatures';
            type: 'u8';
          },
          {
            name: 'allowSwap';
            type: 'bool';
          },
          {
            name: 'allowAddLiquidity';
            type: 'bool';
          },
          {
            name: 'allowRemoveLiquidity';
            type: 'bool';
          },
          {
            name: 'allowOpenPosition';
            type: 'bool';
          },
          {
            name: 'allowClosePosition';
            type: 'bool';
          },
          {
            name: 'allowPnlWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowCollateralWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowSizeChange';
            type: 'bool';
          },
          {
            name: 'coreContributorBucketAllocation';
            type: 'u64';
          },
          {
            name: 'daoTreasuryBucketAllocation';
            type: 'u64';
          },
          {
            name: 'polBucketAllocation';
            type: 'u64';
          },
          {
            name: 'ecosystemBucketAllocation';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'LiquidateParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'MintLmTokensFromBucketParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bucketName';
            type: {
              defined: 'BucketName';
            };
          },
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'reason';
            type: 'string';
          },
        ];
      };
    },
    {
      name: 'OpenPositionWithSwapParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'collateral';
            type: 'u64';
          },
          {
            name: 'size';
            type: 'u64';
          },
          {
            name: 'side';
            type: {
              defined: 'Side';
            };
          },
        ];
      };
    },
    {
      name: 'OpenPositionParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'collateral';
            type: 'u64';
          },
          {
            name: 'size';
            type: 'u64';
          },
          {
            name: 'side';
            type: {
              defined: 'Side';
            };
          },
        ];
      };
    },
    {
      name: 'RemoveCollateralParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'collateralUsd';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'RemoveCustodyParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'ratios';
            type: {
              vec: {
                defined: 'TokenRatios';
              };
            };
          },
        ];
      };
    },
    {
      name: 'RemoveLiquidStakeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'RemoveLiquidityParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'lpAmountIn';
            type: 'u64';
          },
          {
            name: 'minAmountOut';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'RemoveLockedStakeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'lockedStakeIndex';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'RemovePoolParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'SetAdminSignersParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'minSignatures';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'SetCustodyConfigParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isStable';
            type: 'bool';
          },
          {
            name: 'isVirtual';
            type: 'bool';
          },
          {
            name: 'oracle';
            type: {
              defined: 'OracleParams';
            };
          },
          {
            name: 'pricing';
            type: {
              defined: 'PricingParams';
            };
          },
          {
            name: 'permissions';
            type: {
              defined: 'Permissions';
            };
          },
          {
            name: 'fees';
            type: {
              defined: 'Fees';
            };
          },
          {
            name: 'borrowRate';
            type: {
              defined: 'BorrowRateParams';
            };
          },
          {
            name: 'ratios';
            type: {
              vec: {
                defined: 'TokenRatios';
              };
            };
          },
        ];
      };
    },
    {
      name: 'SetCustomOraclePricePermissionlessParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'custodyAccount';
            type: 'publicKey';
          },
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'expo';
            type: 'i32';
          },
          {
            name: 'conf';
            type: 'u64';
          },
          {
            name: 'ema';
            type: 'u64';
          },
          {
            name: 'publishTime';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'SetCustomOraclePriceParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'expo';
            type: 'i32';
          },
          {
            name: 'conf';
            type: 'u64';
          },
          {
            name: 'ema';
            type: 'u64';
          },
          {
            name: 'publishTime';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'SetPermissionsParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'allowSwap';
            type: 'bool';
          },
          {
            name: 'allowAddLiquidity';
            type: 'bool';
          },
          {
            name: 'allowRemoveLiquidity';
            type: 'bool';
          },
          {
            name: 'allowOpenPosition';
            type: 'bool';
          },
          {
            name: 'allowClosePosition';
            type: 'bool';
          },
          {
            name: 'allowPnlWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowCollateralWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowSizeChange';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'SetTestTimeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'time';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'SwapParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amountIn';
            type: 'u64';
          },
          {
            name: 'minAmountOut';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'TestAdminRemoveCollateralParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'collateralUsd';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'UpgradeCustodyParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'WithdrawFeesParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'WithdrawSolFeesParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'Fees';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'mode';
            type: {
              defined: 'FeesMode';
            };
          },
          {
            name: 'ratioMult';
            type: 'u64';
          },
          {
            name: 'utilizationMult';
            type: 'u64';
          },
          {
            name: 'swapIn';
            type: 'u64';
          },
          {
            name: 'swapOut';
            type: 'u64';
          },
          {
            name: 'stableSwapIn';
            type: 'u64';
          },
          {
            name: 'stableSwapOut';
            type: 'u64';
          },
          {
            name: 'addLiquidity';
            type: 'u64';
          },
          {
            name: 'removeLiquidity';
            type: 'u64';
          },
          {
            name: 'openPosition';
            type: 'u64';
          },
          {
            name: 'closePosition';
            type: 'u64';
          },
          {
            name: 'liquidation';
            type: 'u64';
          },
          {
            name: 'protocolShare';
            type: 'u64';
          },
          {
            name: 'feeMax';
            type: 'u64';
          },
          {
            name: 'feeOptimal';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'FeesStats';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'swapUsd';
            type: 'u64';
          },
          {
            name: 'addLiquidityUsd';
            type: 'u64';
          },
          {
            name: 'removeLiquidityUsd';
            type: 'u64';
          },
          {
            name: 'openPositionUsd';
            type: 'u64';
          },
          {
            name: 'closePositionUsd';
            type: 'u64';
          },
          {
            name: 'liquidationUsd';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'RewardsStats';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'swapLm';
            type: 'u64';
          },
          {
            name: 'addLiquidityLm';
            type: 'u64';
          },
          {
            name: 'removeLiquidityLm';
            type: 'u64';
          },
          {
            name: 'openPositionLm';
            type: 'u64';
          },
          {
            name: 'closePositionLm';
            type: 'u64';
          },
          {
            name: 'liquidationLm';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'VolumeStats';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'swapUsd';
            type: 'u64';
          },
          {
            name: 'addLiquidityUsd';
            type: 'u64';
          },
          {
            name: 'removeLiquidityUsd';
            type: 'u64';
          },
          {
            name: 'openPositionUsd';
            type: 'u64';
          },
          {
            name: 'closePositionUsd';
            type: 'u64';
          },
          {
            name: 'liquidationUsd';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'TradeStats';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'profitUsd';
            type: 'u64';
          },
          {
            name: 'lossUsd';
            type: 'u64';
          },
          {
            name: 'oiLongUsd';
            type: 'u64';
          },
          {
            name: 'oiShortUsd';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'Assets';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'collateral';
            type: 'u64';
          },
          {
            name: 'protocolFees';
            type: 'u64';
          },
          {
            name: 'owned';
            type: 'u64';
          },
          {
            name: 'locked';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'PricingParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'useEma';
            type: 'bool';
          },
          {
            name: 'useUnrealizedPnlInAum';
            type: 'bool';
          },
          {
            name: 'tradeSpreadLong';
            type: 'u64';
          },
          {
            name: 'tradeSpreadShort';
            type: 'u64';
          },
          {
            name: 'swapSpread';
            type: 'u64';
          },
          {
            name: 'minInitialLeverage';
            type: 'u64';
          },
          {
            name: 'maxInitialLeverage';
            type: 'u64';
          },
          {
            name: 'maxLeverage';
            type: 'u64';
          },
          {
            name: 'maxPayoffMult';
            type: 'u64';
          },
          {
            name: 'maxUtilization';
            type: 'u64';
          },
          {
            name: 'maxPositionLockedUsd';
            type: 'u64';
          },
          {
            name: 'maxTotalLockedUsd';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'BorrowRateParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'baseRate';
            type: 'u64';
          },
          {
            name: 'slope1';
            type: 'u64';
          },
          {
            name: 'slope2';
            type: 'u64';
          },
          {
            name: 'optimalUtilization';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'BorrowRateState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'currentRate';
            type: 'u64';
          },
          {
            name: 'cumulativeInterest';
            type: 'u128';
          },
          {
            name: 'lastUpdate';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'PositionStats';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'openPositions';
            type: 'u64';
          },
          {
            name: 'collateralUsd';
            type: 'u64';
          },
          {
            name: 'sizeUsd';
            type: 'u64';
          },
          {
            name: 'borrowSizeUsd';
            type: 'u64';
          },
          {
            name: 'lockedAmount';
            type: 'u64';
          },
          {
            name: 'weightedPrice';
            type: 'u128';
          },
          {
            name: 'totalQuantity';
            type: 'u128';
          },
          {
            name: 'cumulativeInterestUsd';
            type: 'u64';
          },
          {
            name: 'cumulativeInterestSnapshot';
            type: 'u128';
          },
        ];
      };
    },
    {
      name: 'DeprecatedPricingParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'useEma';
            type: 'bool';
          },
          {
            name: 'useUnrealizedPnlInAum';
            type: 'bool';
          },
          {
            name: 'tradeSpreadLong';
            type: 'u64';
          },
          {
            name: 'tradeSpreadShort';
            type: 'u64';
          },
          {
            name: 'swapSpread';
            type: 'u64';
          },
          {
            name: 'minInitialLeverage';
            type: 'u64';
          },
          {
            name: 'maxLeverage';
            type: 'u64';
          },
          {
            name: 'maxPayoffMult';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'OraclePrice';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'exponent';
            type: 'i32';
          },
        ];
      };
    },
    {
      name: 'OracleParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'oracleAccount';
            type: 'publicKey';
          },
          {
            name: 'oracleType';
            type: {
              defined: 'OracleType';
            };
          },
          {
            name: 'oracleAuthority';
            type: 'publicKey';
          },
          {
            name: 'maxPriceError';
            type: 'u64';
          },
          {
            name: 'maxPriceAgeSec';
            type: 'u32';
          },
        ];
      };
    },
    {
      name: 'PriceAndFee';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'fee';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'AmountAndFee';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'fee';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'NewPositionPricesAndFee';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'entryPrice';
            type: 'u64';
          },
          {
            name: 'liquidationPrice';
            type: 'u64';
          },
          {
            name: 'fee';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'SwapAmountAndFees';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amountOut';
            type: 'u64';
          },
          {
            name: 'feeIn';
            type: 'u64';
          },
          {
            name: 'feeOut';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'ProfitAndLoss';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'profit';
            type: 'u64';
          },
          {
            name: 'loss';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'Permissions';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'allowSwap';
            type: 'bool';
          },
          {
            name: 'allowAddLiquidity';
            type: 'bool';
          },
          {
            name: 'allowRemoveLiquidity';
            type: 'bool';
          },
          {
            name: 'allowOpenPosition';
            type: 'bool';
          },
          {
            name: 'allowClosePosition';
            type: 'bool';
          },
          {
            name: 'allowPnlWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowCollateralWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowSizeChange';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'TokenRatios';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'target';
            type: 'u64';
          },
          {
            name: 'min';
            type: 'u64';
          },
          {
            name: 'max';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'StakingRound';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'startTime';
            type: 'i64';
          },
          {
            name: 'rate';
            type: 'u64';
          },
          {
            name: 'totalStake';
            type: 'u64';
          },
          {
            name: 'totalClaim';
            type: 'u64';
          },
          {
            name: 'lmRate';
            type: 'u64';
          },
          {
            name: 'lmTotalStake';
            type: 'u64';
          },
          {
            name: 'lmTotalClaim';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'LiquidStake';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'stakeTime';
            type: 'i64';
          },
          {
            name: 'claimTime';
            type: 'i64';
          },
          {
            name: 'overlapTime';
            type: 'i64';
          },
          {
            name: 'overlapAmount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'LockedStake';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'stakeTime';
            type: 'i64';
          },
          {
            name: 'claimTime';
            type: 'i64';
          },
          {
            name: 'lockDuration';
            type: 'u64';
          },
          {
            name: 'rewardMultiplier';
            type: 'u32';
          },
          {
            name: 'lmRewardMultiplier';
            type: 'u32';
          },
          {
            name: 'voteMultiplier';
            type: 'u32';
          },
          {
            name: 'amountWithRewardMultiplier';
            type: 'u64';
          },
          {
            name: 'amountWithLmRewardMultiplier';
            type: 'u64';
          },
          {
            name: 'resolved';
            type: 'bool';
          },
          {
            name: 'stakeResolutionThreadId';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'BucketName';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'CoreContributor';
          },
          {
            name: 'DaoTreasury';
          },
          {
            name: 'PoL';
          },
          {
            name: 'Ecosystem';
          },
        ];
      };
    },
    {
      name: 'FeesMode';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Fixed';
          },
          {
            name: 'Linear';
          },
          {
            name: 'Optimal';
          },
        ];
      };
    },
    {
      name: 'AdminInstruction';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'AddPool';
          },
          {
            name: 'RemovePool';
          },
          {
            name: 'AddCustody';
          },
          {
            name: 'RemoveCustody';
          },
          {
            name: 'SetAdminSigners';
          },
          {
            name: 'SetCustodyConfig';
          },
          {
            name: 'SetPermissions';
          },
          {
            name: 'SetBorrowRate';
          },
          {
            name: 'WithdrawFees';
          },
          {
            name: 'WithdrawSolFees';
          },
          {
            name: 'SetCustomOraclePrice';
          },
          {
            name: 'SetTestTime';
          },
          {
            name: 'UpgradeCustody';
          },
          {
            name: 'MintLmTokensFromBucket';
          },
          {
            name: 'InitStaking';
          },
        ];
      };
    },
    {
      name: 'OracleType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'None';
          },
          {
            name: 'Custom';
          },
          {
            name: 'Pyth';
          },
        ];
      };
    },
    {
      name: 'AumCalcMode';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Min';
          },
          {
            name: 'Max';
          },
          {
            name: 'Last';
          },
          {
            name: 'EMA';
          },
        ];
      };
    },
    {
      name: 'Side';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'None';
          },
          {
            name: 'Long';
          },
          {
            name: 'Short';
          },
        ];
      };
    },
    {
      name: 'CollateralChange';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'None';
          },
          {
            name: 'Add';
          },
          {
            name: 'Remove';
          },
        ];
      };
    },
    {
      name: 'StakingType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'LM';
          },
          {
            name: 'LP';
          },
        ];
      };
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'MultisigAccountNotAuthorized';
      msg: 'Account is not authorized to sign this instruction';
    },
    {
      code: 6001;
      name: 'MultisigAlreadySigned';
      msg: 'Account has already signed this instruction';
    },
    {
      code: 6002;
      name: 'MultisigAlreadyExecuted';
      msg: 'This instruction has already been executed';
    },
    {
      code: 6003;
      name: 'MathOverflow';
      msg: 'Overflow in arithmetic operation';
    },
    {
      code: 6004;
      name: 'UnsupportedOracle';
      msg: 'Unsupported price oracle';
    },
    {
      code: 6005;
      name: 'InvalidOracleAccount';
      msg: 'Invalid oracle account';
    },
    {
      code: 6006;
      name: 'InvalidOracleState';
      msg: 'Invalid oracle state';
    },
    {
      code: 6007;
      name: 'StaleOraclePrice';
      msg: 'Stale oracle price';
    },
    {
      code: 6008;
      name: 'InvalidOraclePrice';
      msg: 'Invalid oracle price';
    },
    {
      code: 6009;
      name: 'InvalidEnvironment';
      msg: 'Instruction is not allowed in production';
    },
    {
      code: 6010;
      name: 'InvalidPoolState';
      msg: 'Invalid pool state';
    },
    {
      code: 6011;
      name: 'InvalidVestState';
      msg: 'Invalid vest state';
    },
    {
      code: 6012;
      name: 'InvalidStakeState';
      msg: 'Invalid stake state';
    },
    {
      code: 6013;
      name: 'InvalidCustodyState';
      msg: 'Invalid custody state';
    },
    {
      code: 6014;
      name: 'InvalidCollateralCustody';
      msg: 'Invalid collateral custody';
    },
    {
      code: 6015;
      name: 'InvalidPositionState';
      msg: 'Invalid position state';
    },
    {
      code: 6016;
      name: 'InvalidStakingRoundState';
      msg: 'Invalid staking round state';
    },
    {
      code: 6017;
      name: 'InvalidPerpetualsConfig';
      msg: 'Invalid perpetuals config';
    },
    {
      code: 6018;
      name: 'InvalidPoolConfig';
      msg: 'Invalid pool config';
    },
    {
      code: 6019;
      name: 'InvalidCustodyConfig';
      msg: 'Invalid custody config';
    },
    {
      code: 6020;
      name: 'InsufficientAmountReturned';
      msg: 'Insufficient token amount returned';
    },
    {
      code: 6021;
      name: 'MaxPriceSlippage';
      msg: 'Price slippage limit exceeded';
    },
    {
      code: 6022;
      name: 'MaxLeverage';
      msg: 'Position leverage limit exceeded';
    },
    {
      code: 6023;
      name: 'CustodyAmountLimit';
      msg: 'Custody amount limit exceeded';
    },
    {
      code: 6024;
      name: 'PositionAmountLimit';
      msg: 'Position amount limit exceeded';
    },
    {
      code: 6025;
      name: 'TokenRatioOutOfRange';
      msg: 'Token ratio out of range';
    },
    {
      code: 6026;
      name: 'UnsupportedToken';
      msg: 'Token is not supported';
    },
    {
      code: 6027;
      name: 'InstructionNotAllowed';
      msg: 'Instruction is not allowed at this time';
    },
    {
      code: 6028;
      name: 'MaxUtilization';
      msg: 'Token utilization limit exceeded';
    },
    {
      code: 6029;
      name: 'InvalidGovernanceProgram';
      msg: "Governance program do not match Cortex's";
    },
    {
      code: 6030;
      name: 'InvalidGovernanceRealm';
      msg: "Governance realm do not match Cortex's";
    },
    {
      code: 6031;
      name: 'InvalidVestingUnlockTime';
      msg: 'Vesting unlock time is too close or passed';
    },
    {
      code: 6032;
      name: 'InvalidStakingLockingTime';
      msg: 'Invalid staking locking time';
    },
    {
      code: 6033;
      name: 'CannotFoundStake';
      msg: 'Cannot found stake';
    },
    {
      code: 6034;
      name: 'UnresolvedStake';
      msg: 'Stake is not resolved';
    },
    {
      code: 6035;
      name: 'BucketMintLimit';
      msg: 'Reached bucket mint limit';
    },
    {
      code: 6036;
      name: 'GenesisAlpLimitReached';
      msg: 'Genesis ALP add liquidity limit reached';
    },
    {
      code: 6037;
      name: 'PermissionlessOracleMissingSignature';
      msg: 'Permissionless oracle update must be preceded by Ed25519 signature verification instruction';
    },
    {
      code: 6038;
      name: 'PermissionlessOracleMalformedEd25519Data';
      msg: 'Ed25519 signature verification data does not match expected format';
    },
    {
      code: 6039;
      name: 'PermissionlessOracleSignerMismatch';
      msg: 'Ed25519 signature was not signed by the oracle authority';
    },
    {
      code: 6040;
      name: 'PermissionlessOracleMessageMismatch';
      msg: 'Signed message does not match instruction params';
    },
  ];
};

export const IDL: Perpetuals = {
  version: '0.1.0',
  name: 'perpetuals',
  instructions: [
    {
      name: 'init',
      accounts: [
        {
          name: 'upgradeAuthority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStakingStakedTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStakingLmRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetualsProgramData',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceRealm',
          isMut: false,
          isSigner: false,
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ],
        },
        {
          name: 'governanceProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'InitParams',
          },
        },
      ],
    },
    {
      name: 'addVest',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vest',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceRealm',
          isMut: false,
          isSigner: false,
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ],
        },
        {
          name: 'governanceRealmConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceGoverningTokenHolding',
          isMut: true,
          isSigner: false,
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: 'governanceGoverningTokenOwnerRecord',
          isMut: true,
          isSigner: false,
          docs: ['Account owned by governance storing user informations'],
        },
        {
          name: 'governanceProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AddVestParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'claimVest',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'receivingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vest',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceRealm',
          isMut: false,
          isSigner: false,
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ],
        },
        {
          name: 'governanceRealmConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceGoverningTokenHolding',
          isMut: true,
          isSigner: false,
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: 'governanceGoverningTokenOwnerRecord',
          isMut: true,
          isSigner: false,
          docs: ['Account owned by governance storing user informations'],
        },
        {
          name: 'governanceProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
      returns: 'u64',
    },
    {
      name: 'addPool',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AddPoolParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'removePool',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'RemovePoolParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'addCustody',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AddCustodyParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'removeCustody',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'RemoveCustodyParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'setAdminSigners',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'SetAdminSignersParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'setCustodyConfig',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'SetCustodyConfigParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'setPermissions',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'SetPermissionsParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'withdrawFees',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'receivingTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'WithdrawFeesParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'withdrawSolFees',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'receivingAccount',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'WithdrawSolFeesParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'upgradeCustody',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'UpgradeCustodyParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'setCustomOraclePrice',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'SetCustomOraclePriceParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'setTestTime',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'SetTestTimeParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'testAdminRemoveCollateral',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'multisig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'receivingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'position',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'TestAdminRemoveCollateralParams',
          },
        },
      ],
    },
    {
      name: 'swap',
      accounts: [
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'fundingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'receivingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'receivingCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'receivingCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'receivingCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'dispensingCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'dispensingCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'dispensingCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'SwapParams',
          },
        },
      ],
    },
    {
      name: 'addLiquidity',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'fundingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AddLiquidityParams',
          },
        },
      ],
    },
    {
      name: 'addGenesisLiquidity',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'fundingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lpUserStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStakingStakedTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceRealm',
          isMut: false,
          isSigner: false,
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ],
        },
        {
          name: 'governanceRealmConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceGoverningTokenHolding',
          isMut: true,
          isSigner: false,
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: 'governanceGoverningTokenOwnerRecord',
          isMut: true,
          isSigner: false,
          docs: ['Account owned by governance storing user informations'],
        },
        {
          name: 'lpStakeResolutionThread',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakesClaimCronThread',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpUserStakingThreadAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clockworkProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AddGenesisLiquidityParams',
          },
        },
      ],
    },
    {
      name: 'removeLiquidity',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'receivingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'RemoveLiquidityParams',
          },
        },
      ],
    },
    {
      name: 'openPosition',
      accounts: [
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
          docs: ['Check: any user account'],
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'fundingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'position',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OpenPositionParams',
          },
        },
      ],
    },
    {
      name: 'openPositionWithSwap',
      accounts: [
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'fundingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'receivingCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'receivingCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'receivingCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'principalCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'principalCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'principalCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'position',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OpenPositionWithSwapParams',
          },
        },
      ],
    },
    {
      name: 'addCollateral',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'fundingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'position',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AddCollateralParams',
          },
        },
      ],
    },
    {
      name: 'removeCollateral',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'receivingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'position',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'RemoveCollateralParams',
          },
        },
      ],
    },
    {
      name: 'closePosition',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'receivingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'position',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpStakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'ClosePositionParams',
          },
        },
      ],
    },
    {
      name: 'liquidate',
      accounts: [
        {
          name: 'signer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'receivingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewardsReceivingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'position',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'LiquidateParams',
          },
        },
      ],
    },
    {
      name: 'updatePoolAum',
      accounts: [
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
      returns: 'u128',
    },
    {
      name: 'getAddLiquidityAmountAndFee',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lpTokenMint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GetAddLiquidityAmountAndFeeParams',
          },
        },
      ],
      returns: {
        defined: 'AmountAndFee',
      },
    },
    {
      name: 'getRemoveLiquidityAmountAndFee',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lpTokenMint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GetRemoveLiquidityAmountAndFeeParams',
          },
        },
      ],
      returns: {
        defined: 'AmountAndFee',
      },
    },
    {
      name: 'getEntryPriceAndFee',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GetEntryPriceAndFeeParams',
          },
        },
      ],
      returns: {
        defined: 'NewPositionPricesAndFee',
      },
    },
    {
      name: 'getExitPriceAndFee',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'position',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GetExitPriceAndFeeParams',
          },
        },
      ],
      returns: {
        defined: 'PriceAndFee',
      },
    },
    {
      name: 'getPnl',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'position',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GetPnlParams',
          },
        },
      ],
      returns: {
        defined: 'ProfitAndLoss',
      },
    },
    {
      name: 'getLiquidationPrice',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'position',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GetLiquidationPriceParams',
          },
        },
      ],
      returns: 'u64',
    },
    {
      name: 'getLiquidationState',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'position',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GetLiquidationStateParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'getOraclePrice',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GetOraclePriceParams',
          },
        },
      ],
      returns: 'u64',
    },
    {
      name: 'getSwapAmountAndFees',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'receivingCustody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'receivingCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'dispensingCustody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'dispensingCustodyOracleAccount',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GetSwapAmountAndFeesParams',
          },
        },
      ],
      returns: {
        defined: 'SwapAmountAndFees',
      },
    },
    {
      name: 'getAssetsUnderManagement',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GetAssetsUnderManagementParams',
          },
        },
      ],
      returns: 'u128',
    },
    {
      name: 'initUserStaking',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingLmRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userStakingThreadAuthority',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakesClaimCronThread',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakesClaimPayer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'staking',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clockworkProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'InitUserStakingParams',
          },
        },
      ],
    },
    {
      name: 'initStaking',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'multisig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'staking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingStakedTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingLmRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'stakingStakedTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'InitStakingParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'addLiquidStake',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'fundingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingStakedTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingLmRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'staking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceRealm',
          isMut: false,
          isSigner: false,
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ],
        },
        {
          name: 'governanceRealmConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceGoverningTokenHolding',
          isMut: true,
          isSigner: false,
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: 'governanceGoverningTokenOwnerRecord',
          isMut: true,
          isSigner: false,
          docs: ['Account owned by governance storing user informations'],
        },
        {
          name: 'stakesClaimCronThread',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStakingThreadAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clockworkProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AddLiquidStakeParams',
          },
        },
      ],
    },
    {
      name: 'addLockedStake',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'fundingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingStakedTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'staking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceRealm',
          isMut: false,
          isSigner: false,
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ],
        },
        {
          name: 'governanceRealmConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceGoverningTokenHolding',
          isMut: true,
          isSigner: false,
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: 'governanceGoverningTokenOwnerRecord',
          isMut: true,
          isSigner: false,
          docs: ['Account owned by governance storing user informations'],
        },
        {
          name: 'stakeResolutionThread',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakesClaimCronThread',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStakingThreadAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clockworkProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'AddLockedStakeParams',
          },
        },
      ],
    },
    {
      name: 'removeLiquidStake',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'stakedTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingStakedTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingLmRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'staking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceRealm',
          isMut: false,
          isSigner: false,
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ],
        },
        {
          name: 'governanceRealmConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceGoverningTokenHolding',
          isMut: true,
          isSigner: false,
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: 'governanceGoverningTokenOwnerRecord',
          isMut: true,
          isSigner: false,
          docs: ['Account owned by governance storing user informations'],
        },
        {
          name: 'stakesClaimCronThread',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStakingThreadAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clockworkProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'RemoveLiquidStakeParams',
          },
        },
      ],
    },
    {
      name: 'removeLockedStake',
      accounts: [
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'lmTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingStakedTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingLmRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'staking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceRealm',
          isMut: false,
          isSigner: false,
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ],
        },
        {
          name: 'governanceRealmConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceGoverningTokenHolding',
          isMut: true,
          isSigner: false,
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: 'governanceGoverningTokenOwnerRecord',
          isMut: true,
          isSigner: false,
          docs: ['Account owned by governance storing user informations'],
        },
        {
          name: 'stakesClaimCronThread',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStakingThreadAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clockworkProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'RemoveLockedStakeParams',
          },
        },
      ],
    },
    {
      name: 'claimStakes',
      accounts: [
        {
          name: 'caller',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lmTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingLmRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'staking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'finalizeLockedStake',
      accounts: [
        {
          name: 'caller',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userStaking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'staking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'governanceRealm',
          isMut: false,
          isSigner: false,
          docs: [
            'A realm represent one project (ADRENA, MANGO etc.) within the governance program',
          ],
        },
        {
          name: 'governanceRealmConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'governanceGoverningTokenHolding',
          isMut: true,
          isSigner: false,
          docs: [
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: 'governanceGoverningTokenOwnerRecord',
          isMut: true,
          isSigner: false,
          docs: ['Account owned by governance storing user informations'],
        },
        {
          name: 'governanceProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'FinalizeLockedStakeParams',
          },
        },
      ],
    },
    {
      name: 'resolveStakingRound',
      accounts: [
        {
          name: 'caller',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'stakingStakedTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingLmRewardTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'staking',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stakingRewardTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpetualsProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'getLpTokenPrice',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lpTokenMint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'GetLpTokenPriceParams',
          },
        },
      ],
      returns: 'u64',
    },
    {
      name: 'mintLmTokensFromBucket',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'receivingAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'transferAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'cortex',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lmTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'MintLmTokensFromBucketParams',
          },
        },
      ],
      returns: 'u8',
    },
    {
      name: 'setCustomOraclePricePermissionless',
      accounts: [
        {
          name: 'perpetuals',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'custody',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'oracleAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ixSysvar',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'SetCustomOraclePricePermissionlessParams',
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'cortex',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'lmTokenBump',
            type: 'u8',
          },
          {
            name: 'governanceTokenBump',
            type: 'u8',
          },
          {
            name: 'inceptionEpoch',
            type: 'u64',
          },
          {
            name: 'governanceProgram',
            type: 'publicKey',
          },
          {
            name: 'governanceRealm',
            type: 'publicKey',
          },
          {
            name: 'vests',
            type: {
              vec: 'publicKey',
            },
          },
          {
            name: 'coreContributorBucketAllocation',
            type: 'u64',
          },
          {
            name: 'coreContributorBucketMintedAmount',
            type: 'u64',
          },
          {
            name: 'daoTreasuryBucketAllocation',
            type: 'u64',
          },
          {
            name: 'daoTreasuryBucketMintedAmount',
            type: 'u64',
          },
          {
            name: 'polBucketAllocation',
            type: 'u64',
          },
          {
            name: 'polBucketMintedAmount',
            type: 'u64',
          },
          {
            name: 'ecosystemBucketAllocation',
            type: 'u64',
          },
          {
            name: 'ecosystemBucketMintedAmount',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'custody',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pool',
            type: 'publicKey',
          },
          {
            name: 'mint',
            type: 'publicKey',
          },
          {
            name: 'tokenAccount',
            type: 'publicKey',
          },
          {
            name: 'decimals',
            type: 'u8',
          },
          {
            name: 'isStable',
            type: 'bool',
          },
          {
            name: 'isVirtual',
            type: 'bool',
          },
          {
            name: 'oracle',
            type: {
              defined: 'OracleParams',
            },
          },
          {
            name: 'pricing',
            type: {
              defined: 'PricingParams',
            },
          },
          {
            name: 'permissions',
            type: {
              defined: 'Permissions',
            },
          },
          {
            name: 'fees',
            type: {
              defined: 'Fees',
            },
          },
          {
            name: 'borrowRate',
            type: {
              defined: 'BorrowRateParams',
            },
          },
          {
            name: 'assets',
            type: {
              defined: 'Assets',
            },
          },
          {
            name: 'collectedFees',
            type: {
              defined: 'FeesStats',
            },
          },
          {
            name: 'distributedRewards',
            type: {
              defined: 'RewardsStats',
            },
          },
          {
            name: 'volumeStats',
            type: {
              defined: 'VolumeStats',
            },
          },
          {
            name: 'tradeStats',
            type: {
              defined: 'TradeStats',
            },
          },
          {
            name: 'longPositions',
            type: {
              defined: 'PositionStats',
            },
          },
          {
            name: 'shortPositions',
            type: {
              defined: 'PositionStats',
            },
          },
          {
            name: 'borrowRateState',
            type: {
              defined: 'BorrowRateState',
            },
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'tokenAccountBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'deprecatedCustody',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pool',
            type: 'publicKey',
          },
          {
            name: 'mint',
            type: 'publicKey',
          },
          {
            name: 'tokenAccount',
            type: 'publicKey',
          },
          {
            name: 'decimals',
            type: 'u8',
          },
          {
            name: 'isStable',
            type: 'bool',
          },
          {
            name: 'oracle',
            type: {
              defined: 'OracleParams',
            },
          },
          {
            name: 'pricing',
            type: {
              defined: 'PricingParams',
            },
          },
          {
            name: 'permissions',
            type: {
              defined: 'Permissions',
            },
          },
          {
            name: 'fees',
            type: {
              defined: 'Fees',
            },
          },
          {
            name: 'borrowRate',
            type: {
              defined: 'BorrowRateParams',
            },
          },
          {
            name: 'assets',
            type: {
              defined: 'Assets',
            },
          },
          {
            name: 'collectedFees',
            type: {
              defined: 'FeesStats',
            },
          },
          {
            name: 'distributedRewards',
            type: {
              defined: 'RewardsStats',
            },
          },
          {
            name: 'volumeStats',
            type: {
              defined: 'VolumeStats',
            },
          },
          {
            name: 'tradeStats',
            type: {
              defined: 'TradeStats',
            },
          },
          {
            name: 'longPositions',
            type: {
              defined: 'PositionStats',
            },
          },
          {
            name: 'shortPositions',
            type: {
              defined: 'PositionStats',
            },
          },
          {
            name: 'borrowRateState',
            type: {
              defined: 'BorrowRateState',
            },
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'tokenAccountBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'multisig',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'numSigners',
            type: 'u8',
          },
          {
            name: 'numSigned',
            type: 'u8',
          },
          {
            name: 'minSignatures',
            type: 'u8',
          },
          {
            name: 'instructionAccountsLen',
            type: 'u8',
          },
          {
            name: 'instructionDataLen',
            type: 'u16',
          },
          {
            name: 'instructionHash',
            type: 'u64',
          },
          {
            name: 'signers',
            type: {
              array: ['publicKey', 6],
            },
          },
          {
            name: 'signed',
            type: {
              array: ['u8', 6],
            },
          },
          {
            name: 'bump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'customOracle',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'expo',
            type: 'i32',
          },
          {
            name: 'conf',
            type: 'u64',
          },
          {
            name: 'ema',
            type: 'u64',
          },
          {
            name: 'publishTime',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'perpetuals',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'permissions',
            type: {
              defined: 'Permissions',
            },
          },
          {
            name: 'pools',
            type: {
              vec: 'publicKey',
            },
          },
          {
            name: 'transferAuthorityBump',
            type: 'u8',
          },
          {
            name: 'perpetualsBump',
            type: 'u8',
          },
          {
            name: 'inceptionTime',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'pool',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'custodies',
            type: {
              vec: 'publicKey',
            },
          },
          {
            name: 'ratios',
            type: {
              vec: {
                defined: 'TokenRatios',
              },
            },
          },
          {
            name: 'aumUsd',
            type: 'u128',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'lpTokenBump',
            type: 'u8',
          },
          {
            name: 'inceptionTime',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'position',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'pool',
            type: 'publicKey',
          },
          {
            name: 'custody',
            type: 'publicKey',
          },
          {
            name: 'collateralCustody',
            type: 'publicKey',
          },
          {
            name: 'openTime',
            type: 'i64',
          },
          {
            name: 'updateTime',
            type: 'i64',
          },
          {
            name: 'side',
            type: {
              defined: 'Side',
            },
          },
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'sizeUsd',
            type: 'u64',
          },
          {
            name: 'borrowSizeUsd',
            type: 'u64',
          },
          {
            name: 'collateralUsd',
            type: 'u64',
          },
          {
            name: 'unrealizedProfitUsd',
            type: 'u64',
          },
          {
            name: 'unrealizedLossUsd',
            type: 'u64',
          },
          {
            name: 'cumulativeInterestSnapshot',
            type: 'u128',
          },
          {
            name: 'lockedAmount',
            type: 'u64',
          },
          {
            name: 'collateralAmount',
            type: 'u64',
          },
          {
            name: 'bump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'staking',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stakingType',
            type: {
              defined: 'StakingType',
            },
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'stakedTokenVaultBump',
            type: 'u8',
          },
          {
            name: 'rewardTokenVaultBump',
            type: 'u8',
          },
          {
            name: 'lmRewardTokenVaultBump',
            type: 'u8',
          },
          {
            name: 'nbLockedTokens',
            type: 'u64',
          },
          {
            name: 'stakedTokenMint',
            type: 'publicKey',
          },
          {
            name: 'stakedTokenDecimals',
            type: 'u8',
          },
          {
            name: 'rewardTokenMint',
            type: 'publicKey',
          },
          {
            name: 'rewardTokenDecimals',
            type: 'u8',
          },
          {
            name: 'resolvedRewardTokenAmount',
            type: 'u64',
          },
          {
            name: 'resolvedStakedTokenAmount',
            type: 'u64',
          },
          {
            name: 'resolvedLmRewardTokenAmount',
            type: 'u64',
          },
          {
            name: 'resolvedLmStakedTokenAmount',
            type: 'u64',
          },
          {
            name: 'currentStakingRound',
            type: {
              defined: 'StakingRound',
            },
          },
          {
            name: 'nextStakingRound',
            type: {
              defined: 'StakingRound',
            },
          },
          {
            name: 'resolvedStakingRounds',
            type: {
              vec: {
                defined: 'StakingRound',
              },
            },
          },
        ],
      },
    },
    {
      name: 'userStaking',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'threadAuthorityBump',
            type: 'u8',
          },
          {
            name: 'stakesClaimCronThreadId',
            type: 'u64',
          },
          {
            name: 'liquidStake',
            type: {
              defined: 'LiquidStake',
            },
          },
          {
            name: 'lockedStakes',
            type: {
              vec: {
                defined: 'LockedStake',
              },
            },
          },
        ],
      },
    },
    {
      name: 'vest',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'unlockStartTimestamp',
            type: 'i64',
          },
          {
            name: 'unlockEndTimestamp',
            type: 'i64',
          },
          {
            name: 'claimedAmount',
            type: 'u64',
          },
          {
            name: 'lastClaimTimestamp',
            type: 'i64',
          },
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'AddCollateralParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'collateral',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'AddCustodyParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'isStable',
            type: 'bool',
          },
          {
            name: 'isVirtual',
            type: 'bool',
          },
          {
            name: 'oracle',
            type: {
              defined: 'OracleParams',
            },
          },
          {
            name: 'pricing',
            type: {
              defined: 'PricingParams',
            },
          },
          {
            name: 'permissions',
            type: {
              defined: 'Permissions',
            },
          },
          {
            name: 'fees',
            type: {
              defined: 'Fees',
            },
          },
          {
            name: 'borrowRate',
            type: {
              defined: 'BorrowRateParams',
            },
          },
          {
            name: 'ratios',
            type: {
              vec: {
                defined: 'TokenRatios',
              },
            },
          },
        ],
      },
    },
    {
      name: 'AddGenesisLiquidityParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lpStakeResolutionThreadId',
            type: 'u64',
          },
          {
            name: 'amountIn',
            type: 'u64',
          },
          {
            name: 'minLpAmountOut',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'AddLiquidStakeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'AddLiquidityParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amountIn',
            type: 'u64',
          },
          {
            name: 'minLpAmountOut',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'AddLockedStakeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stakeResolutionThreadId',
            type: 'u64',
          },
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'lockedDays',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'AddPoolParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: 'string',
          },
        ],
      },
    },
    {
      name: 'AddVestParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'unlockStartTimestamp',
            type: 'i64',
          },
          {
            name: 'unlockEndTimestamp',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'ClosePositionParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'price',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'FinalizeLockedStakeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'threadId',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'GetAddLiquidityAmountAndFeeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amountIn',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'GetAssetsUnderManagementParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'GetEntryPriceAndFeeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'collateral',
            type: 'u64',
          },
          {
            name: 'size',
            type: 'u64',
          },
          {
            name: 'side',
            type: {
              defined: 'Side',
            },
          },
        ],
      },
    },
    {
      name: 'GetExitPriceAndFeeParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'GetLiquidationPriceParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'addCollateral',
            type: 'u64',
          },
          {
            name: 'removeCollateral',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'GetLiquidationStateParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'GetLpTokenPriceParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'GetOraclePriceParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'ema',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'GetPnlParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'GetRemoveLiquidityAmountAndFeeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lpAmountIn',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'GetSwapAmountAndFeesParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amountIn',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'InitStakingParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stakingType',
            type: {
              defined: 'StakingType',
            },
          },
        ],
      },
    },
    {
      name: 'InitUserStakingParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'stakesClaimCronThreadId',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'InitParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'minSignatures',
            type: 'u8',
          },
          {
            name: 'allowSwap',
            type: 'bool',
          },
          {
            name: 'allowAddLiquidity',
            type: 'bool',
          },
          {
            name: 'allowRemoveLiquidity',
            type: 'bool',
          },
          {
            name: 'allowOpenPosition',
            type: 'bool',
          },
          {
            name: 'allowClosePosition',
            type: 'bool',
          },
          {
            name: 'allowPnlWithdrawal',
            type: 'bool',
          },
          {
            name: 'allowCollateralWithdrawal',
            type: 'bool',
          },
          {
            name: 'allowSizeChange',
            type: 'bool',
          },
          {
            name: 'coreContributorBucketAllocation',
            type: 'u64',
          },
          {
            name: 'daoTreasuryBucketAllocation',
            type: 'u64',
          },
          {
            name: 'polBucketAllocation',
            type: 'u64',
          },
          {
            name: 'ecosystemBucketAllocation',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'LiquidateParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'MintLmTokensFromBucketParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bucketName',
            type: {
              defined: 'BucketName',
            },
          },
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'reason',
            type: 'string',
          },
        ],
      },
    },
    {
      name: 'OpenPositionWithSwapParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'collateral',
            type: 'u64',
          },
          {
            name: 'size',
            type: 'u64',
          },
          {
            name: 'side',
            type: {
              defined: 'Side',
            },
          },
        ],
      },
    },
    {
      name: 'OpenPositionParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'collateral',
            type: 'u64',
          },
          {
            name: 'size',
            type: 'u64',
          },
          {
            name: 'side',
            type: {
              defined: 'Side',
            },
          },
        ],
      },
    },
    {
      name: 'RemoveCollateralParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'collateralUsd',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'RemoveCustodyParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'ratios',
            type: {
              vec: {
                defined: 'TokenRatios',
              },
            },
          },
        ],
      },
    },
    {
      name: 'RemoveLiquidStakeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'RemoveLiquidityParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lpAmountIn',
            type: 'u64',
          },
          {
            name: 'minAmountOut',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'RemoveLockedStakeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lockedStakeIndex',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'RemovePoolParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'SetAdminSignersParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'minSignatures',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'SetCustodyConfigParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'isStable',
            type: 'bool',
          },
          {
            name: 'isVirtual',
            type: 'bool',
          },
          {
            name: 'oracle',
            type: {
              defined: 'OracleParams',
            },
          },
          {
            name: 'pricing',
            type: {
              defined: 'PricingParams',
            },
          },
          {
            name: 'permissions',
            type: {
              defined: 'Permissions',
            },
          },
          {
            name: 'fees',
            type: {
              defined: 'Fees',
            },
          },
          {
            name: 'borrowRate',
            type: {
              defined: 'BorrowRateParams',
            },
          },
          {
            name: 'ratios',
            type: {
              vec: {
                defined: 'TokenRatios',
              },
            },
          },
        ],
      },
    },
    {
      name: 'SetCustomOraclePricePermissionlessParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'custodyAccount',
            type: 'publicKey',
          },
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'expo',
            type: 'i32',
          },
          {
            name: 'conf',
            type: 'u64',
          },
          {
            name: 'ema',
            type: 'u64',
          },
          {
            name: 'publishTime',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'SetCustomOraclePriceParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'expo',
            type: 'i32',
          },
          {
            name: 'conf',
            type: 'u64',
          },
          {
            name: 'ema',
            type: 'u64',
          },
          {
            name: 'publishTime',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'SetPermissionsParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'allowSwap',
            type: 'bool',
          },
          {
            name: 'allowAddLiquidity',
            type: 'bool',
          },
          {
            name: 'allowRemoveLiquidity',
            type: 'bool',
          },
          {
            name: 'allowOpenPosition',
            type: 'bool',
          },
          {
            name: 'allowClosePosition',
            type: 'bool',
          },
          {
            name: 'allowPnlWithdrawal',
            type: 'bool',
          },
          {
            name: 'allowCollateralWithdrawal',
            type: 'bool',
          },
          {
            name: 'allowSizeChange',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'SetTestTimeParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'time',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'SwapParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amountIn',
            type: 'u64',
          },
          {
            name: 'minAmountOut',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'TestAdminRemoveCollateralParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'collateralUsd',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'UpgradeCustodyParams',
      type: {
        kind: 'struct',
        fields: [],
      },
    },
    {
      name: 'WithdrawFeesParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'WithdrawSolFeesParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'Fees',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'mode',
            type: {
              defined: 'FeesMode',
            },
          },
          {
            name: 'ratioMult',
            type: 'u64',
          },
          {
            name: 'utilizationMult',
            type: 'u64',
          },
          {
            name: 'swapIn',
            type: 'u64',
          },
          {
            name: 'swapOut',
            type: 'u64',
          },
          {
            name: 'stableSwapIn',
            type: 'u64',
          },
          {
            name: 'stableSwapOut',
            type: 'u64',
          },
          {
            name: 'addLiquidity',
            type: 'u64',
          },
          {
            name: 'removeLiquidity',
            type: 'u64',
          },
          {
            name: 'openPosition',
            type: 'u64',
          },
          {
            name: 'closePosition',
            type: 'u64',
          },
          {
            name: 'liquidation',
            type: 'u64',
          },
          {
            name: 'protocolShare',
            type: 'u64',
          },
          {
            name: 'feeMax',
            type: 'u64',
          },
          {
            name: 'feeOptimal',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'FeesStats',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'swapUsd',
            type: 'u64',
          },
          {
            name: 'addLiquidityUsd',
            type: 'u64',
          },
          {
            name: 'removeLiquidityUsd',
            type: 'u64',
          },
          {
            name: 'openPositionUsd',
            type: 'u64',
          },
          {
            name: 'closePositionUsd',
            type: 'u64',
          },
          {
            name: 'liquidationUsd',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'RewardsStats',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'swapLm',
            type: 'u64',
          },
          {
            name: 'addLiquidityLm',
            type: 'u64',
          },
          {
            name: 'removeLiquidityLm',
            type: 'u64',
          },
          {
            name: 'openPositionLm',
            type: 'u64',
          },
          {
            name: 'closePositionLm',
            type: 'u64',
          },
          {
            name: 'liquidationLm',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'VolumeStats',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'swapUsd',
            type: 'u64',
          },
          {
            name: 'addLiquidityUsd',
            type: 'u64',
          },
          {
            name: 'removeLiquidityUsd',
            type: 'u64',
          },
          {
            name: 'openPositionUsd',
            type: 'u64',
          },
          {
            name: 'closePositionUsd',
            type: 'u64',
          },
          {
            name: 'liquidationUsd',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'TradeStats',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'profitUsd',
            type: 'u64',
          },
          {
            name: 'lossUsd',
            type: 'u64',
          },
          {
            name: 'oiLongUsd',
            type: 'u64',
          },
          {
            name: 'oiShortUsd',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'Assets',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'collateral',
            type: 'u64',
          },
          {
            name: 'protocolFees',
            type: 'u64',
          },
          {
            name: 'owned',
            type: 'u64',
          },
          {
            name: 'locked',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'PricingParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'useEma',
            type: 'bool',
          },
          {
            name: 'useUnrealizedPnlInAum',
            type: 'bool',
          },
          {
            name: 'tradeSpreadLong',
            type: 'u64',
          },
          {
            name: 'tradeSpreadShort',
            type: 'u64',
          },
          {
            name: 'swapSpread',
            type: 'u64',
          },
          {
            name: 'minInitialLeverage',
            type: 'u64',
          },
          {
            name: 'maxInitialLeverage',
            type: 'u64',
          },
          {
            name: 'maxLeverage',
            type: 'u64',
          },
          {
            name: 'maxPayoffMult',
            type: 'u64',
          },
          {
            name: 'maxUtilization',
            type: 'u64',
          },
          {
            name: 'maxPositionLockedUsd',
            type: 'u64',
          },
          {
            name: 'maxTotalLockedUsd',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'BorrowRateParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'baseRate',
            type: 'u64',
          },
          {
            name: 'slope1',
            type: 'u64',
          },
          {
            name: 'slope2',
            type: 'u64',
          },
          {
            name: 'optimalUtilization',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'BorrowRateState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'currentRate',
            type: 'u64',
          },
          {
            name: 'cumulativeInterest',
            type: 'u128',
          },
          {
            name: 'lastUpdate',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'PositionStats',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'openPositions',
            type: 'u64',
          },
          {
            name: 'collateralUsd',
            type: 'u64',
          },
          {
            name: 'sizeUsd',
            type: 'u64',
          },
          {
            name: 'borrowSizeUsd',
            type: 'u64',
          },
          {
            name: 'lockedAmount',
            type: 'u64',
          },
          {
            name: 'weightedPrice',
            type: 'u128',
          },
          {
            name: 'totalQuantity',
            type: 'u128',
          },
          {
            name: 'cumulativeInterestUsd',
            type: 'u64',
          },
          {
            name: 'cumulativeInterestSnapshot',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'DeprecatedPricingParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'useEma',
            type: 'bool',
          },
          {
            name: 'useUnrealizedPnlInAum',
            type: 'bool',
          },
          {
            name: 'tradeSpreadLong',
            type: 'u64',
          },
          {
            name: 'tradeSpreadShort',
            type: 'u64',
          },
          {
            name: 'swapSpread',
            type: 'u64',
          },
          {
            name: 'minInitialLeverage',
            type: 'u64',
          },
          {
            name: 'maxLeverage',
            type: 'u64',
          },
          {
            name: 'maxPayoffMult',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'OraclePrice',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'exponent',
            type: 'i32',
          },
        ],
      },
    },
    {
      name: 'OracleParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'oracleAccount',
            type: 'publicKey',
          },
          {
            name: 'oracleType',
            type: {
              defined: 'OracleType',
            },
          },
          {
            name: 'oracleAuthority',
            type: 'publicKey',
          },
          {
            name: 'maxPriceError',
            type: 'u64',
          },
          {
            name: 'maxPriceAgeSec',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'PriceAndFee',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'fee',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'AmountAndFee',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'fee',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'NewPositionPricesAndFee',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'entryPrice',
            type: 'u64',
          },
          {
            name: 'liquidationPrice',
            type: 'u64',
          },
          {
            name: 'fee',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'SwapAmountAndFees',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amountOut',
            type: 'u64',
          },
          {
            name: 'feeIn',
            type: 'u64',
          },
          {
            name: 'feeOut',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'ProfitAndLoss',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'profit',
            type: 'u64',
          },
          {
            name: 'loss',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'Permissions',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'allowSwap',
            type: 'bool',
          },
          {
            name: 'allowAddLiquidity',
            type: 'bool',
          },
          {
            name: 'allowRemoveLiquidity',
            type: 'bool',
          },
          {
            name: 'allowOpenPosition',
            type: 'bool',
          },
          {
            name: 'allowClosePosition',
            type: 'bool',
          },
          {
            name: 'allowPnlWithdrawal',
            type: 'bool',
          },
          {
            name: 'allowCollateralWithdrawal',
            type: 'bool',
          },
          {
            name: 'allowSizeChange',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'TokenRatios',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'target',
            type: 'u64',
          },
          {
            name: 'min',
            type: 'u64',
          },
          {
            name: 'max',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'StakingRound',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'startTime',
            type: 'i64',
          },
          {
            name: 'rate',
            type: 'u64',
          },
          {
            name: 'totalStake',
            type: 'u64',
          },
          {
            name: 'totalClaim',
            type: 'u64',
          },
          {
            name: 'lmRate',
            type: 'u64',
          },
          {
            name: 'lmTotalStake',
            type: 'u64',
          },
          {
            name: 'lmTotalClaim',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'LiquidStake',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'stakeTime',
            type: 'i64',
          },
          {
            name: 'claimTime',
            type: 'i64',
          },
          {
            name: 'overlapTime',
            type: 'i64',
          },
          {
            name: 'overlapAmount',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'LockedStake',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'stakeTime',
            type: 'i64',
          },
          {
            name: 'claimTime',
            type: 'i64',
          },
          {
            name: 'lockDuration',
            type: 'u64',
          },
          {
            name: 'rewardMultiplier',
            type: 'u32',
          },
          {
            name: 'lmRewardMultiplier',
            type: 'u32',
          },
          {
            name: 'voteMultiplier',
            type: 'u32',
          },
          {
            name: 'amountWithRewardMultiplier',
            type: 'u64',
          },
          {
            name: 'amountWithLmRewardMultiplier',
            type: 'u64',
          },
          {
            name: 'resolved',
            type: 'bool',
          },
          {
            name: 'stakeResolutionThreadId',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'BucketName',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'CoreContributor',
          },
          {
            name: 'DaoTreasury',
          },
          {
            name: 'PoL',
          },
          {
            name: 'Ecosystem',
          },
        ],
      },
    },
    {
      name: 'FeesMode',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Fixed',
          },
          {
            name: 'Linear',
          },
          {
            name: 'Optimal',
          },
        ],
      },
    },
    {
      name: 'AdminInstruction',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'AddPool',
          },
          {
            name: 'RemovePool',
          },
          {
            name: 'AddCustody',
          },
          {
            name: 'RemoveCustody',
          },
          {
            name: 'SetAdminSigners',
          },
          {
            name: 'SetCustodyConfig',
          },
          {
            name: 'SetPermissions',
          },
          {
            name: 'SetBorrowRate',
          },
          {
            name: 'WithdrawFees',
          },
          {
            name: 'WithdrawSolFees',
          },
          {
            name: 'SetCustomOraclePrice',
          },
          {
            name: 'SetTestTime',
          },
          {
            name: 'UpgradeCustody',
          },
          {
            name: 'MintLmTokensFromBucket',
          },
          {
            name: 'InitStaking',
          },
        ],
      },
    },
    {
      name: 'OracleType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'None',
          },
          {
            name: 'Custom',
          },
          {
            name: 'Pyth',
          },
        ],
      },
    },
    {
      name: 'AumCalcMode',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Min',
          },
          {
            name: 'Max',
          },
          {
            name: 'Last',
          },
          {
            name: 'EMA',
          },
        ],
      },
    },
    {
      name: 'Side',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'None',
          },
          {
            name: 'Long',
          },
          {
            name: 'Short',
          },
        ],
      },
    },
    {
      name: 'CollateralChange',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'None',
          },
          {
            name: 'Add',
          },
          {
            name: 'Remove',
          },
        ],
      },
    },
    {
      name: 'StakingType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'LM',
          },
          {
            name: 'LP',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'MultisigAccountNotAuthorized',
      msg: 'Account is not authorized to sign this instruction',
    },
    {
      code: 6001,
      name: 'MultisigAlreadySigned',
      msg: 'Account has already signed this instruction',
    },
    {
      code: 6002,
      name: 'MultisigAlreadyExecuted',
      msg: 'This instruction has already been executed',
    },
    {
      code: 6003,
      name: 'MathOverflow',
      msg: 'Overflow in arithmetic operation',
    },
    {
      code: 6004,
      name: 'UnsupportedOracle',
      msg: 'Unsupported price oracle',
    },
    {
      code: 6005,
      name: 'InvalidOracleAccount',
      msg: 'Invalid oracle account',
    },
    {
      code: 6006,
      name: 'InvalidOracleState',
      msg: 'Invalid oracle state',
    },
    {
      code: 6007,
      name: 'StaleOraclePrice',
      msg: 'Stale oracle price',
    },
    {
      code: 6008,
      name: 'InvalidOraclePrice',
      msg: 'Invalid oracle price',
    },
    {
      code: 6009,
      name: 'InvalidEnvironment',
      msg: 'Instruction is not allowed in production',
    },
    {
      code: 6010,
      name: 'InvalidPoolState',
      msg: 'Invalid pool state',
    },
    {
      code: 6011,
      name: 'InvalidVestState',
      msg: 'Invalid vest state',
    },
    {
      code: 6012,
      name: 'InvalidStakeState',
      msg: 'Invalid stake state',
    },
    {
      code: 6013,
      name: 'InvalidCustodyState',
      msg: 'Invalid custody state',
    },
    {
      code: 6014,
      name: 'InvalidCollateralCustody',
      msg: 'Invalid collateral custody',
    },
    {
      code: 6015,
      name: 'InvalidPositionState',
      msg: 'Invalid position state',
    },
    {
      code: 6016,
      name: 'InvalidStakingRoundState',
      msg: 'Invalid staking round state',
    },
    {
      code: 6017,
      name: 'InvalidPerpetualsConfig',
      msg: 'Invalid perpetuals config',
    },
    {
      code: 6018,
      name: 'InvalidPoolConfig',
      msg: 'Invalid pool config',
    },
    {
      code: 6019,
      name: 'InvalidCustodyConfig',
      msg: 'Invalid custody config',
    },
    {
      code: 6020,
      name: 'InsufficientAmountReturned',
      msg: 'Insufficient token amount returned',
    },
    {
      code: 6021,
      name: 'MaxPriceSlippage',
      msg: 'Price slippage limit exceeded',
    },
    {
      code: 6022,
      name: 'MaxLeverage',
      msg: 'Position leverage limit exceeded',
    },
    {
      code: 6023,
      name: 'CustodyAmountLimit',
      msg: 'Custody amount limit exceeded',
    },
    {
      code: 6024,
      name: 'PositionAmountLimit',
      msg: 'Position amount limit exceeded',
    },
    {
      code: 6025,
      name: 'TokenRatioOutOfRange',
      msg: 'Token ratio out of range',
    },
    {
      code: 6026,
      name: 'UnsupportedToken',
      msg: 'Token is not supported',
    },
    {
      code: 6027,
      name: 'InstructionNotAllowed',
      msg: 'Instruction is not allowed at this time',
    },
    {
      code: 6028,
      name: 'MaxUtilization',
      msg: 'Token utilization limit exceeded',
    },
    {
      code: 6029,
      name: 'InvalidGovernanceProgram',
      msg: "Governance program do not match Cortex's",
    },
    {
      code: 6030,
      name: 'InvalidGovernanceRealm',
      msg: "Governance realm do not match Cortex's",
    },
    {
      code: 6031,
      name: 'InvalidVestingUnlockTime',
      msg: 'Vesting unlock time is too close or passed',
    },
    {
      code: 6032,
      name: 'InvalidStakingLockingTime',
      msg: 'Invalid staking locking time',
    },
    {
      code: 6033,
      name: 'CannotFoundStake',
      msg: 'Cannot found stake',
    },
    {
      code: 6034,
      name: 'UnresolvedStake',
      msg: 'Stake is not resolved',
    },
    {
      code: 6035,
      name: 'BucketMintLimit',
      msg: 'Reached bucket mint limit',
    },
    {
      code: 6036,
      name: 'GenesisAlpLimitReached',
      msg: 'Genesis ALP add liquidity limit reached',
    },
    {
      code: 6037,
      name: 'PermissionlessOracleMissingSignature',
      msg: 'Permissionless oracle update must be preceded by Ed25519 signature verification instruction',
    },
    {
      code: 6038,
      name: 'PermissionlessOracleMalformedEd25519Data',
      msg: 'Ed25519 signature verification data does not match expected format',
    },
    {
      code: 6039,
      name: 'PermissionlessOracleSignerMismatch',
      msg: 'Ed25519 signature was not signed by the oracle authority',
    },
    {
      code: 6040,
      name: 'PermissionlessOracleMessageMismatch',
      msg: 'Signed message does not match instruction params',
    },
  ],
};
