import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import shovelIcon from '@/../public/images/Icons/shovel.svg';
import Button from '@/components/common/Button/Button';
import CopyButton from '@/components/common/CopyButton/CopyButton';
import Loader from '@/components/Loader/Loader';
import { ErrorReportType } from '@/types';

export default function ErrorReport() {
  const router = useRouter();
  const { code } = router.query;

  const [errorCode, setErrorCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ErrorReportType | null>(null);
  const [isUTC, setIsUTC] = useState<boolean>(true);

  useEffect(() => {
    if (code && typeof code === 'string') {
      setErrorCode(code);
      fetchErrorReport(code);
    }
  }, [code]);

  const fetchErrorReport = async (code: string) => {
    if (!code) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/error_reports?error_code=${encodeURIComponent(code)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch error report');
      }

      if (data.reports && data.reports.length > 0) {
        setReportData(data.reports[0]);
      } else {
        setError(`No error report found with code: ${code}`);
        setReportData(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (errorCode.trim()) {
      fetchErrorReport(errorCode.trim());
      router.push(
        {
          pathname: '/admin',
          query: { code: errorCode.trim() },
        },
        undefined,
        { shallow: true },
      );
    }
  };

  const formatConsoleLogs = (logs: string) => {
    if (typeof logs === 'string') {
      try {
        logs = JSON.parse(logs);
      } catch {
        return logs;
      }
    }

    if (!Array.isArray(logs)) return JSON.stringify(logs, null, 2);

    return logs.map((log, i) => (
      <div key={i} className="font-mono text-xs border-b border-gray-800 py-1">
        <div className="text-gray-400">
          {new Date(log.timestamp).toLocaleString()}
        </div>
        <pre
          className={twMerge(
            'text-xs font-mono',
            log.type === 'error' && 'text-redbright',
          )}
        >
          {JSON.stringify(log.message, null, 2)}
        </pre>
      </div>
    ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 border rounded-md mt-8">
      <h1 className="text-xl font-interSemibold mb-3 capitalize">
        Error Report Lookup
      </h1>

      <div className="relative flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter error code"
          value={errorCode}
          onChange={(e) => setErrorCode(e.target.value)}
          className="text-sm p-3 rounded-md text-ellipsis font-mono outline-none w-full bg-inputcolor border border-white/10"
        />
        <Button
          title="Search"
          onClick={() => handleSearch()}
          disabled={loading || !errorCode.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        />
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <Loader />
        </div>
      )}

      {error && !loading && (
        <div className="text-sm border border-red text-redbright rounded-md p-4 mb-4">
          {error}
        </div>
      )}

      {reportData && !loading && (
        <div className="bg-[#08141E] border border-[#1A2938] rounded-md p-4 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="text-lg font-interSemibold mb-2 text-white">
                Error Details
              </h2>

              <div className="mb-3">
                <div className="text-sm text-gray-400">Report Code</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{reportData.ref}</span>
                  <CopyButton
                    textToCopy={reportData.ref}
                    notificationTitle="Error code copied to clipboard"
                    className="opacity-50"
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-400">Timestamp</div>
                <div
                  className="text-sm cursor-pointer"
                  onClick={() => setIsUTC(!isUTC)}
                >
                  {new Date(reportData.created_at).toLocaleString(
                    isUTC ? 'en-US' : undefined,
                    {
                      timeZone: isUTC
                        ? 'UTC'
                        : Intl.DateTimeFormat().resolvedOptions().timeZone,
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    },
                  )}
                  <span className="opacity-50 text-xs underline ml-2">
                    {isUTC ? 'UTC' : 'Local Time'}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-400">Action</div>
                <div className="text-sm">{reportData.action || 'N/A'}</div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-400">Step</div>
                <div className="text-sm">{reportData.step || 'N/A'}</div>
              </div>

              {reportData.txHash && (
                <div className="mb-3">
                  <div className="text-sm text-gray-400">Transaction</div>
                  <div className="flex items-center gap-2 text-sm">
                    <a
                      href={`https://explorer.solana.com/tx/${reportData.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-400 hover:text-blue-300 truncate underline"
                    >
                      {reportData.txHash}
                    </a>
                    <CopyButton
                      textToCopy={reportData.txHash}
                      notificationTitle="Transaction hash copied to clipboard"
                      className="opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-interSemibold mb-2 text-white">
                User Info
              </h2>

              <div className="mb-3">
                <div className="text-sm text-gray-400">Wallet Address</div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://explorer.solana.com/address/${reportData.wallet_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-blue-400 hover:text-blue-300 truncate underline"
                  >
                    {reportData.wallet_address}
                  </a>
                  <CopyButton
                    textToCopy={reportData.wallet_address}
                    notificationTitle="Wallet address copied to clipboard"
                    className="opacity-50"
                  />

                  <Link
                    href={`/monitoring?view=walletDigger&wallet=${reportData.wallet_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-300"
                  >
                    <Image
                      src={shovelIcon}
                      alt="shovel"
                      width={12}
                      height={12}
                    />
                  </Link>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-400">URL</div>
                <div className="text-sm truncate">
                  {reportData.url || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-interSemibold mb-2 text-white">
              Error Message
            </h2>
            <div className="bg-[#040D14] p-4 rounded-md border border-bcolor whitespace-pre-wrap font-mono text-sm text-red-300">
              {reportData.error_message}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2 text-white">
              Console Logs
            </h2>
            <div className="bg-[#040D14] p-4 rounded-md border border-bcolor overflow-auto max-h-[18.75rem] overscroll-contain">
              {formatConsoleLogs(reportData.console_log as unknown as string)}
            </div>
          </div>

          {reportData.recent_post_data && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2 text-white">
                Recent API Requests
              </h2>
              <div className="bg-[#040D14] p-4 rounded-md border border-bcolor overflow-auto max-h-[18.75rem overscroll-contain">
                <pre className="text-xs font-mono">
                  {JSON.stringify(reportData.recent_post_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
