import { useState } from 'react';
import Input from '../Input/Input';
import Select from '../Select/Select';
import styles from './TradingTokenInputs.module.scss'

type Tokens = 'ETH' | 'BTC' | 'SOL';

export default function TradingTokenInputs({ className, inputALabelTopLeft, inputALabelTopRight, inputBLabelTopLeft, inputBLabelTopRight }: {
    className?: string;
    inputALabelTopLeft?: string;
    inputALabelTopRight?: string;
    inputBLabelTopLeft?: string;
    inputBLabelTopRight?: string;
}) {
    const [inputA, setInputA] = useState<string>('');
    const [inputB, setInputB] = useState<string>('');

    const [tokenA, setTokenA] = useState<Tokens>('ETH');
    const [tokenB, setTokenB] = useState<Tokens>('ETH');

    const tokens: Tokens[] = ['ETH', 'BTC', 'SOL'];

    const switchAB = () => {
        setInputA(inputB);
        setInputB(inputA);

        setTokenA(tokenB);
        setTokenB(tokenA);
    };

    return (
        <div className={`${styles.tradingTokenInputs} ${className ?? ''}`}>
            <div className={`${styles.tradingTokenInputs__container} ${className ?? ''}`}>
                <div className={styles.tradingTokenInputs__container_labels}>
                    <div>{inputALabelTopLeft}</div>
                    <div>{inputALabelTopRight}</div>
                </div>
                <div className={styles.tradingTokenInputs__container_infos}>
                    <Input value={inputA} placeholder="0.00" className={styles.tradingTokenInputs__container_infos_input} onChange={(v) => setInputA(v)} />

                    <Select className={styles.tradingTokenInputs__container_infos_select} selected={tokenA} options={tokens} onSelect={(token) => setTokenA(token)} />
                </div>
            </div>

            <div className={styles.tradingTokenInputs__switch} onClick={() => switchAB()}>
                <img src="/images/swap.svg" />
            </div>

            <div className={`${styles.tradingTokenInputs__container} ${className ?? ''}`}>
                <div className={styles.tradingTokenInputs__container_labels}>
                    <div>{inputBLabelTopLeft}</div>
                    <div>{inputBLabelTopRight}</div>
                </div>
                <div className={styles.tradingTokenInputs__container_infos}>
                    <Input value={inputB} placeholder="0.00" className={styles.tradingTokenInputs__container_infos_input} onChange={(v) => setInputB(v)} />

                    <Select className={styles.tradingTokenInputs__container_infos_select} selected={tokenB} options={tokens} onSelect={(token) => setTokenB(token)} />
                </div>
            </div>
        </div >
    );
}