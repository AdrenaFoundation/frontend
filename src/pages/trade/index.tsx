import { BN } from '@coral-xyz/anchor';
import { Transaction } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import resizeIcon from '@/../public/images/Icons/resize.svg';
import { setSettings } from '@/actions/settingsActions';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import ChartControlsDesktop from '@/components/pages/trading/ChartControls/ChartControlsDesktop';
import ChartControlsMobile from '@/components/pages/trading/ChartControls/ChartControlsMobile';
import LimitOrder from '@/components/pages/trading/LimitOrder/LimitOrder';
import Positions from '@/components/pages/trading/Positions/Positions';
import PositionsHistory from '@/components/pages/trading/Positions/PositionsHistory';
import TradeComp from '@/components/pages/trading/TradeComp/TradeComp';
import TradingChart from '@/components/pages/trading/TradingChart/TradingChart';
import { ChartPreferences } from '@/components/pages/trading/TradingChart/types';
import { useMarks } from '@/components/pages/trading/TradingChart/useMarks';
import TradingChartHeader from '@/components/pages/trading/TradingChartHeader/TradingChartHeader';
import TradingChartMini from '@/components/pages/trading/TradingChartMini/TradingChartMini';
import ViewTabs, {
  ViewType,
} from '@/components/pages/trading/ViewTabs/ViewTabs';
import { ALTERNATIVE_SWAP_TOKENS, PRICE_DECIMALS } from '@/constant';
import { useAllPositions } from '@/hooks/useAllPositions';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useLimitOrderBook } from '@/hooks/useLimitOrderBook';
import usePositionsHistory from '@/hooks/usePositionHistory';
import usePositions from '@/hooks/usePositions';
import { useDispatch, useSelector } from '@/store/store';
import { PageProps, PositionExtended, Token } from '@/types';
import { getTokenSymbol, uiToNative } from '@/utils';
import { getWalletAddress } from '@/utils';

export type Action = 'long' | 'short' | 'swap';

function pickDefaultToken(positions: PositionExtended[] | null): Token {
  const tokens = window.adrena.client.tokens.filter((t) => !t.isStable);

  const solToken = tokens.find(
    (t) => t.symbol === 'JITOSOL' || t.symbol === 'SOL',
  );

  if (!solToken) throw new Error('SOL token not found');

  if (!positions || !positions.length) return solToken;

  const positionsPerToken: Record<string, number> = positions.reduce(
    (acc, position) => {
      const tokenSymbol = position.token.symbol;
      const positionSize = position.sizeUsd;

      acc[tokenSymbol] = (acc[tokenSymbol] || 0) + positionSize;

      return acc;
    },
    {} as Record<string, number>,
  );

  const maxPositionSize = Math.max(...Object.values(positionsPerToken));

  const tokenWithMaxSize = tokens.find(
    (t) =>
      t.symbol ===
      Object.keys(positionsPerToken).find(
        (key) => positionsPerToken[key] === maxPositionSize,
      ),
  )!;

  return tokenWithMaxSize;
}

export default function Trade({
  wallet,
  connected,
  triggerUserProfileReload,
  userProfile,
  activeRpc,
  adapters,
}: PageProps) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const settings = useSelector((state) => state.settings);

  // FIXME: Only call this hook in a single place & as-close as possible to consumers.
  const walletAddress = getWalletAddress(wallet);
  const positions = usePositions(walletAddress);
  const { positionsData } = usePositionsHistory({
    walletAddress: walletAddress,
    batchSize: 200,
    interval: 10_000,
  });
  const { allPositions } = useAllPositions({ connected });

  const [activePositionModal, setActivePositionModal] = useState<Action | null>(
    null,
  );
  const [selectedAction, setSelectedAction] = useState<Action>('long');
  const router = useRouter();

  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);

  const [cookies] = useCookies([
    'showBreakEvenLine',
    'toggleSizeUsdInChart',
    'showAllActivePositionsLiquidationLines',
    'showAllActivePositions',
    'showPositionHistory',
    'updateTPSLByDrag',
    'showHighLow',
    'last-selected-trading-token',
  ]);

  const [chartPreferences, setChartPreferences] = useState<ChartPreferences>({
    showAllActivePositionsLiquidationLines:
      cookies?.showAllActivePositionsLiquidationLines === true,
    showAllActivePositions: cookies?.showAllActivePositions === true,
    showPositionHistory: cookies?.showPositionHistory === true,
    updateTPSLByDrag: cookies?.updateTPSLByDrag === true,
    showHighLow: true,
  });

  const { getMarksCallback } = useMarks({
    positionsHistory: positionsData?.positions ?? [],
    allActivePositions: allPositions,
    activeToken: tokenB,
    walletAddress: walletAddress,
    chartPreferences,
  });

  const [showBreakEvenLine, setShowBreakEvenLine] = useState<boolean>(
    cookies?.showBreakEvenLine !== false,
  );
  const [toggleSizeUsdInChart, setToggleSizeUsdInChart] = useState<boolean>(
    cookies?.toggleSizeUsdInChart === true,
  );

  const [isInitialized, setIsInitialize] = useState<boolean>(false);

  // There is one position max per side per custody
  // If the position exist for the selected custody, store it in this variable
  const [openedPosition, setOpenedPosition] = useState<PositionExtended | null>(
    null,
  );

  const isBigScreen = useBetterMediaQuery('(min-width: 1152px)');
  const isExtraWideScreen = useBetterMediaQuery('(min-width: 1600px)');
  const [view, setView] = useState<ViewType>('positions');

  const { limitOrderBook, reload } = useLimitOrderBook({
    walletAddress: walletAddress,
  });

  const minChartHeight = 200; // Minimum height
  const maxChartHeight = 1200; // Maximum height
  const [chartHeight, setChartHeight] = useState(() => {
    // Try to get saved height from localStorage
    const savedHeight = localStorage.getItem('chartHeight');
    if (savedHeight) {
      const height = parseInt(savedHeight);
      // Validate the saved height is within bounds
      if (height >= minChartHeight && height <= maxChartHeight) {
        return height;
      }
    }
    return 400; // Default height if no valid saved value
  });

  // Update localStorage whenever chartHeight changes
  useEffect(() => {
    localStorage.setItem('chartHeight', chartHeight.toString());
  }, [chartHeight]);

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!tokenA || !tokenB) return;

    // Save the trading pair on URL
    router.replace({
      query: {
        ...router.query,
        pair: `${getTokenSymbol(tokenA.symbol)}_${getTokenSymbol(
          tokenB.symbol,
        )}`,
        action: selectedAction,
      },
    });
    // Use custom triggers to avoid unwanted refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!router, tokenA?.symbol, tokenB?.symbol, selectedAction]);

  // Setup
  useEffect(() => {
    const tokenACandidate = [
      ...window.adrena.client.tokens,
      ...ALTERNATIVE_SWAP_TOKENS,
    ];

    // First initialization of the component
    // Load trading pair and action type (long/short/swap) from URL
    if (!isInitialized) {
      setIsInitialize(true);

      const action = router.query.action;

      // bad/empty url query params
      if (
        typeof action !== 'string' ||
        !['long', 'short', 'swap'].includes(action)
      ) {
        return;
      }

      // Set the proper action
      setSelectedAction(action as Action);

      const tokenBCandidate =
        action === 'swap'
          ? window.adrena.client.tokens
          : window.adrena.client.tokens.filter((t) => !t.isStable);

      const possiblePair = router.query.pair;

      // bad url
      if (!possiblePair || possiblePair instanceof Array) {
        return;
      }

      const pair = possiblePair.split('_');

      // bad URL
      if (pair.length !== 2) {
        return;
      }

      const [tokenAName, tokenBName] = pair;

      const tokenA = tokenACandidate.find(
        (token) => getTokenSymbol(token.symbol) === tokenAName,
      );
      const tokenB = tokenBCandidate.find(
        (token) => getTokenSymbol(token.symbol) === tokenBName,
      );

      // bad URL
      if (!tokenA || !tokenB) {
        return;
      }

      setTokenA(tokenA);
      setTokenB(tokenB);

      return;
    }

    const tokenBCandidate =
      selectedAction === 'swap'
        ? window.adrena.client.tokens
        : window.adrena.client.tokens.filter((t) => !t.isStable);

    if (
      !tokenB ||
      !tokenBCandidate.find((token) => token.symbol === tokenB.symbol)
    ) {
      const lastSelectedToken = tokenBCandidate.find(
        (t) => t.symbol === settings.lastSelectedTradingToken,
      );

      if (lastSelectedToken) {
        setTokenB(lastSelectedToken);
      } else {
        setTokenB(pickDefaultToken(positions));
      }
    }

    if (
      !tokenA ||
      !tokenACandidate.find((token) => token.symbol === tokenA.symbol)
    ) {
      const settingsPick: Token | undefined = tokenACandidate.find(
        (t) => t.symbol === settings.openPositionCollateralSymbol,
      );

      if (settingsPick) {
        setTokenA(settingsPick);
        return;
      }

      // If long, pick the same token as tokenB (avoid swap for user) else pick the default token
      const candidate =
        selectedAction === 'long'
          ? (tokenB ?? pickDefaultToken(positions))
          : tokenACandidate[0];

      if (tokenACandidate.some((t) => t.symbol === candidate.symbol)) {
        setTokenA(candidate);
      } else {
        setTokenA(tokenACandidate[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only call when the user get initialized or we change of action
    selectedAction,
    isInitialized,
  ]);

  // Check for opened position
  useEffect(() => {
    if (!tokenB) return;
    if (!positions) return setOpenedPosition(null);

    const relatedPosition = positions.find(
      (position) =>
        position.token.mint.equals(tokenB.mint) &&
        position.side === selectedAction,
    );

    setOpenedPosition(relatedPosition ?? null);
  }, [positions, selectedAction, tokenB]);

  useEffect(() => {
    if (activePositionModal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [activePositionModal]);

  const triggerCancelAllLimitOrder = useCallback(async () => {
    if (!limitOrderBook || limitOrderBook.limitOrders.length === 0) return;

    const notification = MultiStepNotification.newForRegularTransaction(
      t('trade.cancelAllLimitOrder'),
    ).fire();

    try {
      const ixBuilders = await Promise.all(
        limitOrderBook.limitOrders.map((lo) =>
          window.adrena.client.buildCancelLimitOrderIx({
            id: lo.id,
            collateralCustody: lo.collateralCustody,
          }),
        ),
      );

      const ixs = await Promise.all(
        ixBuilders.map((ixBuilder) => ixBuilder.instruction()),
      );

      const transaction = new Transaction();
      transaction.add(...ixs);

      await window.adrena.client.signAndExecuteTxAlternative({
        transaction,
        notification,
      });

      reload();
    } catch (error) {
      console.error('error', error);
    }
  }, [limitOrderBook, reload]);

  const triggerCloseAllPosition = useCallback(async () => {
    if (!positions || positions.length === 0) return;

    // Missing price
    if (positions.some((p) => !tokenPrices[getTokenSymbol(p.token.symbol)])) {
      return;
    }

    const nbTransactions = Math.ceil(positions.length / 2);

    try {
      for (let i = 0; i < nbTransactions; i++) {
        const positionsGroup = positions.slice(i * 2, (i + 1) * 2);

        const notification = MultiStepNotification.newForRegularTransaction(
          `${t('trade.closeAllPositions')}${nbTransactions > 1 ? ` (${i + 1}/${nbTransactions})` : ''}`,
        ).fire();

        // 1%
        const slippageInBps = 100;

        const ixBuilders = await Promise.all(
          positionsGroup.map((p) =>
            p.side === 'long'
              ? window.adrena.client.buildClosePositionLongIx({
                position: p,
                price: uiToNative(
                  tokenPrices[getTokenSymbol(p.token.symbol)]!,
                  PRICE_DECIMALS,
                )
                  .mul(new BN(10_000 - slippageInBps))
                  .div(new BN(10_000)),
              })
              : window.adrena.client.buildClosePositionShortIx({
                position: p,
                price: uiToNative(
                  tokenPrices[p.token.symbol]!,
                  PRICE_DECIMALS,
                )
                  .mul(new BN(10_000))
                  .div(new BN(10_000 - slippageInBps)),
              }),
          ),
        );

        const ixs = await Promise.all(
          ixBuilders.map((ixBuilder) => ixBuilder.instruction()),
        );

        const transaction = new Transaction();
        transaction.add(...ixs);

        await window.adrena.client.signAndExecuteTxAlternative({
          transaction,
          notification,
        });
      }
    } catch (error) {
      console.error('error', error);
    }
  }, [positions, tokenPrices]);

  const allActivePositions = tokenB
    ? allPositions.filter((p) => p.token.mint.equals(tokenB.mint))
    : null;

  // Calculate position counts for the selected token
  const numberLong = allActivePositions?.filter(
    (p) => p.side === 'long',
  ).length;
  const numberShort = allActivePositions?.filter(
    (p) => p.side === 'short',
  ).length;

  const totalStats =
    positions && positions.length > 0
      ? positions.reduce(
        (acc, position) => {
          const price = tokenPrices[getTokenSymbol(position.token.symbol)];
          if (!price || position.pnl == null) {
            return acc;
          }
          acc.totalPnL += position.pnl;
          acc.totalCollateral += position.collateralUsd;
          return acc;
        },
        { totalPnL: 0, totalCollateral: 0 },
      )
      : null;

  return (
    <div className="w-full flex flex-col items-center lg:flex-row lg:justify-center lg:items-start z-10 min-h-full sm:p-4 pb-[200px] sm:pb-4">
      <div className="fixed w-full h-screen left-0 top-0 -z-10 opacity-50 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]" />

      <div className="flex flex-col w-full min-w-0">
        <div className="flex flex-col w-full border sm:rounded-lg overflow-hidden bg-secondary">
          {/* Trading chart header */}
          {tokenB ? (
            <TradingChartHeader
              tokenList={window.adrena.client.tokens.filter((t) => !t.isStable)}
              selected={tokenB}
              onChange={(t: Token) => {
                dispatch(
                  setSettings({
                    lastSelectedTradingToken: t.symbol,
                  }),
                );
                setTokenB(t);
              }}
              allActivePositions={allActivePositions}
              selectedAction={selectedAction}
            />
          ) : null}

          <div className="relative" style={{ height: chartHeight }}>
            <div className="absolute inset-0 flex">
              {tokenA && tokenB ? (
                <TradingChart
                  token={tokenB ? tokenB : tokenA.isStable ? tokenB : tokenA}
                  positions={positions}
                  allActivePositions={allActivePositions}
                  positionHistory={positionsData?.positions ?? []}
                  chartPreferences={chartPreferences}
                  limitOrders={limitOrderBook?.limitOrders ?? null}
                  showBreakEvenLine={showBreakEvenLine}
                  toggleSizeUsdInChart={toggleSizeUsdInChart}
                  getMarksCallback={getMarksCallback}
                />
              ) : null}
            </div>
          </div>

          <div className="flex flex-col border-t border-white/10">
            <div className="flex flex-row items-center gap-0">
              <ChartControlsDesktop
                chartPreferences={chartPreferences}
                setChartPreferences={setChartPreferences}
                showBreakEvenLine={showBreakEvenLine}
                setShowBreakEvenLine={setShowBreakEvenLine}
                toggleSizeUsdInChart={toggleSizeUsdInChart}
                setToggleSizeUsdInChart={setToggleSizeUsdInChart}
              />

              <div
                className="hidden md:block p-1 mr-3 border opacity-50 border-bcolor hover:bg-third hover:opacity-100 transition-all duration-300 rounded-md cursor-ns-resize"
                onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  const startY = e.clientY;
                  const initialHeight = chartHeight;

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    moveEvent.preventDefault();
                    const deltaY = moveEvent.clientY - startY;
                    const newHeight = Math.max(
                      200,
                      Math.min(1200, initialHeight + deltaY),
                    );
                    setChartHeight(newHeight);
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    setIsResizing(false);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <Image
                  src={resizeIcon}
                  alt={t('trade.resizeChart')}
                  width={14}
                  height={14}
                  className="-rotate-45"
                />
              </div>
            </div>

            <ChartControlsMobile
              chartPreferences={chartPreferences}
              setChartPreferences={setChartPreferences}
              showBreakEvenLine={showBreakEvenLine}
              setShowBreakEvenLine={setShowBreakEvenLine}
              toggleSizeUsdInChart={toggleSizeUsdInChart}
              setToggleSizeUsdInChart={setToggleSizeUsdInChart}
              isResizing={isResizing}
              setIsResizing={setIsResizing}
            />
          </div>
        </div>

        {!!isBigScreen ? (
          <>
            <div className="bg-secondary mt-4 border rounded-md relative">
              <ViewTabs
                view={view}
                setView={setView}
                positionsCount={positions?.length ?? 0}
                limitOrdersCount={limitOrderBook?.limitOrders.length ?? 0}
                isBigScreen={!!isBigScreen}
                onCloseAllPositions={triggerCloseAllPosition}
                onCancelAllLimitOrders={triggerCancelAllLimitOrder}
                positions={positions}
                totalStats={totalStats}
                limitOrdersExist={!!limitOrderBook?.limitOrders.length}
              />

              {view === 'history' ? (
                <div className="flex flex-col w-full p-4 pt-2">
                  <PositionsHistory
                    walletAddress={getWalletAddress(wallet)}
                    connected={connected}
                    key={`history-${getWalletAddress(wallet) || 'none'}`}
                    userProfile={userProfile}
                  />
                </div>
              ) : null}

              {view === 'positions' ? (
                <div className="flex flex-col w-full p-4 pt-2">
                  <Positions
                    connected={connected}
                    positions={positions}
                    triggerUserProfileReload={triggerUserProfileReload}
                    isBigScreen={isBigScreen}
                    setTokenB={setTokenB}
                    userProfile={userProfile}
                  />
                </div>
              ) : null}

              {view === 'limitOrder' ? (
                <div className="flex flex-col w-full p-4 pt-2">
                  <LimitOrder
                    walletAddress={getWalletAddress(wallet)}
                    limitOrderBook={limitOrderBook}
                    reload={reload}
                  />
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex">
            <div className="bg-secondary mt-4 border rounded-md w-full sm:w-1/2 sm:mr-4 lg:mr-0 md:w-[57%] lg:w-[65%] h-full flex flex-col relative">
              <ViewTabs
                view={view}
                setView={setView}
                positionsCount={positions?.length ?? 0}
                limitOrdersCount={limitOrderBook?.limitOrders.length ?? 0}
                isBigScreen={!!isBigScreen}
                onCloseAllPositions={triggerCloseAllPosition}
                onCancelAllLimitOrders={triggerCancelAllLimitOrder}
                positions={positions}
                totalStats={totalStats}
                limitOrdersExist={!!limitOrderBook?.limitOrders.length}
              />

              {view === 'history' ? (
                <div className="mt-1 w-full p-4 pt-2 flex grow">
                  <PositionsHistory
                    walletAddress={getWalletAddress(wallet)}
                    connected={connected}
                    key={`history-${getWalletAddress(wallet) || 'none'}`}
                    userProfile={userProfile}
                  />
                </div>
              ) : null}

              {view === 'limitOrder' ? (
                <div className="mt-1 w-full p-4 pt-2">
                  <LimitOrder
                    walletAddress={getWalletAddress(wallet)}
                    limitOrderBook={limitOrderBook}
                    reload={reload}
                  />
                </div>
              ) : null}

              {view === 'positions' ? (
                <div className="mt-1 w-full p-4 pt-2">
                  <Positions
                    connected={connected}
                    positions={positions}
                    triggerUserProfileReload={triggerUserProfileReload}
                    isBigScreen={isBigScreen}
                    setTokenB={setTokenB}
                    userProfile={userProfile}
                  />
                </div>
              ) : null}
            </div>

            <div className="sm:w-1/2 md:w-[43%] lg:w-[35%] lg:ml-4 hidden sm:flex">
              <TradeComp
                selectedAction={selectedAction}
                setSelectedAction={setSelectedAction}
                tokenA={tokenA}
                tokenB={tokenB}
                setTokenA={(t: Token | null) => {
                  // Persist the selected token in the settings
                  dispatch(
                    setSettings({
                      openPositionCollateralSymbol: t?.symbol ?? '',
                    }),
                  );

                  setTokenA(t);
                }}
                setTokenB={setTokenB}
                openedPosition={openedPosition}
                wallet={wallet}
                connected={connected}
                isBigScreen={isBigScreen}
                activeRpc={activeRpc}
                terminalId="integrated-terminal-1"
                adapters={adapters}
                onLimitOrderAdded={reload}
              />
            </div>
          </div>
        )}
      </div>

      {!!isBigScreen && (
        <div
          className={twMerge(
            'hidden sm:flex ml-4',
            isExtraWideScreen
              ? 'w-[20%] min-w-[350px]'
              : 'w-[25%] min-w-[320px]',
          )}
        >
          <TradeComp
            className="w-full"
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            tokenA={tokenA}
            tokenB={tokenB}
            setTokenA={(t: Token | null) => {
              // Persist the selected token in the settings
              dispatch(
                setSettings({
                  openPositionCollateralSymbol: t?.symbol ?? '',
                }),
              );

              setTokenA(t);
            }}
            setTokenB={setTokenB}
            openedPosition={openedPosition}
            wallet={wallet}
            connected={connected}
            isBigScreen={isBigScreen}
            activeRpc={activeRpc}
            terminalId="integrated-terminal-2"
            adapters={adapters}
            onLimitOrderAdded={reload}
          />
        </div>
      )}

      <div className="relative w-full sm:hidden">
        <div className="fixed left-0 bottom-[2.8125rem] w-full bg-bcolor backdrop-blur-sm p-3 z-30">
          <ul className="flex flex-row gap-3 justify-between ml-4 mr-4">
            <li>
              <Button
                className="bg-transparent font-semibold border-[#10e1a3] text-[#10e1a3]"
                title={t('trade.long')}
                variant="outline"
                size="lg"
                onClick={() => {
                  setActivePositionModal('long');
                  setSelectedAction('long');
                }}
              />
            </li>
            <li>
              <Button
                className="bg-transparent font-semibold border-[#f24f4f] text-[#f24f4f]"
                title={t('trade.short')}
                variant="outline"
                size="lg"
                onClick={() => {
                  setActivePositionModal('short');
                  setSelectedAction('short');
                }}
              />
            </li>
            <li>
              <Button
                className="bg-transparent font-semibold border-white text-white"
                title={t('trade.swap')}
                variant="outline"
                size="lg"
                onClick={() => {
                  setActivePositionModal('swap');
                  setSelectedAction('swap');
                }}
              />
            </li>
          </ul>

          <AnimatePresence>
            {activePositionModal && (
              <Modal
                title={t(`trade.${activePositionModal}Position`)}
                close={() => setActivePositionModal(null)}
                className="flex flex-col overflow-y-auto w-full"
              >
                {tokenB && (
                  <TradingChartMini
                    token={tokenB}
                    selectedAction={selectedAction}
                    numberLong={numberLong}
                    numberShort={numberShort}
                  />
                )}
                <div className="bg-bcolor w-full h-[1px] my-3" />
                <div className="flex w-full">
                  <TradeComp
                    selectedAction={selectedAction}
                    setSelectedAction={setSelectedAction}
                    tokenA={tokenA}
                    tokenB={tokenB}
                    setTokenA={(t: Token | null) => {
                      // Persist the selected token in the settings
                      dispatch(
                        setSettings({
                          openPositionCollateralSymbol: t?.symbol ?? '',
                        }),
                      );

                      setTokenA(t);
                    }}
                    setTokenB={setTokenB}
                    openedPosition={openedPosition}
                    className="p-0 m-0 w-full px-4"
                    wallet={wallet}
                    connected={connected}
                    activeRpc={activeRpc}
                    terminalId="integrated-terminal-3"
                    adapters={adapters}
                    onLimitOrderAdded={reload}
                    setActivePositionModal={setActivePositionModal}
                  />
                </div>
              </Modal>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
