import Image from 'next/image';
import Link from 'next/link';

import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended, PositionHistoryExtended } from '@/types';
import { formatDate2Digits, getTokenImage, getTokenSymbol } from '@/utils';

import OnchainAccountInfo from '../../../monitoring/OnchainAccountInfo';

interface PositionNameProps {
    position: PositionExtended | PositionHistoryExtended;
    isHistory?: boolean;
    readOnly: boolean;
}

export const PositionName = ({ position, readOnly, isHistory }: PositionNameProps) => (
    <div className="justify-start items-center gap-2.5 flex">
        <Image
            className="w-8 h-8 rounded-full"
            src={getTokenImage(position.token)}
            width={200}
            height={200}
            alt={`${getTokenSymbol(position.token.symbol)} logo`}
        />

        <div className="flex flex-col justify-start items-start gap-0.5 inline-flex">
            <div className="flex items-center justify-center gap-2">
                {!readOnly && window.location.pathname !== '/trade' ? (
                    <Link
                        href={`/trade?pair=USDC_${getTokenSymbol(
                            position.token.symbol,
                        )}&action=${position.side}`}
                        target=""
                    >
                        <div className="text-center text-whiteLabel text-lg font-black font-mono tracking-wide">
                            {getTokenSymbol(position.token.symbol)}
                        </div>
                    </Link>
                ) : (
                    <div className="text-center text-whiteLabel text-lg font-black font-mono tracking-wide">
                        {getTokenSymbol(position.token.symbol)}
                    </div>
                )}

                <div
                    className={`px-2 py-1 rounded-lg justify-center items-center gap-2 flex ${position.side === 'long' ? 'bg-greenSide/10' : 'bg-redSide/10'}`}
                >
                    <div
                        className={`text-center text-xs font-medium font-mono ${position.side === 'long' ? 'text-greenSide' : 'text-redSide'}`}
                    >
                        {position.side.charAt(0).toUpperCase() + position.side.slice(1)}
                    </div>
                </div>

                <div className="text-center text-whiteLabel text-sm font-extrabold font-mono">
                    <FormatNumber
                        nb={
                            'initialLeverage' in position
                                ? position.initialLeverage
                                : position.entryLeverage
                        }
                        format="number"
                        precision={0}
                        isDecimalDimmed={false}
                    />x
                </div>
                {isHistory ? (
                    <div className="mt-1 text-xxs opacity-50">
                        {formatDate2Digits('entryDate' in position ? position.entryDate : '-')}
                    </div>
                ) : (
                    <OnchainAccountInfo
                        address={position.pubkey}
                        shorten={true}
                        className="text-xs font-mono mt-1"
                        iconClassName="w-2 h-2"
                    />
                )}
            </div>
        </div>
    </div>
);
