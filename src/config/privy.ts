import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

const privyAppId = process.env.PRIVY_APP_ID || 'no-privy-app-id';

if (privyAppId === 'no-privy-app-id') {
  console.error('PRIVY_APP_ID is not set');
}

export const privyConfig = {
  appId: privyAppId,
  appearance: {
    theme: 'dark' as const,
    accentColor: '#ab9ff2' as const,
    logo: '/images/logo.svg',
    showWalletLoginFirst: false,
    walletChainType: 'solana-only' as const,
  },
  loginMethods: ['email', 'google', 'twitter', 'discord', 'wallet'],
  embeddedWallets: {
    requireUserPasswordOnCreate: false,
    createOnLogin: 'all-users' as const,
    solana: {
      createOnLogin: 'all-users' as const,
    },
    ethereum: {
      createOnLogin: 'off' as const,
    },
    // Enable native Privy funding features
    fundingConfig: {
      methods: ['moonpay', 'external'] as const,
      options: {
        defaultRecommendedCurrency: 'SOL_SOLANA' as const,
        promptFundingOnWalletCreation: true,
      },
    },
    // Configure MoonPay integration
    fundingMethodConfig: {
      moonpay: {
        useSandbox: process.env.NEXT_PUBLIC_DEV_CLUSTER === 'devnet',
        paymentMethod: 'credit_debit_card' as const,
        uiConfig: {
          theme: 'dark' as const,
          accentColor: '#ab9ff2' as const,
        },
      },
    },
  },
  externalWallets: {
    solana: {
      connectors: toSolanaWalletConnectors(),
    },
  },
  walletConnectCloudProjectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    '549f49d83c4bc0a5c405d8ef6db7972a',
};
