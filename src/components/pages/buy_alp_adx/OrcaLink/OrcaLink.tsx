import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

import Button from '@/components/common/Button/Button';

import coralImg from '../../../../../public/images/coral.svg';
import externalLinkIcon from '../../../../../public/images/external-link-logo.png';

export default function OrcaLink() {
  return (
    <div
      className="rounded-lg h-full w-full flex relative justify-center bg-cover bg-center min-h-[30em] overflow-hidden"
      style={{
        backgroundImage: `url('images/gradient.svg')`,
      }}
    >
      <AnimatePresence>
        <motion.div
          className="w-full h-full absolute bg-cover bg-top z-20"
          style={{
            backgroundImage: `url('images/shimmer.svg')`,
          }}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 6,
            ease: 'linear',
          }}
        ></motion.div>
      </AnimatePresence>

      <AnimatePresence>
        <motion.img
          src="images/orca.svg"
          alt="Orca"
          className="absolute right-4 top-[20%] w-[15em]"
          initial={{ rotate: -15 }}
          animate={{ rotate: 15 }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 20,
            ease: 'linear',
          }}
        />
      </AnimatePresence>

      <Image src={coralImg} alt="Coral" className="absolute bottom-0 w-full" />

      <AnimatePresence>
        <motion.img
          src="images/jellyfish.svg"
          alt="Jellyfish"
          className="absolute left-6 top-0 w-[7em] rotate-180"
          initial={{ top: 0 }}
          animate={{ top: '100%' }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 120,
            ease: 'linear',
          }}
        />
      </AnimatePresence>

      <AnimatePresence>
        <motion.img
          src="images/fish.svg"
          alt="Fish"
          className="absolute bottom-[25%] w-[10em]"
          initial={{ left: '-10em' }}
          animate={{ left: '100%' }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 20,
            ease: 'linear',
          }}
        />
      </AnimatePresence>

      <Button
        className="mt-auto w-full mb-8 ml-4 mr-4 z-20"
        rightIcon={externalLinkIcon}
        title="Buy ADX on Orca"
        size="lg"
        onClick={() => {
          window.open('https://www.orca.so');
        }}
      />
    </div>
  );
}
