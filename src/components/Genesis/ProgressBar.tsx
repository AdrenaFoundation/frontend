import { differenceInSeconds } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { GenesisLock } from '@/types';

import chevronIcon from '../../../public/images/chevron-down.svg';
import GensisStepsBGImg from '../../../public/images/genesis-bg.png';
import Modal from '../common/Modal/Modal';

export default function ProgressBar({
  currentStep,
  genesis,
}: {
  currentStep: number;
  genesis: GenesisLock;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const campaignEndDate = new Date(
    genesis.campaignStartDate.toNumber() * 1000 +
      genesis.campaignDuration.toNumber() * 1000,
  );

  const reservedCampaignEndDate = new Date(
    genesis.campaignStartDate.toNumber() * 1000 +
      genesis.reservedGrantDuration.toNumber() * 1000,
  );

  const diffInHoursReserved = differenceInSeconds(
    reservedCampaignEndDate,
    new Date(),
  );

  const diffInHoursPublic = differenceInSeconds(campaignEndDate, new Date());

  const getPercent = (diffInHours: number, duration: number) => {
    const percent = 100 - (diffInHours / duration) * 100;
    if (percent < 0) {
      return 0;
    }
    return percent;
  };

  const percentToReserved = getPercent(
    diffInHoursReserved,
    genesis.reservedGrantDuration.toNumber(),
  );

  const percentToPublic = getPercent(
    diffInHoursPublic,
    genesis.campaignDuration.toNumber(),
  );

  const steps = [
    {
      title: 'Campaign Starts',
      date: new Date(genesis?.campaignStartDate.toNumber() * 1000),
    },
    {
      title: 'Reserved Period Ends',
      date: new Date(
        genesis.campaignStartDate.toNumber() * 1000 +
          genesis.reservedGrantDuration.toNumber() * 1000,
      ),
    },
    {
      title: 'Campaign Ends',
      date: new Date(
        genesis.campaignStartDate.toNumber() * 1000 +
          genesis.campaignDuration.toNumber() * 1000,
      ),
    },
    {
      title: 'Pool Rebalancing',
    },
    {
      title: 'Trading Live',
    },
  ];

  const lastStep = steps.length - 1;

  return (
    <>
      <div className="relative p-4 sm:p-0 max-w-[1150px] sm:max-w-full">
        <div className="flex flex-col gap-3 justify-center items-center relative mx-auto border border-bcolor bg-gradient-to-tr from-[#07111A] to-[#0B1722] sm:bg-none rounded-lg sm:border-none sm:p-0 z-10 w-full">
          <Image
            src={GensisStepsBGImg}
            alt="Steps background"
            className="max-w-[1040px] z-0 hidden sm:block"
          />
          <div className="sm:absolute flex flex-row justify-center top-2 w-full sm:max-w-[920px] px-5 pt-5 sm:px-[50px] sm:pt-0">
            {steps.map((_, index) =>
              index !== lastStep ? (
                <div key={index} className="flex flex-row items-center w-full">
                  <div
                    className={twMerge(
                      'rounded-full w-5 h-5 flex-none',
                      currentStep < index && currentStep !== index
                        ? 'bg-transparent border-2 border-bcolor'
                        : 'bg-white',
                      currentStep === index && 'border-white',
                    )}
                  />

                  <div className="bg-bcolor w-full h-[2px]">
                    {currentStep >= index && (
                      <div
                        className="bg-white w-full h-[2px] rounded-full"
                        style={{
                          width: `${
                            // TODO: redo this
                            index === 0 && currentStep === 0
                              ? percentToReserved
                              : index === 1 && currentStep === 1
                              ? percentToPublic
                              : currentStep <= index
                              ? 0
                              : 100
                          }%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`rounded-full w-5 h-5 flex-none ${
                    currentStep !== index
                      ? 'bg-transparent border-2 border-bcolor'
                      : 'bg-white'
                  }`}
                  key={index}
                />
              ),
            )}
          </div>

          <div className="flex sm:hidden flex-row justify-between w-full px-5 pb-3">
            <div>
              <h2 className="font-bold">{steps[currentStep].title}</h2>
              <p className="sm:text-sm opacity-50">
                {steps[currentStep].date?.toLocaleDateString()}
              </p>
            </div>

            <Image
              src={chevronIcon}
              alt="Arrow"
              className={twMerge(
                'w-[34px] h-[34px] transition duration-300 transform',
                isOpen && 'rotate-180',
              )}
              onClick={() => setIsOpen(true)}
            />
          </div>

          <div className="flex flex-row justify-between items-center sm:hidden p-5 border-t border-bcolor w-full">
            <div>
              <p className="opacity-25">Up next</p>
              <p className="text-base opacity-50">
                {
                  steps[currentStep === lastStep ? lastStep : currentStep + 1]
                    .title
                }{' '}
                –{' '}
                {steps[
                  currentStep === lastStep ? lastStep : currentStep + 1
                ]?.date?.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-row justify-center top-2 w-full max-w-[990px] px-[50px]">
            <div className="flex flex-row w-full">
              <div>
                <p className="font-bold text-center">{steps[0].title}</p>
                <p className="text-center text-sm opacity-50 font-mono">
                  {steps[0].date?.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-row w-full">
              <div>
                <p className="font-bold text-center">{steps[1].title}</p>
                <p className="text-center text-sm opacity-50 font-mono">
                  {steps[1].date?.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-row w-full">
              <div>
                <p className="font-bold text-center">{steps[2].title}</p>
                <p className="text-center text-sm opacity-50 font-mono">
                  {steps[2].date?.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-row w-full">
              <div>
                <p className="font-bold text-center">{steps[3].title}</p>
              </div>
            </div>

            <div className="flex-none">
              <p className="font-bold text-center">{steps[4].title}</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <Modal title="Progress" close={() => setIsOpen(false)}>
            <div className="flex flex-col gap-1 p-5">
              {steps.map((step, index) => (
                <>
                  <div
                    key={index}
                    className="flex flex-row gap-3 items-center w-full"
                  >
                    <div
                      className={twMerge(
                        'rounded-full w-5 h-5 flex-none',
                        currentStep < index && currentStep !== index
                          ? 'bg-transparent border-2 border-bcolor'
                          : 'bg-white',
                        currentStep === index && 'border-white',
                      )}
                    />

                    <div
                      className={twMerge(
                        currentStep < index &&
                          currentStep !== index &&
                          'opacity-50',
                      )}
                    >
                      <h2 className="font-bold">{step.title}</h2>
                      <p className="sm:text-sm opacity-50">
                        {step.date?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {index !== lastStep && (
                    <div
                      className={twMerge(
                        'w-[2px] h-[40px] border transfrom translate-x-2',
                        currentStep <= index ? 'border-bcolor' : 'border-white',
                      )}
                    />
                  )}
                </>
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
