import BN from 'bn.js';
import { twMerge } from 'tailwind-merge';

export default function DateInfo({
  className,
  timestamp,
  shorten = false,
}: {
  className?: string;
  timestamp: BN;
  shorten?: boolean;
}) {
  const date = new Date(timestamp.toNumber() * 1_000);

  return (
    <div className={twMerge(className)}>
      {shorten ? date.toLocaleDateString() : date.toLocaleString()}
    </div>
  );
}
