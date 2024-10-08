import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import useSablierFinalizeLockedStakedThreads from '@/hooks/useSablierFinalizeLockedStakedThreads';

import refreshIcon from '../../../../public/images/refresh.png';
import OnchainAccountInfo from './OnchainAccountInfo';
import RemainingTimeToDate from './RemainingTimeToDate';
import Table from './Table';

export default function FinalizeLockedStakedThreadsInner() {
  const { threads, triggerReload, isLoading } =
    useSablierFinalizeLockedStakedThreads();

  if (threads === null || isLoading) {
    return (
      <div className="pt-8 pb-12">
        <Loader />

        <div className="opacity-40 mt-4 text-sm">
          Loading accounts in progress, it may take some time
        </div>
      </div>
    );
  }

  return (
    <div className="w-[20em]">
      <Image
        className={twMerge(
          'absolute w-auto h-[1em] top-4 right-4 opacity-40',
          isLoading
            ? 'hover:opacity-40 cursor-not-allowed'
            : 'hover:opacity-100 cursor-pointer',
        )}
        src={refreshIcon}
        alt="Reload icon"
        onClick={() => {
          if (isLoading) return;

          triggerReload();
        }}
      />

      <div className="flex flex-col w-full">
        {threads ? <div>{threads.length} Threads</div> : null}

        <Table
          rowHovering={true}
          className="mt-4 w-full"
          rowTitleWidth="50%"
          columnsTitles={['Until call']}
          pagination={true}
          nbItemPerPage={15}
          nbItemPerPageWhenBreakpoint={3}
          data={
            threads?.map((thread) => ({
              rowTitle: (
                <div className="flex items-center">
                  <OnchainAccountInfo
                    className="ml-auto"
                    address={thread.pubkey}
                    shorten={true}
                  />
                </div>
              ),
              values: [
                <div className="flex" key="call">
                  {thread.nextTheoreticalExecutionDate ? (
                    <RemainingTimeToDate
                      timestamp={thread.nextTheoreticalExecutionDate}
                      tippyText="The call is overdue, please check the thread."
                    />
                  ) : (
                    'Cannot be calculated'
                  )}
                </div>,
              ],
            })) ?? []
          }
        />
      </div>
    </div>
  );
}
