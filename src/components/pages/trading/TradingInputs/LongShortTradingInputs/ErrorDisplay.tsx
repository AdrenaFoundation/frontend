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
                className="flex w-full relative overflow-hidden mt-1 sm:mt-2 border-2 border-[#BE3131] backdrop-blur-md z-30 rounded-xl"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.5 }}
                style={{ originY: 0 }}
            >
                <div className="flex items-center w-full py-2 px-4">
                    <Image
                        className="w-auto h-[1.5em] mr-3 flex-shrink-0"
                        src={errorImg}
                        alt="Error icon"
                    />
                    <div className="flex-1 text-sm 2xl:text-center">
                        {errorMessage}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
