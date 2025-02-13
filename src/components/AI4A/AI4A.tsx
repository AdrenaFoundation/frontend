import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import { ADX_LOCK_PERIODS, PRICE_DECIMALS } from '@/constant';
import useUserVest from '@/hooks/useUserVest';
import { useDispatch, useSelector } from '@/store/store';
import { AdxLockPeriod, PositionExtended } from '@/types';
import { addNotification, formatNumber } from '@/utils';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';
import { twMerge } from 'tailwind-merge';
import WalletConnection from '../WalletAdapter/WalletConnection';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fetchWalletTokenBalances } from '@/actions/thunks';
import Markdown from 'react-markdown';
import usePositionsByAddress from '@/hooks/usePositionsByAddress';
import BN from 'bn.js';

export default function AI4A() {
  const dispatch = useDispatch();
  const wallet = useSelector((s) => s.walletState.wallet);
  const owner: PublicKey | null = wallet
    ? new PublicKey(wallet.walletAddress)
    : null;

  const { vestAmounts } = useUserVest(owner?.toBase58() ?? null);
  const positions = usePositionsByAddress({
    walletAddress: owner?.toBase58() ?? null,
  });

  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      maxSteps: 5,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === 'isConnected') {
          return owner ? 'Yes' : 'No';
        }

        if (toolCall.toolName === 'getAllPositionPubkeys') {
          return positions?.map((p) => p.pubkey.toBase58());
        }

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

        if (toolCall.toolName === 'getUserWalletBalance') {
          if (!owner) {
            return null;
          }
          console.log('fetching wallet token balances...', walletTokenBalances);

          dispatch(fetchWalletTokenBalances());
          return walletTokenBalances;
        }

        if (toolCall.toolName === 'setStopLoss') {
          if (!owner || !positions) {
            addNotification({
              title: 'Position not found',
              type: 'error',
              message: 'Position not found',
              duration: 'fast',
            });
            return 'Failed to set stop loss';
          }

          const position = positions.find(
            //@ts-ignore
            (p) => p.pubkey.toBase58() === toolCall.args?.positionPubkey,
          );
          //@ts-ignore
          const stopLossInput = toolCall.args?.stopLossPrice;

          console.log('position', position);
          console.log('stopLossInput', stopLossInput);
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
          // {
          //   const takeProfitSet =
          //     position.takeProfitIsSet &&
          //     position.takeProfitLimitPrice &&
          //     position.takeProfitLimitPrice > 0;

          //   // Create Take Profit if not set or if it changed
          //   if (
          //     (!takeProfitSet && takeProfitInput !== null) ||
          //     (takeProfitInput !== null &&
          //       takeProfitInput !== position.takeProfitLimitPrice)
          //   ) {
          //     transaction.add(
          //       await (position.side === 'long'
          //         ? window.adrena.client.buildSetTakeProfitLongIx.bind(
          //           window.adrena.client,
          //         )
          //         : window.adrena.client.buildSetTakeProfitShortIx.bind(
          //           window.adrena.client,
          //         ))({
          //           position,
          //           takeProfitLimitPrice: new BN(
          //             takeProfitInput * 10 ** PRICE_DECIMALS,
          //           ),
          //         }),
          //     );
          //   }

          //   // Delete the Take Profit if it was set and is now null
          //   if (takeProfitSet && takeProfitInput === null) {
          //     transaction.add(
          //       await window.adrena.client.buildCancelTakeProfitIx({
          //         position,
          //       }),
          //     );
          //   }
          // }

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
            MultiStepNotification.newForRegularTransaction('TP/SL').fire();

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

        if (toolCall.toolName === 'stakeADX') {
          if (!owner) {
            return;
          }

          //@ts-ignore
          const amount = toolCall.args?.amount ?? null;
          //@ts-ignore
          const days = toolCall.args?.days ?? null;
          const stakedTokenMint = window.adrena.client.adxToken.mint;

          const notification =
            MultiStepNotification.newForRegularTransaction('Stake ADX').fire();

          if (days === 0) {
            await window.adrena.client.addLiquidStake({
              owner,
              amount,
              stakedTokenMint: window.adrena.client.adxToken.mint,
              notification,
            });
          } else {
            await window.adrena.client.addLockedStake({
              owner,
              amount,
              lockedDays: days as AdxLockPeriod,
              stakedTokenMint,
              notification,
            });
          }

          return days === 0
            ? `Liquid Staked ${amount} ADX`
            : `Staked ${amount} ADX for ${days} days`;
        }
      },
    });

  const TOKEN_SYMBOL: { [key: string]: string } = {
    JITOSOL:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/jitosol.png',
    USDC: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/usdc.svg',
    BONK: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/bonk.png',
    WBTC: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wbtc.png',
    SOL: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/sol.png',
    BTC: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/btc.svg',
    ADX: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/adx.svg',
    ALP: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/alp.svg',
  };

  return (
    <div className="flex flex-col gap-5 justify-between w-full max-w-md h-full p-3 overflow-hidden">
      {/* {messages?.map((m: Message) => (
        <div key={m.id} className='text-xs opacity-50 mb-3 font-mono bg-slate-500 w-fit'>
          {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
            switch (toolInvocation.state) {
              case 'partial-call':
                return <>render partial tool call</>;
              case 'call':
                return <>render full tool call</>;
              case 'result':
                return <>render tool result</>;
            }
          })}
        </div>
      ))} */}

      <div className="flex flex-col gap-2 overflow-hidden overflow-y-auto custom-chat-scrollbar pb-[100px]">
        {messages?.map((m: Message) => (
          <div key={m.id}>
            <div className="flex flex-row gap-2 items-center">
              {/* <Image
                src={window.adrena.client.adxToken.image}
                width={24}
                height={24}
                alt="avatar"
              /> */}
              <p
                className={twMerge(
                  'inline-block mr-2 font-mono',
                  m.role === 'assistant' ? 'text-red' : 'text-blue',
                )}
              >
                {m.role === 'assistant' ? 'N.E.M.E.S.I.S' : m.role}:
              </p>
            </div>
            <Markdown
              components={{
                p: ({ children }) => (
                  <p className="text-base font-boldy mb-2">{children}</p>
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

            {m.toolInvocations ? (
              <div className="border rounded-lg overflow-hidden">
                {m.toolInvocations.map((toolInvocation: ToolInvocation, i) => {
                  const toolCallId = toolInvocation.toolCallId;
                  const addResult = (result: string) =>
                    addToolResult({ toolCallId, result });

                  // render confirmation tool (client-side tool with user interaction)
                  if (
                    toolInvocation.toolName ===
                    'askForClaimVestedADXConfirmation'
                  ) {
                    return (
                      <div
                        key={toolCallId}
                        className={twMerge(
                          'flex flex-col gap-2 p-3',
                          m.toolInvocations?.length &&
                          i !== m.toolInvocations.length - 1 &&
                          'border-b',
                        )}
                      >
                        <div className="flex flex-row gap-2 items-center">
                          <div
                            className={twMerge(
                              'flex items-center justify-center rounded-full p-2 bg-white/10 border border-white/20 w-4 h-4 mr-2 transition duration-300',
                              'result' in toolInvocation && 'bg-green',
                            )}
                          >
                            <p
                              className={twMerge(
                                'font-mono text-xxs opacity-50 transition-opacity duration-300',
                                'result' in toolInvocation && 'opacity-100',
                              )}
                            >
                              {i + 1}
                            </p>
                          </div>

                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 0.5, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-xs opacity-50 font-mono"
                          >
                            {toolInvocation?.args?.message}
                          </motion.p>
                        </div>

                        {'result' in toolInvocation ? (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="font-boldy ml-[2.2rem]"
                          >
                            {toolInvocation.result}
                          </motion.p>
                        ) : null}

                        {!('result' in toolInvocation) ? (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                          >
                            <div className="flex flex-row gap-2 items-center">
                              <Image
                                src={TOKEN_SYMBOL['ADX']}
                                width={16}
                                height={16}
                                alt="ADX icon"
                              />
                              <FormatNumber
                                nb={vestAmounts.claimableAmount}
                                suffix="ADX"
                                className="text-lg"
                              />
                            </div>

                            <div className="flex flex-row gap-3 mt-3 w-full">
                              <Button
                                variant="primary"
                                title="Claim"
                                className="w-full"
                                onClick={() => addResult('Yes')}
                              />
                              <Button
                                variant="outline"
                                title="Abort"
                                className="w-full"
                                onClick={() => addResult('No')}
                              />
                            </div>
                          </motion.div>
                        ) : null}
                      </div>
                    );
                  }

                  if (toolInvocation.toolName === 'askForConfirmation') {
                    return (
                      <div
                        key={toolCallId}
                        className={twMerge(
                          'flex flex-col gap-2 p-3',
                          m.toolInvocations?.length &&
                          i !== m.toolInvocations.length - 1 &&
                          'border-b',
                        )}
                      >
                        <div className="flex flex-row gap-2 items-center">
                          <div
                            className={twMerge(
                              'flex items-center justify-center rounded-full p-2 bg-white/10 border border-white/20 w-4 h-4 mr-2 transition duration-300',
                              'result' in toolInvocation && 'bg-green',
                            )}
                          >
                            <p
                              className={twMerge(
                                'font-mono text-xxs opacity-50 transition-opacity duration-300',
                                'result' in toolInvocation && 'opacity-100',
                              )}
                            >
                              {i + 1}
                            </p>
                          </div>
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 0.5, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="opacity-50 font-mono"
                          >
                            {toolInvocation?.args?.message}
                          </motion.p>
                        </div>
                        <div>
                          {'result' in toolInvocation ? (
                            <motion.p
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="font-boldy ml-[2.2rem]"
                            >
                              {toolInvocation.result}
                            </motion.p>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex flex-row gap-3 mt-3 w-full"
                            >
                              <Button
                                variant="primary"
                                title="Yes"
                                className="w-full"
                                onClick={() => addResult('Yes')}
                              />
                              <Button
                                variant="outline"
                                title="No"
                                className="w-full"
                                onClick={() => addResult('No')}
                              />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (toolInvocation.toolName === 'askHowManyDaysToStakeADX') {
                    return (
                      <div
                        key={toolCallId}
                        className={twMerge(
                          'flex flex-col gap-3 p-3',
                          m.toolInvocations?.length &&
                          i !== m.toolInvocations.length - 1 &&
                          'border-b',
                        )}
                      >
                        <div className="flex flex-row gap-2 items-center">
                          <div
                            className={twMerge(
                              'flex items-center justify-center rounded-full p-2 bg-white/10 border border-white/20 w-4 h-4 mr-2 transition duration-300',
                              'result' in toolInvocation && 'bg-green',
                            )}
                          >
                            <p
                              className={twMerge(
                                'font-mono text-xxs opacity-50 transition-opacity duration-300',
                                'result' in toolInvocation && 'opacity-100',
                              )}
                            >
                              {i + 1}
                            </p>
                          </div>

                          <p className="font-xs font-mono opacity-50">
                            Choose one of the following days to lock your adx
                          </p>
                        </div>

                        <div>
                          {'result' in toolInvocation ? (
                            <p className="font-boldy ml-[2.2rem]">
                              {toolInvocation.result} days
                            </p>
                          ) : (
                            <div className="flex flex-row gap-3 items-center ">
                              {ADX_LOCK_PERIODS.map((d) => (
                                <Button
                                  key={d}
                                  title={`${d}d`}
                                  variant="secondary"
                                  rounded={false}
                                  className="flex-grow text-xs bg-third border border-white/10 hover:border-white/20 rounded-lg flex-1 font-mono"
                                  onClick={() => addResult(String(d))}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (toolInvocation.toolName === 'isConnected') {
                    return (
                      <div
                        key={toolCallId}
                        className={twMerge(
                          'flex flex-row gap-2 items-center bg-secondary w-full p-3',
                          m.toolInvocations?.length &&
                          i !== m.toolInvocations.length - 1 &&
                          'border-b',
                        )}
                      >
                        <div
                          className={twMerge(
                            'flex items-center justify-center rounded-full p-2 bg-white/10 border border-white/20 w-4 h-4 mr-2 transition duration-300',
                            'result' in toolInvocation && 'bg-green',
                          )}
                        >
                          <p
                            className={twMerge(
                              'font-mono text-xxs opacity-50 transition-opacity duration-300',
                              'result' in toolInvocation && 'opacity-100',
                            )}
                          >
                            {i + 1}
                          </p>
                        </div>

                        {!('result' in toolInvocation) ? (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-row items-center justify-between w-full"
                          >
                            <p className="font-mono text-orange">
                              checking wallet balance...
                            </p>
                          </motion.div>
                        ) : null}

                        {'result' in toolInvocation ? (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {toolInvocation.result === 'Yes' ? (
                              <div className="flex flex-row items-center gap-2 justify-between w-full">
                                <p className="font-mono text-green">
                                  Wallet Connected
                                </p>
                              </div>
                            ) : (
                              <WalletConnection disableSubtext={true} />
                            )}
                          </motion.div>
                        ) : null}
                      </div>
                    );
                  }

                  if (toolInvocation.toolName === 'getUserWalletBalance') {
                    return (
                      <div
                        key={toolCallId}
                        className={twMerge(
                          'flex flex-row gap-2 items-center bg-secondary w-full p-3',
                          m.toolInvocations?.length &&
                          i !== m.toolInvocations.length - 1 &&
                          'border-b',
                        )}
                      >
                        <div
                          className={twMerge(
                            'flex items-center justify-center rounded-full p-2 bg-white/10 border border-white/20 w-4 h-4 mr-2 transition duration-300',
                            'result' in toolInvocation && 'bg-green',
                          )}
                        >
                          <p
                            className={twMerge(
                              'font-mono text-xxs opacity-50 transition-opacity duration-300',
                              'result' in toolInvocation && 'opacity-100',
                            )}
                          >
                            {i + 1}
                          </p>
                        </div>

                        {!('result' in toolInvocation) ? (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-row items-center justify-between w-full"
                          >
                            <p className="font-mono text-orange">
                              checking wallet balance...
                            </p>
                          </motion.div>
                        ) : null}

                        {'result' in toolInvocation ? (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-row items-center gap-5 flex-wrap w-full"
                          >
                            {Object.keys(toolInvocation.result).map((token) => {
                              if (!toolInvocation.result[token]) {
                                return null;
                              }
                              return (
                                <div
                                  key={token}
                                  className="flex flex-row items-center gap-1"
                                >
                                  <img
                                    src={TOKEN_SYMBOL[token]}
                                    width={12}
                                    height={12}
                                    alt="token icon"
                                  />

                                  <FormatNumber
                                    nb={toolInvocation.result[token]}
                                    suffix={token}
                                  />
                                </div>
                              );
                            })}
                          </motion.div>
                        ) : null}
                      </div>
                    );
                  }
                  // other tools:
                  return (
                    <div
                      className={twMerge(
                        'flex flex-row items-center gap-3 w-full p-3',
                        m.toolInvocations?.length &&
                        i !== m.toolInvocations.length - 1 &&
                        'border-b',
                      )}
                    >
                      <div
                        className={twMerge(
                          'flex items-center justify-center rounded-full p-2 bg-white/10 border border-white/20 w-4 h-4 mr-2 transition duration-300',
                          'result' in toolInvocation && 'bg-green',
                        )}
                      >
                        <p
                          className={twMerge(
                            'font-mono text-xxs opacity-50 transition-opacity duration-300',
                            'result' in toolInvocation && 'opacity-100',
                          )}
                        >
                          {i + 1}
                        </p>
                      </div>

                      {'result' in toolInvocation ? (
                        <motion.div
                          key={toolCallId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.3 }}
                        >
                          {typeof toolInvocation.result === 'object' ? (
                            JSON.stringify(toolInvocation.result)
                          ) : (
                            <p
                              className={twMerge(
                                'font-mono',
                                toolInvocation.result.includes('Failed')
                                  ? 'text-red'
                                  : 'text-green',
                              )}
                            >
                              {toolInvocation.result}
                            </p>
                          )}
                        </motion.div>
                      ) : null}

                      {!('result' in toolInvocation) ? (
                        <motion.div
                          key={toolCallId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="font-mono text-orange">
                            Calling {toolInvocation.toolName}...
                          </p>
                        </motion.div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="bg-secondary w-full max-w-md p-2 px-4 border border-bcolor rounded-lg shadow-xl mt-auto text-sm font-boldy"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
