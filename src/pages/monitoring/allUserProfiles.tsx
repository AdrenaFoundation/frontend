import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import reloadIcon from '@/../public/images/Icons/arrow-down-up.svg';
import chartIcon from '@/../public/images/Icons/chart-icon.svg';
import listIcon from '@/../public/images/Icons/list-ul.svg';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Pagination from '@/components/common/Pagination/Pagination';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import AllUserProfileStatsChart from '@/components/pages/global/AllUserProfileStatsChart/AllUserProfileStatsChart';
import FilterSidebar from '@/components/pages/monitoring/FilterSidebar/FilterSidebar';
import UserProfileBlock from '@/components/pages/monitoring/UserProfileBlock';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import {
  SuperchargedUserProfile,
  useAllUserSuperchargedProfiles,
} from '@/hooks/auth-profile/useAllUserSuperchargedProfiles';
import { UserProfileExtended } from '@/types';

type SortableKeys = 'pnl' | 'volume' | 'fees';

export default function AllUserProfiles() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfigs, setSortConfigs] = useState<{
    [key: string]: 'asc' | 'desc';
  }>({
    pnl: 'desc',
    fees: 'desc',
    volume: 'desc',
  });

  const keys = {
    pnl: 'pnl',
    'trade volume': 'volume',
    'fees paid': 'fees',
  } as const;

  const [sortOrder, setSortOrder] = useState<string[]>([
    'pnl',
    'volume',
    'fees',
  ]);

  const [viewPage, setViewPage] = useState<string>('List view');

  const [usernameFilter, setUsernameFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [pnlFilter, setPnlFilter] = useState<'all' | 'positive' | 'negative'>(
    'all',
  );

  const { superchargedUserProfiles: allUserProfiles, triggerReload } =
    useAllUserSuperchargedProfiles({
      orderBy: sortOrder[0] as SortableKeys,
      sort: sortConfigs[sortOrder[0] as SortableKeys],
      pnlStatus: pnlFilter,
    });

  const [filteredProfiles, setFilteredProfiles] = useState<
    SuperchargedUserProfile[] | null
  >(null);

  const [paginatedProfiles, setPaginatedProfiles] = useState<
    SuperchargedUserProfile[]
  >([]);

  const [activeProfile, setActiveProfile] =
    useState<UserProfileExtended | null>(null);

  useEffect(() => {
    if (!usernameFilter.length && !ownerFilter.length)
      return setFilteredProfiles(allUserProfiles);

    setFilteredProfiles(
      allUserProfiles?.filter((p) => {
        if (usernameFilter.length) {
          if (!p.profile) {
            return false;
          }

          if (
            !p.profile.nickname
              .toLowerCase()
              .includes(usernameFilter.toLowerCase())
          ) {
            return false;
          }
        }

        if (ownerFilter.length) {
          if (!p.profile) {
            return false;
          }

          if (
            !p.profile.owner
              .toBase58()
              .toLowerCase()
              .includes(ownerFilter.toLowerCase())
          ) {
            return false;
          }
        }

        return true;
      }) ?? [],
    );
  }, [allUserProfiles, usernameFilter, ownerFilter]);

  useEffect(() => {
    if (!filteredProfiles) return;

    const paginated = filteredProfiles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );

    setPaginatedProfiles(paginated);
  }, [currentPage, filteredProfiles]);

  const toggleSortOrder = (criteria: keyof typeof keys) => {
    setSortConfigs((prevConfigs) => ({
      ...prevConfigs,
      [keys[criteria] as SortableKeys]:
        prevConfigs[keys[criteria] as SortableKeys] === 'desc' ? 'asc' : 'desc',
    }));

    setSortOrder((prevOrder) => {
      const newOrder = prevOrder.filter(
        (item) => item !== (keys[criteria] as SortableKeys),
      );

      return [keys[criteria] as SortableKeys, ...newOrder];
    });
  };

  return (
    <>
      <div>
        <StyledContainer className="p-0">
          <div className="flex flex-col md:flex-row md:gap-3 h-full w-full">
            <FilterSidebar
              views={[
                {
                  title: 'List view',
                  icon: listIcon,
                },
                {
                  title: 'Chart view',
                  icon: chartIcon,
                },
              ]}
              activeView={viewPage}
              handleViewChange={setViewPage}
              searches={[
                {
                  value: ownerFilter,
                  placeholder: 'Filter by owner (pubkey)',
                  handleChange: setOwnerFilter,
                },
                {
                  value: usernameFilter,
                  placeholder: 'Filter by username',
                  handleChange: setUsernameFilter,
                },
              ]}
              filterOptions={[
                {
                  type: 'radio',
                  name: 'PnL',
                  activeOption: pnlFilter,
                  handleChange: (v: unknown) =>
                    setPnlFilter(v as 'all' | 'positive' | 'negative'),
                  optionItems: [
                    { label: 'all' },
                    { label: 'positive' },
                    { label: 'negative' },
                  ],
                  disabled: viewPage === 'Chart view',
                },
              ]}
              sortOptions={{
                handleChange: toggleSortOrder as React.Dispatch<
                  React.SetStateAction<string>
                >,
                optionItems: [
                  {
                    label: 'pnl',
                    order: sortConfigs.pnl,
                    lastClicked: sortOrder[0] === 'pnl',
                  },
                  {
                    label: 'trade volume',
                    order: sortConfigs.volume,
                    lastClicked: sortOrder[0] === 'volume',
                  },
                  {
                    label: 'fees paid',
                    order: sortConfigs.fees,
                    lastClicked: sortOrder[0] === 'fees',
                  },
                ],
                disabled: viewPage === 'Chart view',
              }}
            />

            {viewPage === 'List view' ? (
              <div className="w-full p-4">
                <div className="mb-4 w-full">
                  <Button
                    icon={reloadIcon}
                    variant="outline"
                    onClick={triggerReload}
                    className="w-7 h-7 p-0 border-bcolor ml-auto"
                    iconClassName="w-4 h-4 opacity-75 hover:opacity-100"
                  />
                </div>

                <div className="flex flex-wrap flex-col gap-2 mb-3">
                  <AnimatePresence mode="wait">
                    {paginatedProfiles.length > 0 ? (
                      <motion.section
                        key="profiles-section"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-2 w-full"
                      >
                        <AnimatePresence>
                          {paginatedProfiles.map((superchargedProfile, index) => (
                            <motion.div
                              key={superchargedProfile.wallet.toBase58()}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <UserProfileBlock
                                superchargedProfile={superchargedProfile}
                                setActiveProfile={setActiveProfile}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.section>
                    ) : (
                      <motion.section
                        key="loader-section"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <LoaderState />
                      </motion.section>
                    )}
                  </AnimatePresence>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={
                    filteredProfiles
                      ? Math.ceil(filteredProfiles.length / itemsPerPage)
                      : 0
                  }
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredProfiles?.length ?? 0}
                />
              </div>
            ) : (
              <div className="flex w-full min-h-[34em] h-[34em] grow">
                <AllUserProfileStatsChart
                  filteredProfiles={filteredProfiles}
                  setActiveProfile={setActiveProfile}
                />
              </div>
            )}
          </div>
        </StyledContainer>
      </div>

      <AnimatePresence>
        {activeProfile && (
          <Modal
            className="h-[80vh] w-full overflow-y-auto"
            wrapperClassName="items-start w-full max-w-[70em] sm:mt-0"
            title=""
            close={() => setActiveProfile(null)}
            isWrapped={false}
          >
            <ViewProfileModal
              profile={activeProfile}
              close={() => setActiveProfile(null)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

const LoaderState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col gap-3 w-full mx-auto"
  >
    <div className="flex flex-col gap-2 w-full">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="w-full h-[3.918125rem] bg-third rounded-md animate-loader"
          style={{
            // strong fade from top to bottom
            opacity: 1 - i * 0.05,
          }}
        />
      ))}
    </div>
  </motion.div>
);
