import React from 'react';

export default function IntegrationUpcomingCard({
  integration,
}: {
  integration: {
    name: string;
    description: string;
    icon: string;
    link: string;
    tags: string[];
    status: string;
  };
}) {
  if (!integration) return null;

  const { name, description, icon, tags } = integration;

  return (
    <div className="flex flex-row gap-3 border rounded-xl p-2 px-3 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="w-[2.75rem] h-[2.75rem] object-cover rounded-lg border border-bcolor"
        src={icon}
        alt={`${name} logo`}
      />
      <div>
        <div className="flex flex-row items-center gap-2">
          <p className="font-boldy text-base">{name}</p>
          {tags.map((tag) => (
            <p
              key={tag}
              className="px-3 py-1 rounded-full bg-third text-xxs font-boldy opacity-50"
            >
              #{tag}
            </p>
          ))}
        </div>
        <p className="text-xs opacity-50">{description}</p>
      </div>
    </div>
  );
}
