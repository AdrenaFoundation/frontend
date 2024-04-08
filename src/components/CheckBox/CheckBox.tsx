import React, { ChangeEvent } from 'react';
import { twMerge } from 'tailwind-merge';

interface CheckBoxProps {
  checked: boolean;
  onClick: () => void;
}

export default function CheckBox({ checked, onClick }: CheckBoxProps) {
  return (
    <div
      className={twMerge(
        'flex justify-center items-center w-[16px] h-[16px] rounded-[4px] bg-third hover:bg-four transition duration-300 cursor-pointer',
        checked && 'bg-green hover:bg-green',
      )}
      onClick={onClick}
    >
      {checked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-[12px] w-[12px] text-white mx-auto my-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  );
}
