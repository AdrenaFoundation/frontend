import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import Button from '@/components/common/Button/Button';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal/TermsAndConditionsModal';
import { GeoBlockingData } from '@/types';

import logo from '../../../public/images/logo.svg';
import NoMonsterZoneImg from '../../../public/images/no-monster-zone.png';

export default function GeoBlocked({ country }: GeoBlockingData) {
  const [isTermsAndConditionModalOpen, setIsTermsAndConditionModalOpen] =
    useState<boolean>(false);

  const router = useRouter();

  return (
    <>
      <div className="w-full h-full flex flex-col items-center z-20">
        <Image
          src={logo}
          className="mt-4 mb-4 border-2 border-white sm:self-start sm:ml-4 p-2"
          alt="logo"
          width={120}
          height={25}
        />

        <div className="font-specialmonster text-4xl sm:text-6xl mt-8 flex text-wrap max-w-3xl text-center pl-4 pr-4">
          Oh no! Looks like you are in a no-monster zone {':('}
        </div>

        <Image
          src={NoMonsterZoneImg}
          width={300}
          height={300}
          alt="monster no go zone image"
          className="mt-4 sm:mt-12 bg-black rounded-full max-w-[45%]"
        />

        <div className="flex flex-col mt-4 sm:mt-12 gap-8">
          <Button
            title="See Terms and conditions"
            variant="secondary"
            onClick={() => {
              setIsTermsAndConditionModalOpen(true);
            }}
          />

          <Button
            title="Go to landing page"
            variant="secondary"
            onClick={() => {
              router.push('https://landing.adrena.xyz/');
            }}
          />
        </div>

        <div className="absolute bottom-4 sm:right-4 text-xs italic m-w-[80%] text-center">
          * You are connecting from a country that is not allowed to use Adrena
          (Country tag: {`"`}
          {country}
          {`"`})
        </div>

        <TermsAndConditionsModal
          isOpen={isTermsAndConditionModalOpen}
          readonly={true}
          closeTrigger={() => {
            setIsTermsAndConditionModalOpen(false);
          }}
        />
      </div>

      <div className="absolute top-0 right-0 overflow-hidden w-full">
        <div id="modal-container"></div>
      </div>
    </>
  );
}
