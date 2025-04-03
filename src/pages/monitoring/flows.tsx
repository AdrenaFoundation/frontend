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

  const [selectedRange, setSelectedRange] = useState('All Time');
  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
  const [profile, setProfile] = useState<UserProfileExtended | null>(null);
  const [showTopTraders, setShowTopTraders] = useState(false);

  if (view !== 'flows') return <></>;

  return (
    <>
      <StyledContainer className="rounded-lg overflow-hidden p-5">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-secondary border border-gray-800 rounded p-2 text-sm items-center max-w-md">
          <Select
            onSelect={(value) => {
              setSelectedRange(value);
              const date = new Date();
              setEndDate(date.toISOString());
              switch (value) {
                case 'All Time':
                  setStartDate('2024-09-25T00:00:00Z');
                  break;
                case 'Last Month':
                  date.setMonth(date.getMonth() - 1);
                  setStartDate(date.toISOString());
                  break;
                case 'Last Week':
                  date.setDate(date.getDate() - 7);
                  setStartDate(date.toISOString());
                  break;
                case 'Last Day':
                  date.setDate(date.getDate() - 1);
                  setStartDate(date.toISOString());
                  break;
                case 'Custom':
                  break;
                default:
                  break;
              }
            }}
            reversed={true}
            className="shrink-0 h-full flex items-center"
            selectedTextClassName="text-sm"
            menuTextClassName="text-sm"
            menuClassName="rounded-tl-lg rounded-bl-lg ml-3"
            menuOpenBorderClassName="rounded-tl-lg rounded-bl-lg"
            options={[
              { title: 'All Time' },
              { title: 'Last Month' },
              { title: 'Last Week' },
              { title: 'Last Day' },
              { title: 'Custom' },
            ]}
            selected={selectedRange}
          />

          {selectedRange === 'Custom' && (
            <>
              <DatePicker
                selected={new Date(startDate)}
                onChange={(date: Date | null) => {
                  if (date) {
                    setStartDate(date.toISOString());
                  }
                }}
                className="w-full sm:w-auto px-2 py-1 bg-[#050D14] rounded border border-gray-600"
                minDate={new Date('2023-09-25')}
                maxDate={new Date()}
              />
              <DatePicker
                selected={new Date(endDate)}
                onChange={(date: Date | null) => {
                  if (date) {
                    setEndDate(date.toISOString());
                  }
                }}
                className="w-full sm:w-auto px-2 py-1 bg-[#050D14] rounded border border-gray-600"
                minDate={new Date('2023-09-25')}
                maxDate={new Date()}
              />
            </>
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
