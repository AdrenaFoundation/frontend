import React from 'react';

import IntegrationCard from './IntegrationCard';
import { INTEGRATION_UPCOMING, INTEGRATIONS } from './integrationData';
import IntegrationUpcomingCard from './IntegrationUpcomingCard';

export default function IntegrationListView({
  setActiveIntegrationId,
}: {
  setActiveIntegrationId: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  return (
    <>
      <div className="px-5 mb-3">
        <h1 className="text-2xl font-boldy capitalize">Integrations</h1>
        <p className="text-sm opacity-50 max-w-[400px]">
          We are working on integrating with various platforms to enhance your
          experience. Stay tuned for updates!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-5">
        {INTEGRATIONS.map((integration, index) => (
          <IntegrationCard
            key={index}
            integration={integration}
            setActiveIntegrationId={setActiveIntegrationId}
          />
        ))}
      </div>

      <div className="w-full h-[1px] bg-bcolor my-5" />

      <div className="px-5">
        <h1 className="text-2xl font-boldy capitalize mb-2">Upcoming</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATION_UPCOMING.map((integration, index) => (
            <IntegrationUpcomingCard key={index} integration={integration} />
          ))}
        </div>
      </div>

      <div className="w-full h-[1px] bg-bcolor my-5" />

      <div className="px-5">
        <h1 className="text-2xl font-boldy capitalize mb-3">Sponsors</h1>
        <div className='flex flex-row gap-3 items-center'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-[2.75rem] h-[2.75rem] object-cover rounded-lg border border-bcolor"
            src={'https://pbs.twimg.com/profile_images/1687112019563188224/mnbhxwox_400x400.png'}
            alt={`logo`}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-[2.75rem] h-[2.75rem] object-cover rounded-lg border border-bcolor"
            src={'https://coin-images.coingecko.com/coins/images/28600/large/bonk.jpg?1696527587'}
            alt={`logo`}
          />
        </div>
      </div>
    </>
  );
}
