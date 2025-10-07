import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';

import Button from '@/components/common/Button/Button';
import { TokenBalance } from '@/hooks/useGetBalancesAndJupiterPrices';
import { selectWalletAddress } from '@/selectors/walletSelectors';
import { useSelector } from '@/store/store';
import { isValidPublicKey, uiToNative } from '@/utils';

import InputNumber from '../common/InputNumber/InputNumber';
import InputString from '../common/inputString/InputString';
import FormatNumber from '../Number/FormatNumber';
import { TokenListItem } from './TokenListItem';

export function SendTokenView({
    tokenBalancesWithPrices,
    isLoadingBalances,
    sendTokensToWalletAddress,
    cancel,
}: {
    tokenBalancesWithPrices: Array<TokenBalance & { priceUsd?: number; valueUsd?: number }>;
    isLoadingBalances?: boolean;
    sendTokensToWalletAddress: (i: {
        senderAddress: PublicKey;
        tokenSymbol: string;
        tokenAddress: PublicKey;
        amount: BN;
        recipientAddress: PublicKey;
    }) => Promise<void>;
    cancel: () => void;
}) {
    const [selectedToken, setSelectedToken] = useState<typeof tokenBalancesWithPrices[0] | null>(
        tokenBalancesWithPrices.find(t => t.symbol === 'SOL') || tokenBalancesWithPrices[0] || null
    );

    const [recipientAddress, setRecipientAddress] = useState<string | null>('');
    const [amount, setAmount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recipientAddressError, setRecipientAddressError] = useState<string | null>(null);
    const walletAddress = useSelector(selectWalletAddress);

    const handleRecipientAddressChange = (value: string | null) => {
        setRecipientAddress(value);

        if (value?.trim()) {
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
            const amountNumber = amount ?? 0;

            if (amountNumber <= 0) {
                setError('Amount must be greater than 0');
                return;
            }

            if (amountNumber > selectedToken.uiAmount) {
                setError(`Insufficient balance. Available: ${selectedToken.uiAmount} ${selectedToken.symbol}`);
                return;
            }

            const senderPubkey = new PublicKey(walletAddress);

            await sendTokensToWalletAddress({
                senderAddress: senderPubkey,
                tokenSymbol: selectedToken.symbol,
                tokenAddress: new PublicKey(selectedToken.mint),
                amount: uiToNative(amountNumber, selectedToken.decimals),
                recipientAddress: recipientPubkey
            });
        } catch (err) {
            console.error('Transfer error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = !recipientAddress || !amount || !selectedToken || isLoading || !!recipientAddressError;

    return (
        <div className="flex flex-col grow gap-4">
            <div className="gap-2 pl-2 pr-2">
                {isLoadingBalances ? (
                    <div className="flex-1 overflow-y-auto h-[calc(100vh-28em)] max-h-[calc(100vh-28em)] min-h-[calc(100vh-28em)] bg-gray-900 rounded-md" />
                ) : (
                    <div className="grid grid-cols-1 gap-1.5 h-[calc(100vh-28em)] pr-2 overflow-y-auto">
                        {tokenBalancesWithPrices.map((token: typeof tokenBalancesWithPrices[0]) => (
                            <TokenListItem
                                key={token.mint}
                                token={token}
                                onClick={() => {
                                    setSelectedToken(token);
                                    setAmount(0);
                                }}
                                isSelected={selectedToken?.mint === token.mint}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-white">Recipient Address</label>

                <InputString
                    value={recipientAddress ?? ''}
                    onChange={(value) => handleRecipientAddressChange(value)}
                    placeholder='Enter recipient address'
                    className='p-2 bg-inputcolor rounded-md'
                    inputFontSize='1em'
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
                            onClick={() => setAmount(selectedToken.uiAmount)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <FormatNumber
                                nb={selectedToken.uiAmount}
                                isDecimalDimmed={false}
                                precisionIfPriceDecimalsBelow={selectedToken.decimals}
                                precision={selectedToken.decimals}
                                className='text-mono text-sm'
                                prefix='Max: '
                                suffix={selectedToken.symbol}
                            />
                        </button>
                    ) : null}
                </div>

                <InputNumber
                    value={amount ?? undefined}
                    onChange={(value: number | null) => setAmount(value)}
                    className='bg-inputcolor p-2 rounded-md'
                    inputFontSize='1em'
                />
            </div>

            {error ? (
                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            ) : null}

            <div className='flex gap-2 mt-auto'>
                <Button
                    title='Cancel'
                    onClick={() => {
                        cancel();
                    }}
                    className="w-1/2"
                />

                <Button
                    title={isLoading ? 'Sending...' : 'Send Tokens'}
                    disabled={isButtonDisabled}
                    onClick={handleSend}
                    className="w-1/2"
                />
            </div>
        </div>
    );
}
