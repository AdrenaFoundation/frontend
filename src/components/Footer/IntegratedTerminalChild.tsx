import { WalletName } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { TransactionError } from '@solana/web3.js';
import React, { useEffect } from 'react';

import { walletAdapters } from '@/constant';
import { useSelector } from '@/store/store';
import { addFailedTxNotification, addSuccessTxNotification } from '@/utils';

import StyledSubContainer from '../common/StyledSubContainer/StyledSubContainer';

export default function IntegratedTerminal({
  connected,
}: {
  connected: boolean;
}) {
  const walletState = useSelector((s) => s.walletState.wallet);

  const passthroughWalletContextState = useWallet();

  useEffect(() => {
    if (connected && walletState?.adapterName) {
      const adapter = walletAdapters[walletState.adapterName];

      passthroughWalletContextState.select(adapter.name as WalletName);
    }
  }, [connected, walletState]);

  useEffect(() => {
    window.Jupiter.init({
      displayMode: 'integrated',
      integratedTargetId: 'integrated-terminal',
      enableWalletPassthrough: true,
      strictTokenList: true,
      formProps: {
        fixedOutputMint: true,
        swapMode: 'ExactIn',
        initialOutputMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      },
      endpoint:
        'https://adrena-solanad-ac2e.devnet.rpcpool.com/eb24df90-f9aa-45f2-9a9c-fe20cd0f35fd', // TODO: Use the correct endpoint

      onSuccess: ({ txid }: { txid: string }) => {
        console.log({ txid });

        return addSuccessTxNotification({
          title: 'Successfull Transaction',
          txHash: txid,
        });
      },
      onSwapError: ({ error }: { error: TransactionError }) => {
        console.log('onSwapError', error);

        return addFailedTxNotification({
          title: 'Swap Error',
          error,
        });
      },
    });
  }, []);

  useEffect(() => {
    if (!window.Jupiter.syncProps) return;
    window.Jupiter.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState.connected, connected]);

  return (
    <StyledSubContainer
      id="integrated-terminal"
      className="h-full w-[400px] mr-12"
    ></StyledSubContainer>
  );
}
