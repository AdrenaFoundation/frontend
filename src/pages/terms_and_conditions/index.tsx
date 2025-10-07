import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import documentIcon from '@/../public/images/Icons/document.svg';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { PageProps } from '@/types';

const TOKEN_TERMS_PDF_URL = 'https://2570697779-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FSrdLcmUOicAVBsHQeHAa%2Fuploads%2F2aI660onfZVqBAusAVvL%2FTokenTermsAndConditions.pdf?alt=media&token=51652e7a-4856-4817-b2f6-5235a6d16547';

const TERMS_OF_SERVICE_PDF_URL = 'https://2570697779-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FSrdLcmUOicAVBsHQeHAa%2Fuploads%2F3EXTCw5USM3nsBcQPfUi%2FTermsOfService.pdf?alt=media&token=c6c36bb0-4458-4d28-83af-c51c0967877f';

type DocumentType = 'token-terms' | 'terms-of-service' | 'privacy-policy';

export default function TermsAndConditions({ }: PageProps) {
  const [activeTab, setActiveTab] = useState<DocumentType>('terms-of-service');
  const [hasError, setHasError] = useState(false);

  const getPdfConfig = () => {
    switch (activeTab) {
      case 'token-terms':
        return {
          url: TOKEN_TERMS_PDF_URL,
          title: 'Token Terms and Conditions',
        };
      case 'privacy-policy':
        return {
          url: `${TOKEN_TERMS_PDF_URL}#page=32`,
          title: 'Privacy Policy',
        };
      case 'terms-of-service':
      default:
        return {
          url: TERMS_OF_SERVICE_PDF_URL,
          title: 'Terms of Service',
        };
    }
  };

  const { url: currentPdfUrl, title: currentTitle } = getPdfConfig();

  return (
    <div className="flex flex-col p-4 min-h-screen">
      <StyledContainer className="w-full max-w-7xl mx-auto" bodyClassName="p-0">
        <div className="p-8 pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Legal Information</h1>
          <p className="text-txtfade mb-6">
            Please review our Token Terms and Conditions, Terms of Service, and Privacy Policy
          </p>

          <div className="flex gap-2 sm:gap-4 border-b border-bcolor overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('terms-of-service');
                setHasError(false);
              }}
              className={twMerge(
                'px-3 sm:px-4 py-3 font-medium transition-colors text-xs sm:text-base whitespace-nowrap outline-none focus:outline-none border-b-2',
                activeTab === 'terms-of-service'
                  ? 'text-white border-orange'
                  : 'text-txtfade hover:text-white border-transparent'
              )}
            >
              Terms of Service
            </button>
            <button
              onClick={() => {
                setActiveTab('token-terms');
                setHasError(false);
              }}
              className={twMerge(
                'px-3 sm:px-4 py-3 font-medium transition-colors text-xs sm:text-base whitespace-nowrap outline-none focus:outline-none border-b-2',
                activeTab === 'token-terms'
                  ? 'text-white border-orange'
                  : 'text-txtfade hover:text-white border-transparent'
              )}
            >
              Token Terms & Conditions
            </button>
            <button
              onClick={() => {
                setActiveTab('privacy-policy');
                setHasError(false);
              }}
              className={twMerge(
                'px-3 sm:px-4 py-3 font-medium transition-colors text-xs sm:text-base whitespace-nowrap outline-none focus:outline-none border-b-2',
                activeTab === 'privacy-policy'
                  ? 'text-white border-orange'
                  : 'text-txtfade hover:text-white border-transparent'
              )}
            >
              Privacy Policy
            </button>
          </div>
        </div>

        <div className="w-full border-t border-bcolor">
          {!hasError ? (
            <iframe
              key={activeTab}
              src={`${currentPdfUrl}#view=FitH`}
              className="w-full"
              style={{ height: 'calc(100vh - 350px)', minHeight: '600px' }}
              title={currentTitle}
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 gap-6">
              <Image
                src={documentIcon}
                alt="Document"
                width={48}
                height={48}
                className="w-12 h-12 opacity-50"
              />
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Unable to display PDF</h3>
                <p className="text-txtfade mb-6">
                  Your browser may not support embedded PDFs. Please try a different browser or contact support.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 pt-6 border-t border-bcolor">
          <p className="text-sm text-txtfade mb-4">
            For more information, please visit:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://docs.adrena.xyz/technical-documentation/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange hover:underline"
            >
              Terms of Service →
            </a>
            <a
              href="https://docs.adrena.xyz/technical-documentation/token-terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange hover:underline"
            >
              Token Terms and Conditions →
            </a>
          </div>
        </div>
      </StyledContainer>
    </div>
  );
}
