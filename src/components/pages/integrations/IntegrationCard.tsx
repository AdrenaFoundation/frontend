import React from 'react';

import arrow from '@/../public/images/arrow-right.svg';
import Button from '@/components/common/Button/Button';

import { INTEGRATIONS } from './integrationData';

export default function IntegrationCard({
  integration,
  setActiveIntegrationId,
}: {
  integration: (typeof INTEGRATIONS)[number];
  setActiveIntegrationId: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  if (!integration) return null;

  const { name, description, icon, id, tags } = integration;

  return (
    <div className="flex flex-col gap-3 bg-[#040D14] border rounded-xl p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="w-[2.75rem] h-[2.75rem] object-cover rounded-lg border border-bcolor"
        src={icon}
        alt={`${name} logo`}
      />
      <div>
        <div className="flex flex-row items-center gap-2 mb-1">
          <p className="font-boldy text-lg">{name}</p>
          {tags.map((tag) => (
            <p
              key={tag}
              className="px-3 py-1 rounded-full bg-third text-xxs font-boldy opacity-50"
            >
              #{tag}
            </p>
          ))}
        </div>
        <p className="text-sm opacity-50">{description}</p>
      </div>

      <Button
        title="Learn"
        variant="outline"
        className="w-full rounded-lg border border-bcolor"
        rightIcon={arrow}
        onClick={() => setActiveIntegrationId(id)}
      />
    </div>
  );
}
