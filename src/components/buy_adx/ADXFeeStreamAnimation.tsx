import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

export default function ADXFeeStreamAnimation({
  token,
}: {
  token: 'ALP' | 'ADX';
}) {
  const usdc = window.adrena.client.tokens.find(
    (token) => token.symbol === 'USDC',
  );

  const lines = [
    {
      start: 'translatex(0px)',
      end: 'translatex(250px)',
      duration: 2,
      className: 'from-[#1A243100] to-[#1A2431] left-[-120px]',
    },
    {
      start: 'translatex(0px)',
      end: 'translatex(300px)',
      duration: 2,
      className:
        'from-[#1A243100] to-[#1A2431] right-[100px] top-[100px] rotate-45',
    },
    {
      start: 'translatex(0px)',
      end: 'translatex(250px)',
      duration: 3,
      className:
        'from-[#1A243100] to-[#1A2431] right-[0px] top-[100px] rotate-90',
    },
    {
      start: 'translatex(300px)',
      end: 'translatex(0px)',
      duration: 3,
      className:
        'from-[#1A2431] to-[#1A243100] right-[-100px] top-[100px] -rotate-45',
    },
    {
      start: 'translatex(300px)',
      end: 'translatex(0px)',
      duration: 3,
      className: 'from-[#1A2431] to-[#1A243100] left-[150px]',
    },
    {
      start: 'translatex(0px)',
      end: 'translatex(300px)',
      duration: 3,
      className:
        'from-[#1A243100] to-[#1A2431] right-[0px] bottom-[50px] -rotate-90',
    },
    {
      start: 'translatex(300px)',
      end: 'translatex(0px)',
      duration: 4,
      className:
        'from-[#1A2431] to-[#1A243100] right-[-100px] bottom-[100px] rotate-45',
    },
    {
      start: 'translatex(0px)',
      end: 'translatex(300px)',
      duration: 3,
      className:
        'from-[#1A243100] to-[#1A2431] right-[100px] bottom-[100px] -rotate-45',
    },
  ];

  return (
    <div className="relative w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] flex items-center justify-center overflow-hidden mx-auto lg:ml-auto lg:mr-0">
      <Image
        src={
          token === 'ADX'
            ? window.adrena.client.adxToken.image
            : window.adrena.client.alpToken.image
        }
        className="w-[150px] h-[150px] z-10"
        alt="adx logo"
        width={150}
        height={150}
      />
      {lines.map(({ start, end, duration, className }, i) => (
        <motion.div
          className={`absolute flex items-center w-full h-[1px] bg-gradient-to-r ${className}`}
          key={i}
        >
          {usdc && (
            <motion.span
              initial={{ transform: start, opacity: 0 }}
              animate={{ transform: end, opacity: 1 }}
              transition={{ duration: duration, repeat: Infinity }}
              className="absolute"
            >
              <Image
                src={usdc?.image}
                className="w-5 h-5"
                alt="adx logo"
                width={20}
                height={20}
              />
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
