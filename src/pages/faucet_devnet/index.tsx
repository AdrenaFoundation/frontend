import {
  createAssociatedTokenAccountIdempotent,
  NATIVE_MINT,
  transferChecked,
} from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { useState } from 'react';

import Button from '@/components/common/Button/Button';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { devnetFaucetBankWallet } from '@/constant';
import { useSelector } from '@/store/store';
import { PageProps, Token } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  AdrenaTransactionError,
  findATAAddressSync,
  uiToNative,
} from '@/utils';

export default function FaucetDevnet({
  wallet,
  triggerWalletTokenBalancesReload,
}: PageProps) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [pendingTx, setPendingTx] = useState<boolean>(false);

  const sendDevnetTokens = async (token: Token) => {
    if (!wallet) return;

    const connection = window.adrena.client.connection;
    if (!connection) return;

    const fromATA = findATAAddressSync(
      devnetFaucetBankWallet.publicKey,
      token.mint,
    );
    const toATA = findATAAddressSync(wallet.publicKey, token.mint);

    let tokenAmount;

    if (token.symbol === 'ADX') {
      tokenAmount = 1;
    } else {
      // Calculate how many tokens to send, we want to send for $10k of tokens
      const tokenPrice = tokenPrices[token.symbol];

      if (!tokenPrice) {
        return addNotification({
          title: 'Price not found',
          type: 'error',
          message: 'Cannot find token price, please retry',
          duration: 'long',
        });
      }

      tokenAmount = 10_000 / tokenPrice;
    }

    setPendingTx(true);

    try {
      await createAssociatedTokenAccountIdempotent(
        connection,
        devnetFaucetBankWallet,
        token.mint,
        wallet.publicKey,
      );

      const txHash = await transferChecked(
        connection,
        devnetFaucetBankWallet,
        fromATA,
        token.mint,
        toATA,
        devnetFaucetBankWallet.publicKey,
        uiToNative(tokenAmount, token.decimals).toNumber(),
        token.decimals,
      );

      setPendingTx(false);
      triggerWalletTokenBalancesReload();

      return addSuccessTxNotification({
        title: 'Successfull Transaction',
        txHash,
      });
    } catch (error) {
      console.log('error', error);

      setPendingTx(false);

      return addFailedTxNotification({
        title: 'Transfer Error',
        error,
      });
    }
  };

  const airdropDevnetSol = async () => {
    if (!wallet) return;

    // Use official RPC for airdrop
    const connection = new Connection('https://api.devnet.solana.com');

    let txHash: string | null = null;

    try {
      txHash = await connection.requestAirdrop(
        wallet.publicKey,
        LAMPORTS_PER_SOL,
      );

      const signatureResult = await connection.confirmTransaction(txHash);

      if (signatureResult.value.err) {
        throw signatureResult.value.err;
      }

      setPendingTx(false);

      return addSuccessTxNotification({
        title: 'Successfull Transaction',
        txHash,
      });
    } catch (error) {
      setPendingTx(false);

      return addFailedTxNotification({
        title: 'Airdrop Failed',
        error: new AdrenaTransactionError(
          txHash,
          (
            error as {
              message?: string;
            }
          )?.message ?? String(error),
        ),
      });
    }
  };

  const allTokens = [
    ...window.adrena.client.tokens,
    window.adrena.client.adxToken,
  ];

  return (
    <div className="flex p-4">
      <StyledContainer
        className="ml-auto mr-auto"
        bodyClassName="flex-row max-w-full flex-wrap gap-4 items-center justify-center"
        title={
          <h1 className="w-full flex items-center justify-center">
            GET DEVNET TOKENS
          </h1>
        }
      >
        {allTokens.map((token) => (
          <StyledSubContainer
            key={token.symbol}
            className="w-[25em] h-[10em] items-center justify-center"
          >
            <Button
              disabled={pendingTx}
              className="w-full md:w-[30em]"
              title={`Get ${token.symbol}`}
              onClick={() =>
                token.mint.equals(NATIVE_MINT)
                  ? airdropDevnetSol()
                  : sendDevnetTokens(token)
              }
            />

            <div className="text-sm mt-4 text-txtfade">
              {(() => {
                if (token.mint.equals(NATIVE_MINT) || token.symbol === 'ADX')
                  return 'Aidropped 1 ';
                return '$10k worth of ';
              })()}
              token at a time
            </div>

            <div className="text-sm mt-2 text-txtfade">
              {token.mint.toBase58()}
            </div>
          </StyledSubContainer>
        ))}
      </StyledContainer>
    </div>
  );
}
