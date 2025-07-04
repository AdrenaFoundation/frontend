import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect } from 'react';

import { setBorrowRatesAction } from '@/actions/borrowRatesActions';
import { RATE_DECIMALS } from '@/constant';
import { useDispatch } from '@/store/store';
import { nativeToUi } from '@/utils';

let borrowRateInterval: NodeJS.Timeout | null = null;

const BORROW_RATE_LOADING_INTERVAL_IN_MS = 20_000;

export default function useWatchBorrowRates() {
  const dispatch = useDispatch();

  const loadBorrowRates = useCallback(async () => {
    if (!dispatch) return;

    const readonlyProgram = window.adrena.client.getReadonlyAdrenaProgram();

    const custodiesAddresses = window.adrena.client.mainPool.custodies.filter(
      (custody) => !custody.equals(PublicKey.default),
    );

    const result =
      await readonlyProgram.account.custody.fetchMultiple(custodiesAddresses);

    const borrowRates = result.reduce(
      (acc, custody, i) => {
        if (!custody) return acc;

        acc[custodiesAddresses[i].toBase58()] = nativeToUi(
          custody.borrowRateState.currentRate,
          RATE_DECIMALS,
        );

        return acc;
      },
      {} as {
        [custody: string]: number | null;
      },
    );

    dispatch(setBorrowRatesAction(borrowRates));
  }, [dispatch]);

  useEffect(() => {
    if (!window.adrena.client) {
      return;
    }

    loadBorrowRates().catch((e) =>
      console.error('error happened loading borrow rates', e),
    );

    borrowRateInterval = setInterval(() => {
      loadBorrowRates().catch((e) =>
        console.error('error happened loading borrow rates', e),
      );
    }, BORROW_RATE_LOADING_INTERVAL_IN_MS);

    return () => {
      if (!borrowRateInterval) {
        return;
      }

      clearInterval(borrowRateInterval);
      borrowRateInterval = null;
    };

    // Manually handle dependencies to avoid unwanted refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadBorrowRates, !!window.adrena.client.connection]);
}
