import { createRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export default function TabSelect<T extends string | number>({
  selected,
  initialSelectedIndex,
  onClick,
  tabs,
  wrapperClassName,
  className,
}: {
  selected?: T;
  initialSelectedIndex?: number;
  tabs: {
    title: T;
    icon?: string;
    activeColor?: string;
  }[];
  onClick: (title: T, index: number) => void;
  className?: string;
  wrapperClassName?: string;
}) {
  const [activeTab, setActiveTab] = useState<null | number>(
    selected !== undefined ? initialSelectedIndex ?? 0 : null,
  );

  const refs: React.RefObject<HTMLDivElement>[] = tabs.map(() => createRef());

  return (
    <div
      className={twMerge(
        'relative flex flex-row justify-between w-full pb-1 mb-3',
        wrapperClassName,
      )}
    >
      {tabs.map(({ title, activeColor }, index) => (
        <div
          className={twMerge(
            'ext-center p-1 w-full cursor-pointer z-10',
            className,
            activeTab !== null && index === activeTab
              ? `opacity-100 border-b-[0.3em] ${activeColor}`
              : 'opacity-50 border-b-[1px]',
          )}
          ref={refs[index]}
          key={title}
          onClick={() => {
            onClick(title, index);
            setActiveTab(index);
          }}
          style={
            {
              // color:
              //   (activeTab !== null && index === activeTab
              //     ? activeColor
              //     : 'white') ?? 'white',
              // borderBottom:
              //   activeTab !== null && index === activeTab
              //     ? '0.3em solid'
              //     : '1px solid',
              // borderBottomColor:
              //   activeTab !== null && index === activeTab ? activeColor : '',
            }
          }
        >
          <h4 className="text-center uppercase text-sm">{title}</h4>
        </div>
      ))}
    </div>
  );
}
