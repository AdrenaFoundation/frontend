import { twMerge } from 'tailwind-merge';

import Switch from '@/components/common/Switch/Switch';

interface ChartToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function ChartToggleButton({
  isActive,
  onClick,
  children,
  className,
}: ChartToggleButtonProps) {
  const baseClasses = twMerge(
    'flex flex-row items-center gap-2 border p-1 px-2 cursor-pointer border-bcolor rounded-md opacity-50 hover:opacity-100 transition-opacity duration-300 w-full sm:w-fit',
    isActive && 'opacity-100',
  );

  const textClasses = twMerge('text-xs font-interMedium whitespace-nowrap');

  return (
    <div className={twMerge(baseClasses, className)} onClick={onClick}>
      <p className={textClasses}>{children}</p>
      <Switch
        checked={isActive}
        onChange={() => {
          // parent onClick will handle the toggle
        }}
        size="small"
      />
    </div>
  );
}
