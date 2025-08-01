import { Switch } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import arrowIcon from '@/../public/images/Icons/arrow-slim.svg';
import checkIcon from '@/../public/images/Icons/check.svg';
import collapseIcon from '@/../public/images/Icons/collapse-left.svg';
import filterIcon from '@/../public/images/Icons/filter-circle.svg';
import sortIcon from '@/../public/images/Icons/sort-icon.svg';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { ImageRef } from '@/types';

export default function FilterSidebar({
  filterOptions,
  switchOptions,
  sortOptions,
  views,
  handleViewChange,
  activeView,
  searches,
}: {
  views?: {
    title: string;
    icon?: string;
    activeColor?: string;
    disabled?: boolean;
  }[];
  searches?: {
    value: string;
    placeholder: string;
    handleChange: React.Dispatch<React.SetStateAction<string>>;
  }[];
  handleViewChange?: (title: string) => void;
  activeView?: string;
  switchOptions?: {
    handleChange: React.Dispatch<React.SetStateAction<boolean>>;
    label: string;
    checked: boolean;
  }[];
  filterOptions?: {
    // TODO: fix type
    type: 'checkbox' | 'radio' | 'input';
    name: string;
    handleChange:
      | React.Dispatch<React.SetStateAction<string>>
      | React.Dispatch<React.SetStateAction<string[] | null>>;
    activeOption: string[] | string | null;
    optionItems: { label: string; icon?: ImageRef | string }[];
    disabled?: boolean;
  }[];
  sortOptions?: {
    handleChange: React.Dispatch<React.SetStateAction<string>>;
    optionItems: {
      label: string;
      icon?: ImageRef;
      order: 'asc' | 'desc';
      lastClicked?: boolean; // Use this to highlight last clicked filter option
    }[];
    disabled?: boolean;
  };
}) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const SwitchOptions = switchOptions ? (
    <div className="p-4 bg-[#040D14] border rounded-lg flex flex-col gap-3 ">
      {switchOptions.map((opt) => (
        <label
          className="flex items-center justify-between ml-1 cursor-pointer"
          key={opt.label}
        >
          <span className="mx-1 text-txtfade whitespace-nowrap text-center text-sm">
            {opt.label}
          </span>
          <Switch
            className="mr-0.5"
            checked={opt.checked}
            onChange={() => opt.handleChange((prev) => !prev)}
            size="small"
          />
        </label>
      ))}
    </div>
  ) : null;

  const FilterOptions = filterOptions ? (
    <div
      className={twMerge(
        'p-4 bg-[#040D14] border rounded-lg',
        filterOptions.some((f) => f.disabled) &&
          'opacity-25 cursor-not-allowed pointer-events-none',
      )}
    >
      <div className="flex flex-row gap-2 mb-3">
        <Image src={filterIcon} alt="filter icon" className="opacity-50" />

        <p className="text-base font-boldy">Filter</p>
      </div>

      <div className="flex flex-col gap-3">
        {searches?.map((search, i) => (
          <input
            key={`search-${i}`}
            type="text"
            value={search.value}
            onChange={(e) => search.handleChange(e.target.value)}
            placeholder={search.placeholder}
            className="hidden md:flex bg-gray-800 text-white border border-gray-700 rounded-lg p-2 px-3 w-full text-sm font-boldy"
          />
        ))}

        {filterOptions.map((filterOption, i) => (
          <div key={`filter-${i}`}>
            <p className="font-boldy opacity-50 mb-1">{filterOption.name}</p>
            <div className="flex flex-row gap-3 flex-wrap">
              {filterOption.optionItems.map((opt) => {
                if (filterOption.type === 'checkbox') {
                  return (
                    <Checkbox
                      key={opt.label}
                      label={opt.label}
                      checked={
                        filterOption.activeOption !== null &&
                        filterOption.activeOption.includes(opt.label)
                      }
                      img={opt.icon}
                      onClick={
                        filterOption.handleChange as React.Dispatch<
                          React.SetStateAction<string[] | null>
                        >
                      }
                    />
                  );
                }

                if (filterOption.type === 'radio') {
                  return (
                    <Radio
                      key={opt.label}
                      name={filterOption.name}
                      label={opt.label}
                      checked={filterOption.activeOption === opt.label}
                      img={opt.icon}
                      onClick={
                        filterOption.handleChange as React.Dispatch<
                          React.SetStateAction<string>
                        >
                      }
                    />
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  const SortOptions = sortOptions ? (
    <div
      className={twMerge(
        'p-4 bg-[#040D14] border rounded-lg transition duration-300',
        sortOptions.disabled &&
          'opacity-25 cursor-not-allowed pointer-events-none',
      )}
    >
      <div className="flex flex-row gap-2 mb-3">
        <Image src={sortIcon} alt="sort icon" className="opacity-50" />

        <p className="text-base font-boldy">Sort</p>
      </div>
      <div className="flex flex-row gap-3 flex-wrap">
        {sortOptions.optionItems.map((opt) => (
          <div
            key={opt.label}
            className={twMerge(
              'flex flex-row gap-3 items-center border hover:border-white rounded-full p-1 px-3 cursor-pointer transition duration-300 select-none',
              opt.lastClicked ? 'border-white' : 'border-bcolor',
            )}
            onClick={() => sortOptions.handleChange(opt.label)}
          >
            {opt.icon && <Image src={opt.icon} alt="sort icon" />}
            <p className="text-sm font-boldy">{opt.label}</p>

            <motion.div
              key={opt.label}
              className="flex-none h-3 w-3"
              animate={{ rotate: opt.order === 'asc' ? 0 : 180 }}
            >
              <Image
                src={arrowIcon}
                alt="arrow icon"
                width={12}
                height={12}
                className="flex-none h-3 w-3"
              />
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="p-4 pb-0 md:pb-4 md:border-r">
      {!isCollapsed && (
        <div className="hidden md:flex flex-col gap-0">
          {views && (
            <div className="flex flex-row gap-3 border-b pb-2">
              {views.map((view) => (
                <Image
                  key={view.title}
                  src={view.icon ?? filterIcon}
                  alt="view icon"
                  onClick={() => handleViewChange?.(view.title)}
                  className={twMerge(
                    'opacity-25 hover:opacity-100 transition-opacity duration-300 cursor-pointer',
                    activeView === view.title && 'opacity-100',
                  )}
                />
              ))}
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCollapsed(!isCollapsed)}
            leftIcon={collapseIcon}
            className="p-0 border-bcolor  border-none ml-auto flex-none -scale-x-[1] m-auto mt-2"
            iconClassName="w-4 h-4 opacity-75 hover:opacity-100"
          />
        </div>
      )}

      {isCollapsed && (
        <>
          {views && (
            <div className="flex flex-row gap-3 items-start">
              <TabSelect
                selected={activeView}
                tabs={views}
                onClick={(title) => {
                  handleViewChange?.(title);
                }}
                wrapperClassName="mb-5"
              />

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCollapsed(!isCollapsed)}
                leftIcon={collapseIcon}
                className="p-0 border-bcolor  border-none ml-auto hidden md:flex flex-none"
                iconClassName="w-4 h-4 opacity-75 hover:opacity-100"
              />
            </div>
          )}

          <div className="hidden md:flex flex-col gap-6 w-[275px] flex-none">
            <div>
              {!views && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  leftIcon={collapseIcon}
                  className="p-0 border-bcolor  border-none ml-auto hidden md:flex flex-none mb-3"
                  iconClassName="w-4 h-4 opacity-75 hover:opacity-100"
                />
              )}
              {FilterOptions}
            </div>
            {SortOptions}
            {SwitchOptions}
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 md:hidden">
        {searches?.map((search, i) => (
          <input
            key={`search-${i}`}
            type="text"
            value={search.value}
            onChange={(e) => search.handleChange(e.target.value)}
            placeholder={search.placeholder}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg p-2 px-3 w-full text-sm font-boldy mb-3"
          />
        ))}

        <div className="flex flex-row border rounded-lg">
          <div
            className="w-full p-4"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Image src={filterIcon} alt="filter icon" className="m-auto" />
          </div>
          <div
            className="w-full p-4 border-l"
            onClick={() => setIsSortModalOpen(true)}
          >
            <Image src={sortIcon} alt="sort icon" className="m-auto" />
          </div>
        </div>

        {SwitchOptions}

        <AnimatePresence>
          {isFilterModalOpen && (
            <Modal close={() => setIsFilterModalOpen(false)}>
              <div className="p-4">
                {FilterOptions}
                <Button
                  size="lg"
                  className="mt-4 w-full"
                  title="Apply"
                  onClick={() => setIsFilterModalOpen(false)}
                />
              </div>
            </Modal>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSortModalOpen && (
            <Modal close={() => setIsSortModalOpen(false)}>
              <div className="p-4">
                {SortOptions}
                <Button
                  size="lg"
                  className="mt-4 w-full"
                  title="Apply"
                  onClick={() => setIsSortModalOpen(false)}
                />
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onClick: React.Dispatch<React.SetStateAction<string[] | null>>;
  img?: ImageRef | string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onClick,
  img,
  labelClassName,
  size = 'md',
}) => {
  return (
    <div
      className="group flex items-center cursor-pointer bg-transparent hover:bg-third transition duration-300 border rounded-lg p-1 px-2 pr-4"
      onClick={() => {
        if (checked) {
          onClick((prev) => {
            if (prev === null || prev.length === 1) return null;
            return prev.filter((item) => item !== label);
          });
        } else {
          onClick((prev) => {
            if (prev === null) return [label];
            return [...prev, label];
          });
        }
      }}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
            // Handle the click on the level above
          }}
          className={twMerge(
            'peer h-4 w-4 text-blue-600 transition duration-150 ease-in-out cursor-pointer',
            size === 'sm' ? '!h-3 !w-3' : size === 'lg' ? '!h-5 !w-5' : '',
          )}
        />
        <Image
          src={checkIcon}
          alt="check icon"
          width="24"
          height="24"
          className={twMerge('absolute peer-checked:opacity-100 opacity-0')}
        />
      </div>

      <label
        className={twMerge(
          'flex flex-row gap-1 opacity-50 group-hover:opacity-100 font-boldy items-center ml-2 text-sm cursor-pointer transition-opacity duration-300',
          checked && 'opacity-100',
          labelClassName,
        )}
      >
        {img && <Image src={img} alt="token icon" width="12" height="12" />}
        {label}
      </label>
    </div>
  );
};

interface RadioProps {
  name?: string;
  label: string;
  checked: boolean;
  onClick: React.Dispatch<React.SetStateAction<string>>;
  img?: ImageRef | string;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  name,
  label,
  checked,
  onClick,
  img,
  className,
}) => {
  return (
    <div
      className={twMerge(
        'flex items-center cursor-pointer bg-transparent hover:bg-third transition duration-300 border rounded-lg p-1 px-4 pl-2',
        className,
      )}
      onClick={() => onClick(label)}
    >
      <input
        name={name}
        type="radio"
        checked={checked}
        onChange={() => {
          // Handle the click on the level above
        }}
        className="h-4 w-4 text-blue-600 transition duration-150 ease-in-out cursor-pointer"
      />
      <label
        className={twMerge(
          'flex flex-row gap-1 font-boldy items-center ml-2 text-sm cursor-pointer',
          ['profit', 'long'].includes(label) && 'text-green',
          ['loss', 'short'].includes(label) && 'text-red',
        )}
      >
        {img && <Image src={img} alt="token icon" width="12" height="12" />}
        {label}
      </label>
    </div>
  );
};
