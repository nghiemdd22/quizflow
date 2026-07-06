import React from 'react'
import { motion, type Variants } from 'framer-motion'

const pageVariants: Variants = {
  initial: { opacity: 0, y: 15 },
  in: { opacity: 1, y: 0, transition: { duration: 0.15, ease: 'easeOut' } },
  out: { opacity: 0, transition: { duration: 0.1, ease: 'easeIn' } }
}

export const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="flex-1 flex flex-col w-full h-full"
    >
      {children}
    </motion.div>
  )
}
