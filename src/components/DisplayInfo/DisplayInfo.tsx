import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

export default function DisplayInfo({
  data,
  className,
}: {
  data: { title: string; value: string }[];
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        'flex bg-gray-200 p-4 rounded-lg border border-gray-300 md:bg-transparent md:p-0 md:rounded-none md:border-none flex-col md:flex-row flex-wrap gap-2 md:gap-5 w-full',
        className,
      )}
    >
      {data.map(({ title, value }, i) => (
        <div
          className="flex flex-row gap-1 justify-between md:flex-col md:justify-normal md:bg-gray-200 md:border md:border-gray-300 md:rounded-lg md:p-4 flex-1"
          key={'info' + i}
        >
          <p className="text-base md:text-sm opacity-50">{title}</p>
          <div className="flex flex-row gap-2 w-full">
            <Image
              src={window.adrena.client.adxToken.image}
              width={24}
              height={24}
              alt="adx"
            />

            <p className="text-base font-mono">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
