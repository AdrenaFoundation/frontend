import { motion } from 'framer-motion';
import React from 'react';

export default function FooterAnnouncement() {
  const announcements: string[] = []; // TODO: Replace with API data

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      className="relative p-2 px-0 border-l border-inputcolor cursor-pointer hover:bg-third transition-colors duration-300 overflow-hidden max-w-[300px]"
    >
      <div className="w-5 h-full bg-gradient-to-r from-secondary to-transparent absolute left-0 top-0 z-20" />
      <div className="w-5 h-full bg-gradient-to-l from-secondary to-transparent absolute right-0 top-0 z-20" />
      <div className="overflow-hidden w-full">
        <motion.div
          className="flex flex-row items-center gap-9 whitespace-nowrap"
          initial={{ x: 0 }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 20,
            ease: 'linear',
          }}
          style={{ willChange: 'transform' }}
        >
          {announcements.map((announcement, index) => (
            <p key={index} className="text-xs font-medium opacity-75">
              {announcement}
            </p>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
