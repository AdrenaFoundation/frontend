import styles from "./Button.module.scss";

export default function Button({
  title,
  onClick,
  className,
  leftIcon,
  rightIcon,
}: {
  title: string;
  onClick: () => void;
  className?: string;
  leftIcon?: string;
  rightIcon?: string;
}) {
  return (
    <div
      className={`${styles.button} ${className ?? ""}`}
      onClick={() => onClick()}
    >
      {leftIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={leftIcon}
          className={styles.button__left_icon}
          alt="left icon"
        />
      ) : null}
      {title}
      {rightIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={rightIcon}
          className={styles.button__right_icon}
          alt="right icon"
        />
      ) : null}
    </div>
  );
}
