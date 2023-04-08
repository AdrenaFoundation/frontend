import styles from './LoadingIcon.module.scss';

export default function LoadingIcon({ className }: { className?: string }) {
  return (
    <div
      className={`${styles.LoadingIcon} ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}
