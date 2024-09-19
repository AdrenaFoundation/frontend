import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { useWeb3ModalProvider } from '@web3modal/solana/react';
import { useEffect, useState } from 'react';

import { openCloseConnectionModalAction } from '@/actions/walletActions';
import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { FeesAndAmountsType } from '@/pages/buy_alp';
import { useDispatch, useSelector } from '@/store/store';
import { Token } from '@/types';
import { uiToNative } from '@/utils';

import ALPSwapInputs from './ALPSwapInputs';

export default function ALPSwap({
  triggerWalletTokenBalancesReload,
  collateralInput,
  setCollateralInput,
  alpInput,
  setAlpInput,
  errorMessage,
  setErrorMessage,
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
  connected,
}: {
  className?: string;
  triggerWalletTokenBalancesReload: () => void;
  collateralInput: number | null;
  setCollateralInput: (v: number | null) => void;
  alpInput: number | null;
  setAlpInput: (v: number | null) => void;
  errorMessage: string | null;
  setErrorMessage: (v: string | null) => void;
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
  connected: boolean;
}) {
  const dispatch = useDispatch();
  const { walletProvider } = useWeb3ModalProvider();

  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const [buttonTitle, setButtonTitle] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);
  const [isDisabledButton, setIsDisabledButton] = useState<boolean>(false);

  const handleExecuteButton = async () => {
    if (!connected) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    if (
      !walletProvider?.publicKey ||
      !collateralInput ||
      !collateralToken ||
      !alpInput
    ) {
      console.log('Missing some info');
      return;
    }

    const notification =
      MultiStepNotification.newForRegularTransaction('Buying ALP').fire();

    if (selectedAction === 'buy') {
      try {
        await window.adrena.client.addLiquidity({
          owner: new PublicKey(walletProvider.publicKey),
          amountIn: uiToNative(collateralInput, collateralToken.decimals),
          mint: collateralToken.mint,

          // TODO: Apply proper slippage
          minLpAmountOut: new BN(0),
          notification,
        });

        triggerWalletTokenBalancesReload();
        setCollateralInput(null);
      } catch (error) {
        console.log('error', error);
      }

      return;
    }

    // "sell"
    try {
      await window.adrena.client.removeLiquidity({
        owner: new PublicKey(walletProvider.publicKey),
        mint: collateralToken.mint,
        lpAmountIn: uiToNative(
          alpInput,
          window.adrena.client.alpToken.decimals,
        ),

        // TODO: Apply proper slippage
        minAmountOut: new BN(0),
        notification,
      });

      triggerWalletTokenBalancesReload();
      setCollateralInput(null);
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    const newButtonTitle = () => {
      // If wallet not connected, then user need to connect wallet
      if (!connected) {
        setIsDisabledButton(false);
        return 'Connect wallet';
      }

      if (
        errorMessage !== null &&
        (alpInput !== null || collateralInput !== null)
      ) {
        setIsDisabledButton(true);
        return errorMessage;
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
    errorMessage,
    selectedAction,
    walletTokenBalances,
  ]);

  useEffect(() => {
    if (errorMessage === null) setErrorDescription(null);
    if (errorMessage === 'Pool ratio reached for this token')
      setErrorDescription(
        `The target ratio for the selected token has already been reached,
        please use a different token.
        If you want to see more details on the pool and the ratios,
        please go to Monitoring page.`,
      );
    if (errorMessage === 'Not enough liquidity in the pool for this token')
      setErrorDescription(
        `Not enough liquidity in the pool for this token to perform this action,
        please use a different token.
        If you want to see more details on the pool and the ratios,
        please go to Monitoring page.`,
      );
  }, [errorMessage]);

  return (
    <div className={className}>
      <TabSelect
        selected={selectedAction}
        tabs={[
          { title: 'buy', activeColor: 'border-white' },
          { title: 'sell', activeColor: 'border-white' },
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
            setErrorMessage={setErrorMessage}
            feesAndAmounts={feesAndAmounts}
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

          {errorDescription ? (
            <div className="flex mt-4 text-txtfade text-xs font-mono">
              {errorDescription}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
