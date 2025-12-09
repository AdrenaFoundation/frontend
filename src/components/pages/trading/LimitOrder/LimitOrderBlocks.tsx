import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { LimitOrder } from '@/types';

import LimitOrderBlock from './LimitOrderBlock';

export function LimitOrderBlocks({
    connected,
    className,
    limitOrders,
    // isLoading,
    reload,
}: {
    connected: boolean;
    className?: string;
    limitOrders: LimitOrder[];
    // isLoading: boolean;
    reload: () => void;
}) {
    const { t } = useTranslation();
    // if (isLoading) {
    //     return (
    //         <div className="flex overflow-hidden w-full mt-4 h-[15em] items-center justify-center">
    //             <Loader className='ml-auto mr-auto' />
    //         </div>
    //     );
    // }

    if (!connected) {
        return (
            <div className="flex overflow-hidden bg-main/90 w-full border rounded-md mt-4 h-[15em] items-center justify-center">
                <WalletConnection connected={connected} />
            </div>
        );
    }

    if (!limitOrders || limitOrders.length === 0) {
        return (
            <div className="flex overflow-hidden bg-main/90 grow border rounded-md h-[15em] items-center justify-center w-full">
                <div className="text-sm opacity-50 font-normal mt-5 font-semibold">
                    {t('trade.limitOrder.noLimitOrders')}
                </div>
            </div>
        );
    }

    return (
        <div
            className={twMerge(
                'flex flex-col bg-first w-full h-full gap-3',
                className,
            )}
        >
            {limitOrders.map((order) => (
                <LimitOrderBlock
                    key={order.id}
                    order={order}
                    onCancel={() => {
                        const notification =
                            MultiStepNotification.newForRegularTransaction(t('trade.limitOrder.cancelLimitOrder', { id: order.id })).fire();

                        window.adrena.client.cancelLimitOrder({
                            id: order.id,
                            collateralCustody: order.collateralCustody,
                            notification,
                        }).then(() => {
                            reload();
                        });
                    }}
                />
            ))}
        </div>
    );
}

export default memo(LimitOrderBlocks);
