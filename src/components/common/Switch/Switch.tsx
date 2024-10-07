import { twMerge } from 'tailwind-merge';

export default function Switch({
  checked,
  onChange,
  className,
  size = 'medium', // New size prop with default value
}: {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large'; // Define possible sizes
}) {
  // Set size values
  const sizeClasses = {
    small: 'w-4 h-2',
    medium: 'w-6 h-3',
    large: 'w-8 h-4',
  };

  return (
    <div
      className={twMerge(
        'relative inline-block rounded-full bg-third cursor-pointer',
        sizeClasses[size], // Apply size classes
        checked ? 'bg-green' : 'bg-third',
        className,
      )}
      onClick={() => onChange(!checked)}
    >
      <div
        className={twMerge(
          'absolute inline-block rounded-full bg-white shadow-sm transform transition-transform',
          size === 'small'
            ? 'w-2 h-2'
            : size === 'large'
            ? 'w-4 h-4'
            : 'w-3 h-3', // Adjust inner size based on size prop
          checked
            ? size === 'small'
              ? 'translate-x-2'
              : size === 'large'
              ? 'translate-x-full'
              : 'translate-x-full'
            : 'translate-x-0',
        )}
      />
    </div>
  );
}
