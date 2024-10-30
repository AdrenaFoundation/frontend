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
      <div className="m-auto p-5">
        <Loader />

        <div className="opacity-40 mt-4 text-sm text-center">
          Loading accounts in progress, it may take some time
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-row justify-between items-center p-5 pb-0">
        {threads ? <p className='text-sm font-mono'>{threads.length} Threads</p> : null}
        <Image
          className={twMerge(
            'w-[16px] h-[16px]',
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
      </div>

      <div className="flex flex-col">
        <Table
          rowHovering={true}
          className="mt-4 rounded-none bg-transparent border-none"
          rowTitleWidth='50%'
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

                  />
                </div>
              ),
              values: [
                <div className="flex md:ml-auto" key="call">
                  {thread.nextTheoreticalExecutionDate ? (
                    <>
                      <RemainingTimeToDate
                        timestamp={thread.nextTheoreticalExecutionDate}
                        tippyText="The call is overdue, please check the thread."
                        classNameTime="font-mono"
                      />
                      <p className='ml-1 opacity-50 font-mono'>left</p>
                    </>
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
