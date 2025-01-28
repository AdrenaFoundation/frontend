import { twMerge } from 'tailwind-merge';

export default function Checkbox({
  checked,
  onChange,
  className,
}: {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        'h-3 w-3 border border-bcolor rounded-[0.1em] cursor-pointer flex justify-center items-center',
        className,
      )}
      onClick={() => onChange(!checked)}
    >
      {checked ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="images/check.svg"
          alt="check icon"
          className="h-full w-full"
        />
      ) : null}
    </div>
  );
}
