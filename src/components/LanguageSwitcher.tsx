import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from './common/Modal/Modal';

export default function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const changeLanguage = async (lng: string) => {
        await i18n.changeLanguage(lng);
        setIsOpen(false);
        // Reload the page to apply translations fully
        window.location.reload();
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-1 px-1.5 hover:bg-third transition-colors cursor-pointer rounded-md text-sm"
            >
                {i18n.language === 'en' ? 'EN' : 'KO'}
            </button>

            {isOpen && (
                <Modal
                    title="Select Language"
                    close={() => setIsOpen(false)}
                    className="flex flex-col w-full p-5"
                    wrapperClassName="w-80"
                >
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`px-2 py-4 rounded-md border border-bcolor hover:bg-third bg-third hover:opacity-100 hover:grayscale-0 transition duration-300 ${i18n.language !== 'en' &&
                                'grayscale border-transparent bg-transparent hover:bg-transparent opacity-30'
                                }`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => changeLanguage('ko')}
                            className={`px-2 py-4 rounded-md border border-bcolor hover:bg-third bg-third hover:opacity-100 hover:grayscale-0 transition duration-300 ${i18n.language !== 'ko' &&
                                'grayscale border-transparent bg-transparent hover:bg-transparent opacity-30'
                                }`}
                        >
                            한국어
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}