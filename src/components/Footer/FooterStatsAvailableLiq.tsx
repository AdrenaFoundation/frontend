import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import useDynamicCustodyAvailableLiquidity from '@/hooks/useDynamicCustodyAvailableLiquidity';
import { useSelector } from '@/store/store';
import { getTokenSymbol } from '@/utils';

import FormatNumber from '../Number/FormatNumber';
import InfoAnnotation from '../pages/monitoring/InfoAnnotation';

export default function FooterStatsAvailableLiq({
  activeToken,
  isLoading,
}: {
  activeToken: 'SOL' | 'BTC' | 'BONK';
  isLoading: boolean;
}) {
  const token = window.adrena.client.tokens.find(
    (t) => getTokenSymbol(t.symbol) === activeToken,
  );

  const tokenPrices = useSelector((state) => state.tokenPrices);
  const tokenPrice = token?.symbol ? tokenPrices[token.symbol] : null;

  const custody = token?.mint
    ? window.adrena.client.getCustodyByMint(token?.mint)
    : null;

  const custodyLiquidity = useDynamicCustodyAvailableLiquidity(custody);

  return (
    <div className="flex flex-row items-center justify-center gap-1 mt-1">
      <InfoAnnotation
        className="inline-flex ml-0 opacity-30"
        text="This value represents the total size available for borrowing in this market and side by all traders. It depends on the pool's available liquidity and configuration restrictions."
      />
      <p className="text-xs opacity-30 font-boldy">Avail. long liq.</p>
      <AnimatePresence mode="wait">
        {custodyLiquidity !== null && tokenPrice && custody && !isLoading ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            key={`${activeToken}-available-liq`}
          >
            <FormatNumber
              nb={custodyLiquidity * tokenPrice}
              format="currency"
              precision={0}
              className="text-xs opacity-50 transition-opacity duration-300"
              isDecimalDimmed={false}
            />
          </motion.span>
        ) : (
          <motion.div
            key="adx-staking-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#050D14] h-[1.125rem] w-[3rem] animate-loader rounded-lg"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
