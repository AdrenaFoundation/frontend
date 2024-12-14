import type { RootState } from '@/store/store';

export const selectTokenPrices = (state: RootState) =>
  state.tokenPrices ?? null;
