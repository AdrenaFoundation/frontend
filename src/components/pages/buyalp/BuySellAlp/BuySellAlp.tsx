import { useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { useSelector } from '@/store/store';
import { Token } from '@/types';

import BuySellAlpInputs from '../BuySellAlpInputs/BuySellAlpInputs';

export default function BuySellAlp({
  className,
  client,
}: {
  className?: string;
  client: AdrenaClient | null;
}) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const connected = !!wallet;
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const [collateralToken, setCollateralToken] = useState<Token | null>(null);
  const [alpInput, setAlpInput] = useState<number | null>(null);
  const [collateralInput, setCollateralInput] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    if (!client || !client.tokens.length) return;

    setCollateralToken(client.tokens[0]);
  }, [client]);

  const handleExecuteButton = () => {
    //
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

    // Loading, should happens quickly
    if (typeof walletCollateralTokenBalance === 'undefined') {
      return '...';
    }

    /*
    // If user wallet balance doesn't have enough tokens, tell user
    if (!walletTokenABalance || inputAValue > walletTokenABalance) {
      return `Insufficient ${tokenA.name} balance`;
    }

    if (openedPosition) {
      if (selectedAction === 'short') {
        return 'Reduce Position';
      }
      if (selectedAction === 'long') {
        return 'Increase Position';
      }
    }

    if (selectedAction === 'swap') {
      return 'Swap';
    }*/

    return 'Open Position';
  })();

  return (
    <div className={className}>
      <TabSelect
        selected={selectedAction}
        tabs={[{ title: 'buy' }, { title: 'sell' }]}
        onClick={(title) => {
          setSelectedAction(title);
        }}
      />

      {client && collateralToken ? (
        <>
          <BuySellAlpInputs
            className="mt-4"
            client={client}
            actionType={selectedAction}
            alpToken={AdrenaClient.alpToken}
            collateralToken={collateralToken}
            allowedCollateralTokens={client?.tokens}
            onChangeAlpInput={setAlpInput}
            onChangeCollateralInput={setCollateralInput}
            setActionType={setSelectedAction}
            setCollateralToken={setCollateralToken}
          />

          {/* Button to execute action */}
          <Button
            className="mt-4 bg-highlight text-sm"
            title={buttonTitle}
            activateLoadingIcon={true}
            onClick={handleExecuteButton}
          />
        </>
      ) : null}
    </div>
  );
}
