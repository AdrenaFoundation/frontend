function percentageCalculation({
  side,
  percent,
  price,
  tokenDecimals,
}: {
  side: 'long' | 'short';
  percent: number;
  price: number;
  tokenDecimals: number;
}): number {
  const p = side === 'long' ? -percent : percent;

  return Number((price + (price * p) / 100).toFixed(tokenDecimals));
}

export function calculateLimitOrderTriggerPrice({
  tokenPriceBTrade,
  tokenDecimals,
  percent,
  side,
}: {
  tokenPriceBTrade: number | undefined | null;
  tokenDecimals: number;
  percent: number;
  side: 'long' | 'short';
}): number {
  const p = side === 'long' ? -percent : percent;
  return Number(
    (tokenPriceBTrade
      ? tokenPriceBTrade + (tokenPriceBTrade * p) / 100
      : 0
    ).toFixed(tokenDecimals),
  );
}

export function calculateLimitOrderLimitPrice({
  limitOrderTriggerPrice,
  tokenDecimals,
  percent,
  side,
}: {
  limitOrderTriggerPrice: number;
  tokenDecimals: number;
  percent: number;
  side: 'long' | 'short';
}) {
  return percentageCalculation({
    side,
    percent,
    price: limitOrderTriggerPrice,
    tokenDecimals,
  });
}
