import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputString from '@/components/common/inputString/InputString';
import { useSelector } from '@/store/store';
import { Token } from '@/types';

import Modal from '../../../common/Modal/Modal';

export function PickTokenModal({
    isPickTokenModalOpen,
    setIsPickTokenModalOpen,
    recommendedToken,
    tokenList,
    pick,
}: {
    isPickTokenModalOpen: boolean;
    setIsPickTokenModalOpen: (b: boolean) => void;
    recommendedToken?: Token;
    tokenList: Token[];
    pick: (t: Token) => void;
}) {
    const walletTokenBalances = useSelector((state) => state.walletTokenBalances);
    const [tokenSearch, setTokenSearch] = useState<string | null>(null);

    const filteredTokenList = useMemo(() => tokenList.filter((token) => {
        if (!tokenSearch || !tokenSearch.length) return true;

        return token.symbol.toLowerCase().includes(tokenSearch.toLowerCase() ?? '');
    }), [tokenList, tokenSearch]);

    return <AnimatePresence>
        {isPickTokenModalOpen ? (
            <Modal
                title=""
                close={() => setIsPickTokenModalOpen(false)}
                className="flex flex-col w-[20em] max-w-[95%] h-[60vh] max-h-[90%] gap-2 items-center"
            >
                <InputString
                    className="font-boldy text-xl relative p-3 border border-bcolor rounded-lg text-center w-full mt-4 mb-4 max-w-[95%]"
                    value={tokenSearch ?? ''}
                    onChange={setTokenSearch}
                    placeholder="Token Symbol"
                    inputFontSize="1em"
                    maxLength={24}
                />

                {recommendedToken ? <Tippy content={"Using the right asset avoid unnecessary swap."}>
                    <div className='flex gap-2 items-center mb-3' onClick={() => pick(recommendedToken)}>
                        <div className='text-sm text-txtfade'>Recommended</div>

                        <div className='flex items-center hover:underline cursor-pointer'>
                            <div className='font-archivo w-[5em] flex items-center justify-center'>
                                {recommendedToken.symbol}
                            </div>

                            <Image
                                className='h-5 w-5'
                                src={recommendedToken.image}
                                alt="logo"
                                width="40"
                                height="40"
                            />
                        </div>
                    </div>
                </Tippy> : null}

                <div className={twMerge("flex flex-col gap-1 w-full items-center max-w-[90%] pt-2 pb-2", filteredTokenList.length ? 'border' : '')}>
                    {filteredTokenList.length ? filteredTokenList.map((token, i) => (<>
                        {i > 0 ? <div className='w-full h-[1px] bg-bcolor' key={"separator" + token.symbol} /> : null}

                        <div
                            key={"symbol" + token.symbol}
                            className={twMerge(
                                'flex gap-2 items-center justify-center cursor-pointer hover:underline',
                                !walletTokenBalances?.[token.symbol] ? 'opacity-40' : '',
                            )}
                            onClick={() => pick(token)}
                        >
                            <div className='font-archivo w-[5em] flex items-center justify-center'>
                                {token.symbol}
                            </div>

                            <Image
                                className='h-5 w-5'
                                src={token.image}
                                alt="logo"
                                width="40"
                                height="40"
                            />
                        </div>
                    </>)) : 'No tokens found'}
                </div>
            </Modal>
        ) : null}
    </AnimatePresence>;
}