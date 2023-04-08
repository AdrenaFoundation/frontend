import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import PositionDetails from '@/components/pages/trading/PositionDetails/PositionDetails';
import Positions from '@/components/pages/trading/Positions/Positions';
import SwapDetails from '@/components/pages/trading/SwapDetails/SwapDetails';
import TradingChart from '@/components/pages/trading/TradingChart/TradingChart';
import TradingChartHeader from '@/components/pages/trading/TradingChartHeader/TradingChartHeader';
import TradingInputs from '@/components/pages/trading/TradingInputs/TradingInputs';
import useAdrenaClient from '@/hooks/useAdrenaClient';
import useConnection from '@/hooks/useConnection';
import useListenToPythTokenPricesChange from '@/hooks/useListenToPythTokenPricesChange';
import usePositions from '@/hooks/usePositions';
import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';
import { useDispatch, useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  uiToNative,
} from '@/utils';

type Action = 'long' | 'short' | 'swap';

export default function Trade() {
  const connection = useConnection();
  const client = useAdrenaClient();
  const { positions, triggerPositionsReload } = usePositions(client);
  const dispatch = useDispatch();

  useListenToPythTokenPricesChange(client, connection);
  useWatchWalletBalance(client, connection);

  const [selectedAction, setSelectedAction] = useState<Action>('long');
  const wallet = useSelector((s) => s.walletState.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [inputAValue, setInputAValue] = useState<number | null>(null);
  const [inputBValue, setInputBValue] = useState<number | null>(null);
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);

  // There is one position max per side per custody
  // If the position exist for the selected custody, store it in this variable
  const [openedPosition, setOpenedPosition] = useState<PositionExtended | null>(
    null,
  );

  // Unused for now
  const [leverage, setLeverage] = useState<number | null>(null);

  // Setup
  useEffect(() => {
    if (!client) return;

    if (!tokenA) {
      setTokenA(client.tokens[0]);
    }

    if (!tokenB) {
      setTokenB(
        selectedAction === 'swap'
          ? client.tokens[0]
          : client.tokens.filter((t) => !t.isStable)[0],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only call when the user get initialized or we change of action
    client,
    selectedAction,
  ]);

  // Check for opened position
  useEffect(() => {
    if (!tokenB) return;
    if (!positions) return setOpenedPosition(null);

    const relatedPosition = positions.find((position) =>
      position.token.mint.equals(tokenB.mint),
    );

    setOpenedPosition(relatedPosition ?? null);
  }, [positions, tokenB]);

  const handleExecuteButton = async (): Promise<void> => {
    if (!connected || !client || !dispatch) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    if (!tokenA || !tokenB || !inputAValue || !inputBValue || !leverage) {
      return addNotification({
        type: 'info',
        title: 'Cannot open position',
        message: 'Missing informations',
      });
    }

    const tokenBPrice = tokenPrices[tokenB.name];
    if (!tokenBPrice) {
      return addNotification({
        type: 'info',
        title: 'Cannot open position',
        message: `Missing ${tokenB.name} price`,
      });
    }

    if (selectedAction === 'swap') {
      try {
        const txHash = await client.swap({
          owner: new PublicKey(wallet.walletAddress),
          amountIn: uiToNative(inputAValue, tokenA.decimals),

          // TODO
          // How to handle slippage?
          // the inputBValue should take fees into account, for now it doesn't.
          minAmountOut: new BN(0),
          mintA: tokenA.mint,
          mintB: tokenB.mint,
        });

        return addSuccessTxNotification({
          title: 'Successfull Swap',
          txHash,
        });
      } catch (error) {
        return addFailedTxNotification({
          title: 'Error Swapping',
          error,
        });
      }
    }

    const entryPriceAndFee = await client.getEntryPriceAndFee({
      token: tokenB,
      collateral: uiToNative(inputBValue, tokenB.decimals).div(
        new BN(leverage),
      ),
      size: uiToNative(inputBValue, tokenB.decimals),
      side: selectedAction,
    });

    if (!entryPriceAndFee) {
      return addNotification({
        type: 'info',
        title: 'Cannot calculate entry price',
      });
    }

    // Position is already opened, add collateral to it
    if (openedPosition) {
      try {
        const txHash = await client.swapAndAddCollateralToPosition({
          position: openedPosition,
          mintIn: tokenA.mint,
          amountIn: uiToNative(inputAValue, tokenA.decimals),
          // TODO
          // How to handle slippage?
          // the inputBValue should take fees into account, for now it doesn't.
          minAmountOut: new BN(0),
          addedCollateral: uiToNative(inputBValue, tokenB.decimals).div(
            new BN(leverage),
          ),
        });

        triggerPositionsReload();

        return addSuccessTxNotification({
          title: 'Successfully Increase Position',
          txHash,
        });
      } catch (error) {
        return addFailedTxNotification({
          title: 'Error Increasing Position',
          error,
        });
      }
    }

    try {
      const txHash = await client.openPositionWithSwap({
        owner: new PublicKey(wallet.walletAddress),
        mintA: tokenA.mint,
        mintB: tokenB.mint,
        amountA: uiToNative(inputAValue, tokenA.decimals),
        price: entryPriceAndFee.entryPrice,
        collateral: uiToNative(inputBValue, tokenB.decimals).div(
          new BN(leverage),
        ),
        size: uiToNative(inputBValue, tokenB.decimals),
        side: selectedAction,
      });

      triggerPositionsReload();

      return addSuccessTxNotification({
        title: 'Successfully Opened Position',
        txHash,
      });
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Opening Position',
        error,
      });
    }
  };

  const buttonTitle = (() => {
    // If wallet not connected, then user need to connect wallet
    if (!connected) {
      return 'Connect wallet';
    }

    if (inputAValue === null || inputBValue === null) {
      return 'Enter an amount';
    }

    // Loading, should happens quickly
    if (!tokenA) {
      return '...';
    }

    const walletTokenABalance = walletTokenBalances?.[tokenA.name];

    // Loading, should happens quickly
    if (typeof walletTokenABalance === 'undefined') {
      return '...';
    }

    // If user wallet balance doesn't have enough tokens, tell user
    if (!walletTokenABalance || inputAValue > walletTokenABalance) {
      return `Insufficient ${tokenA.name} balance`;
    }

    if (openedPosition) {
      if (selectedAction === 'short') {
        return 'Reduce Position';
      }
      if (selectedAction === 'long') {
        return 'Increase Position';
      }
    }

    if (selectedAction === 'swap') {
      return 'Swap';
    }

    return 'Open Position';
  })();

  return (
    <div
      className={twMerge(
        'w-full',
        'h-full',
        'flex',
        'bg-main',
        'p-4',
        'overflow-auto',
        'flex-col',
        'items-center',
        'xl:flex-row',
        'xl:justify-center',
        'xl:items-start',
      )}
    >
      <div
        className={twMerge(
          'flex',
          'flex-col',
          'w-full',
          'xl:w-[60%]',
          'xl:max-w-[60em]',
        )}
      >
        {/* Trading chart header */}
        {client && tokenB ? (
          <TradingChartHeader
            className="mb-4 pl-4 pr-4"
            tokenList={
              selectedAction === 'short' || selectedAction === 'long'
                ? client.tokens.filter((t) => !t.isStable)
                : client.tokens
            }
            selected={tokenB}
            onChange={(t: Token) => {
              setTokenB(t);
            }}
            client={client}
          />
        ) : null}

        <div
          className={twMerge(
            'h-[60em]',
            'shrink-1',
            'grow',
            'bg-main',
            'flex',
            'max-w-full',
            'max-h-[30em]',
          )}
        >
          {/* Display trading chart for appropriate token */}
          {tokenA && tokenB ? (
            <>
              {selectedAction === 'short' || selectedAction === 'long' ? (
                <TradingChart token={tokenB} />
              ) : null}

              {selectedAction === 'swap' ? (
                <TradingChart token={tokenA.isStable ? tokenB : tokenA} />
              ) : null}
            </>
          ) : null}
        </div>

        <>
          {positions ? (
            <>
              <div className="mb-4">Positions ({positions.length})</div>

              <Positions
                positions={positions}
                client={client}
                triggerPositionsReload={triggerPositionsReload}
              />
            </>
          ) : null}
        </>
      </div>

      <div className="flex flex-col mt-4 xl:ml-4 xl:mt-0">
        <div
          className={twMerge(
            'w-[26em]',
            'bg-secondary',
            'p-4',
            'border',
            'border-grey',
          )}
        >
          <TabSelect
            selected={selectedAction}
            tabs={[
              { title: 'long', icon: '/images/long.svg' },
              { title: 'short', icon: '/images/short.svg' },
              { title: 'swap', icon: '/images/swap.svg' },
            ]}
            onClick={(title) => {
              setSelectedAction(title);
            }}
          />

          {client && client.tokens.length && tokenA && tokenB && (
            <>
              <TradingInputs
                className="mt-4"
                actionType={selectedAction}
                allowedTokenA={client.tokens}
                allowedTokenB={
                  selectedAction === 'swap'
                    ? client.tokens
                    : client.tokens.filter((t) => !t.isStable)
                }
                tokenA={tokenA}
                tokenB={tokenB}
                openedPosition={openedPosition}
                onChangeInputA={setInputAValue}
                onChangeInputB={setInputBValue}
                setTokenA={setTokenA}
                setTokenB={setTokenB}
                onChangeLeverage={setLeverage}
                client={client}
              />
            </>
          )}

          {/* Button to execute action */}
          <Button
            className="mt-4 bg-highlight text-sm"
            title={buttonTitle}
            activateLoadingIcon={true}
            onClick={handleExecuteButton}
          />
        </div>

        {/* Position details */}
        <div
          className={twMerge(
            'w-[26em]',
            'mt-4',
            'bg-secondary',
            'border',
            'border-grey',
          )}
        >
          <div className="flex items-center border-b border-grey p-3">
            <span className="capitalize">{selectedAction}</span>

            {selectedAction === 'short' || selectedAction === 'long' ? (
              <span className="ml-1">{tokenB?.name ?? '-'}</span>
            ) : null}
          </div>

          {tokenA && tokenB ? (
            <>
              {selectedAction === 'short' || selectedAction === 'long' ? (
                <PositionDetails
                  className="p-4"
                  tokenB={tokenB}
                  entryPrice={
                    tokenB &&
                    inputBValue &&
                    tokenPrices &&
                    tokenPrices[tokenB.name]
                      ? tokenPrices[tokenB.name]
                      : null
                  }
                  exitPrice={
                    tokenB &&
                    inputBValue &&
                    tokenPrices &&
                    tokenPrices[tokenB.name]
                      ? tokenPrices[tokenB.name]
                      : null
                  }
                  client={client}
                />
              ) : (
                <SwapDetails tokenA={tokenA} tokenB={tokenB} client={client} />
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
