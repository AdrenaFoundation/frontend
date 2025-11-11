import { AddressLookupTableState, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export function useAllAddressLookupTables({
  wallet,
}: {
  wallet: PublicKey | null;
}): {
  allAddressLookupTables:
    | { pubkey: PublicKey; account: AddressLookupTableState }[]
    | null;
  triggerAllAddressLookupTablesReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [allAddressLookupTables, setAllAddressLookupTables] = useState<
    { pubkey: PublicKey; account: AddressLookupTableState }[] | null
  >(null);

  useEffect(() => {
    const loadAllAddressLookupTables = async () => {
      if (!wallet) return setAllAddressLookupTables(null);

      try {
        setAllAddressLookupTables(
          await window.adrena.client.getAllLookupTablesByAuthority(wallet),
        );
      } catch (e) {
        console.log('Error loading address lookup tables', e);
      }
    };

    loadAllAddressLookupTables();

    const interval = setInterval(loadAllAddressLookupTables, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trickReload, window.adrena.client.readonlyConnection]);

  return {
    allAddressLookupTables,
    triggerAllAddressLookupTablesReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
