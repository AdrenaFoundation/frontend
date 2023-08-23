import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { useSelector } from '@/store/store';
import { Token, TokenName } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  formatPriceInfo,
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
  alpPrice,
  setAlpPrice,
  collateralPrice,
  setCollateralPrice,
  feesAndAmounts,
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
  feesAndAmounts: {
    [tokenName: TokenName]: { fees: number | null; amount: number | null };
  } | null;
  selectedAction: 'buy' | 'sell';
  setSelectedAction: (v: 'buy' | 'sell') => void;
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
    <div className="bg-gray-200 border border-gray-300 lg:w-[450px] p-4 rounded-lg h-fit">
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
            onChangeAlpInput={setAlpInput}
            collateralInput={collateralInput}
            onChangeCollateralInput={setCollateralInput}
            setActionType={setSelectedAction}
            onCollateralTokenChange={onCollateralTokenChange}
            setFeesUsd={setFeesUsd}
            alpPrice={alpPrice}
            collateralPrice={collateralPrice}
            setAlpPrice={setAlpPrice}
            setCollateralPrice={setCollateralPrice}
            feesAndAmounts={feesAndAmounts}
          />

          <div className="flex w-full justify-between mt-4">
            <span className="text-sm opacity-50">Fees</span>
            <span className="text-sm font-mono">
              {formatPriceInfo(feesUsd)}
            </span>
          </div>

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
