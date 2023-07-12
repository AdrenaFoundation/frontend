import {
  createAssociatedTokenAccountIdempotent,
  NATIVE_MINT,
  transferChecked,
} from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { useState } from 'react';

import Button from '@/components/common/Button/Button';
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

export default function FaucetDevnet({ wallet }: PageProps) {
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

    // Calculate how many tokens to send, we want to send for $10k of tokens
    const tokenPrice = tokenPrices[token.name];

    if (!tokenPrice) {
      return addNotification({
        title: 'Price not found',
        type: 'error',
        message: 'Cannot find token price, please retry',
        duration: 'long',
      });
    }

    setPendingTx(true);

    const tokenAmount = 10_000 / tokenPrice;

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

  return (
    <>
      {window.adrena.client.tokens.map((token) => (
        <div key={token.name} className="mt-8 flex flex-col items-center">
          <Button
            disabled={pendingTx}
            activateLoadingIcon={true}
            className="bg-secondary w-[30em]"
            title={`Get ${token.name}`}
            onClick={() =>
              token.mint.equals(NATIVE_MINT)
                ? airdropDevnetSol()
                : sendDevnetTokens(token)
            }
          />

          <div className="text-xs mt-4 text-txtfade">
            {token.mint.equals(NATIVE_MINT) ? 'Aidroped 1 ' : '$10k worth of '}
            token at a time
          </div>

          <div className="text-xs mt-2 text-txtfade">
            {token.mint.toBase58()}
          </div>
        </div>
      ))}
    </>
  );
}
