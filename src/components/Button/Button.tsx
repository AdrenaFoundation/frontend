import styles from './Button.module.scss'

export default function Button({ title, onClick, className, leftIcon, rightIcon }: {
    title: string;
    onClick: () => void;
    className?: string;
    leftIcon?: string;
    rightIcon?: string;
}) {
    return (
        <div className={`${styles.button} ${className ?? ''}`} onClick={() => onClick()}>
            {leftIcon ? <img src={leftIcon} className={styles.button__left_icon} /> : null}
            {title}
            {rightIcon ? <img src={rightIcon} className={styles.button__right_icon} /> : null}
        </div>
    );
}
