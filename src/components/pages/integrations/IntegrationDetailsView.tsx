import { WalletProvider } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import arrowIcon from '@/../public/images/arrow-right.svg';
import copyIcon from '@/../public/images/copy.svg';
import arrowExternalIcon from '@/../public/images/Icons/arrow-sm-45.svg';
import { PageProps } from '@/types';

import { INTEGRATIONS } from './integrationData';
import { BlinksBlock } from './IntegrationItems/BlinksBlock';
import { CodeBlock } from './IntegrationItems/CodeBlock';

export default function IntegrationDetailsView({
  activeIntegrationId,
  adapters,
}: {
  activeIntegrationId: number;
  adapters: PageProps['adapters'];
}) {
  const integration = INTEGRATIONS.find(
    (integration) => integration.id === activeIntegrationId,
  );
  if (!integration) return null;

  const { name, description, content } = integration;
  const adapter = adapters.find((x) => x.name === 'Phantom');

  return (
    <div className="flex flex-col gap-3 px-5 mb-3">
      <div>
        <h1 className="font-boldy capitalize">{name}</h1>
        <p className="text-sm opacity-50 max-w-[400px]">{description}</p>
      </div>

      {content.map((item, index) => {
        if (item.type === 'h1') {
          return (
            <h1 key={index} className="font-boldy capitalize">
              {item.text}
            </h1>
          );
        } else if (item.type === 'h2') {
          return (
            <h2 key={index} className="font-boldy capitalize">
              {item.text}
            </h2>
          );
        } else if (item.type === 'h3') {
          return (
            <h3 key={index} className="font-boldy capitalize">
              {item.text}
            </h3>
          );
        } else if (item.type === 'p') {
          return (
            <p key={index} className="text-base font-boldy opacity-75">
              {item.text}
            </p>
          );
        } else if (item.type === 'image-carousel') {
          return (
            <div
              className="relative overflow-hidden rounded-xl border"
              key={index}
            >
              <div className="relative flex flex-row gap-4 p-4 bg-[#040D14] overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                {item.items.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${index}-${i}`}
                    src={img}
                    alt={`${name} image`}
                    className="w-[23.3125rem] h-[13.625rem] object-cover rounded-lg border border-bcolor flex-none snap-center"
                  />
                ))}
              </div>
              <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-[3.125rem] bg-gradient-to-l from-[#040D14] to-transparent" />
            </div>
          );
        } else if (item.type === 'divider') {
          return <div key={index} className="w-full h-[1px] bg-bcolor my-5" />;
        } else if (item.type === 'space') {
          return <div key={index} className="w-full my-1" />;
        } else if (item.type === 'list') {
          return (
            <ul key={index} className="list-disc pl-5 flex flex-col gap-2">
              {item.text.map((listItem, i) => (
                <li
                  key={`${index}-${i}`}
                  className="text-base font-boldy opacity-75"
                >
                  {listItem}
                </li>
              ))}
            </ul>
          );
        } else if (item.type === 'code-block') {
          return (
            <div
              key={index}
              className="relative bg-[#040D14] p-5 font-mono border rounded-xl overflow-x-auto"
            >
              <CodeBlock code={item.content} />
              <Image
                src={copyIcon}
                alt="copy"
                className="absolute top-4 right-4 cursor-pointer w-[0.875rem] h-[0.875rem] opacity-50 hover:opacity-100 transition-opacity duration-200"
                onClick={() => {
                  navigator.clipboard.writeText(item.content);
                }}
              />
            </div>
          );
        } else if (item.type === 'link') {
          return (
            <Link
              className="flex flex-row items-center justify-between border border-bcolor p-2 bg-transparent hover:bg-bcolor/20 px-4 rounded-xl transition duration-300"
              href={item.href}
              key={index}
              target={item.external ? '_blank' : '_self'}
            >
              <div className="flex flex-row items-center gap-3">
                {item?.icon ? (
                  <Image src={item.icon} alt={item.title} className="w-3 h-3" />
                ) : null}
                <div>
                  <p className="text-base font-boldy">{item.title}</p>
                </div>
              </div>

              {item.external ? (
                <Image
                  src={arrowExternalIcon}
                  alt="arrow icon"
                  className="w-2 h-2"
                />
              ) : (
                <Image src={arrowIcon} alt="arrow icon" className="w-4 h-4" />
              )}
            </Link>
          );
        } else if (item.type === 'blink') {
          if (!adapter) return null;

          return (
            <div key={index}>
              <div className="flex mb-3 flex-row gap-3 items-center justify-between border border-bcolor p-2 w-full bg-transparent hover:bg-bcolor/20 px-4 rounded-xl transition duration-300 cursor-pointer">
                <div className="flex flex-row items-center gap-3 min-w-0 flex-1">
                  {/* <Image src={arrowIcon} className="w-3 h-3" alt="link icon" /> */}
                  <p className="text-base font-boldy truncate opacity-50">
                    {item.url}
                  </p>
                </div>

                <Image
                  src={copyIcon}
                  alt="arrow icon"
                  className="w-3 h-3 flex-shrink-0"
                />
              </div>
              <div
                className="flex justify-center items-center bg-[#040D14] p-5 font-mono border rounded-xl"
                key={index}
              >
                <div className="w-[300px] mx-auto">
                  <WalletProvider wallets={[adapter]} autoConnect>
                    <BlinksBlock url={item.url} />
                  </WalletProvider>
                </div>
              </div>
            </div>
          );
        } else if (item.type === 'video') {
          return (
            <div
              className="flex items-center bg-[#040D14] p-5 font-mono border rounded-xl"
              key={index}
            >
              <video
                className="w-full h-full rounded-lg object-contain"
                controls
                playsInline
                preload="metadata"
              >
                <source src={item.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
