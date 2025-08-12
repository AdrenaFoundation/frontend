import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputString from '@/components/common/inputString/InputString';
import Modal from '@/components/common/Modal/Modal';
import Loader from '@/components/Loader/Loader';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import { PROFILE_PICTURES } from '@/constant';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import { UserProfileExtended } from '@/types';
import { getAbbrevWalletAddress } from '@/utils';

import chevronIcon from '../../../public/images/chevron-down.svg';
import searchIcon from '../../../public/images/Icons/search.svg';

interface SearchUserProfilesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchUserProfiles({
  isOpen,
  onClose,
}: SearchUserProfilesProps) {
  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] =
    useState<UserProfileExtended | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();

    const nicknameMatches = allUserProfilesMetadata.filter((user) =>
      user.nickname.toLowerCase().includes(query)
    );

    const addressMatches = allUserProfilesMetadata.filter((user) =>
      !user.nickname.toLowerCase().includes(query) &&
      user.owner.toBase58().toLowerCase().includes(query)
    );

    return [...nicknameMatches, ...addressMatches].slice(0, 50);
  }, [searchQuery, allUserProfilesMetadata]);

  const closeProfileModal = useCallback(() => {
    setSelectedProfile(null);
  }, []);

  const closeSearchModal = useCallback(() => {
    setSearchQuery('');
    setSelectedProfile(null);
    setLoadingProfile(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !selectedProfile && (
          <Modal
            title="Search User Profiles"
            close={closeSearchModal}
            className="w-[25rem] h-[40vh] flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full"
            >
              <div className="p-4 pb-0 border-bcolor">
                <div className="relative">
                  <InputString
                    className="w-full pl-8 pr-4 py-2 bg-inputcolor border border-white/20 rounded-lg !text-sm font-mono"
                    placeholder="Search by username or wallet address..."
                    value={searchQuery}
                    onChange={(value) => setSearchQuery(value || '')}
                  />
                  <Image
                    src={searchIcon}
                    alt="search"
                    width={14}
                    height={14}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {!searchQuery.trim() ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center p-4 pb-10"
                  >
                    <div className="text-6xl mb-2">🔍</div>
                    <h3 className="text-lg font-boldy mb-2">
                      Search for Traders
                    </h3>
                    <p className="text-sm opacity-70">
                      Enter a username or wallet address to find user profiles
                    </p>
                  </motion.div>
                ) : filteredUsers.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center p-4 pb-10"
                  >
                    <div className="text-6xl mb-2">😔</div>
                    <h3 className="text-lg font-boldy mb-2">
                      No Results Found
                    </h3>
                    <p className="text-sm opacity-70">
                      Try searching with a different username or wallet address
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-2 px-4 mt-2"
                  >
                    <div className="flex flex-col gap-2">
                      <AnimatePresence mode="popLayout">
                        {filteredUsers.map((user) => (
                          <motion.div
                            key={user.owner.toBase58()}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={twMerge(
                              'flex items-center gap-3 p-2 px-4 rounded-lg border border-bcolor hover:border-white/10 cursor-pointer transition-all duration-200',
                              'hover:bg-third/50 group',
                              loadingProfile === user.owner.toBase58() &&
                              'opacity-50 pointer-events-none',
                            )}
                            onClick={() =>
                              setSelectedProfile(user as UserProfileExtended)
                            }
                          >
                            <div className="relative flex-shrink-0">
                              <Image
                                src={
                                  PROFILE_PICTURES[
                                  user.profilePicture as keyof typeof PROFILE_PICTURES
                                  ] || PROFILE_PICTURES[0]
                                }
                                alt="Profile"
                                width={32}
                                height={32}
                                className="rounded-full border border-white/10"
                              />
                              {loadingProfile === user.owner.toBase58() && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                  <Loader width={20} />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-boldy text-base truncate group-hover:text-blue transition-colors duration-200">
                                  {user.nickname}
                                </h4>
                              </div>
                              <p className="text-xs opacity-60 font-mono truncate">
                                {getAbbrevWalletAddress(user.owner.toBase58())}
                              </p>
                            </div>

                            <div className="opacity-40 group-hover:opacity-100 transition-opacity duration-200">
                              <Image
                                src={chevronIcon}
                                alt="View Profile"
                                width={16}
                                height={16}
                                className="w-5 h-5 -rotate-90"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center text-xs opacity-50 mt-4 pt-4 border-t border-bcolor"
                    >
                      {filteredUsers.length === 50
                        ? 'Showing first 50 results. Refine your search for better results.'
                        : `Found ${filteredUsers.length} result${filteredUsers.length === 1 ? '' : 's'}`}
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProfile && (
          <Modal
            className="h-[80vh] w-full overflow-y-auto overscroll-contain"
            wrapperClassName="items-start w-full max-w-[55em] sm:mt-0 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')] bg-third/30 backdrop-blur-sm"
            isWrapped={false}
            close={() => {
              closeProfileModal();
            }}
          >
            <ViewProfileModal
              profile={selectedProfile}
              close={() => {
                closeProfileModal();
              }}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
