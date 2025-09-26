import '@/styles/globals.scss';

import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { Connection } from '@solana/web3.js';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { Provider } from 'react-redux';

import {
  checkAndSignInAnonymously,
  setVerifiedWalletAddresses,
} from '@/actions/supabaseAuthActions';
import { fetchWalletTokenBalances } from '@/actions/thunks';
import { AdrenaClient } from '@/AdrenaClient';
import RootLayout from '@/components/layouts/RootLayout/RootLayout';
import MigrateUserProfileV1Tov2Modal from '@/components/pages/profile/MigrateUserProfileV1Tov2Modal';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal/TermsAndConditionsModal';
import initConfig from '@/config/init';
import { PrivySidebarProvider } from '@/contexts/PrivySidebarContext';
import useCustodies from '@/hooks/useCustodies';
import useMainPool from '@/hooks/useMainPool';
import useRpc from '@/hooks/useRPC';
import useSettingsPersistence from '@/hooks/useSettingsPersistence';
import useUserProfile from '@/hooks/useUserProfile';
import useWallet from '@/hooks/useWallet';
import useWalletAdapters, { WalletAdapterName } from '@/hooks/useWalletAdapters';
import useWatchBorrowRates from '@/hooks/useWatchBorrowRates';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import initializeApp, { createReadOnlyAdrenaProgram } from '@/initializeApp';
import { IDL as ADRENA_IDL } from '@/target/adrena';
import { VestExtended } from '@/types';
import { clearCorruptedWalletData } from '@/utils/clearCorruptedWalletData';

import logo from '../../public/images/logo.svg';
import store, { useDispatch, useSelector } from '../store/store';

function Loader(): JSX.Element {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Image
        src={logo}
        className="max-w-[40%] animate-pulse"
        alt="logo"
        width={350}
        height={50}
      />
    </div>
  );
}

// Make explicit that the config is constant.
// initialized once, doesn't move afterwards.
// actually twice, once on the server to `null` & once on the client.
const CONFIG = initConfig();

const privyAppId = process.env.PRIVY_APP_ID || 'no-privy-app-id';

if (privyAppId === 'no-privy-app-id') {
  console.error('PRIVY_APP_ID is not set');
}

// Load cluster from URL then load the config and initialize the app.
// When everything is ready load the main component
export default function App(props: AppProps) {
  const [initStatus, setInitStatus] = useState<
    'not-started' | 'starting' | 'done'
  >('not-started');
  // FIXME: RPC selection shouldn't be hook / effect-based.
  // A default RPC should be picked by the server during ssr.
  const {
    activeRpc,
    rpcInfos,
    customRpcLatency,
    autoRpcMode,
    customRpcUrl,
    favoriteRpc,
    setAutoRpcMode,
    setCustomRpcUrl,
    setFavoriteRpc,
  } = useRpc(CONFIG);

  // Initialize the app as soon as possible:
  // - when the client-side app boots..
  //   - and the RPC has been picked by usePRC hook.
  // No need to use an Effect as long as we guard with the correct conditions.
  if (CONFIG !== null && initStatus === 'not-started' && activeRpc !== null) {
    setInitStatus('starting');
    initializeApp(CONFIG, activeRpc.connection).then(() => {
      setInitStatus('done');
    });
  }

  // Create dynamic Privy configuration that updates when RPC changes (needed for custom RPCs)
  const privyConfigDynamic = useMemo(() => ({
    appId: privyAppId,
    supportedChains: ['solana'],
    config: {
      // Use new Solana RPC configuration format for Privy 3.0
      solana: {
        rpcs: {
          'solana:mainnet': {
            rpc: createSolanaRpc(activeRpc?.connection?.rpcEndpoint || `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY}`),
            rpcSubscriptions: createSolanaRpcSubscriptions(
              (activeRpc?.connection?.rpcEndpoint || `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY}`)
                .replace('https', 'wss')
            )
          },
          'solana:devnet': {
            rpc: createSolanaRpc('https://api.devnet.solana.com'),
            rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com')
          },
        }
      },
      appearance: {
        theme: 'dark' as const,
        accentColor: '#ab9ff2' as const,
        logo: '/images/logo.svg',
        showWalletLoginFirst: false,
        walletList: ['detected_wallets'],
        walletChainType: 'solana-only' as const,
      },
      loginMethods: ['email', 'google', 'twitter', 'discord', 'wallet'],
      embeddedWallets: {
        solana: {
          createOnLogin: 'all-users' as const,
        },
        ethereum: {
          createOnLogin: 'off' as const,
        },
        fundingConfig: {
          methods: ['moonpay', 'external'] as const,
          options: {
            defaultRecommendedCurrency: 'SOL_SOLANA' as const,
            promptFundingOnWalletCreation: true,
          },
        },
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
      // walletConnectCloudProjectId: '549f49d83c4bc0a5c405d8ef6db772a', // TODO: crash in localhost

    }
  }), [activeRpc?.connection?.rpcEndpoint]);

  // The Loaded is rendered while the app init, but also rendered in SSR.
  if (initStatus !== 'done' || !activeRpc) return <Loader />;

  return (
    <PrivyProvider
      appId={privyConfigDynamic.appId as string}
      // @ts-expect-error Privy types are not updated yet
      config={privyConfigDynamic.config}
    >
      <Provider store={store}>
        <CookiesProvider>
          <PrivySidebarProvider>
            <AppComponent
              activeRpc={activeRpc}
              rpcInfos={rpcInfos}
              autoRpcMode={autoRpcMode}
              customRpcUrl={customRpcUrl}
              customRpcLatency={customRpcLatency}
              favoriteRpc={favoriteRpc}
              setAutoRpcMode={setAutoRpcMode}
              setCustomRpcUrl={setCustomRpcUrl}
              setFavoriteRpc={setFavoriteRpc}
              {...props}
            />
            <Analytics />
            <SpeedInsights />
          </PrivySidebarProvider>
        </CookiesProvider>
      </Provider>
    </PrivyProvider >
  );
}

// - Display the main component
// - Display Terms and condition modal if user haven't accepted them already
// - Initialize program when user connects
//
// Tricks: wrap RootLayout + component here to be able to use hooks
// without getting error being out of Provider
function AppComponent({
  Component,
  pageProps,
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcUrl,
  customRpcLatency,
  favoriteRpc,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
}: AppProps & {
  activeRpc: {
    name: string;
    connection: Connection;
  };
  rpcInfos: {
    name: string;
    latency: number | null;
  }[];
  customRpcLatency: number | null;
  autoRpcMode: boolean;
  customRpcUrl: string | null;
  favoriteRpc: string | null;
  setAutoRpcMode: (autoRpcMode: boolean) => void;
  setCustomRpcUrl: (customRpcUrl: string | null) => void;
  setFavoriteRpc: (favoriteRpc: string) => void;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const mainPool = useMainPool();
  const custodies = useCustodies(mainPool);
  const adapters = useWalletAdapters();
  const wallet = useWallet(adapters);
  const walletState = useSelector((s) => s.walletState.wallet);
  const walletAddress = walletState?.walletAddress;
  const { userProfile, isUserProfileLoading, triggerUserProfileReload } = useUserProfile(
    walletAddress ?? null,
  );

  // Add Privy integration to check for authenticated state
  const { ready: privyReady, authenticated: privyAuthenticated, user } = usePrivy();

  // Track logout to prevent immediate auto-reconnect
  const [lastLogoutTime, setLastLogoutTime] = useState<number>(0);
  const [hasAutoConnected, setHasAutoConnected] = useState<boolean>(false);

  // Track when user logs out to prevent immediate auto-reconnect
  useEffect(() => {
    // Detect logout: either Privy auth lost OR wallet state exists but should be cleared
    const privyLogoutDetected = privyReady && !privyAuthenticated && hasAutoConnected;
    const manualDisconnectDetected = localStorage.getItem('lastConnectionSource') === 'manual-disconnect' && walletState?.isPrivy;

    if (privyLogoutDetected || manualDisconnectDetected) {
      // User just logged out - immediately clear UI to prevent flicker
      console.log('🔌 Logout detected, immediately clearing state', { privyLogoutDetected, manualDisconnectDetected });
      setLastLogoutTime(Date.now());
      setHasAutoConnected(false);

      // Immediately clear UI state to prevent showing old wallet info
      setConnected(false);

      // Clear Redux wallet state - this will trigger other cleanup effects
      console.log('🔌 Dispatching disconnect action');
      dispatch({
        type: 'disconnect',
      });

      // Clear any Privy-related localStorage to prevent auto-reconnect
      localStorage.removeItem('privy:selectedWallet');
      localStorage.setItem('lastConnectionSource', 'manual-disconnect');
    }
  }, [privyReady, privyAuthenticated, hasAutoConnected, walletState?.isPrivy, dispatch]);


  // Auto-connect Privy adapter when authenticated
  useEffect(() => {
    // Clear any corrupted wallet data on first load
    clearCorruptedWalletData();

    if (!privyReady || !privyAuthenticated || walletState?.adapterName) {
      return; // Don't auto-connect if already connected
    }

    // Prevent auto-connect for 5 seconds after logout
    const timeSinceLogout = Date.now() - lastLogoutTime;
    if (timeSinceLogout < 5000) {
      console.log('🔌 Skipping auto-connect due to recent logout cooldown');
      return;
    }

    // Check if this is a manual disconnect
    const lastConnectionSource = localStorage.getItem('lastConnectionSource');
    if (lastConnectionSource === 'manual-disconnect') {
      console.log('🔌 Skipping auto-connect due to manual disconnect');
      return;
    }

    // Additional check: don't auto-connect if we just cleared wallet state
    if (!walletState && timeSinceLogout < 10000) {
      console.log('🔌 Skipping auto-connect - wallet state was just cleared');
      return;
    }

    console.log('Auto-connecting Privy');

    // Find the Privy adapter
    const privyAdapter = adapters.find(adapter => adapter.name === 'Privy');
    if (!privyAdapter) return;

    console.log('Privy adapter found:', privyAdapter);
    console.log('Wallet state:', walletState);

    // Get wallet address from localStorage (for selected wallet) or Privy user data (embedded wallet)
    let walletAddress = null;

    // First try to get from localStorage (for selected wallet)
    if (typeof window !== 'undefined') {
      const savedWallet = localStorage.getItem('privy:selectedWallet');
      console.log('Raw localStorage value:', savedWallet, typeof savedWallet);
      walletAddress = savedWallet;
    }

    console.log('user', user)

    // If no localStorage preference, try Privy user data (embedded wallet)
    if (!walletAddress && user && user?.linkedAccounts?.length > 0) {
      const embeddedWallet = user.linkedAccounts.find(account =>
        account.type === 'wallet' &&
        account.chainType === 'solana' &&
        account.connectorType === "embedded"
      );
      if (embeddedWallet && embeddedWallet.type === 'wallet') {
        walletAddress = embeddedWallet.address;
        console.log('Using Privy embedded wallet:', walletAddress);
      }
    }

    console.log('Final wallet address:', walletAddress, typeof walletAddress);

    // Validate wallet address more strictly
    if (walletAddress &&
      typeof walletAddress === 'string' &&
      walletAddress.length > 0 &&
      walletAddress !== 'null' &&
      walletAddress !== 'undefined' &&
      !walletAddress.includes('{') &&
      !walletAddress.includes('}')) {

      console.log('Auto-connecting Privy adapter with address:', walletAddress);

      // Mark this as a Privy connection to prevent native auto-connect
      localStorage.setItem('lastConnectionSource', 'privy');
      setHasAutoConnected(true);

      dispatch({
        type: 'connect',
        payload: {
          adapterName: privyAdapter.name as WalletAdapterName,
          walletAddress: walletAddress,
          isPrivy: true,
        },
      });
    } else if (walletAddress) {
      console.error('Invalid wallet address type or value:', walletAddress, typeof walletAddress);
      // Clear invalid localStorage value
      localStorage.removeItem('privy:selectedWallet');
    }
  }, [privyReady, privyAuthenticated, user, walletState, adapters, dispatch, lastLogoutTime]);

  useSettingsPersistence();
  useWatchTokenPrices();
  useWatchBorrowRates();

  // Fetch token balances for the connected wallet:
  // on initial mount of the app & on account change.
  useEffect(() => {
    dispatch(fetchWalletTokenBalances());
  }, [walletAddress, dispatch]);

  const [cookies, setCookie] = useCookies(['terms-and-conditions-acceptance']);

  const [userVest, setUserVest] = useState<VestExtended | null | false>(null);
  const [userDelegatedVest, setUserDelegatedVest] = useState<
    VestExtended | null | false
  >(null);

  const getUserVesting = useCallback(async () => {
    try {
      if (!wallet?.publicKey) return;

      const [delegatedVest, vest] = await Promise.all([
        window.adrena.client.loadUserDelegatedVest(wallet.publicKey),
        window.adrena.client.loadUserVest(wallet.publicKey),
      ]);

      setUserVest(vest);
      setUserDelegatedVest(delegatedVest);
    } catch (error) {
      console.log('failed to load vesting', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!wallet]);

  const [isTermsAndConditionModalOpen, setIsTermsAndConditionModalOpen] =
    useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    getUserVesting();
  }, [getUserVesting]);

  useEffect(() => {
    const acceptanceDate = cookies['terms-and-conditions-acceptance'];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (!acceptanceDate || new Date(acceptanceDate) < thirtyDaysAgo) {
      setIsTermsAndConditionModalOpen(true);
    }
  }, [cookies]);

  useEffect(() => {

    console.log('Checcking wallet to see if connected');
    console.log('wallet', wallet);
    console.log('walletAddress', walletAddress);
    // Use wallet address from Redux state for more reliable connection detection
    const isWalletConnected = !!(wallet && walletAddress);

    console.log('isWalletConnected', isWalletConnected);

    if (!isWalletConnected) {
      setConnected(false);
      console.log('No wallet connected, setting Adrena program to null');

      window.adrena.client.setAdrenaProgram(null);
      return;
    }

    dispatch(setVerifiedWalletAddresses());

    setConnected(true);
    console.log('Setting connected to true', true);
    window.adrena.client.setAdrenaProgram(
      new Program(
        ADRENA_IDL,
        AdrenaClient.programId,
        new AnchorProvider(window.adrena.mainConnection, wallet, {
          commitment: 'processed',
          skipPreflight: true,
        }),
      ),
    );
  }, [wallet, walletAddress, dispatch]);

  useEffect(() => {
    dispatch(checkAndSignInAnonymously());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.adrena.mainConnection = activeRpc.connection;

    window.adrena.client.setReadonlyAdrenaProgram(
      createReadOnlyAdrenaProgram(activeRpc.connection),
    );

    if (wallet) {
      window.adrena.client.setAdrenaProgram(
        new Program(
          ADRENA_IDL,
          AdrenaClient.programId,
          new AnchorProvider(window.adrena.mainConnection, wallet, {
            commitment: 'processed',
            skipPreflight: true,
          }),
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRpc.name, wallet]);

  const [
    isUserProfileMigrationV1Tov2Open,
    setIsUserProfileMigrationV1ToV2Open,
  ] = useState<boolean>(false);

  useEffect(() => {
    if (
      userProfile &&
      userProfile.version < 2 &&
      !isTermsAndConditionModalOpen
    ) {
      setIsUserProfileMigrationV1ToV2Open(true);
    } else {
      setIsUserProfileMigrationV1ToV2Open(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTermsAndConditionModalOpen, !!userProfile]);

  return (
    <>
      <Head>
        <meta name="viewport" content="viewport-fit=cover" />
      </Head>

      <RootLayout
        userVest={userVest}
        userDelegatedVest={userDelegatedVest}
        userProfile={userProfile}
        activeRpc={activeRpc}
        rpcInfos={rpcInfos}
        autoRpcMode={autoRpcMode}
        customRpcUrl={customRpcUrl}
        customRpcLatency={customRpcLatency}
        favoriteRpc={favoriteRpc}
        setAutoRpcMode={setAutoRpcMode}
        setCustomRpcUrl={setCustomRpcUrl}
        setFavoriteRpc={setFavoriteRpc}
        adapters={adapters}
        mainPool={mainPool}
      >
        {
          <TermsAndConditionsModal
            isOpen={isTermsAndConditionModalOpen}
            agreeTrigger={() => {
              setIsTermsAndConditionModalOpen(false);
              setCookie(
                'terms-and-conditions-acceptance',
                new Date().toISOString(),
                {
                  path: '/',
                  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
                  sameSite: 'strict',
                },
              );
            }}
            declineTrigger={() => {
              router.push('https://landing.adrena.xyz/');
            }}
            readonly={false}
          />
        }

        {
          // Handle user profile creation
          isUserProfileMigrationV1Tov2Open && userProfile ? (
            <MigrateUserProfileV1Tov2Modal
              userProfile={userProfile}
              triggerUserProfileReload={triggerUserProfileReload}
              walletPubkey={wallet?.publicKey}
              close={() => {
                setIsUserProfileMigrationV1ToV2Open(false);
              }}
            />
          ) : null
        }

        <Component
          {...pageProps}
          isUserProfileLoading={isUserProfileLoading}
          userProfile={userProfile}
          triggerUserProfileReload={triggerUserProfileReload}
          userVest={userVest}
          userDelegatedVest={userDelegatedVest}
          triggerUserVestReload={getUserVesting}
          mainPool={mainPool}
          custodies={custodies}
          wallet={wallet}
          connected={connected}
          activeRpc={activeRpc}
          rpcInfos={rpcInfos}
          autoRpcMode={autoRpcMode}
          customRpcUrl={customRpcUrl}
          customRpcLatency={customRpcLatency}
          favoriteRpc={favoriteRpc}
          setAutoRpcMode={setAutoRpcMode}
          setCustomRpcUrl={setCustomRpcUrl}
          setFavoriteRpc={setFavoriteRpc}
          adapters={adapters}
        />
      </RootLayout>
    </>
  );
}
