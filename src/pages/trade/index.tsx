import TabSelect from '@/components/TabSelect/TabSelect';
import TradingTokenInputs from '@/components/TradingTokenInput/TradingTokenInputs';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import styles from './index.module.scss'

export default function Trade() {
    const [selectedTab, setSelectedTab] = useState<'long' | 'short' | 'swap'>('long');

    const dispatch = useDispatch();

    return (
        <div className={styles.trade}>
            <div className={styles.trade__tradingview}>

            </div>

            <div className={styles.trade__panel}>
                <TabSelect
                    selected={selectedTab}
                    tabs={[
                        { title: 'long', icon: '/images/long.svg' },
                        { title: 'short', icon: '/images/short.svg' },
                        { title: 'swap', icon: '/images/swap.svg' },
                    ]} onClick={(title, _: number) => {
                        setSelectedTab(title);
                    }} />

                <TradingTokenInputs titleA="Pay" titleB="Long" />
            </div>
        </div>
    );
}
