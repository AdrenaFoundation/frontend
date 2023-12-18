import BN from 'bn.js';
import { twMerge } from 'tailwind-merge';

export default function DateInfo({
  className,
  timestamp,
}: {
  className?: string;
  timestamp: BN;
}) {
  return (
    <div className={twMerge(className)}>
      {new Date(timestamp.toNumber() * 1_000).toLocaleString()}
    </div>
  );
}
