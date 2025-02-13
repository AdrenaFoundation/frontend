import { WalletBalancesState } from '@/reducers/walletBalancesReducer';
import { Token } from '@/types';
import { formatPriceInfo } from '@/utils';

import LeverageSlider from '../../../../common/LeverageSlider/LeverageSlider';
import TradingInput from '../../TradingInput/TradingInput';
import { WalletBalance } from './WalletBalance';

interface InputSectionProps {
    tokenA: Token;
    allowedTokenA: Token[];
    walletTokenBalances: WalletBalancesState;
    inputA: number | null;
    leverage: number;
    priceA: number | null;
    onTokenASelect: (token: Token) => void;
    onInputAChange: (value: number | null) => void;
    onLeverageChange: (value: number) => void;
    onMax: () => void;
}

export const InputSection = ({
    tokenA,
    allowedTokenA,
    walletTokenBalances,
    inputA,
    leverage,
    priceA,
    onTokenASelect,
    onInputAChange,
    onLeverageChange,
    onMax,
}: InputSectionProps) => (
    <>
        <div className="flex w-full justify-between items-center sm:mt-1 sm:mb-1">
            <h5 className="ml-4">Inputs</h5>
            <WalletBalance
                tokenA={tokenA}
                walletTokenBalances={walletTokenBalances}
                onMax={onMax}
            />
        </div>

        <div className="flex">
            <div className="flex flex-col border rounded-lg w-full bg-inputcolor relative">
                <TradingInput
                    className="text-sm rounded-full"
                    inputClassName="border-0 tr-rounded-lg bg-inputcolor"
                    tokenListClassName="border-none bg-inputcolor"
                    menuClassName="shadow-none"
                    menuOpenBorderClassName="rounded-tr-lg"
                    value={inputA}
                    subText={
                        priceA ? (
                            <div className="text-sm text-txtfade font-mono">
                                {priceA > 500000000
                                    ? `> ${formatPriceInfo(500000000)}`
                                    : formatPriceInfo(priceA)}
                            </div>
                        ) : null
                    }
                    selectedToken={tokenA}
                    tokenList={allowedTokenA}
                    onTokenSelect={onTokenASelect}
                    onChange={onInputAChange}
                />

                <LeverageSlider
                    value={leverage}
                    className="w-full font-mono border-t select-none"
                    onChange={onLeverageChange}
                />
            </div>
        </div>
    </>
);
