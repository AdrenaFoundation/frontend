import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import closeBtnIcon from '@/../public/images/Icons/cross.svg';
import searchIcon from '@/../public/images/Icons/search.svg';
import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { Token } from '@/types';

import Modal from '../../../common/Modal/Modal';

export function PickTokenModal({
    isPickTokenModalOpen,
    setIsPickTokenModalOpen,
    recommendedToken,
    tokenList,
    pick,
    isDisplayAllTokens = false,
}: {
    isPickTokenModalOpen: boolean;
    setIsPickTokenModalOpen: (b: boolean) => void;
    recommendedToken?: Token;
    tokenList: Token[];
    pick: (t: Token) => void;
    isDisplayAllTokens?: boolean;
}) {
    const walletTokenBalances = useSelector((state) => state.walletTokenBalances);
    const [tokenSearch, setTokenSearch] = useState<string | null>(null);
    const [displayAllTokens, setDisplayAllTokens] = useState<boolean>(isDisplayAllTokens);

    const tokenPrices = useSelector((s) => s.tokenPrices);

    const filteredTokenList = useMemo(() => tokenList.filter((token) => {
        if (!displayAllTokens && !walletTokenBalances?.[token.symbol]) return false;

        if (!tokenSearch || !tokenSearch.length) return true;

        return token.symbol.toLowerCase().includes(tokenSearch.toLowerCase() ?? '');
    }), [tokenList, displayAllTokens, walletTokenBalances, tokenSearch]);

    return <AnimatePresence>
        {isPickTokenModalOpen ? (
            <Modal
                header={false}
                key='pick-token-modal-inner'
                title=""
                close={() => setIsPickTokenModalOpen(false)}
                className="flex flex-col w-[18em] max-w-[95%] h-[60vh] max-h-[90%] gap-2 ml-3"
            >
                <div className='flex w-full gap-1 pt-2 pr-2 pb-2'>
                    <Image
                        className="opacity-40"
                        src={searchIcon}
                        alt="search icon"
                        width={20}
                        height={20}
                    />

                    <InputString
                        className="text-lg relative p-2 rounded-md text-left w-full bg-transparent"
                        value={tokenSearch ?? ''}
                        onChange={setTokenSearch}
                        placeholder="Token Symbol"
                        inputFontSize="0.8em"
                        maxLength={24}
                    />

                    <Image
                        className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300"
                        src={closeBtnIcon}
                        alt="close icon"
                        width={25}
                        height={25}
                        onClick={() => setIsPickTokenModalOpen(false)}
                    />
                </div>

                {recommendedToken ?
                    <div className='flex gap-4 items-center mb-1 w-full'>
                        <Tippy content={"Using the right asset avoid unnecessary swap."}>
                            <div className='text-sm text-txtfade ml-1'>Recommended</div>
                        </Tippy>

                        <div className='flex items-center cursor-pointer gap-2 rounded-md pr-2 pt-1 pb-1' onClick={() => pick(recommendedToken)}>
                            <Image
                                className='h-4 w-4'
                                src={recommendedToken.image}
                                alt="logo"
                                width="40"
                                height="40"
                            />

                            <div className='font-archivo flex items-center justify-center text-sm'>
                                {recommendedToken.symbol}
                            </div>
                        </div>
                    </div>
                    : null}

                {!isDisplayAllTokens ? <div className='w-full flex gap-2'>
                    <Button
                        title="Your tokens"
                        className={twMerge("text-xs rounded-md", !displayAllTokens ? 'border-white/30 text-white/80 border-2' : 'border-transparent text-white/40 border bg-third')}
                        onClick={() => {
                            setDisplayAllTokens(false);
                        }}
                        variant="outline"
                    />

                    <Button
                        title="All tokens"
                        className={twMerge("text-xs rounded-md", displayAllTokens ? 'border-white/30 border-2' : 'border-transparent text-white/40 border bg-third')}
                        onClick={() => {
                            setDisplayAllTokens(true);
                        }}
                        variant="outline"
                    />
                </div> : null}

                <div className={twMerge("flex flex-col w-full items-center mt-2 pr-2.5 max-h-full overflow-y-auto")}>
                    {filteredTokenList.length ? filteredTokenList.map((token, i) => (<div
                        key={'pick-token-modal-inner-' + i}
                        className='flex gap-2 cursor-pointer w-full hover:bg-third hover:rounded-md p-2'
                        onClick={() => pick(token)}
                    >
                        <Image
                            className='h-5 w-5'
                            src={token.image}
                            alt="logo"
                            width="40"
                            height="40"
                        />

                        <div className='flex flex-col items-start'>
                            <div className='font-archivo flex items-center justify-center text-sm'>
                                {token.symbol}
                            </div>

                            <div className='font-archivo text-txtfade flex items-center justify-center text-xxs'>
                                {token.name}
                            </div>
                        </div>

                        {walletTokenBalances?.[token.symbol] ? <div className='ml-auto pr-2 flex flex-col items-end justify-center'>
                            {tokenPrices?.[token.symbol] ?
                                <FormatNumber
                                    nb={tokenPrices[token.symbol]! * walletTokenBalances[token.symbol]!}
                                    format="currency"
                                    minimumFractionDigits={0}
                                    precisionIfPriceDecimalsBelow={4}
                                    isDecimalDimmed={false}
                                    className='text-sm text-white font-archivo'
                                /> : null}

                            <div className='gap-1 flex text-xs items-center'>
                                <FormatNumber
                                    nb={walletTokenBalances?.[token.symbol]}
                                    format="number"
                                    isAbbreviate={true}
                                    isAbbreviateIcon={false}
                                    minimumFractionDigits={0}
                                    precisionIfPriceDecimalsBelow={4}
                                    isDecimalDimmed={false}
                                    suffix={token.symbol}
                                    suffixClassName='text-xs text-txtfade font-archivo'
                                    className='text-xs text-txtfade'
                                />
                            </div>
                        </div> : null}
                    </div>)) : <div className='text-base mt-8 text-white/60'>No tokens found</div>}
                </div>
            </Modal>
        ) : null
        }
    </AnimatePresence >;
}