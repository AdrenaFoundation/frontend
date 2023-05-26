import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  formatPriceInfo,
  uiToNative,
} from '@/utils';

import ALPSwapInputs from './ALPSwapInputs';

export default function ALPSwap({
  className,
  triggerWalletTokenBalancesReload,
}: {
  className?: string;
  triggerWalletTokenBalancesReload: () => void;
}) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const [collateralToken, setCollateralToken] = useState<Token | null>(null);
  const [alpInput, setAlpInput] = useState<number | null>(null);
  const [collateralInput, setCollateralInput] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell'>('buy');
  const [feesUsd, setFeesUsd] = useState<number | null>(null);

  useEffect(() => {
    if (!window.adrena.client.tokens.length) return;

    setCollateralToken(window.adrena.client.tokens[0]);
  }, []);

  const handleExecuteButton = async () => {
    if (
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
        const txHash = await window.adrena.client.addLiquidity({
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
      const txHash = await window.adrena.client.removeLiquidity({
        owner: new PublicKey(wallet.walletAddress),
        mint: collateralToken.mint,
        lpAmountIn: uiToNative(
          alpInput,
          window.adrena.client.alpToken.decimals,
        ),

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
      walletTokenBalances?.[window.adrena.client.alpToken.name];

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
      return `Insufficient ${window.adrena.client.alpToken.name} balance`;
    }

    if (selectedAction === 'buy') {
      return `Buy ${window.adrena.client.alpToken.name}`;
    }

    return `Sell ${window.adrena.client.alpToken.name}`;
  })();

  return (
    <div
      className={twMerge(
        className,
        'border',
        'border-grey',
        'bg-secondary',
        'p-4',
      )}
    >
      <TabSelect
        selected={selectedAction}
        tabs={[{ title: 'buy' }, { title: 'sell' }]}
        onClick={(title) => {
          setSelectedAction(title);
        }}
      />

      {collateralToken ? (
        <>
          <ALPSwapInputs
            className="mt-4"
            actionType={selectedAction}
            alpToken={window.adrena.client.alpToken}
            collateralToken={collateralToken}
            allowedCollateralTokens={window.adrena.client.tokens}
            onChangeAlpInput={setAlpInput}
            onChangeCollateralInput={setCollateralInput}
            setActionType={setSelectedAction}
            setCollateralToken={setCollateralToken}
            setFeesUsd={setFeesUsd}
          />

          <div className="flex w-full justify-between mt-4">
            <span>Fees</span>
            <span>{formatPriceInfo(feesUsd)}</span>
          </div>

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
