import { createSelector } from '@reduxjs/toolkit';

import { selectWalletPublicKey } from './walletSelectors';

/**
 * Memoize the computation of all possible user position addresses.
 * - https://reselect.js.org/api/createselector/
 */
export const selectPossibleUserPositions = createSelector(
  [selectWalletPublicKey],
  // TODO: handle multiple pool
  (user) =>
    user &&
    window.adrena.client.getPossiblePositionAddresses(
      user,
      window.adrena.client.mainPool.pubkey,
    ),
);
