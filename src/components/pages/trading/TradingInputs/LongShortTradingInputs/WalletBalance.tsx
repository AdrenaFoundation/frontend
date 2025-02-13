import Image from 'next/image';

import RefreshButton from '@/components/RefreshButton/RefreshButton';
import { Token } from '@/types';
import { formatNumber } from '@/utils';

import walletImg from '../../../../../../public/images/wallet-icon.svg';

interface WalletBalanceProps {
    tokenA: Token;
    walletTokenBalances: Record<string, number | null> | null;
    onMax: () => void;
}

export const WalletBalance = ({ tokenA, walletTokenBalances, onMax }: WalletBalanceProps) => {
    if (!tokenA || !walletTokenBalances) {
        return <div className="h-6" />;
    }

    const balance = walletTokenBalances[tokenA.symbol];
    if (balance === null) {
        return <div className="h-6" />;
    }

    return (
        <div className="text-sm flex items-center justify-end h-6">
            <div className='flex' onClick={onMax}>
                <Image
                    className="mr-1 opacity-60 relative"
                    src={walletImg}
                    height={14}
                    width={14}
                    alt="Wallet icon"
                />
                <span className="text-txtfade font-mono text-xs cursor-pointer">
                    {formatNumber(balance, tokenA.displayAmountDecimalsPrecision, tokenA.displayAmountDecimalsPrecision)}
                </span>
            </div>
            <RefreshButton className="border-0 ml-[0.1em] relative -top-[0.1em]" />
        </div>
    );
};
