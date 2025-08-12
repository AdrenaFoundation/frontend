import Image from 'next/image';
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import TradingInput from '@/components/pages/trading/TradingInput/TradingInput';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { Token } from '@/types';

export default function ADXSwapBuy({
  className,
  connected,
}: {
  className?: string;
  connected: boolean;
}) {
  const [collateralToken, setCollateralToken] = useState<Token | null>(null);
  const [collateralAmount, setCollateralAmount] = useState<number | null>(null);
  const [adxAmount, setAdxAmount] = useState<number | null>(null);
  const [fees, setFees] = useState<number | null>(null);

  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  // Initialize with USDC
  useEffect(() => {
    const usdcToken = window.adrena.client.tokens.find(
      (t) => t.symbol === 'USDC',
    );
    if (usdcToken) {
      setCollateralToken(usdcToken);
    }
  }, []);

  // Calculate ADX amount and fees when collateral changes
  useEffect(() => {
    if (!collateralAmount || !collateralToken || !tokenPrices.ADX) return;

    const collateralPrice = tokenPrices[collateralToken.symbol];
    if (!collateralPrice) return;

    const collateralValue = collateralAmount * collateralPrice;
    const adxValue = collateralValue * 0.9995; // Approximate fee calculation
    const adxAmountCalculated = adxValue / tokenPrices.ADX;

    setAdxAmount(adxAmountCalculated);
    setFees(collateralValue * 0.0005); // 0.05% fee
  }, [collateralAmount, collateralToken, tokenPrices]);

  const handleMax = () => {
    if (!collateralToken || !walletTokenBalances) return;
    const balance = walletTokenBalances[collateralToken.symbol];
    if (balance) {
      setCollateralAmount(balance);
    }
  };

  const handlePercentage = (percentage: number) => {
    if (!collateralToken || !walletTokenBalances) return;
    const balance = walletTokenBalances[collateralToken.symbol];
    if (balance) {
      setCollateralAmount(balance * percentage);
    }
  };

  const handleBuy = () => {
    if (!connected) return;
    // Open Jupiter in new tab
    window.open(
      'https://jup.ag/swap/USDC-AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw',
      '_blank',
    );
  };

  if (!collateralToken) return null;

  return (
    <div className={twMerge('flex flex-col gap-4', className)}>
      {/* Collateral Section */}
      <div>
        <h5 className="text-white mb-2">Pay</h5>
        <div className="flex gap-2">
          <TradingInput
            className="flex-1"
            inputClassName="bg-inputcolor"
            value={collateralAmount}
            selectedToken={collateralToken}
            tokenList={window.adrena.client.tokens}
            onTokenSelect={setCollateralToken}
            onChange={setCollateralAmount}
            placeholder="0"
          />
        </div>

        {/* Percentage Buttons */}
        <div className="flex gap-2 mt-2">
          {[0.1, 0.25, 0.5, 0.75].map((pct) => (
            <button
              key={pct}
              onClick={() => handlePercentage(pct)}
              className="px-2 py-1 text-xs bg-third rounded hover:bg-opacity-80 transition-colors"
            >
              {pct * 100}%
            </button>
          ))}
        </div>

        {/* Balance */}
        <div className="text-right mt-2 text-sm text-txtfade">
          Balance:{' '}
          {walletTokenBalances?.[collateralToken.symbol] ? (
            <FormatNumber
              nb={walletTokenBalances[collateralToken.symbol]}
              format="number"
              suffix={` ${collateralToken.symbol}`}
            />
          ) : (
            `0 ${collateralToken.symbol}`
          )}
        </div>
      </div>

      {/* Receive Section */}
      <div>
        <h5 className="text-white mb-2">Receive</h5>
        <div className="flex gap-2">
          <div className="flex-1 bg-third rounded-lg p-3 flex items-center justify-between">
            <span className="text-white">
              {adxAmount ? adxAmount.toFixed(2) : '0'} ADX
            </span>
            <Image
              src={window.adrena.client.adxToken.image}
              alt="ADX"
              className="w-6 h-6"
            />
          </div>
        </div>
      </div>

      {/* Fees Section */}
      {fees && (
        <div className="border-t pt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-txtfade">Fees:</span>
            <div className="flex items-center gap-2">
              <Image
                src={collateralToken.image}
                alt={collateralToken.symbol}
                className="w-4 h-4"
              />
              <span className="text-white">
                <FormatNumber
                  nb={fees}
                  format="number"
                  suffix={` ${collateralToken.symbol}`}
                />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Routes */}
      <div className="border-t pt-3">
        <h6 className="text-sm font-medium mb-2">Alternative Routes:</h6>
        <div className="space-y-2">
          {['BONK', 'JITOSOL', 'WBTC'].map((token) => (
            <div key={token} className="flex justify-between items-center">
              <span className="text-sm text-txtfade">{token}</span>
              <Button
                size="sm"
                variant="outline"
                title="USE"
                onClick={() => {
                  const altToken = window.adrena.client.tokens.find(
                    (t) => t.symbol === token,
                  );
                  if (altToken) setCollateralToken(altToken);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Buy Button */}
      <Button
        title="Buy ADX"
        onClick={handleBuy}
        size="lg"
        className="w-full mt-4"
        disabled={!connected || !collateralAmount || collateralAmount <= 0}
      />

      {/* Info Text */}
      <p className="text-xs text-txtfade text-center">
        For the protocol health, please consider depositing using the best
        routes. You get lower fees, protocol pool stays balanced, we all win ❤️
      </p>
    </div>
  );
}
