import React, { ReactNode } from "react";
import styles from "./Button.module.scss";

function Button(
  {
    title,
    onClick,
    className,
    leftIcon,
    rightIcon,
  }: {
    title: ReactNode;
    onClick: () => void;
    className?: string;
    leftIcon?: string;
    rightIcon?: string;
  },
  ref?: React.Ref<HTMLDivElement>
) {
  return (
    <div
      className={`${styles.button} ${className ?? ""}`}
      onClick={() => onClick()}
      ref={ref}
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

export default React.forwardRef(Button);
