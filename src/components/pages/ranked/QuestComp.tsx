import Image from 'next/image';
import React, { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

import wing from '@/../../public/images/wing.svg';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import { QuestType } from '@/types';
import { formatNumber } from '@/utils';

export default function QuestComp({
  quest,
  className,
}: {
  quest: QuestType;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        'flex flex-col gap-3 bg-[#07131D] border p-5 rounded-lg',
        className,
      )}
    >
      {quest.title ? (
        <div className="flex flex-row items-center">
          <div className="bg-[#0D1923] border border-white/5 p-2 px-4 rounded-lg w-full border-r-0 rounded-r-none h-[42px]">
            <p className="font-archivoblack text-lg">{quest.title}</p>
          </div>
          <Image
            src={wing}
            alt="wing"
            className="w-[73px] h-[43px] -translate-x-4"
          />
        </div>
      ) : null}

      {quest.description ? (
        <p className="font-boldy opacity-50 mb-3">{quest.description}</p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {quest.tasks.map((task, index) => {
          if (task.type === 'text') {
            return (
              <li
                key={index}
                className={twMerge(
                  'flex flex-col gap-3',
                  index !== 0 && 'mt-6',
                )}
              >
                {task.title ? (
                  <div className="flex flex-row items-center">
                    <div className="bg-[#0D1923] border border-white/5 p-2 px-4 rounded-lg w-full border-r-0 rounded-r-none h-[42px]">
                      <p className="font-archivoblack text-lg">{task.title}</p>
                    </div>
                    <Image
                      src={wing}
                      alt="wing"
                      className="w-[73px] h-[43px] -translate-x-4"
                    />
                  </div>
                ) : null}
                {task.description ? (
                  <p className="font-boldy opacity-50 mb-3">
                    {task.description}
                  </p>
                ) : null}{' '}
                <div className="flex flex-row gap-6 justify-between items-center">
                  <div className="flex flex-row gap-2">
                    <input
                      type="radio"
                      checked={false}
                      onChange={() => false}
                    />
                    <p className="font-boldy opacity-50">{task.task}</p>
                  </div>

                  <p className="font-mono opacity-50 text-right">
                    {typeof task.reward === 'string' ? (
                      <span className="font-mono text-[#e47dbb]">
                        +{task.reward}
                      </span>
                    ) : (
                      <span className="font-mono text-[#e47dbb]">
                        +{formatNumber(task.reward, 4, 0)}{' '}
                      </span>
                    )}
                  </p>
                </div>
              </li>
            );
          }
          if (task.type === 'progressive') {
            return (
              <li
                key={index}
                className={twMerge(
                  'flex flex-col gap-3',
                  index !== 0 && 'mt-6',
                )}
              >
                {task.title ? (
                  <div className="flex flex-row items-center">
                    <div className="bg-[#0D1923] border border-white/5 p-2 px-4 rounded-lg w-full border-r-0 rounded-r-none h-[42px]">
                      <p className="font-archivoblack text-lg">{task.title}</p>
                    </div>
                    <Image
                      src={wing}
                      alt="wing"
                      className="w-[73px] h-[43px] -translate-x-4"
                    />
                  </div>
                ) : null}

                {task.description ? (
                  <p className="font-boldy opacity-50 mb-3">
                    {task.description}
                  </p>
                ) : null}

                <ul className="flex flex-col gap-0">
                  {task.levels?.map((level, index) => {
                    return (
                      <Fragment key={index}>
                        {index !== 0 ? (
                          <li className="h-[15px] w-[1px] bg-bcolor translate-x-[7px]"></li>
                        ) : null}
                        <li
                          key={index}
                          className="flex flex-row gap-6 justify-between"
                        >
                          <div className="flex flex-row gap-2">
                            <input
                              type="radio"
                              checked={level.completed}
                              onChange={() => false}
                            />
                            <p
                              className={twMerge(
                                'opacity-50 font-boldy',
                                level.completed && 'opacity-100',
                              )}
                            >
                              {level.description}
                            </p>
                          </div>

                          {level?.reward ? (
                            <p
                              className={twMerge(
                                'opacity-50 font-mono text-right',
                                level.completed && 'opacity-100',
                              )}
                            >
                              {typeof level.reward === 'string' ? (
                                <span className="font-mono text-[#FAD524]">
                                  +{level.reward}
                                </span>
                              ) : (
                                <span className="font-mono text-[#FAD524]">
                                  +{formatNumber(level.reward, 4, 0)}
                                </span>
                              )}
                            </p>
                          ) : null}

                          {level?.multiplier ? (
                            <p
                              className={twMerge(
                                'opacity-50 font-mono text-right text-[#e47dbb]',
                                level.completed && 'opacity-100',
                              )}
                            >
                              {level.multiplier}
                            </p>
                          ) : null}
                        </li>
                      </Fragment>
                    );
                  })}
                </ul>
              </li>
            );
          }
          return (
            <li
              key={index}
              className={twMerge(
                'flex flex-row gap-4 justify-between items-center',
                className,
                task?.title && index !== 0 && 'mt-3',
              )}
            >
              <div className="flex flex-row gap-2 items-center">
                <Checkbox checked={task.completed} onChange={() => false} />
                <div>
                  {task?.title ? (
                    <p className="font-boldy">{task.title}</p>
                  ) : null}

                  <p
                    className={twMerge(
                      'opacity-50 font-boldy max-w-[350px]',
                      task.completed && 'opacity-100',
                    )}
                  >
                    {task.description}
                  </p>
                </div>
              </div>
              <p
                className={twMerge(
                  'opacity-50 font-mono text-right',
                  task.completed && 'opacity-100',
                )}
              >
                {typeof task.reward === 'string' ? (
                  <span className="font-mono text-[#e47dbb]">
                    +{task.reward}
                  </span>
                ) : (
                  <span className="font-mono text-[#e47dbb]">
                    +{formatNumber(task.reward, 4, 0)}
                  </span>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
