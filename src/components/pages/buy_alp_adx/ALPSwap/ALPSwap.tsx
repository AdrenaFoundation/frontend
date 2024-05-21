import { Wallet } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { useEffect, useState } from 'react';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { FeesAndAmountsType } from '@/pages/buy_alp_adx';
import { useDispatch, useSelector } from '@/store/store';
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
  collateralPrice,
  setCollateralPrice,
  feesAndAmounts,
  className,
  aumUsd,
  connected,
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
  aumUsd: number | undefined;
  connected: boolean;
}) {
  const dispatch = useDispatch();
  const wallet = useSelector((s) => s.walletState.wallet);

  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const [buttonTitle, setButtonTitle] = useState<string | null>(null);
  const [isDisabledButton, setIsDisabledButton] = useState<boolean>(false);

  const handleExecuteButton = async () => {
    if (!connected) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

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
        setCollateralInput(null);

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
      setCollateralInput(null);

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

  useEffect(() => {
    const newButtonTitle = () => {
      if (!connected && !window.adrena.geoBlockingData.allowed) {
        setIsDisabledButton(true);
        return 'Geo-Restricted Access';
      }

      // If wallet not connected, then user need to connect wallet
      if (!connected) {
        setIsDisabledButton(false);
        return 'Connect wallet';
      }

      if (alpInput === null || collateralInput === null) {
        setIsDisabledButton(true);
        return 'Enter an amount';
      }

      // Loading, should happens quickly
      if (!collateralToken) {
        setIsDisabledButton(true);
        return '...';
      }

      const walletCollateralTokenBalance =
        walletTokenBalances?.[collateralToken.symbol];

      const walletAlpTokenBalance =
        walletTokenBalances?.[window.adrena.client.alpToken.symbol];

      if (typeof walletCollateralTokenBalance === 'undefined') {
        setIsDisabledButton(true);
        return '...';
      }

      // If user wallet balance doesn't have enough tokens, tell user
      if (
        selectedAction === 'buy' &&
        ((walletCollateralTokenBalance != null &&
          collateralInput > walletCollateralTokenBalance) ||
          walletCollateralTokenBalance === null)
      ) {
        setIsDisabledButton(true);
        return `Insufficient ${collateralToken.symbol} balance`;
      }

      // If user wallet balance doesn't have enough tokens, tell user
      if (
        selectedAction === 'sell' &&
        ((walletAlpTokenBalance != null && alpInput > walletAlpTokenBalance) ||
          walletAlpTokenBalance === null)
      ) {
        setIsDisabledButton(true);
        return `Insufficient ${window.adrena.client.alpToken.symbol} balance`;
      }

      if (selectedAction === 'buy') {
        setIsDisabledButton(false);
        return `Buy ${window.adrena.client.alpToken.symbol}`;
      }

      setIsDisabledButton(false);
      return `Sell ${window.adrena.client.alpToken.symbol}`;
    };

    setButtonTitle(newButtonTitle);
  }, [
    alpInput,
    buttonTitle,
    collateralInput,
    collateralToken,
    connected,
    selectedAction,
    walletTokenBalances,
  ]);

  return (
    <div className={className}>
      <TabSelect
        selected={selectedAction}
        tabs={[
          { title: 'buy', activeColor: '#22c55e' },
          { title: 'sell', activeColor: '#c13332' },
        ]}
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
            collateralPrice={collateralPrice}
            setCollateralPrice={setCollateralPrice}
            feesAndAmounts={feesAndAmounts}
            aumUsd={aumUsd}
            connected={connected}
          />

          {/* Button to execute action */}
          <Button
            title={buttonTitle}
            size="lg"
            disabled={isDisabledButton}
            className="justify-center w-full mt-5"
            onClick={handleExecuteButton}
          />
        </>
      ) : null}
    </div>
  );
}
