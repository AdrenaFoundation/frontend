function percentageCalculation({
  side,
  percent,
  price,
}: {
  side: 'long' | 'short';
  percent: number;
  price: number;
}): number {
  const p = side === 'long' ? -percent : percent;

  return Number((price + (price * p) / 100).toFixed(2));
}

export function calculateLimitOrderTriggerPrice({
  tokenPriceBTrade,
  percent,
  side,
}: {
  tokenPriceBTrade: number | undefined | null;
  percent: number;
  side: 'long' | 'short';
}): number {
  const p = side === 'long' ? -percent : percent;
  return Number(
    (tokenPriceBTrade
      ? tokenPriceBTrade + (tokenPriceBTrade * p) / 100
      : 0
    ).toFixed(2),
  );
}

export function calculateLimitOrderLimitPrice({
  limitOrderTriggerPrice,
  percent,
  side,
}: {
  limitOrderTriggerPrice: number;
  percent: number;
  side: 'long' | 'short';
}) {
  return percentageCalculation({
    side,
    percent,
    price: limitOrderTriggerPrice,
  });
}
