import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import useSablierFinalizeLockedStakedThreads from '@/hooks/useSablierFinalizeLockedStakedThreads';

import warningImg from '../../../../public/images/Icons/warning.png';
import refreshIcon from '../../../../public/images/refresh.png';
import NumberInfo from './NumberInfo';
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
    <div className="w-full">
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
          className="mt-4"
          rowTitleWidth="20%"
          columnsTitles={['Funding', 'Paused', 'Until call']}
          pagination={true}
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
                <div className="flex" key="funding">
                  {thread.funding !== null && thread.funding < 0.0175 ? (
                    <Image
                      className="w-auto h-[1.5em] mr-1"
                      src={warningImg}
                      alt="Error icon"
                    />
                  ) : null}

                  <NumberInfo denomination="SOL" value={thread.funding} />
                </div>,

                <div className="flex" key="call">
                  {thread.nativeObject.paused ? (
                    <div className="flex">
                      <Image
                        className="w-auto h-[1.5em] mr-1"
                        src={warningImg}
                        alt="Error icon"
                      />
                      <span>Yes</span>
                    </div>
                  ) : (
                    'No'
                  )}
                </div>,

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
