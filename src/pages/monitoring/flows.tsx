import 'react-datepicker/dist/react-datepicker.css';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import DatePicker from 'react-datepicker';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Select from '@/components/common/Select/Select';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import Loader from '@/components/Loader/Loader';
import ActivityCalendar from '@/components/pages/monitoring/ActivityCalendar';
import PositionStatsCard from '@/components/pages/monitoring/PositionStatsCard';
import TopTraders from '@/components/pages/monitoring/TopTraders';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import usePositionStats from '@/hooks/usePositionStats';
import { CustodyExtended, UserProfileExtended } from '@/types';


export default function Flow({
  custodies,
  view
}: {
  custodies: CustodyExtended[] | null;
  view: string;
}) {
  const {
    groupedStats,
    activityCalendarData,
    bubbleBy,
    setBubbleBy,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
  } = usePositionStats();

  const [selectedRange, setSelectedRange] = useState('All time');
  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
  const [profile, setProfile] = useState<UserProfileExtended | null>(null);
  const [showTopTraders, setShowTopTraders] = useState(false);

  if (view !== 'flows') return <></>;

  return (
    <>
      <StyledContainer className="rounded-lg overflow-hidden p-5">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-[#0A1117] rounded-lg border border-gray-800/50">
            <Select
              onSelect={(value) => {
                setSelectedRange(value);
                const date = new Date();
                setEndDate(date.toISOString());
                switch (value) {
                  case 'All time':
                    setStartDate('2024-09-25T00:00:00.000Z');
                    break;
                  case 'Last 7 days':
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    sevenDaysAgo.setUTCHours(0, 0, 0, 0);
                    setStartDate(sevenDaysAgo.toISOString());
                    break;
                  case 'Last 30 days':
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    oneMonthAgo.setUTCHours(0, 0, 0, 0);
                    setStartDate(oneMonthAgo.toISOString());
                    break;
                  case 'Year to date':
                    const startOfYear = new Date();
                    startOfYear.setMonth(0, 1);
                    startOfYear.setUTCHours(0, 0, 0, 0);
                    setStartDate(startOfYear.toISOString());
                    break;
                  case 'Custom':
                    break;
                  default:
                    break;
                }
              }}
              reversed={true}
              className="h-8 w-28 flex items-center px-2"
              selectedTextClassName="text-xs font-medium flex-1 text-left"
              menuTextClassName="text-xs"
              menuClassName="w-28"
              options={[
                { title: 'All time' },
                { title: 'Last 7 days' },
                { title: 'Last 30 days' },
                { title: 'Year to date' },
                { title: 'Custom' },
              ]}
              selected={selectedRange}
            />
          </div>

          {selectedRange === 'Custom' && (
            <div className="flex items-center gap-2">
              <div className="relative flex items-center bg-[#0A1117] rounded-lg border border-gray-800/50">
                <DatePicker
                  selected={new Date(startDate)}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setStartDate(date.toISOString());
                    }
                  }}
                  className="h-8 w-[104px] px-2 bg-transparent text-xs font-medium"
                  minDate={new Date('2023-09-25')}
                  maxDate={new Date()}
                />
              </div>
              <span className="text-xs text-gray-500">to</span>
              <div className="relative flex items-center bg-[#0A1117] rounded-lg border border-gray-800/50">
                <DatePicker
                  selected={new Date(endDate)}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setEndDate(date.toISOString());
                    }
                  }}
                  className="h-8 w-[104px] px-2 bg-transparent text-xs font-medium"
                  minDate={new Date('2023-09-25')}
                  maxDate={new Date()}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          {loading ? (
            // Show loading cards while data is being fetched
            Array.from({ length: 3 }).map((_, index) => (
              <PositionStatsCard
                key={`loading-${index}`}
                symbol=""
                stats={[]}
                isLoading={true}
              />
            ))
          ) : groupedStats ? (
            Object.entries(groupedStats).map(([symbol, symbolStats]) => (
              <PositionStatsCard
                key={symbol}
                symbol={symbol}
                stats={symbolStats}
                custodies={custodies}
                isLoading={false}
              />
            ))
          ) : null}
        </div>

        {loading ? (<div className="p-4 border rounded-lg bg-[#050D14] flex-1 h-full flex items-center justify-center">
          <Loader />
        </div>) : (
          <ActivityCalendar
            data={activityCalendarData}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            bubbleBy={bubbleBy}
            setBubbleBy={setBubbleBy}
            setSelectedRange={setSelectedRange}
          />
        )}

        <div className="flex flex-col gap-4">
          {!showTopTraders && (
            <Button
              onClick={() => setShowTopTraders(true)}
              className="font-boldy rounded-lg ml-auto mr-auto"
              title="Show Top 100 Traders"
              variant="outline"
              size="lg"
              rounded={false}
            />
          )}

          {showTopTraders && (
            <TopTraders
              startDate={startDate}
              endDate={endDate}
              allUserProfilesMetadata={allUserProfilesMetadata}
              setProfile={setProfile}
            />
          )}
        </div>

      </StyledContainer>
      <AnimatePresence>
        {profile && (
          <Modal
            className="h-[80vh] w-full overflow-y-auto"
            wrapperClassName="items-start w-full max-w-[55em] sm:mt-0  bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper-1.jpg')]"
            isWrapped={false}
            close={() => setProfile(null)}
          >
            <ViewProfileModal profile={profile} close={() => setProfile(null)} />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
