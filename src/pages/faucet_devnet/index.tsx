import {
  createAssociatedTokenAccountIdempotent,
  NATIVE_MINT,
  transferChecked,
} from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import Button from '@/components/common/Button/Button';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { devnetFaucetBankWallet } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import { PageProps, Token } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  AdrenaTransactionError,
  findATAAddressSync,
  getAccountExplorer,
  uiToNative,
} from '@/utils';

export default function FaucetDevnet({
  wallet,
}: PageProps) {
  const dispatch = useDispatch();
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
      dispatch(fetchWalletTokenBalances());

      return addSuccessTxNotification({
        title: 'Successful Transaction',
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

      const signatureResult = await connection.confirmTransaction({ signature: txHash, blockhash: (await connection.getLatestBlockhash('confirmed')).blockhash, lastValidBlockHeight: (await connection.getLatestBlockhash('confirmed')).lastValidBlockHeight });

      if (signatureResult.value.err) {
        throw signatureResult.value.err;
      }

      setPendingTx(false);

      return addSuccessTxNotification({
        title: 'Successful Transaction',
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
        title="GET DEVNET TOKENS"
      >
        {allTokens.map((token) => (
          <StyledSubContainer
            key={token.symbol}
            className="w-[25em] h-[10em] items-center justify-center"
          >
            <Button
              disabled={pendingTx}
              className="w-full md:w-[30em]"
              title={token.symbol}
              onClick={() =>
                token.mint.equals(NATIVE_MINT)
                  ? airdropDevnetSol()
                  : sendDevnetTokens(token)
              }
            />

            <div className="text-sm mt-4 text-txtfade">
              {(() => {
                if (token.mint.equals(NATIVE_MINT) || token.symbol === 'ADX')
                  return 'Airdropped 1 ';
                return '$10k worth of ';
              })()}
              token at a time
            </div>

            <Link
              className="text-sm mt-2 text-txtfade cursor-pointer opacity-50 hover:opacity-100 flex items-center"
              href={getAccountExplorer(token.mint)}
            >
              {token.mint.toBase58()}

              <Image
                className="ml-1 h-3 w-3"
                src="/images/external-link-logo.png"
                alt="external link icon"
                width={12}
                height={10}
              />
            </Link>
          </StyledSubContainer>
        ))}
      </StyledContainer>
    </div>
  );
}
