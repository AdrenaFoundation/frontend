import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { FeesAndAmountsType } from '@/pages/buy_alp_adx';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  uiToNative,
} from '@/utils';

import ALPSwapInputs from './ALPSwapInputs';

export default function ALPSwap({
  triggerWalletTokenBalancesReload,
  collateralInput,
  setCollateralInput,
  alpInput,
  setAlpInput,
  collateralToken,
  onCollateralTokenChange,
  feesUsd,
  setFeesUsd,
  allowedCollateralTokens,
  selectedAction,
  setSelectedAction,
  setAlpPrice,
  setCollateralPrice,
  feesAndAmounts,
  className,
}: {
  className?: string;
  triggerWalletTokenBalancesReload: () => void;
  collateralInput: number | null;
  setCollateralInput: (v: number | null) => void;
  alpInput: number | null;
  setAlpInput: (v: number | null) => void;
  alpPrice: number | null;
  setAlpPrice: (v: number | null) => void;
  collateralToken: Token | null;
  onCollateralTokenChange: (t: Token) => void;
  collateralPrice: number | null;
  setCollateralPrice: (v: number | null) => void;
  feesUsd: number | null;
  setFeesUsd: (v: number | null) => void;
  allowedCollateralTokens: Token[] | null;
  selectedAction: 'buy' | 'sell';
  setSelectedAction: (v: 'buy' | 'sell') => void;
  feesAndAmounts: FeesAndAmountsType | null;
}) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

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
          title: 'Successful Transaction',
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
      walletTokenBalances?.[collateralToken.symbol];

    const walletAlpTokenBalance =
      walletTokenBalances?.[window.adrena.client.alpToken.symbol];

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
      return `Insufficient ${collateralToken.symbol} balance`;
    }

    // If user wallet balance doesn't have enough tokens, tell user
    if (
      selectedAction === 'sell' &&
      ((walletAlpTokenBalance != null && alpInput > walletAlpTokenBalance) ||
        walletAlpTokenBalance === null)
    ) {
      return `Insufficient ${window.adrena.client.alpToken.symbol} balance`;
    }

    if (selectedAction === 'buy') {
      return `Buy ${window.adrena.client.alpToken.symbol}`;
    }

    return `Sell ${window.adrena.client.alpToken.symbol}`;
  })();

  return (
    <div
      className={twMerge(
        'bg-gray-300/85 backdrop-blur-md border border-gray-200 p-4 rounded-2xl h-fit',
        className,
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
            allowedCollateralTokens={allowedCollateralTokens}
            alpInput={alpInput}
            feesUsd={feesUsd}
            onChangeAlpInput={setAlpInput}
            collateralInput={collateralInput}
            onChangeCollateralInput={setCollateralInput}
            onCollateralTokenChange={onCollateralTokenChange}
            setFeesUsd={setFeesUsd}
            setAlpPrice={setAlpPrice}
            setCollateralPrice={setCollateralPrice}
            feesAndAmounts={feesAndAmounts}
          />

          {/* Button to execute action */}
          <Button
            title={buttonTitle}
            size="lg"
            disabled={buttonTitle.includes('Insufficient')}
            className="justify-center w-full mt-5"
            onClick={handleExecuteButton}
          />
        </>
      ) : null}
    </div>
  );
}
