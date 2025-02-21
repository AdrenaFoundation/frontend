import { PublicKey, Transaction } from '@solana/web3.js';
import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';
import BN from 'bn.js';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { memo, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { twMerge } from 'tailwind-merge';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import { PRICE_DECIMALS, PROFILE_PICTURES, USD_DECIMALS } from '@/constant';
import usePositionsByAddress from '@/hooks/usePositionsByAddress';
import useUserProfile from '@/hooks/useUserProfile';
import useUserVest from '@/hooks/useUserVest';
import { useDispatch, useSelector } from '@/store/store';
import { AdxLockPeriod, AlpLockPeriod, ClosePositionEvent } from '@/types';
import {
  addNotification,
  formatNumber,
  getTokenSymbolReverse,
  nativeToUi,
  uiLeverageToNative,
  uiToNative,
} from '@/utils';

import nemesisPP from '../../../public/images/nemesis-pp.png';
import AskForConfirmationTool from './UITools/AskForConfirmationTool';
import ClaimADXConfirmationTool from './UITools/ClaimADXConfirmationTool';
import DefaultTool from './UITools/DefaultTool';
import IsConnected from './UITools/IsConnected';
import PositionsListTool from './UITools/PositionsListTool';
import StakeLockTool from './UITools/StakeLockTool';
import UserBalanceTool from './UITools/UserBalanceTool';

const Nemesis = ({ className }: { className?: string }) => {
  const dispatch = useDispatch();
  const wallet = useSelector((s) => s.walletState.wallet);
  const owner: PublicKey | null = wallet
    ? new PublicKey(wallet.walletAddress)
    : null;

  const walletAddress = owner?.toBase58() ?? null;

  const { vestAmounts } = useUserVest(walletAddress);

  const positions = usePositionsByAddress({
    walletAddress,
  });
  const { userProfile } = useUserProfile(walletAddress);

  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const containerRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      maxSteps: 5,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === 'isConnected') {
          return owner ? 'Yes' : 'No';
        }

        //
        // Position tools
        //

        if (toolCall.toolName === 'openPosition') {
          if (!owner) {
            return 'Error: Wallet not connected';
          }
          const args = toolCall.args as {
            side: 'long' | 'short';
            collateralAmount: number;
            tokenSymbol: string;
            collateralTokenSymbol: string;
            tradedTokenSymbol: string;
            leverage: number;
          };

          const side = args?.side;
          const collateralAmountUi = args?.collateralAmount;
          const collateralTokenSymbol = args?.collateralTokenSymbol;
          const tradedTokenSymbol = args?.tradedTokenSymbol;
          const leverage = args?.leverage;
          console.log('args', args);

          //TODO: check if tokens are allowed
          const tokenA = window.adrena.client.getTokenBySymbol(
            collateralTokenSymbol,
          );
          const tokenB = window.adrena.client.getTokenBySymbol(
            getTokenSymbolReverse(tradedTokenSymbol),
          );

          console.log('tokenA', tokenA);
          console.log('tokenB', tokenB);

          if (!tokenA || !tokenB) {
            return 'Error: Token not found';
          }

          if (!collateralAmountUi) {
            return 'Error: Missing required parameters';
          }

          if (side !== 'long' && side !== 'short') {
            return 'Error: Invalid side';
          }

          const notification = MultiStepNotification.newForRegularTransaction(
            side + ' Position Opening',
          ).fire();

          const collateralAmount = uiToNative(
            collateralAmountUi,
            tokenA.decimals,
          );

          const openPositionWithSwapAmountAndFees =
            await window.adrena.client.getOpenPositionWithSwapAmountAndFees({
              collateralMint: tokenA.mint,
              mint: tokenB.mint,
              collateralAmount,
              leverage: uiLeverageToNative(leverage),
              side,
            });

          if (!openPositionWithSwapAmountAndFees) {
            return notification.currentStepErrored('Error calculating fees');
          }

          try {
            await window.adrena.client.openOrIncreasePositionWithSwapLong({
              owner,
              collateralMint: tokenA.mint,
              mint: tokenB.mint,
              price: openPositionWithSwapAmountAndFees.entryPrice,
              collateralAmount,
              leverage: uiLeverageToNative(leverage),
              notification,
            });

            return `Opened ${tradedTokenSymbol} ${side} position with $${collateralAmountUi} worth of ${collateralTokenSymbol}`;
          } catch (error) {
            return 'Failed to open position';
          }
        }

        if (toolCall.toolName === 'getAllUserPositions') {
          return positions?.map((p) => ({
            pubkey: p.pubkey.toBase58(),
            pnl: p.pnl,
            collateralUsd: p.collateralUsd,
            sizeUsd: p.sizeUsd,
            nativeObject: { openTime: p.nativeObject.openTime.toNumber() },
            side: p.side,
            pnlMinusFees: p.pnlMinusFees,
            collateralToken: {
              symbol: p.collateralToken.symbol,
              mint: p.collateralToken.mint.toBase58(),
            },
            token: {
              symbol: p.token.symbol,
              mint: p.token.mint.toBase58(),
            },
          }));
        }

        if (toolCall.toolName === 'closePosition') {
          const args = toolCall.args as {
            pubkey: string;
          };

          if (!positions) {
            return 'Error: No active positions';
          }

          const position = positions.find(
            (p) => p.pubkey.toBase58() === args.pubkey,
          );

          if (!position) {
            return 'Error: Position not found';
          }

          const notification =
            MultiStepNotification.newForRegularTransaction(
              'Close Position',
            ).fire();

          try {
            const priceAndFee = await window.adrena.client.getExitPriceAndFee({
              position,
            });

            if (!priceAndFee) {
              return notification.currentStepErrored(
                'Cannot calculate position closing price',
              );
            }

            // 1%
            const slippageInBps = 100;

            const priceWithSlippage =
              position.side === 'short'
                ? priceAndFee.price
                  .mul(new BN(10_000))
                  .div(new BN(10_000 - slippageInBps))
                : priceAndFee.price
                  .mul(new BN(10_000 - slippageInBps))
                  .div(new BN(10_000));

            await (
              position.side === 'long'
                ? window.adrena.client.closePositionLong.bind(
                  window.adrena.client,
                )
                : window.adrena.client.closePositionShort.bind(
                  window.adrena.client,
                )
            )({
              position,
              price: priceWithSlippage,
              notification,
              getTransactionLogs: (logs) => {
                if (!logs) return;

                const events = logs.events as ClosePositionEvent;

                const profit = nativeToUi(events.profitUsd, USD_DECIMALS);
                const loss = nativeToUi(events.lossUsd, USD_DECIMALS);
                // const exitFeeUsd = nativeToUi(events.exitFeeUsd, USD_DECIMALS);
                // const borrowFeeUsd = nativeToUi(events.borrowFeeUsd, USD_DECIMALS);

                return `Closed position with PnL: $${profit - loss}`;
              },
            });

            return `Closed position`;
          } catch (error) {
            return 'Failed to close position';
          }
        }

        if (toolCall.toolName === 'setTakeProfit') {
          if (!owner || !positions) {
            addNotification({
              title: 'Position not found',
              type: 'error',
              duration: 'fast',
            });
            return 'Failed to set take profit';
          }

          const args = toolCall.args as {
            positionPubkey: string;
            takeProfitPrice: number;
          };

          const position = positions.find(
            (p) => p.pubkey.toBase58() === args.positionPubkey,
          );

          const takeProfitInput = args.takeProfitPrice;

          if (!position) {
            addNotification({
              title: 'Position not found',
              type: 'error',
              message: 'Position not found',
              duration: 'fast',
            });
            return 'Failed to set stop loss';
          }

          const transaction = new Transaction();

          // Handle Take Profit
          {
            const takeProfitSet =
              position.takeProfitIsSet &&
              position.takeProfitLimitPrice &&
              position.takeProfitLimitPrice > 0;

            // Create Take Profit if not set or if it changed
            if (
              (!takeProfitSet && takeProfitInput !== null) ||
              (takeProfitInput !== null &&
                takeProfitInput !== position.takeProfitLimitPrice)
            ) {
              transaction.add(
                await (
                  position.side === 'long'
                    ? window.adrena.client.buildSetTakeProfitLongIx.bind(
                      window.adrena.client,
                    )
                    : window.adrena.client.buildSetTakeProfitShortIx.bind(
                      window.adrena.client,
                    )
                )({
                  position,
                  takeProfitLimitPrice: new BN(
                    takeProfitInput * 10 ** PRICE_DECIMALS,
                  ),
                }),
              );
            }

            // Delete the Take Profit if it was set and is now null
            if (takeProfitSet && takeProfitInput === null) {
              transaction.add(
                await window.adrena.client.buildCancelTakeProfitIx({
                  position,
                }),
              );
            }

            if (transaction.instructions.length === 0) {
              return addNotification({
                title: 'Nothing to do',
                type: 'info',
                message: 'Configuration is already set',
                duration: 'fast',
              });
            }

            const notification =
              MultiStepNotification.newForRegularTransaction('TP').fire();

            try {
              await window.adrena.client.signAndExecuteTxAlternative({
                transaction,
                notification,
              });

              return `Set take profit at ${takeProfitInput}`;
            } catch (error) {
              console.log('error', error);
              return `Failed to set take profit at ${takeProfitInput}`;
            }
          }
        }

        if (toolCall.toolName === 'setStopLoss') {
          if (!owner || !positions) {
            addNotification({
              title: 'Position not found',
              type: 'error',
              duration: 'fast',
            });
            return 'Failed to set stop loss';
          }

          const args = toolCall.args as {
            positionPubkey: string;
            stopLossPrice: number;
          };

          const position = positions.find(
            (p) => p.pubkey.toBase58() === args.positionPubkey,
          );

          const stopLossInput = args.stopLossPrice;

          if (!position) {
            addNotification({
              title: 'Position not found',
              type: 'error',
              message: 'Position not found',
              duration: 'fast',
            });
            return 'Failed to set stop loss';
          }

          const transaction = new Transaction();

          // Handle Stop Loss
          {
            const stopLossSet =
              position.stopLossIsSet &&
              position.stopLossLimitPrice &&
              position.stopLossLimitPrice > 0;

            const slippageMultiplier = position.side === 'long' ? 0.99 : 1.01;
            const adjustedStopLossPrice = stopLossInput
              ? stopLossInput * slippageMultiplier
              : null;

            // Create Stop loss if not set or if it changed
            if (
              (!stopLossSet && stopLossInput !== null) ||
              (stopLossInput !== null &&
                stopLossInput !== position.stopLossLimitPrice)
            ) {
              transaction.add(
                await (
                  position.side === 'long'
                    ? window.adrena.client.buildSetStopLossLongIx.bind(
                      window.adrena.client,
                    )
                    : window.adrena.client.buildSetStopLossShortIx.bind(
                      window.adrena.client,
                    )
                )({
                  position,
                  stopLossLimitPrice: new BN(
                    stopLossInput * 10 ** PRICE_DECIMALS,
                  ),
                  closePositionPrice: new BN(
                    (adjustedStopLossPrice
                      ? adjustedStopLossPrice
                      : stopLossInput) *
                    10 ** PRICE_DECIMALS,
                  ),
                }),
              );
            }

            // Delete the Stop Loss if it was set and is now null
            if (stopLossSet && stopLossInput === null) {
              console.log('Cancel stop loss');

              transaction.add(
                await window.adrena.client.buildCancelStopLossIx({
                  position,
                }),
              );
            }
          }

          if (transaction.instructions.length === 0) {
            return addNotification({
              title: 'Nothing to do',
              type: 'info',
              message: 'Configuration is already set',
              duration: 'fast',
            });
          }

          const notification =
            MultiStepNotification.newForRegularTransaction('SL').fire();

          try {
            await window.adrena.client.signAndExecuteTxAlternative({
              transaction,
              notification,
            });

            return `Set stop loss at ${stopLossInput}`;
          } catch (error) {
            console.log('error', error);
            return `Failed to set stop loss at ${stopLossInput}`;
          }
        }

        //
        // ALP
        //

        if (toolCall.toolName === 'addLiquidity') {
          if (!owner) {
            return;
          }

          const args = toolCall.args as {
            collateralToken: string;
            collateralInput: number;
          };

          // TODO: check for only allowed tokens
          const collateralToken = window.adrena.client.getTokenBySymbol(
            args.collateralToken,
          );
          const collateralInput = args.collateralInput;

          if (!collateralToken || !collateralInput) {
            return 'Error: Invalid token or input';
          }

          const notification =
            MultiStepNotification.newForRegularTransaction(
              'Add Liquidity',
            ).fire();

          try {
            await window.adrena.client.addLiquidity({
              owner,
              amountIn: uiToNative(collateralInput, collateralToken.decimals),
              mint: collateralToken.mint,

              // TODO: Apply proper slippage
              minLpAmountOut: new BN(0),
              notification,
            });
          } catch (error) {
            console.log('error', error);
          }

          return `Added ${collateralInput} ${collateralToken.symbol} to the pool`;
        }

        //
        // Vest
        //

        if (toolCall.toolName === 'claimVest') {
          if (!owner) {
            return;
          }

          const notification =
            MultiStepNotification.newForRegularTransaction('Claim Vest').fire();

          try {
            await window.adrena.client.claimUserVest({
              notification,
              targetWallet: undefined,
              owner,
            });
            return `Claimed ${vestAmounts.claimableAmount} ADX`;
          } catch (error) {
            return `Failed to claim ${formatNumber(vestAmounts.claimableAmount, 2)} ADX`;
          }
        }

        //
        // staking
        //

        if (toolCall.toolName === 'stake') {
          if (!owner) {
            return;
          }

          const args = toolCall.args as {
            amount: number;
            days: number;
            stakedToken: 'ADX' | 'ALP';
          };

          const amount = args?.amount;
          const days = args?.days;
          const stakedToken = args?.stakedToken;

          if (!amount) {
            return 'Error: Missing amount';
          }

          if (typeof days === 'undefined' || days === null) {
            return 'Error: Missing amount of days to lock';
          }

          if (!stakedToken) {
            return 'Error: Missing';
          }

          const stakedTokenMint =
            stakedToken === 'ALP'
              ? window.adrena.client.alpToken.mint
              : window.adrena.client.adxToken.mint;

          const notification = MultiStepNotification.newForRegularTransaction(
            `Stake ${stakedToken}`,
          ).fire();

          if (days === 0 && stakedToken === 'ADX') {
            await window.adrena.client.addLiquidStake({
              owner,
              amount,
              stakedTokenMint,
              notification,
            });
          } else {
            await window.adrena.client.addLockedStake({
              owner,
              amount,
              lockedDays: days as AdxLockPeriod | AlpLockPeriod,
              stakedTokenMint,
              notification,
            });
          }

          return days === 0
            ? `Liquid Staked ${amount} ADX`
            : `Staked ${amount} ADX for ${days} days`;
        }

        //
        // utils
        //

        if (toolCall.toolName === 'getUserWalletBalance') {
          if (!owner) {
            return null;
          }

          dispatch(fetchWalletTokenBalances());
          console.log('walletTokenBalances', walletTokenBalances);
          return walletTokenBalances;
        }
      },
    });

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={twMerge(
        'flex flex-col gap-5 justify-between h-full w-full p-3 overflow-hidden grow',
        className,
      )}
    >
      <div
        className="flex flex-col gap-2 overflow-hidden overflow-y-auto custom-chat-scrollbar pb-[50px] grow"
        ref={containerRef}
      >
        {messages && messages.length > 0 ? (
          messages.map((m: Message) => (
            <div key={m.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-row gap-2 items-start mb-2"
              >
                {m.role === 'assistant' ? (
                  <Image
                    src={nemesisPP}
                    width={24}
                    height={24}
                    alt="avatar"
                    className="rounded-full border border-bcolor"
                  />
                ) : (
                  <Image
                    src={
                      PROFILE_PICTURES[
                      userProfile ? userProfile.profilePicture : 0
                      ]
                    }
                    width={24}
                    height={24}
                    alt="avatar"
                    className="rounded-full border border-bcolor"
                  />
                )}
                <div
                  className={twMerge(
                    'flex flex-col gap-2',
                    m.role === 'user' &&
                    'bg-[#172430] border border-[#1D2A37] px-2 rounded-full',
                  )}
                >
                  <Markdown
                    components={{
                      p: ({ children }) => (
                        <p className="text-base font-boldy">{children}</p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="font-boldy">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-boldy">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-boldy">{children}</h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="font-boldy">{children}</h4>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc mb-2">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="ml-4 text-sm ">{children}</li>
                      ),
                    }}
                  >
                    {m.content}
                  </Markdown>
                </div>
              </motion.div>
              {m.toolInvocations ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="border rounded-lg overflow-hidden mb-2 bg-[#081018]"
                >
                  <div className="flex flex-row gap-2 justify-between  p-2 px-3 border-b">
                    <p className="text-xs font-mono opacity-50">Total steps</p>
                    <p className="text-xs font-mono opacity-50">
                      {m.toolInvocations.length}
                    </p>
                  </div>

                  {m.toolInvocations.map(
                    (toolInvocation: ToolInvocation, i) => {
                      const toolCallId = toolInvocation.toolCallId;

                      const addResult = (result: string) =>
                        addToolResult({ toolCallId, result });

                      const totalSteps = m.toolInvocations
                        ? m.toolInvocations.length
                        : 0;

                      switch (toolInvocation.toolName) {
                        case 'isConnected':
                          return (
                            <IsConnected
                              toolInvocation={toolInvocation}
                              i={i}
                              sep={i !== totalSteps - 1}
                            />
                          );
                        case 'askForClaimVestedADXConfirmation':
                          return (
                            <ClaimADXConfirmationTool
                              toolInvocation={toolInvocation}
                              i={i}
                              addResult={addResult}
                              sep={i !== totalSteps - 1}
                              vestAmounts={vestAmounts}
                            />
                          );
                        case 'askForConfirmation':
                          return (
                            <AskForConfirmationTool
                              toolInvocation={toolInvocation}
                              i={i}
                              addResult={addResult}
                              sep={i !== totalSteps - 1}
                            />
                          );

                        case 'askHowManyDaysToStakeALP':
                          return (
                            <StakeLockTool
                              toolInvocation={toolInvocation}
                              i={i}
                              addResult={addResult}
                              sep={i !== totalSteps - 1}
                              token="ALP"
                            />
                          );

                        case 'askHowManyDaysToStakeADX':
                          return (
                            <StakeLockTool
                              toolInvocation={toolInvocation}
                              i={i}
                              addResult={addResult}
                              sep={i !== totalSteps - 1}
                              token="ADX"
                            />
                          );

                        case 'getUserWalletBalance':
                          return (
                            <UserBalanceTool
                              toolInvocation={toolInvocation}
                              i={i}
                              sep={i !== totalSteps - 1}
                            />
                          );
                        case 'getAllUserPositions':
                          return (
                            <PositionsListTool
                              toolInvocation={toolInvocation}
                              i={i}
                              sep={i !== totalSteps - 1}
                            />
                          );
                        default:
                          return (
                            <DefaultTool
                              toolInvocation={toolInvocation}
                              i={i}
                              sep={i !== totalSteps - 1}
                            />
                          );
                      }
                    },
                  )}
                </motion.div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <h1
              className={twMerge(
                'text-[1em] font-archivoblack bg-[linear-gradient(110deg,#2C4852,45%,#F9F3A5,55%,#2C4852)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
              )}
            >
              N.E.M.E.S.I.S
            </h1>
            <p className="font-mono opacity-50">Adrena's AI assistant</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="bg-secondary w-full max-w-md p-2 px-4 border border-bcolor rounded-lg shadow-xl mt-auto text-sm font-boldy z-20"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}

export default memo(Nemesis);