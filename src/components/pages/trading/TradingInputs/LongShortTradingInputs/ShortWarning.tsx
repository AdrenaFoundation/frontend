import Image from 'next/image';
import Link from 'next/link';

import infoIcon from '../../../../../../public/images/Icons/info.svg';

export const ShortWarning = () => (
    <div className="bg-blue/30 p-4 border-dashed border-blue rounded flex relative w-full pl-10 text-xs mb-2">
        <Image
            className="opacity-60 absolute left-3 top-auto bottom-auto"
            src={infoIcon}
            height={16}
            width={16}
            alt="Info icon"
        />
        <span className="text-sm">
            Max payout on short is equivalent to the borrowed USDC (size). <br />
            More about the peer2pool perp model
            <Link
                href="https://docs.adrena.xyz/technical-documentation/peer-to-pool-perp-model-and-the-risks-as-a-liquidity-provider"
                className="underline ml-1 text-sm"
                target='_blank'
            >
                in the docs
            </Link>
            .
        </span>
    </div>
);
