import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { VestExtended } from '@/types';
import { nativeToUi } from '@/utils';
import { PublicKey } from '@solana/web3.js';
import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Chat() {
  const wallet = useSelector((s) => s.walletState.wallet);

  const [userVest, setUserVest] = useState<VestExtended | null>(null);
  const [amounts, setAmounts] = useState<{
    amount: number;
    claimedAmount: number;
    claimableAmount: number;
  }>({
    amount: 0,
    claimedAmount: 0,
    claimableAmount: 0,
  });
  const owner: PublicKey | null = wallet
    ? new PublicKey(wallet.walletAddress)
    : null;

  useEffect(() => {
    if (!owner) {
      return;
    }
    const fetchUserVest = async () => {
      const vest = await window.adrena.client.loadUserVest(owner);
      if (!vest) {
        return;
      }
      setUserVest(vest);
    };
    fetchUserVest();
  }, [window.adrena.client.connection]);

  useEffect(() => {
    if (!owner) return;
    if (!userVest) return;

    const amount = nativeToUi(
      userVest.amount,
      window.adrena.client.adxToken.decimals,
    );

    const claimedAmount = nativeToUi(
      userVest.claimedAmount,
      window.adrena.client.adxToken.decimals,
    );

    // Calculate how much tokens per seconds are getting accrued for the userVest
    const amountPerSecond =
      amount /
      (userVest.unlockEndTimestamp.toNumber() * 1000 -
        userVest.unlockStartTimestamp.toNumber() * 1000);

    const start = new Date(userVest.unlockStartTimestamp.toNumber() * 1000);

    const interval = setInterval(() => {
      if (!userVest) return;
      if (start > new Date()) return;

      // Calculate how many seconds has passed since the last claim
      const nbSecondsSinceLastClaim =
        Date.now() -
        (userVest.lastClaimTimestamp.toNumber() === 0
          ? userVest.unlockStartTimestamp.toNumber()
          : userVest.lastClaimTimestamp.toNumber()) *
        1000;

      const claimableAmount = nbSecondsSinceLastClaim * amountPerSecond;

      setAmounts({
        amount,
        claimedAmount,
        claimableAmount,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userVest]);

  console.log('vest', userVest);

  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      maxSteps: 5,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === 'getLocation') {
          const amount = toolCall.args?.amount ?? null;
          console.log('amount', amount, toolCall);
          const cities = [
            'New York',
            'Los Angeles',
            'Chicago',
            'San Francisco',
          ];
          return cities[Math.floor(Math.random() * cities.length)];
        }

        if (toolCall.toolName === 'claimVest') {
          if (!owner) {
            return;
          }
          const amount = toolCall.args?.amount ?? null;
          console.log('amount', amount, toolCall);

          const notification =
            MultiStepNotification.newForRegularTransaction('Claim Vest').fire();

          await window.adrena.client.claimUserVest({
            notification,
            targetWallet: undefined,
            owner,
          });

          return 'Claimed vested ADX ';
        }

        if (toolCall.toolName === 'stakeADX') {
          if (!owner) {
            return;
          }
          const amount = toolCall.args?.amount ?? null;
          console.log('amount', amount, toolCall);

          const notification =
            MultiStepNotification.newForRegularTransaction('Stake ADX').fire();

          await window.adrena.client.addLiquidStake({
            owner,
            amount,
            stakedTokenMint: window.adrena.client.adxToken.mint,
            notification,
          });

          return `Liquid Staked ${amount} ADX`;
        }
      },
    });

  return (
    <div className="flex flex-col gap-5 w-full max-w-md py-24 mx-auto stretch">
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

      {messages?.map((m: Message) => (
        <div key={m.id}>
          <p
            className={twMerge(
              'text-base opacity-50 inline-block mr-2 font-mono',
              m.role === 'assistant' ? 'text-red' : 'text-blue',
            )}
          >
            {m.role}:
          </p>
          {m.content}
          {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
            const toolCallId = toolInvocation.toolCallId;
            const addResult = (result: string) =>
              addToolResult({ toolCallId, result });

            // render confirmation tool (client-side tool with user interaction)
            if (toolInvocation.toolName === 'askForConfirmation') {
              return (
                <div key={toolCallId}>
                  {toolInvocation?.args?.message}
                  <div>
                    {'result' in toolInvocation ? (
                      <b>{toolInvocation.result}</b>
                    ) : (

                      <div className="flex flex-row gap-3 mt-3">
                        <p className='bg-secondary font-mono px-2 rounded-md border border-bcolor w-fit text-xxs p-1 mb-3'>amount: <FormatNumber nb={amounts.claimableAmount} suffix='ADX' /></p>
                        <Button
                          variant="outline"
                          title="Yes"
                          onClick={() => addResult('Yes')}
                        />
                        <Button
                          variant="outline"
                          title="No"
                          onClick={() => addResult('No')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // other tools:
            return 'result' in toolInvocation ? (
              <div
                key={toolCallId}
                className="bg-secondary font-mono px-2 rounded-md border w-fit text-xxs p-1 mt-3"
              >
                Tool call {`${toolInvocation.toolName}: `}
                {toolInvocation.result}
              </div>
            ) : (
              <div
                key={toolCallId}
                className="bg-secondary font-mono px-2 rounded-md border w-fit text-xxs p-1 mt-3"
              >
                Calling {toolInvocation.toolName}...
              </div>
            );
          })}
          <br />
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bg-secondary bottom-[200px] w-full max-w-md p-2 px-4 mb-8 border border-bcolor rounded-lg shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
