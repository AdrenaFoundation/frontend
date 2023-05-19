import { transferChecked } from '@solana/spl-token';
import { useState } from 'react';

import Button from '@/components/common/Button/Button';
import { devnetFaucetBankWallet, PYTH_ORACLE_RPC } from '@/constant';
import useConnection from '@/hooks/useConnection';
import useWallet from '@/hooks/useWallet';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import { useSelector } from '@/store/store';
import { PageProps, Token } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  findATAAddressSync,
  uiToNative,
} from '@/utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function FaucetDevnet({ client }: PageProps) {
  const wallet = useWallet();
  const pythConnection = useConnection(PYTH_ORACLE_RPC);

  useWatchTokenPrices(client, pythConnection);

  const tokenPrices = useSelector((s) => s.tokenPrices);

  const [pendingTx, setPendingTx] = useState<boolean>(false);

  const sendDevnetTokens = async (token: Token) => {
    if (!client || !wallet) return;

    const connection = client.connection;

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
        type: 'danger',
        message: 'Cannot find token price, please retry',
        duration: 'long',
      });
    }

    setPendingTx(true);

    const tokenAmount = 10_000 / tokenPrice;

    try {
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

  return (
    <div className="w-full h-full bg-main flex flex-col items-center">
      {client?.tokens?.map((token) => (
        <div key={token.name} className="mt-8 flex flex-col items-center">
          <Button
            disabled={pendingTx}
            activateLoadingIcon={true}
            className="bg-secondary w-[30em]"
            title={`Get ${token.name}`}
            onClick={() => sendDevnetTokens(token)}
          />

          <div className="text-xs mt-4 text-txtfade">
            $10k worth of token at a time
          </div>

          <div className="text-xs mt-2 text-txtfade">
            {token.mint.toBase58()}
          </div>
        </div>
      ))}
    </div>
  );
}
