import { Switch } from '@mui/material';
import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import LimitOrder from '@/components/pages/trading/LimitOrder/LimitOrder';
import Positions from '@/components/pages/trading/Positions/Positions';
import PositionsHistory from '@/components/pages/trading/Positions/PositionsHistory';
import TradeComp from '@/components/pages/trading/TradeComp/TradeComp';
import TradingChart from '@/components/pages/trading/TradingChart/TradingChart';
import TradingChartHeader from '@/components/pages/trading/TradingChartHeader/TradingChartHeader';
import TradingChartMini from '@/components/pages/trading/TradingChartMini/TradingChartMini';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useLimitOrderBook } from '@/hooks/useLimitOrderBook';
import usePositions from '@/hooks/usePositions';
import { PageProps, PositionExtended, Token } from '@/types';
import { getTokenSymbol } from '@/utils';

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

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
  activeRpc,
  adapters,
}: PageProps) {
  // FIXME: Only call this hook in a single place & as-close as possible to consumers.
  const positions = usePositions(wallet?.publicKey.toBase58() ?? null);
  const [activePositionModal, setActivePositionModal] = useState<Action | null>(
    null,
  );
  const [selectedAction, setSelectedAction] = useState<Action>('long');
  const router = useRouter();

  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);

  const [cookies, setCookie] = useCookies([
    'showBreakEvenLine',
    'toggleSizeUsdInChart',
  ]);

  const [showBreakEvenLine, setShowBreakEvenLine] = useState<boolean>(
    cookies?.showBreakEvenLine === 'true',
  );
  const [toggleSizeUsdInChart, setToggleSizeUsdInChart] = useState<boolean>(
    cookies?.toggleSizeUsdInChart === 'true',
  );

  const [isInitialized, setIsInitialize] = useState<boolean>(false);

  // There is one position max per side per custody
  // If the position exist for the selected custody, store it in this variable
  const [openedPosition, setOpenedPosition] = useState<PositionExtended | null>(
    null,
  );

  const isBigScreen = useBetterMediaQuery('(min-width: 1100px)');
  const [view, setView] = useState<'history' | 'positions' | 'limitOrder'>('positions');

  const { limitOrderBook, reload } = useLimitOrderBook({
    walletAddress: wallet?.publicKey.toBase58() ?? null,
  });

  const [chartHeight, setChartHeight] = useState(400); // Default height
  const minChartHeight = 300; // Minimum height
  const maxChartHeight = 800; // Maximum height
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
    const tokenACandidate = window.adrena.client.tokens;

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

    // If token is not set or token is not allowed, set default token
    if (
      !tokenB ||
      !tokenBCandidate.find((token) => token.symbol === tokenB.symbol)
    ) {
      setTokenB(pickDefaultToken(positions));
    }

    // If token is not set or token is not allowed, set default token
    if (
      !tokenA ||
      !tokenACandidate.find((token) => token.symbol === tokenA.symbol)
    ) {
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

  return (
    <div className="w-full flex flex-col items-center lg:flex-row lg:justify-center lg:items-start z-10 min-h-full p-4 pb-[200px] sm:pb-4">
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 -z-10 opacity-60 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]" />

      <div className="flex flex-col w-full">
        <div className="flex flex-col w-full border rounded-lg overflow-hidden bg-secondary">
          {/* Trading chart header */}
          {tokenB ? (
            <TradingChartHeader
              tokenList={
                selectedAction === 'short' || selectedAction === 'long'
                  ? window.adrena.client.tokens.filter((t) => !t.isStable)
                  : window.adrena.client.tokens
              }
              selected={tokenB}
              onChange={(t: Token) => {
                setTokenB(t);
              }}
            />
          ) : null}

          <div className="relative" style={{ height: chartHeight }}>
            <div className="absolute inset-0 flex">
              {tokenA && tokenB ? (
                <TradingChart
                  token={tokenB ? tokenB : tokenA.isStable ? tokenB : tokenA}
                  positions={positions}
                  limitOrders={limitOrderBook?.limitOrders ?? null}
                  showBreakEvenLine={showBreakEvenLine}
                  toggleSizeUsdInChart={toggleSizeUsdInChart}
                />
              ) : null}
            </div>
          </div>

          <div className="flex flex-col border-t border-white/10">
            <div className="flex flex-row gap-3 items-center justify-end p-2">
              <div className="flex items-center p-0.5 text-white">
                <Tippy content="The break-even line is the price at which the position would be at breakeven given the fees to be paid at exit.">
                  <p className="opacity-50 text-xs underline-dashed cursor-help">
                    Show Break Even line
                  </p>
                </Tippy>
                <Switch
                  checked={showBreakEvenLine}
                  onChange={() => {
                    setCookie('showBreakEvenLine', !showBreakEvenLine);
                    setShowBreakEvenLine(!showBreakEvenLine);
                  }}
                  size="small"
                  sx={{
                    transform: 'scale(0.7)',
                    '& .MuiSwitch-switchBase': {
                      color: '#ccc',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#1a1a1a',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: '#555',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#10e1a3',
                    },
                  }}
                />
              </div>

              <div className="flex items-center p-0.5 text-white">
                <p className="opacity-50 text-xs underline-dashed cursor-help">
                  Show size in chart
                </p>
                <Switch
                  checked={toggleSizeUsdInChart}
                  onChange={() => {
                    setCookie('toggleSizeUsdInChart', !toggleSizeUsdInChart);
                    setToggleSizeUsdInChart(!toggleSizeUsdInChart);
                  }}
                  size="small"
                  sx={{
                    transform: 'scale(0.7)',
                    '& .MuiSwitch-switchBase': {
                      color: '#ccc',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#1a1a1a',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: '#555',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#10e1a3',
                    },
                  }}
                />
              </div>

              <div
                className="flex items-center p-0.5 text-white cursor-pointer"
                onClick={() => setIsResizing(!isResizing)}
              >
                <p className={twMerge("opacity-50 text-xs hover:opacity-100 transition-opacity", isResizing && "opacity-100")}>
                  Resize
                </p>
              </div>
            </div>

            {isResizing && (
              <div
                className="h-6 w-full flex items-center justify-center cursor-ns-resize hover:bg-white/5"
                onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  const startY = e.clientY;
                  const startHeight = chartHeight;

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    moveEvent.preventDefault();
                    const deltaY = moveEvent.clientY - startY;
                    const newHeight = startHeight + deltaY;
                    if (newHeight >= minChartHeight && newHeight <= maxChartHeight) {
                      setChartHeight(newHeight);
                    }
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
                <div className="w-12 h-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors" />
              </div>
            )}
          </div>
        </div>

        {isBigScreen ? (
          <>
            <div className="bg-secondary mt-4 border rounded-lg relative">
              <div className="flex items-center justify-start gap-2 px-4 pt-2 text-sm">
                <div
                  className={twMerge(
                    'cursor-pointer hover:opacity-100 transition-opacity duration-300 flex items-center gap-2',
                    view === 'positions' ? 'opacity-100' : 'opacity-40',
                  )}
                  onClick={() => setView('positions')}
                >
                  Open positions

                  <div className='h-4 min-w-4 pl-1.5 pr-1.5 flex items-center justify-center text-center rounded text-xxs bg-inputcolor'>{positions?.length ?? 0}</div>
                </div>

                <span className="opacity-20">|</span>

                <div
                  className={twMerge(
                    'cursor-pointer hover:opacity-100 transition-opacity duration-300 flex gap-2 items-center',
                    view === 'limitOrder' ? 'opacity-100' : 'opacity-40',
                  )}
                  onClick={() => setView('limitOrder')}
                >
                  Limit orders

                  <div className='h-4 min-w-4 pl-1.5 pr-1.5 flex items-center justify-center text-center rounded text-xxs bg-inputcolor'>{limitOrderBook?.limitOrders.length ?? 0}</div>
                </div>


                <span className="opacity-20">|</span>

                <span
                  className={twMerge(
                    'cursor-pointer hover:opacity-100 transition-opacity duration-300',
                    view === 'history' ? 'opacity-100' : 'opacity-40',
                  )}
                  onClick={() => setView('history')}
                >
                  Trade history
                </span>

              </div>

              {view === 'history' ? (
                <div className="flex flex-col w-full p-4">
                  <PositionsHistory
                    walletAddress={wallet?.publicKey.toBase58() ?? null}
                    connected={connected}
                    exportButtonPosition='top-right'
                  />
                </div>
              ) : null}

              {view === 'positions' ? (
                <div className="flex flex-col w-full p-4">
                  <Positions
                    connected={connected}
                    positions={positions}
                    triggerUserProfileReload={triggerUserProfileReload}
                    isBigScreen={isBigScreen}
                    setTokenB={setTokenB}
                  />
                </div>
              ) : null}

              {view === 'limitOrder' ? (
                <div className="flex flex-col w-full p-4">
                  <LimitOrder
                    walletAddress={wallet?.publicKey.toBase58() ?? null}
                    limitOrderBook={limitOrderBook}
                    reload={reload}
                  />
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex">
            <div className="bg-secondary mt-4 border rounded-lg w-full sm:w-1/2 sm:mr-4 lg:mr-0 md:w-[57%] lg:w-[65%] h-full flex flex-col">
              <div className="flex items-center justify-start gap-2 px-4 pt-2 text-sm">
                <span
                  className={twMerge(
                    'cursor-pointer hover:opacity-100 transition-opacity duration-300',
                    view === 'positions' ? 'opacity-100' : 'opacity-40',
                  )}
                  onClick={() => setView('positions')}
                >
                  Open positions

                </span>
                <div className={twMerge(
                  'h-4 min-w-4 pl-1.5 pr-1.5 flex items-center justify-center text-center rounded text-xxs bg-inputcolor',
                  view === 'positions' ? 'opacity-100' : 'opacity-40'
                )}>{positions?.length ?? 0}</div>

                <span className="opacity-20">|</span>

                <span
                  className={twMerge(
                    'cursor-pointer hover:opacity-100 transition-opacity duration-300',
                    view === 'limitOrder' ? 'opacity-100' : 'opacity-40',
                  )}
                  onClick={() => setView('limitOrder')}
                >
                  Limit orders
                </span>
                <div className={twMerge(
                  'h-4 min-w-4 pl-1.5 pr-1.5 flex items-center justify-center text-center rounded text-xxs bg-inputcolor',
                  view === 'limitOrder' ? 'opacity-100' : 'opacity-40'
                )}>{limitOrderBook?.limitOrders.length ?? 0}</div>

                <span className="opacity-20">|</span>

                <span
                  className={twMerge(
                    'cursor-pointer hover:opacity-100 transition-opacity duration-300',
                    view === 'history' ? 'opacity-100' : 'opacity-40',
                  )}
                  onClick={() => setView('history')}
                >
                  Trade history
                </span>

              </div>

              {view === 'history' ? (
                <div className="mt-1 w-full p-4 flex grow">
                  <PositionsHistory
                    walletAddress={wallet?.publicKey.toBase58() ?? null}
                    connected={connected}
                    exportButtonPosition='top-right'
                  />
                </div>
              ) : null}

              {view === 'limitOrder' ? (
                <div className="mt-1 w-full p-4">
                  <LimitOrder
                    walletAddress={wallet?.publicKey.toBase58() ?? null}
                    limitOrderBook={limitOrderBook}
                    reload={reload}
                  />
                </div>
              ) : null}

              {view === 'positions' ? (
                <div className="mt-1 w-full p-4">
                  <Positions
                    connected={connected}
                    positions={positions}
                    triggerUserProfileReload={triggerUserProfileReload}
                    isBigScreen={isBigScreen}
                    setTokenB={setTokenB}
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
                setTokenA={setTokenA}
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

      <>
        {isBigScreen ? (
          <TradeComp
            className="hidden sm:flex lg:ml-4 lg:min-w-[25%]"
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            tokenA={tokenA}
            tokenB={tokenB}
            setTokenA={setTokenA}
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
        ) : null}

        {/* 651px and 950px */}

        <div className='relative w-full sm:hidden'>
          <div className="fixed left-0 bottom-[2.8125rem] w-full bg-bcolor backdrop-blur-sm p-3 z-30">
            <ul className="flex flex-row gap-3 justify-between ml-4 mr-4">
              <li>
                <Button
                  className="bg-transparent font-boldy border-[#10e1a3] text-[#10e1a3]"
                  title="Long"
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
                  className="bg-transparent font-boldy border-[#f24f4f] text-[#f24f4f]"
                  title="Short"
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
                  className="bg-transparent font-boldy border-white text-white"
                  title="Swap"
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
                  title={`${activePositionModal.charAt(0).toUpperCase() +
                    activePositionModal.slice(1)
                    } Position`}
                  close={() => setActivePositionModal(null)}
                  className="flex flex-col overflow-y-auto"
                >
                  {tokenB && <TradingChartMini token={tokenB} />}
                  <div className="bg-bcolor w-full h-[1px] my-3" />
                  <div className="flex w-full px-4">
                    <TradeComp
                      selectedAction={selectedAction}
                      setSelectedAction={setSelectedAction}
                      tokenA={tokenA}
                      tokenB={tokenB}
                      setTokenA={setTokenA}
                      setTokenB={setTokenB}
                      openedPosition={openedPosition}
                      className="p-0 m-0"
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
      </>
    </div>
  );
}
