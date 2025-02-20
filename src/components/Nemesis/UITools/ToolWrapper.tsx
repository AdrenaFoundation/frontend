import { motion } from 'framer-motion'
import React from 'react'
import { twMerge } from 'tailwind-merge'

export default function ToolWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.3 }}
      className={twMerge("flex flex-row items-center justify-between w-full", className)}
    >
      {children}
    </motion.div>
  )
}
