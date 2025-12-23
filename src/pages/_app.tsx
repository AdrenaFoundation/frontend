import '@/styles/globals.scss';
import '../i18n/i18next';

import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { PrivyProvider, usePrivy, WalletListEntry } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { Connection } from '@solana/web3.js';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
import { PrivyLedgerWrapper } from '@/components/PrivyLedgerWrapper';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal/TermsAndConditionsModal';
import initConfig from '@/config/init';
import { WalletSidebarProvider } from '@/contexts/WalletSidebarContext';
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
import { getWalletAddress } from '@/utils';

import logo from '../../public/images/logo.svg';
import store, { useDispatch, useSelector } from '../store/store';

function Loader(): JSX.Element {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Image
        src={logo}
        className="max-w-[40%] animate-pulse"
        alt="logo"
        width={0}
        height={0}
        style={{ width: '350px', height: 'auto', maxWidth: '40%' }}
        priority={true}
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

  // Create dynamic Privy configuration that updates when RPC changes
  const privyConfigDynamic = useMemo(() => ({
    appId: privyAppId,
    supportedChains: ['solana'],
    config: {
      solana: {
        rpcs: {
          'solana:mainnet': {
            rpc: createSolanaRpc(activeRpc?.connection?.rpcEndpoint || `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY}`),
            rpcSubscriptions: createSolanaRpcSubscriptions(
              (activeRpc?.connection?.rpcEndpoint || `https://adrena-solanam-6f0c.mainnet.rpcpool.com/${process.env.NEXT_PUBLIC_DEV_TRITON_RPC_API_KEY}`)
                .replace('https', 'wss')
            )
          },
        }
      },
      appearance: {
        theme: 'dark' as const,
        accentColor: '#f5f5f5' as const,
        logo: '/images/logo.svg',
        showWalletLoginFirst: false,
        walletList: ['detected_solana_wallets'] as WalletListEntry[],
        walletChainType: 'solana-only' as const,
      },
      //loginMethods: ['email' as const, 'google' as const, 'twitter' as const, 'discord' as const, 'wallet' as const, 'github' as const], // apple, line, tiktok, linkedin have to be configured first // remove to enable whatsapp
      embeddedWallets: {
        solana: {
          createOnLogin: 'all-users' as const,
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
            useSandbox: false,
            paymentMethod: 'credit_debit_card' as const,
            uiConfig: {
              theme: 'dark' as const,
              accentColor: '#f5f5f5' as const,
            },
          },
        },
      },
      externalWallets: {
        walletConnect: {
          enabled: true,
        },
        solana: {
          connectors: toSolanaWalletConnectors(),
        },
      },
      walletConnectCloudProjectId: '549f49d83c4bc0a5c405d8ef6db7972a',
      whatsAppEnabled: true,
    }
  }), [activeRpc?.connection?.rpcEndpoint]);

  // The Loaded is rendered while the app init, but also rendered in SSR.
  if (initStatus !== 'done' || !activeRpc) return <Loader />;

  return (
    <PrivyProvider
      appId={privyConfigDynamic.appId as string}
      config={privyConfigDynamic.config}
    >
      <PrivyLedgerWrapper>
        <Provider store={store}>
          <CookiesProvider>
            <WalletSidebarProvider>
              <MemoizedAppComponent
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
            </WalletSidebarProvider>
          </CookiesProvider>
        </Provider>
      </PrivyLedgerWrapper>
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
  usePrivy();

  const custodies = useCustodies(mainPool);
  const adapters = useWalletAdapters();
  const wallet = useWallet(adapters);

  const walletState = useSelector((s) => s.walletState.wallet);
  const walletAddress = walletState?.walletAddress;
  const { userProfile, isUserProfileLoading, triggerUserProfileReload } = useUserProfile(
    walletAddress ?? null,
  );

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
    const isWalletConnected = !!(wallet && walletAddress);
    if (!isWalletConnected) {
      if (connected) {
        setConnected(false);
      }
      window.adrena.client.setAdrenaProgram(null);
      return;
    }

    dispatch(setVerifiedWalletAddresses());

    if (!connected) {
      setConnected(true);
    }

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
  }, [wallet, walletAddress, dispatch, connected]);

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
      const newWalletAddress = getWalletAddress(wallet);

      if (walletAddress !== newWalletAddress) {
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('referral');

    if (referralCode && referralCode.trim() !== '') {
      sessionStorage.setItem('adrena_referral_code', referralCode);
    }
  }, []);

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

// Memoize AppComponent to prevent unnecessary re-renders from Redux actions
const MemoizedAppComponent = memo(AppComponent);
