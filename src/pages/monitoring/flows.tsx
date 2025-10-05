import 'react-datepicker/dist/react-datepicker.css';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import DatePicker from 'react-datepicker';

import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Select from '@/components/common/Select/Select';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import ActivityCalendar from '@/components/pages/monitoring/ActivityCalendar';
import PositionStatsCard from '@/components/pages/monitoring/PositionStatsCard';
import TopTraders from '@/components/pages/monitoring/TopTraders';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import usePositionStats from '@/hooks/usePositionStats';
import { CustodyExtended, UserProfileExtended } from '@/types';

export default function Flow({
  custodies,
}: {
  custodies: CustodyExtended[] | null;
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
    isInitialLoad,
  } = usePositionStats();

  const [selectedRange, setSelectedRange] = useState('All time');
  const [profile, setProfile] = useState<UserProfileExtended | null>(null);
  const [showTopTraders, setShowTopTraders] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StyledContainer className="rounded-md overflow-hidden p-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <div className="relative flex items-center bg-[#0A1117] rounded-md border border-gray-800/50">
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
                selectedTextClassName="text-xs flex-1 text-left"
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

            <AnimatePresence>
              {selectedRange === 'Custom' && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex items-center bg-[#0A1117] rounded-md border border-gray-800/50">
                    <DatePicker
                      selected={new Date(startDate)}
                      onChange={(date: Date | null) => {
                        if (date) {
                          setStartDate(date.toISOString());
                        }
                      }}
                      className="h-8 w-[6.5rem] px-2 bg-transparent text-xs font-regular"
                      minDate={new Date('2023-09-25')}
                      maxDate={new Date()}
                    />
                  </div>
                  <span className="text-xs text-gray-500">to</span>
                  <div className="relative flex items-center bg-[#0A1117] rounded-md border border-gray-800/50">
                    <DatePicker
                      selected={new Date(endDate)}
                      onChange={(date: Date | null) => {
                        if (date) {
                          setEndDate(date.toISOString());
                        }
                      }}
                      className="h-8 w-[6.5rem] px-2 bg-transparent text-xs font-regular"
                      minDate={new Date('2023-09-25')}
                      maxDate={new Date()}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col lg:flex-row gap-3"
          >
            <AnimatePresence mode="wait">
              {isInitialLoad &&
                // Show loading cards while data is being fetched
                Array.from({ length: 3 }).map((_, index) => (
                  <motion.div
                    key={`loading-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex-none lg:flex-1 w-full h-[27.4375rem] animate-loader rounded-md"
                  />
                ))}
              {!isInitialLoad &&
                groupedStats &&
                Object.entries(groupedStats).map(
                  ([symbol, symbolStats], index) => (
                    <motion.div
                      key={symbol}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex-1"
                    >
                      <PositionStatsCard
                        symbol={symbol}
                        stats={symbolStats}
                        custodies={custodies}
                        isLoading={false}
                      />
                    </motion.div>
                  ),
                )}
            </AnimatePresence>
          </motion.div>

          <ActivityCalendar
            data={activityCalendarData}
            selectedRange={selectedRange}
            bubbleBy={bubbleBy}
            setBubbleBy={setBubbleBy}
            setSelectedRange={setSelectedRange}
            isLoading={isInitialLoad}
            hasData
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            <AnimatePresence mode="wait">
              {!showTopTraders && (
                <motion.div
                  key="show-traders-button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    onClick={() => setShowTopTraders(true)}
                    className="font-semibold rounded-md ml-auto mr-auto"
                    title="Show Top 100 Traders"
                    variant="outline"
                    size="lg"
                    rounded={false}
                  />
                </motion.div>
              )}

              {showTopTraders && (
                <motion.div
                  key="top-traders-data"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <TopTraders
                    startDate={startDate}
                    endDate={endDate}
                    setProfile={setProfile}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </StyledContainer>
      </motion.div>
      <AnimatePresence>
        {profile && (
          <Modal
            className="h-[80vh] w-full overflow-y-auto"
            wrapperClassName="items-start w-full max-w-[70em] sm:mt-0"
            isWrapped={false}
            close={() => setProfile(null)}
          >
            <ViewProfileModal
              profile={profile}
              close={() => setProfile(null)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
