import { BN } from '@coral-xyz/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import Image from 'next/image';
import { useState } from 'react';

import Button from '@/components/common/Button/Button';
import { TokenBalance } from '@/hooks/useGetBalancesAndJupiterPrices';
import { selectWalletAddress } from '@/selectors/walletSelectors';
import { useSelector } from '@/store/store';
import { isValidPublicKey, uiToNative } from '@/utils';

import refreshIcon from '../../../public/images/refresh.png';
import MultiStepNotification from '../common/MultiStepNotification/MultiStepNotification';
import { TokenListItem } from './TokenListItem';

interface SendTokenProps {
    onClose?: () => void;
    tokenBalancesWithPrices: Array<TokenBalance & { priceUsd?: number; valueUsd?: number }>;
    onRefreshBalances?: () => void;
    isLoadingBalances?: boolean;
}

export function SendToken({ onClose, tokenBalancesWithPrices, onRefreshBalances, isLoadingBalances }: SendTokenProps) {
    const [selectedToken, setSelectedToken] = useState<typeof tokenBalancesWithPrices[0] | null>(
        tokenBalancesWithPrices.find(t => t.symbol === 'SOL') || tokenBalancesWithPrices[0] || null
    );

    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recipientAddressError, setRecipientAddressError] = useState<string | null>(null);
    const walletAddress = useSelector(selectWalletAddress);

    const handleRecipientAddressChange = (value: string) => {
        setRecipientAddress(value);

        if (value.trim()) {
            if (!isValidPublicKey(value)) {
                setRecipientAddressError('Invalid Solana address format');
            } else {
                setRecipientAddressError(null);
            }
        } else {
            setRecipientAddressError(null);
        }
    };

    const handleSend = async () => {
        if (!walletAddress || !selectedToken) {
            setError('Wallet not connected or no token selected');
            return;
        }

        if (!recipientAddress || !amount) {
            setError('Please fill in all fields');
            return;
        }

        if (recipientAddressError) {
            setError('Please enter a valid Solana address');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const recipientPubkey = new PublicKey(recipientAddress);
            const amountNumber = parseFloat(amount);

            if (amountNumber <= 0) {
                setError('Amount must be greater than 0');
                return;
            }

            if (amountNumber > selectedToken.uiAmount) {
                setError(`Insufficient balance. Available: ${selectedToken.uiAmount} ${selectedToken.symbol}`);
                return;
            }

            const senderPubkey = new PublicKey(walletAddress);
            let transaction: Transaction;

            if (selectedToken.symbol === 'SOL') {
                transaction = await window.adrena.client.buildTransferSolTx({
                    owner: senderPubkey,
                    recipient: recipientPubkey,
                    amountLamports: uiToNative(amountNumber, selectedToken.decimals),
                });
            } else {
                transaction = await window.adrena.client.buildTransferTokenTx({
                    owner: senderPubkey,
                    recipient: recipientPubkey,
                    mint: new PublicKey(selectedToken.mint),
                    amount: uiToNative(amountNumber, selectedToken.decimals),
                });
            }

            const notification =
                MultiStepNotification.newForRegularTransaction(`Sending ${selectedToken.symbol}`).fire();

            await window.adrena.client.signAndExecuteTxAlternative({
                transaction,
                notification,
            });

            onClose?.();
        } catch (err) {
            console.error('Transfer error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = !recipientAddress || !amount || !selectedToken || isLoading || !!recipientAddressError;

    return (
        <div className="flex flex-col gap-4 p-4 bg-secondary border border-bcolor rounded-lg max-w-md mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Send Tokens</h2>
                <div className="flex items-center gap-2">
                    {onRefreshBalances ? (
                        <button
                            onClick={onRefreshBalances}
                            className="text-sm text-gray hover:text-white transition-colors flex items-center justify-center w-6 h-6 p-1 rounded-full hover:bg-gray"
                            title="Refresh balances"
                        >
                            <Image src={refreshIcon} alt="Refresh" className="w-3 opacity-60 hover:opacity-100" />
                        </button>
                    ) : null}
                    {onClose ? (
                        <button
                            onClick={onClose}
                            className="text-gray hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="space-y-2">
                {isLoadingBalances ? (
                    <div className="py-3 text-sm text-gray-400 text-center">Loading token balances...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                        {tokenBalancesWithPrices.map((token: typeof tokenBalancesWithPrices[0]) => (
                            <TokenListItem
                                key={token.mint}
                                token={token}
                                onClick={() => {
                                    setSelectedToken(token);
                                    setAmount('');
                                }}
                                isSelected={selectedToken?.mint === token.mint}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-white">Recipient Address</label>
                <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => handleRecipientAddressChange(e.target.value)}
                    placeholder="Enter Solana wallet address"
                    className={`w-full p-3 bg-inputcolor border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${recipientAddressError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-600 focus:border-blue-500'
                        }`}
                />
                {recipientAddressError ? (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                        <span>⚠</span>
                        <span>{recipientAddressError}</span>
                    </div>
                ) : null}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-white">Amount</label>
                    {selectedToken ? (
                        <button
                            type="button"
                            onClick={() => setAmount(selectedToken.uiAmount.toString())}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Max: {selectedToken.uiAmount.toFixed(6)} {selectedToken.symbol}
                        </button>
                    ) : null}
                </div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    step="any"
                    min="0"
                    className="w-full p-3 bg-inputcolor border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
            </div>

            {error ? (
                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            ) : null}

            <Button
                title={isLoading ? 'Sending...' : 'Send Tokens'}
                disabled={isButtonDisabled}
                onClick={handleSend}
                className="w-full"
            />
        </div>
    );
}
