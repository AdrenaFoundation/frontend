import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  uiToNative,
} from '@/utils';

import BuySellAlpInputs from '../BuySellAlpInputs/BuySellAlpInputs';

export default function BuySellAlp({
  className,
  client,
  triggerWalletTokenBalancesReload,
}: {
  className?: string;
  client: AdrenaClient | null;
  triggerWalletTokenBalancesReload: () => void;
}) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const [collateralToken, setCollateralToken] = useState<Token | null>(null);
  const [alpInput, setAlpInput] = useState<number | null>(null);
  const [collateralInput, setCollateralInput] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    if (!client || !client.tokens.length) return;

    setCollateralToken(client.tokens[0]);
  }, [client]);

  const handleExecuteButton = async () => {
    if (
      !client ||
      !wallet?.walletAddress ||
      !collateralInput ||
      !collateralToken ||
      !alpInput
    ) {
      console.log('Missing some info');
      return;
    }

    if (selectedAction === 'buy') {
      try {
        const txHash = await client.addLiquidity({
          owner: new PublicKey(wallet.walletAddress),
          amountIn: uiToNative(collateralInput, collateralToken.decimals),
          mint: collateralToken.mint,

          // TODO: Apply proper slippage
          minLpAmountOut: new BN(0),
        });

        triggerWalletTokenBalancesReload();

        return addSuccessTxNotification({
          title: 'Successfull Transaction',
          txHash,
        });
      } catch (error) {
        console.log('error', error);

        return addFailedTxNotification({
          title: 'Error Buying ALP',
          error,
        });
      }
    }

    // "sell"
    try {
      const txHash = await client.removeLiquidity({
        owner: new PublicKey(wallet.walletAddress),
        mint: collateralToken.mint,
        lpAmountIn: uiToNative(alpInput, AdrenaClient.alpToken.decimals),

        // TODO: Apply proper slippage
        minAmountOut: new BN(0),
      });

      triggerWalletTokenBalancesReload();

      return addSuccessTxNotification({
        title: 'Successfull Transaction',
        txHash,
      });
    } catch (error) {
      console.log('error', error);

      return addFailedTxNotification({
        title: 'Error Selling ALP',
        error,
      });
    }
  };

  const buttonTitle = (() => {
    // If wallet not connected, then user need to connect wallet
    if (!connected) {
      return 'Connect wallet';
    }

    if (alpInput === null || collateralInput === null) {
      return 'Enter an amount';
    }

    // Loading, should happens quickly
    if (!collateralToken) {
      return '...';
    }

    const walletCollateralTokenBalance =
      walletTokenBalances?.[collateralToken.name];

    const walletAlpTokenBalance =
      walletTokenBalances?.[AdrenaClient.alpToken.name];

    // Loading, should happens quickly
    if (typeof walletCollateralTokenBalance === 'undefined') {
      return '...';
    }

    // If user wallet balance doesn't have enough tokens, tell user
    if (
      selectedAction === 'buy' &&
      ((walletCollateralTokenBalance != null &&
        collateralInput > walletCollateralTokenBalance) ||
        walletCollateralTokenBalance === null)
    ) {
      return `Insufficient ${collateralToken.name} balance`;
    }

    // If user wallet balance doesn't have enough tokens, tell user
    if (
      selectedAction === 'sell' &&
      ((walletAlpTokenBalance != null && alpInput > walletAlpTokenBalance) ||
        walletAlpTokenBalance === null)
    ) {
      return `Insufficient ${AdrenaClient.alpToken.name} balance`;
    }

    if (selectedAction === 'buy') {
      return `Buy ${AdrenaClient.alpToken.name}`;
    }

    return `Sell ${AdrenaClient.alpToken.name}`;
  })();

  return (
    <div className={twMerge(className)}>
      <TabSelect
        selected={selectedAction}
        tabs={[{ title: 'buy' }, { title: 'sell' }]}
        onClick={(title) => {
          setSelectedAction(title);
        }}
      />

      {client && collateralToken ? (
        <>
          <BuySellAlpInputs
            className="mt-4"
            client={client}
            actionType={selectedAction}
            alpToken={AdrenaClient.alpToken}
            collateralToken={collateralToken}
            allowedCollateralTokens={client?.tokens}
            onChangeAlpInput={setAlpInput}
            onChangeCollateralInput={setCollateralInput}
            setActionType={setSelectedAction}
            setCollateralToken={setCollateralToken}
          />

          {/* Button to execute action */}
          <Button
            className="mt-4 bg-highlight text-sm"
            title={buttonTitle}
            activateLoadingIcon={true}
            onClick={handleExecuteButton}
          />
        </>
      ) : null}
    </div>
  );
}
