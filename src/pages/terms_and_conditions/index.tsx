import { useEffect, useState } from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { PageProps } from '@/types';

export default function TermsAndConditions({ }: PageProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [termsResponse, tokenTermsResponse] = await Promise.all([
          fetch('/TermsAndConditions.html'),
          fetch('/TokenTermsAndConditions.html')
        ]);

        if (!termsResponse.ok || !tokenTermsResponse.ok) {
          throw new Error('Failed to load documents');
        }

        const [termsHtml, tokenTermsHtml] = await Promise.all([
          termsResponse.text(),
          tokenTermsResponse.text()
        ]);

        const processHtml = (html: string, scopeClass: string) => {
          const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
          const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);

          let scopedStyles = '';

          if (styleMatches) {
            styleMatches.forEach(styleTag => {
              const styleContent = styleTag.replace(/<\/?style[^>]*>/gi, '');

              const rules = styleContent.split('}');
              const scopedRules = rules.map(rule => {
                if (rule.trim() && rule.includes('{')) {
                  const [selectors, declarations] = rule.split('{');

                  if (selectors && declarations) {
                    const scopedSelectors = selectors
                      .split(',')
                      .map(s => `.${scopeClass} ${s.trim()}`)
                      .join(', ');
                    return `${scopedSelectors} { ${declarations}`;
                  }
                }
                return rule;
              }).join('}');

              scopedStyles += scopedRules;
            });
          }

          let result = '';
          if (scopedStyles) {
            result += `<style>${scopedStyles}</style>`;
          }

          if (bodyMatch) {
            result += bodyMatch[1];
          }

          return result;
        };

        const termsContent = processHtml(termsHtml, 'legal-document-1');
        const tokenTermsContent = processHtml(tokenTermsHtml, 'legal-document-2');

        const combinedContent = `
          <div class="legal-document legal-document-1">
            ${termsContent}
          </div>
          <hr style="margin: 4em 0; border: none; border-top: 2px solid rgba(255, 255, 255, 0.1);" />
          <div class="legal-document legal-document-2">
            ${tokenTermsContent}
          </div>
        `;

        setHtmlContent(combinedContent);
      } catch (err) {
        setError('Failed to load the documents. Please try again later.');
        console.error('Error loading HTML:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllContent();
  }, []);

  return (
    <div className="flex flex-col p-4 min-h-screen">
      <StyledContainer className="w-full max-w-7xl mx-auto" bodyClassName="p-0">
        <div className="p-8 pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Legal Information</h1>
          <p className="text-txtfade mb-6">
            Please review our Terms of Service, Token Terms and Conditions, and Privacy Policy
          </p>
        </div>

        <div className="w-full border-t border-bcolor">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-txtfade">Loading documents...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-red text-center">
                <p className="font-semibold mb-2">Error</p>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div
                className="legal-content"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          )}
        </div>

        <div className="p-8 pt-6 border-t border-bcolor">
          <p className="text-sm text-txtfade mb-4">
            For more information, please visit:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://docs.adrena.trade/technical-documentation/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange hover:underline"
            >
              Terms of Service →
            </a>
            <a
              href="https://docs.adrena.trade/technical-documentation/token-terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange hover:underline"
            >
              Token Terms and Conditions →
            </a>
          </div>
        </div>
      </StyledContainer>

      <style jsx>{`
        /* Override text colors only - keep all other original formatting */
        .legal-content :global(*) {
          color: rgba(255, 255, 255, 0.85) !important;
        }

        .legal-content :global(h1),
        .legal-content :global(h2),
        .legal-content :global(h3),
        .legal-content :global(h4),
        .legal-content :global(h5),
        .legal-content :global(h6) {
          color: white !important;
        }

        .legal-content :global(a) {
          color: #FA6724 !important;
        }

        .legal-content :global(a:hover) {
          color: #FAD524 !important;
        }

        .legal-content :global(strong),
        .legal-content :global(b) {
          color: white !important;
        }

        /* Make table borders visible on dark background */
        .legal-content :global(table),
        .legal-content :global(td),
        .legal-content :global(th) {
          border-color: rgba(255, 255, 255, 0.2) !important;
        }

        /* Remove white backgrounds */
        .legal-content :global(*) {
          background-color: transparent !important;
        }

        /* Isolate each document */
        .legal-content :global(.legal-document) {
          margin-bottom: 2em;
        }

        /* Ensure each document container has its own context */
        .legal-content :global(.legal-document-1),
        .legal-content :global(.legal-document-2) {
          isolation: isolate;
        }
      `}</style>
    </div>
  );
}
