import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import infoIcon from '../../../../../../public/images/Icons/info.svg';

export const ShortWarning = ({ messages }: { messages: string[] }) => {

    const { t } = useTranslation()

    const warningMessages = [
        t('trade.shortWarningLine1'),
        t('trade.shortWarningLine2'),
        t('trade.shortWarningLine3')
    ]

    return (
        <div className="bg-blue/30 p-4 border-dashed border-blue rounded flex relative w-full pl-10 text-xs mb-2">
            <Image
                className="opacity-60 absolute left-3 top-auto bottom-auto"
                src={infoIcon}
                height={16}
                width={16}
                alt="Info icon"
            />
            <span className="text-sm">
                {warningMessages[0]} <br />
                {warningMessages[1]}
                <Link
                    href="https://docs.adrena.trade/technical-documentation/peer-to-pool-perp-model-and-the-risks-as-a-liquidity-provider"
                    className="underline ml-1 text-sm"
                    target='_blank'
                >
                    {warningMessages[2]}
                </Link>
                .
            </span>
        </div>
    )
}
