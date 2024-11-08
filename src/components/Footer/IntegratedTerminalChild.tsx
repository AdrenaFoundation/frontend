import { WalletName } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, TransactionError } from '@solana/web3.js';
import React, { useEffect } from 'react';

import { useSelector } from '@/store/store';
import { addFailedTxNotification, addSuccessTxNotification } from '@/utils';

import StyledSubContainer from '../common/StyledSubContainer/StyledSubContainer';

export default function IntegratedTerminalChild({
  connected,
  className,
  activeRpc,
  id = 'integrated-terminal',
}: {
  connected: boolean;
  className?: string;
  activeRpc: {
    name: string;
    connection: Connection;
  };
  id: string;
}) {
  const walletState = useSelector((s) => s.walletState.wallet);

  const passthroughWalletContextState = useWallet();

  useEffect(() => {
    if (connected && walletState?.adapterName) {
      passthroughWalletContextState.select(walletState.adapterName as WalletName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, walletState]);

  useEffect(() => {
    window.Jupiter.init({
      displayMode: 'integrated',
      integratedTargetId: id,
      enableWalletPassthrough: true,
      endpoint: activeRpc.connection.rpcEndpoint,
      containerStyles: { minHeight: '400px' },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRpc.name]);

  useEffect(() => {
    if (!window.Jupiter.syncProps) return;
    window.Jupiter.syncProps({ passthroughWalletContextState });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passthroughWalletContextState.connected, connected]);

  return (
    <StyledSubContainer id={id} className={className}></StyledSubContainer>
  );
}
