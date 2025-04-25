import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import adxLogo from '@/../../public/images/adx.svg';
import copyIcon from '@/../../public/images/copy.svg';
import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import OnchainAccountInfo from '@/components/pages/monitoring/OnchainAccountInfo';
import {
  ACHIEVEMENTS,
  PROFILE_PICTURES,
  USER_PROFILE_TITLES,
  WALLPAPERS,
} from '@/constant';
import {
  AchievementInfoExtended,
  ProfilePicture,
  UserProfileExtended,
  UserProfileTitle,
  Wallpaper,
} from '@/types';
import { addNotification } from '@/utils';

import imageIcon from '../../../../public/images/Icons/image.svg';
import imagesIcon from '../../../../public/images/Icons/images.svg';
import lockIcon from '../../../../public/images/Icons/lock.svg';
import personIcon from '../../../../public/images/Icons/person-fill.svg';
import trophyIcon from '../../../../public/images/Icons/trophy.svg';
import Achievement from '../achievements/Achievement';

type TabType = 'profilePicture' | 'wallpaper' | 'title' | 'achievements';

export default function OwnerBloc({
  userProfile,
  className,
  triggerUserProfileReload,
  canUpdateNickname = true,
  walletPubkey,
  readonly = false,
  favoriteAchievements,
  fetchFavoriteAchievements,
  updateFavoriteAchievements,
  createFavoriteAchievements,
  isUpdatingMetadata,
  setIsUpdatingMetadata,
  setActiveUpdateTab,
  activeUpdateTab,
}: {
  userProfile: UserProfileExtended;
  className?: string;
  triggerUserProfileReload: () => void;
  canUpdateNickname?: boolean;
  walletPubkey?: PublicKey;
  readonly?: boolean;
  favoriteAchievements: number[] | null;
  fetchFavoriteAchievements?: (walletAddress: string) => void;
  updateFavoriteAchievements?: (
    walletAddress: string,
    achievements: number[],
  ) => void;
  createFavoriteAchievements?: (
    walletAddress: string,
    achievements: number[],
  ) => void;
  isUpdatingMetadata?: boolean;
  setIsUpdatingMetadata?: (updating: boolean) => void;
  setActiveUpdateTab?: (tab: TabType) => void;
  activeUpdateTab?: TabType;
}) {
  const [alreadyTakenNicknames, setAlreadyTakenNicknames] = useState<
    Record<string, boolean>
  >({});
  const [nicknameUpdating, setNicknameUpdating] = useState<boolean>(false);
  const [updatedNickname, setUpdatedNickname] = useState<string | null>(
    userProfile.nickname,
  );
  const [trimmedUpdatedNickname, setTrimmedUpdatedNickname] = useState<string>(
    updatedNickname ?? '',
  );

  const [updatingMetadata, setUpdatingMetadata] = useState<{
    profilePicture: ProfilePicture;
    wallpaper: Wallpaper;
    title: UserProfileTitle;
    favoriteAchievements: number[] | null;
  }>({
    profilePicture: userProfile.profilePicture,
    wallpaper: userProfile.wallpaper,
    title: userProfile.title,
    favoriteAchievements: favoriteAchievements,
  });

  useEffect(() => {
    setTrimmedUpdatedNickname((updatedNickname ?? '').trim());
  }, [updatedNickname]);

  const editNickname = useCallback(async () => {
    const notification =
      MultiStepNotification.newForRegularTransaction('Edit Nickname').fire();

    if (
      trimmedUpdatedNickname.length < 3 ||
      trimmedUpdatedNickname.length > 24
    ) {
      return notification.currentStepErrored(
        'Nickname must be between 3 to 24 characters long',
      );
    }

    if (!walletPubkey)
      return notification.currentStepErrored(
        'You must be connected to edit your nickname',
      );

    if (trimmedUpdatedNickname === userProfile.nickname) {
      return notification.currentStepErrored('Nickname is already set');
    }

    try {
      if (!walletPubkey)
        return notification.currentStepErrored('Wallet not connected');

      await window.adrena.client.editUserProfileNickname({
        nickname: trimmedUpdatedNickname,
        notification,
      });

      triggerUserProfileReload();

      // pre-shot the onchain change as we know it's coming
      userProfile.nickname = trimmedUpdatedNickname;

      setNicknameUpdating(false);
    } catch (error) {
      console.error('error', error);
    }
  }, [
    triggerUserProfileReload,
    trimmedUpdatedNickname,
    userProfile,
    walletPubkey,
  ]);

  const updateProfile = useCallback(async () => {
    const notification =
      MultiStepNotification.newForRegularTransaction('Update Profile').fire();

    if (!walletPubkey)
      return notification.currentStepErrored(
        'You must be connected to update your profile',
      );

    const currentFavoriteAchievements = favoriteAchievements;

    if (currentFavoriteAchievements === null) {
      createFavoriteAchievements?.(
        walletPubkey.toBase58(),
        updatingMetadata.favoriteAchievements ?? [],
      );
    } else {
      const hasSameValues =
        currentFavoriteAchievements.length > 0 &&
        currentFavoriteAchievements.every((value) =>
          updatingMetadata.favoriteAchievements?.includes(value),
        );

      if (!hasSameValues) {
        updateFavoriteAchievements?.(
          walletPubkey.toBase58(),
          updatingMetadata.favoriteAchievements ?? [],
        );
      }
    }

    try {
      await window.adrena.client.editUserProfile({
        profilePicture: updatingMetadata.profilePicture,
        wallpaper: updatingMetadata.wallpaper,
        title: updatingMetadata.title,
        team: null, //TODO: replace with updatingMetadata.team if team selectable in profile,
        continent: null, //TODO: replace with updatingMetadata.continent when continent selectable in profile,
        notification,
      });

      // pre-shot the onchain change as we know it's coming
      userProfile.profilePicture = updatingMetadata.profilePicture;
      userProfile.wallpaper = updatingMetadata.wallpaper;
      userProfile.title = updatingMetadata.title;

      triggerUserProfileReload();

      setIsUpdatingMetadata?.(false);
    } catch (error) {
      console.error('error', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    triggerUserProfileReload,
    updatingMetadata.profilePicture,
    updatingMetadata.wallpaper,
    updatingMetadata.title,
    updatingMetadata.favoriteAchievements,
    userProfile,
    walletPubkey,
  ]);

  const [profilePictureHovering, setProfilePictureHovering] =
    useState<boolean>(false);

  useEffect(() => {
    if (!walletPubkey) return;
    fetchFavoriteAchievements?.(walletPubkey.toBase58());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletPubkey]);

  useEffect(() => {
    if (favoriteAchievements) {
      setUpdatingMetadata((u) => ({
        ...u,
        favoriteAchievements: favoriteAchievements,
      }));
    }
  }, [favoriteAchievements]);

  useEffect(() => {
    if (
      trimmedUpdatedNickname.length < 3 ||
      trimmedUpdatedNickname.length > 24 ||
      !window.adrena.client.readonlyConnection
    ) {
      return;
    }

    const userNicknamePda = window.adrena.client.getUserNicknamePda(
      trimmedUpdatedNickname,
    );

    window.adrena.client.readonlyConnection
      .getAccountInfo(userNicknamePda)
      .then((acc) => {
        setAlreadyTakenNicknames((prev) => ({
          ...prev,
          [trimmedUpdatedNickname]: !!(acc && acc.lamports > 0),
        }));
      })
      .catch(() => {
        //Ignore
      });
  }, [trimmedUpdatedNickname]);

  const wallpapersDOM = useMemo(() => {
    const unlockedWallpapers = Object.keys(WALLPAPERS).reduce((unlocked, i) => {
      const index = Number(i);
      // Look if there is an achievement that unlocks this wallpaper
      const achievement = ACHIEVEMENTS.find(
        (achievement) => achievement.wallpaperUnlock === index,
      );

      if (!achievement) {
        // No requirement for the wallpaper
        return [...unlocked, index];
      }

      // Check if the user have the Achievement
      if (userProfile.achievements?.[achievement.index]) {
        return [...unlocked, index];
      }

      return unlocked;
    }, [] as number[]);

    return Object.entries(WALLPAPERS).map(([v, path]) => {
      const unlocked = unlockedWallpapers.includes(Number(v));

      return (
        <Tippy
          content={`Unlocked by the achievement "${ACHIEVEMENTS.find((achievement) => achievement.wallpaperUnlock === Number(v))?.title ?? ''}"`}
          key={`wallpaper-${v}`}
          disabled={unlocked}
        >
          <div
            className={twMerge(
              'h-auto flex z-30 relative aspect-[21/9] rounded-md transition duration-300',
              updatingMetadata.wallpaper ===
                (Number(v) as unknown as ProfilePicture)
                ? 'border-4 border-yellow-400/80'
                : 'border-4 border-[#ffffff20] grayscale',
              unlocked
                ? 'grayscale-0 hover:grayscale-0 cursor-pointer'
                : 'grayscale cursor-disabled',
            )}
            onClick={() => {
              if (!unlocked) return;

              setUpdatingMetadata((u) => ({
                profilePicture: u.profilePicture,
                wallpaper: Number(v) as unknown as Wallpaper,
                title: u.title,
                favoriteAchievements: u.favoriteAchievements,
              }));
            }}
          >
            {!unlocked ? (
              <Image
                className="absolute bottom-2 right-2 opacity-60 h-5 w-5 rounded-md"
                src={lockIcon}
                width={18}
                height={20}
                alt="lock icon"
              />
            ) : null}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={path}
              alt="Wallpaper"
              className="h-full w-full rounded-md"
              width={900}
              height={600}
            />
          </div>
        </Tippy>
      );
    });
  }, [updatingMetadata, userProfile.achievements]);

  const profilePictureDOM = useMemo(() => {
    const unlockedPfpIndexes = Object.keys(PROFILE_PICTURES).reduce(
      (unlocked, i) => {
        const index = Number(i);
        // Look if there is an achievement that unlocks this profile picture
        const achievement = ACHIEVEMENTS.find((achievement) =>
          typeof achievement.pfpUnlock !== 'undefined'
            ? achievement.pfpUnlock === index
            : false,
        );

        if (!achievement) {
          // No requirement for the PFP
          return [...unlocked, index];
        }

        // Check if the user have the Achievement
        if (userProfile.achievements?.[achievement.index]) {
          return [...unlocked, index];
        }

        return unlocked;
      },
      [] as number[],
    );

    return Object.entries(PROFILE_PICTURES).map(([v, path]) => {
      const unlocked = unlockedPfpIndexes.includes(Number(v));

      return (
        <Tippy
          content={`Unlocked by the achievement "${ACHIEVEMENTS.find((achievement) => achievement.pfpUnlock === Number(v))?.title ?? ''}"`}
          key={`pfp-${v}`}
          disabled={unlocked}
        >
          <div
            className={twMerge(
              'h-auto flex z-30 relative aspect-square rounded-md transition duration-300',
              updatingMetadata.profilePicture ===
                (Number(v) as unknown as ProfilePicture)
                ? 'border-4 border-yellow-400/80'
                : 'border-4 border-[#ffffff20] grayscale',
              unlocked
                ? 'grayscale-0 hover:grayscale-0 cursor-pointer'
                : 'grayscale cursor-disabled',
            )}
            onClick={() => {
              if (!unlocked) return;

              setUpdatingMetadata((u) => ({
                profilePicture: Number(v) as unknown as ProfilePicture,
                wallpaper: u.wallpaper,
                title: u.title,
                favoriteAchievements: u.favoriteAchievements,
              }));
            }}
          >
            {!unlocked ? (
              <Image
                className="absolute bottom-2 right-2 opacity-60 h-5 w-5 rounded-md"
                src={lockIcon}
                width={18}
                height={20}
                alt="lock icon"
              />
            ) : null}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={path}
              alt="Profile picture"
              className="h-full w-full rounded-md"
              width={250}
              height={250}
            />
          </div>
        </Tippy>
      );
    });
  }, [updatingMetadata, userProfile.achievements]);

  const titlesDOM = useMemo(() => {
    const unlockedTitles = Object.values(USER_PROFILE_TITLES).filter(
      (_, index) => {
        const achievement = ACHIEVEMENTS.find(
          (achievement) => achievement.titleUnlock === index,
        );

        if (!achievement) {
          // No requirement for the title
          return true;
        }

        // Check if the user have the Achievement
        if (userProfile.achievements?.[achievement.index]) {
          return true;
        }

        return false;
      },
    );

    const lockedTitles = Object.values(USER_PROFILE_TITLES).filter(
      (_, index) => {
        const achievement = ACHIEVEMENTS.find(
          (achievement) => achievement.titleUnlock === index,
        );

        if (!achievement) {
          // No requirement for the title
          return false;
        }

        // Check if the user have the Achievement
        if (userProfile.achievements?.[achievement.index]) {
          return false;
        }

        return true;
      },
    );

    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {unlockedTitles.map((title, i) => {
            const index = Object.values(USER_PROFILE_TITLES).findIndex(
              (t) => t === title,
            );

            return (
              <Tippy
                content={`Unlocked by the achievement "${ACHIEVEMENTS.find((achievement) => achievement.titleUnlock === Number(i))?.title ?? ''}"`}
                key={`title-${i}`}
              >
                <div
                  className={twMerge(
                    'h-auto flex z-30 relative border-b-4 ml-auto mr-auto text-base',
                    updatingMetadata.title ===
                      (index as unknown as ProfilePicture)
                      ? 'border-yellow-400/80'
                      : 'border-transparent grayscale',
                  )}
                  onClick={() => {
                    // if (!unlocked) return;

                    setUpdatingMetadata((u) => ({
                      profilePicture: u.profilePicture,
                      wallpaper: u.wallpaper,
                      favoriteAchievements: u.favoriteAchievements,
                      title: index as unknown as UserProfileTitle,
                    }));
                  }}
                >
                  {title}
                </div>
              </Tippy>
            );
          })}
        </div>
        <div className="w-full h-[1px] bg-bcolor" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 opacity-20 cursor-disabled">
          {lockedTitles.map((title) => {
            return (
              <div className="h-auto flex z-30 relative ml-auto mr-auto text-base text-txtfade" key={`locked-title-${title}`}>
                {title}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [updatingMetadata, userProfile.achievements]);

  const { profilePicture, profilePictureUnlockedByAchievement } =
    useMemo(() => {
      return {
        profilePicture: PROFILE_PICTURES[userProfile.profilePicture],
        profilePictureUnlockedByAchievement: ACHIEVEMENTS.find(
          (achievement) => achievement.pfpUnlock === userProfile.profilePicture,
        ),
      };
    }, [userProfile.profilePicture]);

  const { title, titleUnlockedByAchievement } = useMemo(() => {
    return {
      title: USER_PROFILE_TITLES[userProfile.title],
      titleUnlockedByAchievement: ACHIEVEMENTS.find(
        (achievement) => achievement.titleUnlock === userProfile.title,
      ),
    };
  }, [userProfile.title]);

  const currentAchievements = ACHIEVEMENTS.filter(
    (achievement) => userProfile.achievements?.[achievement.index] > 0,
  );

  return (
    <>
      <div
        className={twMerge(
          'items-center justify-center flex flex-col sm:flex-row relative backdrop-blur-lg bg-[#211a1a99]/50 rounded-tl-xl rounded-tr-xl min-h-[10em] sm:min-h-auto',
          className,
        )}
      >
        <Tippy
          content={
            profilePictureUnlockedByAchievement ? (
              <div className="text-center flex flex-col">
                <div>
                  Unlocked by achievement #
                  {profilePictureUnlockedByAchievement.index + 1}
                </div>

                <div>
                  &quot;{profilePictureUnlockedByAchievement.title}&quot;
                </div>
              </div>
            ) : (
              <div></div>
            )
          }
          disabled={typeof profilePictureUnlockedByAchievement === 'undefined'}
        >
          <div className="flex min-w-[12em] w-[11.5em] h-[10em] relative">
            <div
              onMouseEnter={() => !readonly && setProfilePictureHovering(true)}
              onMouseLeave={() => !readonly && setProfilePictureHovering(false)}
              onClick={() => {
                if (readonly) return;
                setIsUpdatingMetadata?.(true);
                setActiveUpdateTab?.('profilePicture');
              }}
              className={twMerge(
                'border-2 border-[#ffffff50] rounded-full w-[10em] h-[10em] left-[1.5em] top-[-0.8em] flex shrink-0 absolute overflow-hidden z-30',
                !readonly && 'cursor-pointer',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profilePicture}
                alt="Profile picture"
                className="w-full h-full"
                width={250}
                height={250}
              />

              {profilePictureHovering && !readonly ? (
                <>
                  <div className="h-full w-full absolute z-10 backdrop-blur-2xl"></div>
                  <div className="h-full w-full absolute z-20 items-center justify-center flex flex-col">
                    <div className="font-archivoblack tracking-widest opacity-70 text-sm text-center">
                      Change Profile Picture
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </Tippy>

        <div className="flex flex-col items-center mt-12 mb-4 sm:mb-0 sm:mt-0 sm:items-start w-full h-full justify-center z-20 pl-6">
          <div className="flex">
            {walletPubkey ? (
              <Tippy content={'Wallet address'}>
                <div className="z-20 flex gap-1">
                  <Image
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          walletPubkey.toBase58(),
                        );

                        addNotification({
                          title: 'Wallet address copied to clipboard',
                          message: '',
                          type: 'info',
                          duration: 'regular',
                        });
                      } catch (err) {
                        console.error('Could not copy text: ', err);
                      }
                    }}
                    src={copyIcon}
                    className="w-3 h-3 opacity-90 cursor-pointer hover:opacity-100 mr-1"
                    alt="copy icon"
                  />

                  <OnchainAccountInfo
                    address={walletPubkey}
                    className="text-sm opacity-90"
                    addressClassName="text-xs tracking-[0.12em]"
                    iconClassName="ml-1"
                    shorten={true}
                  />
                </div>
              </Tippy>
            ) : null}
          </div>

          <div className="flex mt-1">
            <div className="flex items-end">
              <div className="font-archivoblack uppercase text-3xl relative">
                {userProfile.nickname}
              </div>

              {canUpdateNickname && userProfile.version > 1 ? (
                <div
                  onClick={() => {
                    setNicknameUpdating(true);
                  }}
                  className="text-xs opacity-70 relative bottom-1 left-2 cursor-pointer hover:opacity-100"
                >
                  Edit
                </div>
              ) : null}
            </div>
          </div>

          <Tippy
            content={
              titleUnlockedByAchievement ? (
                <div className="text-center flex flex-col">
                  <div>
                    Unlocked by achievement #
                    {titleUnlockedByAchievement.index + 1}
                  </div>

                  <div>&quot;{titleUnlockedByAchievement.title}&quot;</div>
                </div>
              ) : (
                <div></div>
              )
            }
            disabled={typeof titleUnlockedByAchievement === 'undefined'}
          >
            <div className="flex gap-x-2 items-end relative bottom-1">
              <span className="text-lg font-cursive relative top-1">
                &quot;
              </span>
              <span className="text-sm font-archivoblack">{title}</span>
              <span className="text-lg font-cursive relative bottom-1 -scale-x-100 -scale-y-100">
                &quot;
              </span>

              {canUpdateNickname && userProfile.version > 1 ? (
                <div
                  className="text-xs opacity-70 cursor-pointer hover:opacity-100 relative"
                  onClick={() => {
                    setIsUpdatingMetadata?.(true);
                    setActiveUpdateTab?.('title');
                  }}
                >
                  Edit
                </div>
              ) : null}
            </div>
          </Tippy>

          {!readonly && userProfile.version > 1 ? (
            <div className="absolute top-2 right-4 z-20 ">
              <div
                className="text-xs opacity-70 cursor-pointer flex hover:opacity-100"
                onClick={() => {
                  setIsUpdatingMetadata?.(true);
                  setActiveUpdateTab?.('wallpaper');
                }}
              >
                Edit wallpaper
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {nicknameUpdating ? (
          <Modal
            title="Update Nickname"
            close={() => {
              setNicknameUpdating(false);
            }}
            className="max-w-[100%] w-[30em] pl-8 pr-8 pt-5 overflow-y-none"
          >
            <div className="flex flex-col gap-3">
              <div className="text-sm flex w-full items-center justify-between">
                <div className="font-thin text-base">Cost </div>

                <div className="flex items-center gap-2 text-base">
                  <Image
                    src={adxLogo}
                    alt="ADX logo"
                    className="w-[1.2em] h-[1.2em]"
                  />
                  500 ADX
                </div>
              </div>

              <InputString
                className="font-boldy text-xl relative p-3 border rounded-lg text-center"
                value={updatedNickname ?? ''}
                onChange={setUpdatedNickname}
                placeholder="The Great Trader"
                inputFontSize="1em"
                maxLength={24}
              />

              <div className="h-[1em]">
                {(trimmedUpdatedNickname &&
                  trimmedUpdatedNickname.length < 3) ||
                  !trimmedUpdatedNickname ? (
                  <div className="text-red-500 text-xs text-center mb-4 text-txtfade font-boldy">
                    Nickname must be at least 3 characters
                  </div>
                ) : null}

                {trimmedUpdatedNickname &&
                  typeof alreadyTakenNicknames[trimmedUpdatedNickname] ===
                  'undefined' &&
                  trimmedUpdatedNickname.length > 3 ? (
                  <div className="text-red-500 text-xs text-center mb-4 text-txtfade font-boldy">
                    Checking nickname availability...
                  </div>
                ) : null}

                {trimmedUpdatedNickname &&
                  alreadyTakenNicknames[trimmedUpdatedNickname] === true ? (
                  <div className="text-red-500 text-xs text-center mb-4 text-yellow-400 font-boldy">
                    Nickname is already taken
                  </div>
                ) : null}

                {trimmedUpdatedNickname &&
                  alreadyTakenNicknames[trimmedUpdatedNickname] === false ? (
                  <div className="text-red-500 text-xs text-center mb-4 text-green font-boldy">
                    Nickname is available
                  </div>
                ) : null}
              </div>

              <div className="w-full h-[1px] bg-bcolor mt-1" />

              <div className="flex items-center justify-center gap-8 pb-6 pt-2">
                <Button
                  title="Cancel"
                  variant="outline"
                  onClick={() => {
                    setNicknameUpdating(false);
                  }}
                  className="w-60"
                />

                <Button
                  title={'Pay and Update'}
                  variant="primary"
                  onClick={() => editNickname()}
                  className="w-60"
                />
              </div>
            </div>
          </Modal>
        ) : null}

        {isUpdatingMetadata ? (
          <Modal
            title="Update Profile"
            close={() => {
              setIsUpdatingMetadata?.(false);
            }}
            className="md:w-[50em] md:h-[50vh] flex flex-col"
          >
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-[12em] p-3 border-b md:border-r border-bcolor h-full">
                <ul className="grid grid-cols-2 sm:flex sm:flex-row md:flex-col gap-3 items-center justify-center md:justify-start md:items-start">
                  {[
                    {
                      name: 'Profile Picture',
                      value: 'profilePicture',
                      icon: imageIcon,
                    },
                    {
                      name: 'Wallpaper',
                      value: 'wallpaper',
                      icon: imagesIcon,
                    },
                    {
                      name: 'Title',
                      value: 'title',
                      icon: personIcon,
                    },
                    {
                      name: 'Achievements',
                      value: 'achievements',
                      icon: trophyIcon,
                    },
                  ].map(({ name, value, icon }) => (
                    <li
                      className={twMerge(
                        'p-1 px-2 hover:opacity-100 cursor-pointer transition-opacity duration-300 rounded-md w-full',
                        activeUpdateTab !== value
                          ? 'opacity-50'
                          : 'opacity-100 bg-third',
                      )}
                      onClick={() => setActiveUpdateTab?.(value as TabType)}
                      key={value}
                    >
                      <div className="flex flex-row flex-start gap-1 items-center">
                        <Image
                          src={icon}
                          alt="settings icon"
                          className="w-[0.7em] h-[0.7em]"
                        />
                        <p className="text-nowrap font-boldy text-sm">{name}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col justify-between w-full h-full">
                <div className="overflow-auto">
                  {activeUpdateTab === 'profilePicture' ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 p-3">
                      {profilePictureDOM}
                    </div>
                  ) : null}

                  {activeUpdateTab === 'wallpaper' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3">
                      {wallpapersDOM}
                    </div>
                  ) : null}

                  {activeUpdateTab === 'title' ? (
                    <div className="p-3">{titlesDOM}</div>
                  ) : null}

                  {activeUpdateTab === 'achievements' ? (
                    <div className="flex flex-col gap-3 p-3">
                      <div>
                        <h4 className="font-boldy">
                          Select your favorite achievements
                        </h4>

                        <p className="text-sm font-boldy opacity-50">
                          Selected{' '}
                          {updatingMetadata.favoriteAchievements?.length
                            ? updatingMetadata.favoriteAchievements.length
                            : 0}{' '}
                          / 3
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {currentAchievements.map((achievement) => (
                          <div
                            className={twMerge(
                              'relative flex flex-row gap-3 items-center border-4 p-3 rounded-lg cursor-pointer transition duration-200 overflow-hidden',
                              updatingMetadata.favoriteAchievements?.includes(
                                achievement.index,
                              )
                                ? 'border-yellow-400/80'
                                : 'border-[#ffffff20] grayscale',
                              updatingMetadata.favoriteAchievements?.length ===
                              3 &&
                              !updatingMetadata.favoriteAchievements.includes(
                                achievement.index,
                              ) &&
                              'opacity-20 hover:opacity-20 cursor-disabled',
                            )}
                            onClick={() => {
                              if (
                                updatingMetadata.favoriteAchievements
                                  ?.length === 3 &&
                                !updatingMetadata.favoriteAchievements?.includes(
                                  achievement.index,
                                )
                              )
                                return;

                              setUpdatingMetadata((u) => ({
                                ...u,
                                favoriteAchievements:
                                  u.favoriteAchievements !== null
                                    ? u.favoriteAchievements.includes(
                                      achievement.index,
                                    )
                                      ? u.favoriteAchievements?.filter(
                                        (a) => a !== achievement.index,
                                      )
                                      : [
                                        ...u.favoriteAchievements,
                                        achievement.index,
                                      ]
                                    : null,
                              }));
                            }}
                            key={`achievement-${achievement.index}`}
                          >
                            <Achievement
                              unlocked={true}
                              achievement={
                                achievement as AchievementInfoExtended
                              }
                              className="absolute -top-9 scale-[1.5] w-full rounded-lg opacity-20"
                              key={`achievement-${achievement.index}`}
                            />
                            <div className="relative z-20">
                              <p className="text-base font-boldy">
                                {achievement.title}
                              </p>
                              <p className="opacity-75 text-xs">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className="w-full h-[1px] bg-bcolor" />

                  <div className="flex items-center justify-center gap-8 p-3">
                    <Button
                      title="Cancel"
                      variant="outline"
                      onClick={() => {
                        setIsUpdatingMetadata?.(false);
                      }}
                      className="md:w-60"
                    />

                    <Button
                      title="Save"
                      variant="primary"
                      onClick={() => updateProfile()}
                      className="md:w-60"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* <div className='flex w-full h-full max-h-[35em] overflow-auto flex-col'>
            <div className='flex flex-col w-full'>
              <div className='mt-4 mb-3 tracking-widest w-full items-center flex justify-center text-white/80'>
                Select Profile Picture
              </div>

              <div className='w-full h-[1px] bg-bcolor flex mt-2' />

              <div className="grid grid-cols-[repeat(auto-fit,minmax(7em,1fr))]">
                {profilePictureDOM}
              </div>

            </div>

            <div className='flex flex-col w-full mt-6'>
              <div className='mt-4 mb-3 tracking-widest w-full items-center flex justify-center text-white/80'>
                Select Wallpaper
              </div>

              <div className='w-full h-[1px] bg-bcolor flex mt-2' />

              <div className="grid grid-cols-[repeat(auto-fit,minmax(12em,1fr))]">
                {wallpapersDOM}
              </div>
            </div>

            <div className='flex flex-col w-full mt-6'>
              <div className='mt-4 mb-3 tracking-widest w-full items-center flex justify-center text-white/80'>
                Select Title
              </div>

              <div className='w-full h-[1px] bg-bcolor flex mt-2' />

              <div className="grid grid-cols-[repeat(auto-fit,minmax(15em,1fr))] gap-2 pt-6 pb-6">
                {titlesDOM}
              </div>
            </div>
          </div> */}
          </Modal>
        ) : null}
      </AnimatePresence>
    </>
  );
}
