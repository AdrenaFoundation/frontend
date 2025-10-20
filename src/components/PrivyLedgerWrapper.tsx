import { useSolanaLedgerPlugin } from '@privy-io/react-auth/solana';
import { ReactNode } from 'react';

export function PrivyLedgerWrapper({ children }: { children: ReactNode }) {
    // Initialize the Solana Ledger plugin
    useSolanaLedgerPlugin();

    return <>{children}</>;
}
