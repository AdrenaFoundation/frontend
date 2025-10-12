import { WalletName } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, TransactionError } from '@solana/web3.js';
import { useEffect } from 'react';

import { useSelector } from '@/store/store';
import { Token } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  getTokenNameByMint,
  getTokenSymbol,
} from '@/utils';

import StyledSubContainer from '../common/StyledSubContainer/StyledSubContainer';

export default function IntegratedTerminalChild({
  connected,
  className,
  activeRpc,
  id = 'integrated-terminal',
  setTokenB,
  allowedTokenB,
}: {
  connected: boolean;
  className?: string;
  activeRpc: {
    name: string;
    connection: Connection;
  };
  id: string;
  allowedTokenB: Token[];
  setTokenB: (t: Token) => void;
}) {
  const walletState = useSelector((s) => s.walletState.wallet);

  const passthroughWalletContextState = useWallet();

  useEffect(() => {
    if (connected && walletState?.adapterName) {
      passthroughWalletContextState.select(
        walletState.adapterName as WalletName,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, walletState]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--jupiter-plugin-background',
      '6, 16, 24',
    ); // bg-secondary
    document.documentElement.style.setProperty(
      '--jupiter-plugin-module',
      '16, 23, 31',
    );
    document.documentElement.style.setProperty(
      '--jupiter-plugin-interactive',
      '33, 42, 54',
    );
    document.documentElement.style.setProperty(
      '--jupiter-plugin-primary',
      '199, 242, 132',
    );
    document.documentElement.style.setProperty(
      '--jupiter-plugin-primary-text',
      '232, 249, 255',
    );
    document.documentElement.style.setProperty(
      '--jupiter-plugin-warning',
      '251, 191, 36',
    );
  }, []);

  useEffect(() => {
    window.Jupiter.init({
      displayMode: 'integrated',
      integratedTargetId: id,
      enableWalletPassthrough: true,
      endpoint: activeRpc.connection.rpcEndpoint,
      containerStyles: { minHeight: '400px' },
      onFormUpdate: (form: {
        fromMint: string;
        toMint: string;
        fromValue: string;
        toValue: string;
        slippageBps: number;
        userSlippageMode: 'DYNAMIC' | 'FIXED';
        dynamicSlippageBps: number;
      }) => {
        const tokenB = getTokenSymbol(
          getTokenNameByMint(new PublicKey(form.toMint)),
        );
        const allowedTokenBSymbols = allowedTokenB.map((t) =>
          getTokenSymbol(t.symbol),
        );

        if (!allowedTokenBSymbols.includes(tokenB)) {
          return;
        }

        setTokenB(
          allowedTokenB.find(
            (t) => getTokenSymbol(t.symbol) === getTokenSymbol(tokenB),
          ) as Token,
        );
      },
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
      formProps: {
        swapMode: 'ExactInOrOut',
      },
      branding: {
        name: 'Adrena',
        logoUri: 'https://app.adrena.trade/_next/static/media/adx.ed486967.svg',
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
