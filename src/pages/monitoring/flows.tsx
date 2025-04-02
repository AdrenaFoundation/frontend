import 'react-datepicker/dist/react-datepicker.css';

// import { AnimatePresence } from 'framer-motion';
// import Image from 'next/image';
// import { useEffect, useState } from 'react';
// import DatePicker from 'react-datepicker';
// import { twMerge } from 'tailwind-merge';

// import Modal from '@/components/common/Modal/Modal';
// import Select from '@/components/common/Select/Select';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
// import Loader from '@/components/Loader/Loader';
// import FormatNumber from '@/components/Number/FormatNumber';
// import ActivityCalendar from '@/components/pages/monitoring/ActivityCalendar';
// import TopTraders from '@/components/pages/monitoring/TopTraders';
// import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
// import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
// import usePositionStats from '@/hooks/usePositionStats';
import { CustodyExtended } from '@/types';


export default function Flow({
  // custodies,
  // view
}: {
  custodies: CustodyExtended[] | null;
  view: string;
}) {
  return <StyledContainer className="rounded-lg overflow-hidden p-5 items-center text-sm">
    Flow page is under Maintenance, and will come back soon.
  </StyledContainer>;

  // useEffect(() => {
  //   if (view !== 'flows') return;
  // }, [view]);

  // const {
  //   groupedStats,
  //   activityCalendarData,
  //   bubbleBy,
  //   setBubbleBy,
  //   loading,
  //   startDate,
  //   setStartDate,
  //   endDate,
  //   setEndDate,
  // } = usePositionStats();

  // const [selectedRange, setSelectedRange] = useState('All Time');
  // const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
  // const [profile, setProfile] = useState<UserProfileExtended | null>(null);

  // if (view !== 'flows') return <></>;

  // if (loading) {
  //   return <div className="h-full w-full flex items-center justify-center text-sm">
  //     <div
  //       className="bg-[#040D14] border rounded-lg p-3 w-full h-full flex items-center justify-center"
  //     >
  //       <Loader />
  //     </div>
  //   </div >;
  // }

  // // if (!groupedStats || !activityCalendarData) return <div className='flex justify-center items-center min-h-[200px]'>
  // //   <div className='text-center'>
  // //     <h3 className='text-lg font-medium mb-2'>🛠️ Under Maintenance</h3>
  // //     <p className='text-gray-400'>We&apos;re making some improvements. Check back soon!</p>
  // //   </div>
  // // </div>;

  // return (
  //   <>
  //     <StyledContainer className="rounded-lg overflow-hidden p-5">
  //       <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-secondary border border-gray-800 rounded p-2 text-sm items-center max-w-md">
  //         <Select
  //           onSelect={(value) => {
  //             setSelectedRange(value);
  //             const date = new Date();
  //             setEndDate(date.toISOString());
  //             switch (value) {
  //               case 'All Time':
  //                 setStartDate('2024-09-25T00:00:00Z');
  //                 break;
  //               case 'Last Month':
  //                 date.setMonth(date.getMonth() - 1);
  //                 setStartDate(date.toISOString());
  //                 break;
  //               case 'Last Week':
  //                 date.setDate(date.getDate() - 7);
  //                 setStartDate(date.toISOString());
  //                 break;
  //               case 'Last Day':
  //                 date.setDate(date.getDate() - 1);
  //                 setStartDate(date.toISOString());
  //                 break;
  //               case 'Custom':
  //                 break;
  //               default:
  //                 break;
  //             }
  //           }}
  //           reversed={true}
  //           className="shrink-0 h-full flex items-center"
  //           selectedTextClassName="text-sm"
  //           menuTextClassName="text-sm"
  //           menuClassName="rounded-tl-lg rounded-bl-lg ml-3"
  //           menuOpenBorderClassName="rounded-tl-lg rounded-bl-lg"
  //           options={[
  //             { title: 'All Time' },
  //             { title: 'Last Month' },
  //             { title: 'Last Week' },
  //             { title: 'Last Day' },
  //             { title: 'Custom' },
  //           ]}
  //           selected={selectedRange}
  //         />

  //         {selectedRange === 'Custom' && (
  //           <>
  //             <DatePicker
  //               selected={new Date(startDate)}
  //               onChange={(date: Date | null) => {
  //                 if (date) {
  //                   setStartDate(date.toISOString());
  //                 }
  //               }}
  //               className="w-full sm:w-auto px-2 py-1 bg-[#050D14] rounded border border-gray-600"
  //               minDate={new Date('2023-09-25')}
  //               maxDate={new Date()}
  //             />
  //             <DatePicker
  //               selected={new Date(endDate)}
  //               onChange={(date: Date | null) => {
  //                 if (date) {
  //                   setEndDate(date.toISOString());
  //                 }
  //               }}
  //               className="w-full sm:w-auto px-2 py-1 bg-[#050D14] rounded border border-gray-600"
  //               minDate={new Date('2023-09-25')}
  //               maxDate={new Date()}
  //             />
  //           </>
  //         )}
  //       </div>

  //       <div className="flex flex-col lg:flex-row gap-3">
  //         {groupedStats &&
  //           Object.entries(groupedStats).map(([symbol, symbolStats]) => (
  //             <div
  //               key={symbol}
  //               className="p-4 border rounded-lg bg-[#050D14] flex-1"
  //             >
  //               <h3 className="font-semibold flex items-center gap-2">
  //                 <Image
  //                   src={
  //                     custodies?.find(
  //                       (c) =>
  //                         c.tokenInfo.symbol.toLocaleLowerCase() ===
  //                         symbol.toLowerCase(),
  //                     )?.tokenInfo.image || ''
  //                   }
  //                   alt="token icon"
  //                   width="24"
  //                   height="24"
  //                 />
  //                 {symbol}
  //               </h3>

  //               {symbolStats.map((stat) => (
  //                 <div key={stat.side} className="mt-2 flex flex-col gap-2">
  //                   <h4
  //                     className={`font-boldy ${stat.side === 'long' ? 'text-green' : 'text-redbright'
  //                       }`}
  //                   >
  //                     {stat.side}
  //                   </h4>
  //                   <div>
  //                     <div className="flex justify-between text-txtfade">
  //                       <span>Positions count:</span>
  //                       <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
  //                       <FormatNumber
  //                         nb={stat.countPositions}
  //                         precision={0}
  //                         minimumFractionDigits={0}
  //                       />
  //                     </div>
  //                     <div className="flex justify-between text-txtfade">
  //                       <span className="text-txtfade">
  //                         Total PnL over the period:
  //                       </span>
  //                       <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
  //                       <FormatNumber
  //                         nb={stat.totalPnl}
  //                         precision={2}
  //                         minimumFractionDigits={2}
  //                         prefix="$"
  //                         showSignBeforePrefix={true}
  //                         className={twMerge(
  //                           'opacity-80',
  //                           stat.totalPnl < 0 ? 'text-redbright' : 'text-green',
  //                         )}
  //                         isDecimalDimmed={false}
  //                       />
  //                     </div>
  //                     <div className="flex justify-between text-txtfade">
  //                       <span className="text-txtfade">Worst PnL:</span>
  //                       <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
  //                       <FormatNumber
  //                         nb={stat.minPnl}
  //                         precision={2}
  //                         minimumFractionDigits={2}
  //                         prefix="$"
  //                         showSignBeforePrefix={true}
  //                         className={twMerge(
  //                           'opacity-80',
  //                           stat.minPnl < 0 ? 'text-redbright' : 'text-green',
  //                         )}
  //                         isDecimalDimmed={false}
  //                       />
  //                     </div>
  //                     <div className="flex justify-between text-txtfade">
  //                       <span className="text-txtfade">Best PnL:</span>
  //                       <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
  //                       <FormatNumber
  //                         nb={stat.maxPnl}
  //                         precision={2}
  //                         minimumFractionDigits={2}
  //                         prefix="$"
  //                         showSignBeforePrefix={true}
  //                         className={twMerge(
  //                           'opacity-80',
  //                           stat.maxPnl < 0 ? 'text-redbright' : 'text-green',
  //                         )}
  //                         isDecimalDimmed={false}
  //                       />
  //                     </div>
  //                     <div className="flex justify-between text-txtfade">
  //                       <span>Total Trade Volume:</span>
  //                       <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
  //                       <FormatNumber
  //                         nb={stat.totalVolume}
  //                         precision={2}
  //                         minimumFractionDigits={2}
  //                         prefix="$"
  //                         showSignBeforePrefix={true}
  //                       />
  //                     </div>
  //                     <div className="h-[1px] bg-third my-2" />
  //                     <div className="flex justify-between text-txtfade">
  //                       <span className="text-txtfade">Smallest Trade Size:</span>
  //                       <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
  //                       <FormatNumber
  //                         nb={stat.minVolume}
  //                         precision={2}
  //                         minimumFractionDigits={2}
  //                         prefix="$"
  //                         showSignBeforePrefix={true}
  //                         className="text-txtfade"
  //                       />
  //                     </div>
  //                     <div className="flex justify-between text-txtfade">
  //                       <span className="text-txtfade">Biggest Trade Size:</span>
  //                       <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
  //                       <FormatNumber
  //                         nb={stat.maxVolume}
  //                         precision={2}
  //                         minimumFractionDigits={2}
  //                         prefix="$"
  //                         showSignBeforePrefix={true}
  //                         className="text-txtfade"
  //                       />
  //                     </div>
  //                     <div className="flex justify-between text-txtfade">
  //                       <span>Average Trade Size:</span>
  //                       <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
  //                       <FormatNumber
  //                         nb={stat.averageVolume}
  //                         precision={2}
  //                         minimumFractionDigits={2}
  //                         prefix="$"
  //                         showSignBeforePrefix={true}
  //                       />
  //                     </div>
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           ))}
  //       </div>

  //       <TopTraders
  //         startDate={startDate}
  //         endDate={endDate}
  //         allUserProfilesMetadata={allUserProfilesMetadata}
  //         setProfile={setProfile}
  //       />

  //       {activityCalendarData ? <ActivityCalendar
  //         data={activityCalendarData}
  //         setStartDate={setStartDate}
  //         setEndDate={setEndDate}
  //         bubbleBy={bubbleBy}
  //         setBubbleBy={setBubbleBy}
  //         setSelectedRange={setSelectedRange}
  //       /> : null}
  //     </StyledContainer>
  //     <AnimatePresence>
  //       {profile && (
  //         <Modal
  //           className="h-[80vh] w-full overflow-y-auto"
  //           wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper-1.jpg')]"
  //           isWrapped={false}
  //           close={() => setProfile(null)}
  //         >
  //           <ViewProfileModal profile={profile} close={() => setProfile(null)} />
  //         </Modal>
  //       )}
  //     </AnimatePresence>
  //   </>
  // );
}
