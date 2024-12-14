import { createSelector } from '@reduxjs/toolkit';

import { selectWalletPublicKey } from './wallet';

/**
 * Memoize the computation of all possible user position addresses.
 * - https://reselect.js.org/api/createselector/
 */
export const selectPossibleUserPositions = createSelector(
  [selectWalletPublicKey],
  (user) => user && window.adrena.client.getPossiblePositionAddresses(user),
);
