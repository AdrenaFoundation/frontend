import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useRef } from 'react';

import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';

export default function CaptchaModal({
    isOpen,
    onComplete,
    onSkip,
    sitekey,
}: {
    isOpen: boolean;
    onComplete: (token: string) => void;
    onSkip: () => void;
    sitekey: string;
}) {
    const captchaRef = useRef<HCaptcha | null>(null);

    return (
        <Modal
            title="Captcha Verification"
            className="max-w-lg"
            close={onSkip}
        >
            {isOpen && (
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col gap-3">
                        <p className="text-sm">
                            Complete the security check to unlock the following features:
                        </p>

                        <div className="flex flex-col">
                            <ul className="list-disc list-inside text-sm ml-2">
                                <li>Real-time chat and discussions</li>
                                <li>Push notifications</li>
                            </ul>
                        </div>

                        <p className="text-xs text-txtfade">
                            This helps us protect the platform from bots and malicious activity.
                        </p>
                    </div>

                    <div className="flex justify-center mt-4">
                        <HCaptcha
                            ref={captchaRef}
                            sitekey={sitekey}
                            onVerify={(token) => {
                                onComplete(token);
                            }}
                            theme="dark"
                        />
                    </div>

                    <div className="h-[1px] w-full bg-bcolor mt-4"></div>

                    <div className="flex flex-col gap-2 mt-4">
                        <Button
                            title="Skip for now"
                            variant="outline"
                            onClick={onSkip}
                            className="w-full"
                        />

                        <p className="text-xs text-center text-txtfade">
                            You can complete this verification later to unlock the features.
                        </p>
                    </div>
                </div>
            )}
        </Modal>
    );
}
