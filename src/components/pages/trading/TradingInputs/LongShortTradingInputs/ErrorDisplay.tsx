import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

import errorImg from '../../../../../../public/images/Icons/error.svg';

interface ErrorDisplayProps {
    errorMessage: string | null;
}

export const ErrorDisplay = ({ errorMessage }: ErrorDisplayProps) => {
    if (!errorMessage) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="flex w-full h-auto relative overflow-hidden pl-6 pt-2 pb-3 pr-2 mt-1 sm:mt-2 border-2 border-[#BE3131] backdrop-blur-md z-30 items-center justify-center rounded-xl"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.5 }}
                style={{ originY: 0 }}
            >
                <Image
                    className="w-auto h-[1.5em] absolute left-[0.5em]"
                    src={errorImg}
                    alt="Error icon"
                />
                <div className="items-center justify-center">
                    <div className="text-sm">{errorMessage}</div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
