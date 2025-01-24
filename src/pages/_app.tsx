import '@/styles/globals.scss';

import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { Provider } from 'react-redux';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import { AdrenaClient } from '@/AdrenaClient';
import RootLayout from '@/components/layouts/RootLayout/RootLayout';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal/TermsAndConditionsModal';
import initConfig from '@/config/init';
import { SOLANA_EXPLORERS_OPTIONS } from '@/constant';
import useCustodies from '@/hooks/useCustodies';
import useMainPool from '@/hooks/useMainPool';
import useRpc from '@/hooks/useRPC';
import useUserProfile from '@/hooks/useUserProfile';
import useWallet from '@/hooks/useWallet';
import useWalletAdapters from '@/hooks/useWalletAdapters';
import useWatchBorrowRates from '@/hooks/useWatchBorrowRates';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import initializeApp, {
  createReadOnlyAdrenaProgram,
} from '@/initializeApp';
import { IDL as ADRENA_IDL } from '@/target/adrena';
import { PriorityFeeOption, SolanaExplorerOptions, VestExtended } from '@/types';
import {
  DEFAULT_MAX_PRIORITY_FEE,
  DEFAULT_PRIORITY_FEE_OPTION,
  PercentilePriorityFeeList,
} from '@/utils';

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
// initalized once, doesn't move afterwards.
// actually twice, once on the server to `null` & once on the client.
const CONFIG = initConfig();
export const PYTH_CONNECTION =
  CONFIG && new Connection(CONFIG.pythnetRpc.url, 'processed');

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

  const [cookies] = useCookies(['solanaExplorer']);

  const preferredSolanaExplorer: SolanaExplorerOptions =
    cookies?.solanaExplorer &&
      SOLANA_EXPLORERS_OPTIONS.hasOwnProperty(cookies.solanaExplorer)
      ? cookies?.solanaExplorer
      : 'Solana Explorer';

  // Initialize the app as soon as possible:
  // - when the client-side app boots..
  //   - and the RPC has been picked by usePRC hook.
  // No need to use an Effect as long as we guard with the correct conditions.
  if (
    CONFIG !== null &&
    PYTH_CONNECTION !== null &&
    initStatus === 'not-started' &&
    activeRpc !== null
  ) {
    setInitStatus('starting');
    initializeApp(
      preferredSolanaExplorer,
      CONFIG,
      activeRpc.connection,
      PYTH_CONNECTION,
    ).then(() => {
      setInitStatus('done');
    });
  }

  // The Loaded is rendered while the app init, but also rendered in SSR.
  if (initStatus !== 'done' || !activeRpc) return <Loader />;

  return (
    <Provider store={store}>
      <CookiesProvider>
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
          preferredSolanaExplorer={preferredSolanaExplorer}
          {...props}
        />
        <Analytics />
        <SpeedInsights />
      </CookiesProvider>
    </Provider>
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
  preferredSolanaExplorer,
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
  preferredSolanaExplorer: SolanaExplorerOptions;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const mainPool = useMainPool();
  const custodies = useCustodies(mainPool);
  const adapters = useWalletAdapters();
  const wallet = useWallet(adapters);
  const walletAddress = useSelector((s) => s.walletState.wallet?.walletAddress);
  const { userProfile, triggerUserProfileReload } = useUserProfile(walletAddress ?? null);

  useWatchTokenPrices();
  useWatchBorrowRates();

  // Fetch token balances for the connected wallet:
  // on initial mount of the app & on account change.
  useEffect(() => {
    dispatch(fetchWalletTokenBalances());
  }, [walletAddress, dispatch]);

  const [cookies, setCookie] = useCookies([
    'terms-and-conditions-acceptance',
    'priority-fee',
    'max-priority-fee',
    'show-fees-in-pnl',
  ]);

  const [priorityFeeOption, setPriorityFeeOption] = useState<PriorityFeeOption>(
    DEFAULT_PRIORITY_FEE_OPTION,
  );

  // This represent the maximum extra amount of SOL per IX for priority fees, priority fees will be capped at this value
  const [maxPriorityFee, setMaxPriorityFee] = useState<number | null>(
    DEFAULT_MAX_PRIORITY_FEE,
  );

  const [showFeesInPnl, setShowFeesInPnl] = useState<boolean>(true);

  const [userVest, setUserVest] = useState<VestExtended | null>(null);
  const [userDelegatedVest, setUserDelegatedVest] = useState<VestExtended | null>(null);

  const getUserVesting = useCallback(async () => {
    try {
      if (!wallet?.publicKey) return;

      const [delegatedVest, vest] = await Promise.all([
        window.adrena.client.loadUserDelegatedVest(wallet.publicKey),
        window.adrena.client.loadUserVest(wallet.publicKey),
      ]);

      setUserVest(vest ? vest : null);
      setUserDelegatedVest(delegatedVest ? delegatedVest : null);
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

    // Priority fees
    const priorityFeeOption = cookies['priority-fee'];

    if (
      priorityFeeOption &&
      Object.keys(PercentilePriorityFeeList).includes(priorityFeeOption)
    ) {
      setPriorityFeeOption(priorityFeeOption);
    }

    const maxPriorityFee = parseFloat(cookies['max-priority-fee']);

    if (maxPriorityFee && !isNaN(maxPriorityFee)) {
      setMaxPriorityFee(maxPriorityFee);
    }

    const showFeesInPnl = cookies['show-fees-in-pnl'];

    if (showFeesInPnl && showFeesInPnl === 'false') {
      setShowFeesInPnl(false);
    }
  }, [cookies]);

  useEffect(() => {
    window.adrena.client.setPriorityFeeOption(priorityFeeOption);
  }, [priorityFeeOption]);

  useEffect(() => {
    window.adrena.client.setMaxPriorityFee(maxPriorityFee);
  }, [maxPriorityFee]);

  useEffect(() => {
    if (!wallet) {
      setConnected(false);
      window.adrena.client.setAdrenaProgram(null);
      return;
    }

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
  }, [wallet]);

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

  return (
    <>
      <Head>
        <meta name="viewport" content="viewport-fit=cover" />
      </Head>

      <RootLayout
        userVest={userVest}
        priorityFeeOption={priorityFeeOption}
        setPriorityFeeOption={(p: PriorityFeeOption) => {
          setCookie('priority-fee', p, {
            path: '/',
            maxAge: 360 * 24 * 60 * 60, // 360 days in seconds
            sameSite: 'strict',
          });

          setPriorityFeeOption(p);
        }}
        maxPriorityFee={maxPriorityFee}
        setMaxPriorityFee={(p: number | null) => {
          setCookie('max-priority-fee', p, {
            path: '/',
            maxAge: 360 * 24 * 60 * 60, // 360 days in seconds
            sameSite: 'strict',
          });

          setMaxPriorityFee(p);
        }}
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
        preferredSolanaExplorer={preferredSolanaExplorer}
        adapters={adapters}
        showFeesInPnl={showFeesInPnl}
        setShowFeesInPnl={setShowFeesInPnl}
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

        <Component
          {...pageProps}
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
          preferredSolanaExplorer={preferredSolanaExplorer}
          adapters={adapters}
          showFeesInPnl={showFeesInPnl}
          setShowFeesInPnl={setShowFeesInPnl}
        />
      </RootLayout>
    </>
  );
}
