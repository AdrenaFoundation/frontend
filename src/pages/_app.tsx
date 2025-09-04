import '@/styles/globals.scss';

import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
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
import { privyConfig } from '@/config/privy';
import { PrivySidebarProvider } from '@/contexts/PrivySidebarContext';
import useCustodies from '@/hooks/useCustodies';
import useMainPool from '@/hooks/useMainPool';
import useRpc from '@/hooks/useRPC';
import useSettingsPersistence from '@/hooks/useSettingsPersistence';
import useUserProfile from '@/hooks/useUserProfile';
import useWallet from '@/hooks/useWallet';
import useWalletAdapters from '@/hooks/useWalletAdapters';
import useWatchBorrowRates from '@/hooks/useWatchBorrowRates';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import initializeApp, { createReadOnlyAdrenaProgram } from '@/initializeApp';
import { IDL as ADRENA_IDL } from '@/target/adrena';
import { VestExtended } from '@/types';

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
    appId: privyConfig.appId,
    config: {
      solanaClusters: [
        {
          name: 'mainnet-beta',
          rpcUrl: activeRpc?.connection?.rpcEndpoint || `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY}`,
          blockExplorerUrl: 'https://solscan.io',
        }
      ] as SolanaCluster[],
      appearance: privyConfig.appearance,
      loginMethods: privyConfig.loginMethods as unknown as ('email' | 'google' | 'twitter' | 'discord' | 'wallet')[],
      embeddedWallets: privyConfig.embeddedWallets,
      externalWallets: privyConfig.externalWallets,
      walletConnectCloudProjectId: privyConfig.walletConnectCloudProjectId,
    }
  }), [activeRpc?.connection?.rpcEndpoint]);

  // The Loaded is rendered while the app init, but also rendered in SSR.
  if (initStatus !== 'done' || !activeRpc) return <Loader />;

  return (
    <PrivyProvider
      appId={privyConfigDynamic.appId}
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

  // Auto-connect Privy adapter when authenticated
  useEffect(() => {
    if (!privyReady || !privyAuthenticated) return;

    // Check if Privy adapter is already connected
    if (walletState?.adapterName === 'Privy') return;

    // Find the Privy adapter
    const privyAdapter = adapters.find(adapter => adapter.name === 'Privy');
    if (!privyAdapter) return;

    // Get wallet address from Privy user data or localStorage
    let walletAddress = null;

    // First try to get from localStorage (for selected wallet)
    if (typeof window !== 'undefined') {
      walletAddress = localStorage.getItem('privy:selectedWallet');
    }
    // else get from Privy user data (embedded wallet)
    else if (user?.wallet?.address) {
      walletAddress = user.wallet.address;
    }

    if (walletAddress) {
      console.log('Auto-connecting Privy adapter with address:', walletAddress);
      dispatch({
        type: 'connect',
        payload: {
          adapterName: 'Privy',
          walletAddress: walletAddress,
        },
      });
    }
  }, [privyReady, privyAuthenticated, user, walletState?.adapterName, adapters, dispatch]);

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
    if (!wallet) {
      setConnected(false);
      console.log('No wallet connected, setting Adrena program to null');
      window.adrena.client.setAdrenaProgram(null);
      return;
    }

    dispatch(setVerifiedWalletAddresses());

    setConnected(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

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
  }, [activeRpc.name]);

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
