import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { AnimatePresence, motion } from 'framer-motion';
import banner from '@/../../public/images/referral-wallpaper.jpg';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

export default function Achievements() {
    return (
        <div className="flex flex-col p-4">
            <StyledContainer className="p-0 overflow-hidden" bodyClassName='p-0 items-center justify-center'>
                <div className="relative flex flex-col items-center w-full h-[17em] pt-12 border-b">
                    <div className="">
                        <AnimatePresence>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{}}
                                key={"Achievements"}
                            >
                                <Image
                                    src={banner}
                                    alt="Achievements banner"
                                    className="absolute top-0 left-0 w-full h-full object-cover opacity-30 rounded-tl-xl rounded-tr-xl"
                                    style={{ objectPosition: "50% 80%" }}
                                />
                            </motion.span>
                        </AnimatePresence>
                        <div className="absolute bottom-0 left-0 w-full h-[10em] bg-gradient-to-b from-transparent to-secondary z-10" />
                        <div className="absolute top-0 right-0 w-[10em] h-full bg-gradient-to-r from-transparent to-secondary z-10" />
                        <div className="absolute top-0 left-0 w-[10em] h-full bg-gradient-to-l from-transparent to-secondary z-10" />
                    </div>

                    <div className="z-10 text-center flex flex-col items-center justify-center gap-4 pt-8">
                        <h1
                            className={twMerge(
                                'text-[1em] sm:text-[1.5em] md:text-[2em] font-archivoblack animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]',
                                'bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]',
                            )}
                        >
                            Achievements
                        </h1>

                        <h4 className='font-archivo text-white/80 tracking-widest uppercase text-md'>
                            Show the world what you are capable of
                        </h4>
                    </div>
                </div>

            </StyledContainer>
        </div>
    );
}
