import Image from 'next/image';
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import TradingInput from '@/components/pages/trading/TradingInput/TradingInput';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { Token } from '@/types';

export default function ADXSwapSell({
  className,
  connected,
}: {
  className?: string;
  connected: boolean;
}) {
  const [adxAmount, setAdxAmount] = useState<number | null>(null);
  const [receiveToken, setReceiveToken] = useState<Token | null>(null);
  const [receiveAmount, setReceiveAmount] = useState<number | null>(null);
  const [fees, setFees] = useState<number | null>(null);

  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  // Initialize with USDC
  useEffect(() => {
    const usdcToken = window.adrena.client.tokens.find(
      (t) => t.symbol === 'USDC',
    );
    if (usdcToken) {
      setReceiveToken(usdcToken);
    }
  }, []);

  // Calculate receive amount and fees when ADX amount changes
  useEffect(() => {
    if (!adxAmount || !receiveToken || !tokenPrices.ADX) return;

    const adxValue = adxAmount * tokenPrices.ADX;
    const receiveValue = adxValue * 0.9995; // Approximate fee calculation
    const receiveAmountCalculated =
      receiveValue / tokenPrices[receiveToken.symbol];

    setReceiveAmount(receiveAmountCalculated);
    setFees(adxValue * 0.0005); // 0.05% fee
  }, [adxAmount, receiveToken, tokenPrices]);

  const handleMax = () => {
    if (!walletTokenBalances?.ADX) return;
    setAdxAmount(walletTokenBalances.ADX);
  };

  const handlePercentage = (percentage: number) => {
    if (!walletTokenBalances?.ADX) return;
    setAdxAmount(walletTokenBalances.ADX * percentage);
  };

  const handleSell = () => {
    if (!connected) return;
    // Open Jupiter in new tab
    window.open(
      'https://jup.ag/swap/AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw-USDC',
      '_blank',
    );
  };

  if (!receiveToken) return null;

  return (
    <div className={twMerge('flex flex-col gap-4', className)}>
      {/* ADX Amount Section */}
      <div>
        <h5 className="text-white mb-2">Pay</h5>
        <div className="flex gap-2">
          <div className="flex-1 bg-inputcolor rounded-lg p-3 flex items-center justify-between">
            <input
              type="number"
              value={adxAmount || ''}
              onChange={(e) =>
                setAdxAmount(e.target.value ? parseFloat(e.target.value) : null)
              }
              placeholder="0"
              className="bg-transparent text-white flex-1 outline-none"
            />
            <Image
              src={window.adrena.client.adxToken.image}
              alt="ADX"
              className="w-6 h-6"
            />
          </div>
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
          {walletTokenBalances?.ADX ? (
            <FormatNumber
              nb={walletTokenBalances.ADX}
              format="number"
              suffix=" ADX"
            />
          ) : (
            '0 ADX'
          )}
        </div>
      </div>

      {/* Receive Section */}
      <div>
        <h5 className="text-white mb-2">Receive</h5>
        <div className="flex gap-2">
          <TradingInput
            className="flex-1"
            inputClassName="bg-third"
            value={receiveAmount}
            selectedToken={receiveToken}
            tokenList={window.adrena.client.tokens}
            onTokenSelect={setReceiveToken}
            onChange={() => {}} // Read-only
            disabled={true}
            placeholder="0"
          />
        </div>
      </div>

      {/* Fees Section */}
      {fees && (
        <div className="border-t pt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-txtfade">Fees:</span>
            <div className="flex items-center gap-2">
              <Image
                src={window.adrena.client.adxToken.image}
                alt="ADX"
                className="w-4 h-4"
              />
              <span className="text-white">
                <FormatNumber nb={fees} format="number" suffix=" ADX" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sell Button */}
      <Button
        title="Sell ADX"
        onClick={handleSell}
        size="lg"
        className="w-full mt-4"
        disabled={!connected || !adxAmount || adxAmount <= 0}
      />

      {/* Info Text */}
      <p className="text-xs text-txtfade text-center">
        Selling ADX reduces your governance power and revenue share. Consider
        staking instead for passive income.
      </p>
    </div>
  );
}
