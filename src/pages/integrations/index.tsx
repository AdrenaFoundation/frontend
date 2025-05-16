import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';

import arrowIcon from '@/../public/images/arrow-right.svg';
import IntegrationDetailsView from '@/components/pages/integrations/IntegrationDetailsView';
import IntegrationListView from '@/components/pages/integrations/IntegrationListView';
import { PageProps } from '@/types';

export default function Integrations({ adapters }: PageProps) {
  const [activeIntegrationId, setActiveIntegrationId] = useState<number | null>(
    null,
  );

  return (
    <div className="relative w-full max-w-[62.5rem] lg:mx-auto lg:my-[3.125rem] bg-secondary border lg:rounded-xl py-5">
      {activeIntegrationId !== null ? (
        <div
          className="w-fit mx-5 mb-3 lg:m-0 lg:absolute top-0 -left-[3.125rem] border border-bcolor bg-secondary rounded-lg p-3 hover:bg-third cursor-pointer transition-colors duration-300"
          onClick={() => setActiveIntegrationId(null)}
        >
          <Image
            src={arrowIcon}
            alt="arrow icon"
            className="w-[0.875rem] h-[0.875rem] scale-x-[-1]"
          />
        </div>
      ) : null}

      <AnimatePresence>
        {activeIntegrationId === null ? (
          <motion.div
            key={'integration-list'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <IntegrationListView
              setActiveIntegrationId={setActiveIntegrationId}
            />
          </motion.div>
        ) : (
          <motion.div
            key={'integration-details'}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <IntegrationDetailsView
              adapters={adapters}
              activeIntegrationId={activeIntegrationId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
