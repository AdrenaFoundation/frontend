import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import adxLogo from '@/../../public/images/adx.svg';
import editIcon from '@/../../public/images/Icons/edit.svg';
import shareIcon from '@/../../public/images/Icons/share-fill.svg';
import snsBadgeIcon from '@/../../public/images/sns-badge.svg';
import Button from '@/components/common/Button/Button';
import CopyButton from '@/components/common/CopyButton/CopyButton';
import InputString from '@/components/common/inputString/InputString';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import {
  ACHIEVEMENTS,
  PROFILE_PICTURES,
  USER_PROFILE_TITLES,
  WALLPAPERS,
} from '@/constant';
import useSNSPrimaryDomain from '@/hooks/useSNSPrimaryDomain';
import {
  AchievementInfoExtended,
  ProfilePicture,
  UserProfileExtended,
  UserProfileTitle,
  Wallpaper,
} from '@/types';
import { addNotification, getAbbrevWalletAddress } from '@/utils';

import imageIcon from '../../../../public/images/Icons/image.svg';
import imagesIcon from '../../../../public/images/Icons/images.svg';
import lockIcon from '../../../../public/images/Icons/lock.svg';
import personIcon from '../../../../public/images/Icons/person-fill.svg';
import trophyIcon from '../../../../public/images/Icons/trophy.svg';
import Achievement from '../achievements/Achievement';
import AddTrader from './AddTrader';

type TabType = 'profilePicture' | 'wallpaper' | 'title' | 'achievements';

export default function OwnerBloc({
  userProfile,
  className,
  triggerUserProfileReload,
  canUpdateNickname = true,
  walletPubkey,
  readonly = false,
  favoriteAchievements,
  updateFavoriteAchievements,
  createFavoriteAchievements,
  isUpdatingMetadata,
  setIsUpdatingMetadata,
  setActiveUpdateTab,
  activeUpdateTab,
  walletAddress,
}: {
  userProfile: UserProfileExtended;
  className?: string;
  triggerUserProfileReload: () => void;
  canUpdateNickname?: boolean;
  walletPubkey?: PublicKey;
  readonly?: boolean;
  favoriteAchievements: number[] | null;
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
  walletAddress?: string;
}) {
  const snsDomain = useSNSPrimaryDomain(walletAddress);

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
    favoriteAchievements: favoriteAchievements ?? [],
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
    const onlyUpdateAchievements =
      updatingMetadata.wallpaper === userProfile.wallpaper &&
      updatingMetadata.profilePicture === userProfile.profilePicture &&
      updatingMetadata.title === userProfile.title;

    const currentFavoriteAchievements = favoriteAchievements;

    if (!walletPubkey) return;

    if (currentFavoriteAchievements === null) {
      createFavoriteAchievements?.(
        walletPubkey.toBase58(),
        updatingMetadata.favoriteAchievements ?? [],
      );
    } else {
      const isNewChanges =
        currentAchievements.some(
          (achievement) =>
            !updatingMetadata.favoriteAchievements?.includes(achievement.index),
        ) ||
        currentFavoriteAchievements.length !==
          (updatingMetadata.favoriteAchievements?.length ?? 0);

      if (isNewChanges) {
        updateFavoriteAchievements?.(
          walletPubkey.toBase58(),
          updatingMetadata.favoriteAchievements ?? [],
        );
      }
    }

    if (onlyUpdateAchievements) {
      return setIsUpdatingMetadata?.(false);
    }

    const notification =
      MultiStepNotification.newForRegularTransaction('Update Profile').fire();

    if (!walletPubkey)
      return notification.currentStepErrored(
        'You must be connected to update your profile',
      );

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
      const achievement = ACHIEVEMENTS.find(
        (achievement) => achievement.wallpaperUnlock === Number(v),
      );
      return (
        <Tippy
          content={
            unlocked
              ? achievement
                ? `Unlocked by the achievement "${achievement.title}"`
                : 'Unlocked by default'
              : achievement
                ? `Locked - Unlock by completing the achievement "${achievement.title}"`
                : 'Unlocked by default'
          }
          key={`wallpaper-${v}`}
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
                width={0}
                height={0}
                style={{ width: '18px', height: '20px' }}
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
      const achievement = ACHIEVEMENTS.find(
        (achievement) => achievement.pfpUnlock === Number(v),
      );
      return (
        <Tippy
          content={
            unlocked
              ? achievement
                ? `Unlocked by the achievement "${achievement.title}"`
                : 'Unlocked by default'
              : achievement
                ? `Locked - Unlock by completing the achievement "${achievement.title}"`
                : 'Unlocked by default'
          }
          key={`pfp-${v}`}
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
                width={0}
                height={0}
                style={{ width: '18px', height: '20px' }}
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
                content={
                  ACHIEVEMENTS.find(
                    (achievement) => achievement.titleUnlock === index,
                  ) &&
                  ACHIEVEMENTS.find(
                    (achievement) => achievement.titleUnlock === index,
                  )?.title
                    ? `Unlocked by the achievement "${ACHIEVEMENTS.find((achievement) => achievement.titleUnlock === index)?.title}"`
                    : 'Unlocked by default'
                }
                key={`title-${i}`}
              >
                <div
                  className={twMerge(
                    'h-auto flex z-30 relative border-b-4 ml-auto mr-auto text-base',
                    updatingMetadata.title ===
                      (index as unknown as ProfilePicture)
                      ? 'border-yellow-400/80'
                      : 'border-transparent grayscale',
                    'cursor-pointer',
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
            const index = Object.values(USER_PROFILE_TITLES).findIndex(
              (t) => t === title,
            );
            const achievement = ACHIEVEMENTS.find(
              (achievement) => achievement.titleUnlock === index,
            );
            return (
              <Tippy
                content={
                  achievement && achievement.title
                    ? `Locked - Unlock by completing the achievement "${achievement.title}"`
                    : 'Locked by default'
                }
                key={`locked-title-${title}`}
              >
                <div className="h-auto flex z-30 relative ml-auto mr-auto text-base text-txtfade">
                  {title}
                </div>
              </Tippy>
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
          'items-center justify-center flex flex-col sm:flex-row relative backdrop-blur-lg bg-[#050F19]/40  rounded-tl-xl rounded-tr-xl min-h-[11em] sm:min-h-auto',
          className,
        )}
      >
        <div className="absolute w-full h-full bg-gradient-to-b from-transparent to-main" />
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
                    <div className="font-bold tracking-widest opacity-70 text-sm text-center">
                      Change Profile Picture
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </Tippy>

        <div className="flex flex-col items-center sm:items-start w-full h-full justify-center z-20 pl-6">
          <div className="flex flex-row items-center gap-3">
            {walletPubkey ? (
              <Tippy
                content={
                  <p className="!text-xs !font-semibold">
                    <span className="text-xs opacity-50 mr-1">
                      Wallet Address
                    </span>{' '}
                    {getAbbrevWalletAddress(walletPubkey.toBase58())}
                  </p>
                }
              >
                <CopyButton
                  textToCopy={walletPubkey.toBase58()}
                  notificationTitle="Wallet address copied to clipboard"
                  className="opacity-70"
                />
              </Tippy>
            ) : null}

            <Tippy
              content="Share Profile"
              className="!text-xs !font-semibold"
              placement="top"
            >
              <Image
                src={shareIcon}
                className="w-3 h-3 opacity-70 cursor-pointer hover:opacity-100 transition-opacity duration-300"
                alt="share icon"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://www.adrena.trade/profile/${userProfile.owner.toBase58()}`,
                  );
                  addNotification({
                    title: 'Profile link copied to clipboard',
                    message: '',
                    type: 'info',
                    duration: 'regular',
                  });
                }}
                width={16}
                height={16}
              />
            </Tippy>

            {canUpdateNickname && userProfile.version > 1 ? (
              <Tippy
                content="Edit Nickname"
                className="!text-xs !font-semibold"
                placement="top"
              >
                <Image
                  onClick={() => {
                    setNicknameUpdating(true);
                  }}
                  src={editIcon}
                  alt="Edit nickname"
                  className="w-4 h-4 opacity-70 cursor-pointer hover:opacity-100 transition-opacity duration-300"
                  width={16}
                  height={16}
                />
              </Tippy>
            ) : null}

            {snsDomain ? (
              <Tippy
                content="Registered Domain through Solana Name Service (SNS)"
                className="!text-xs !font-semibold"
                placement="top"
              >
                <div className="flex flex-row gap-1 items-center sm:pr-4">
                  <Image
                    src={snsBadgeIcon}
                    alt="SNS badge"
                    className="w-3 h-3"
                    width={12}
                    height={12}
                  />
                  <p className="text-xs font-mono bg-[linear-gradient(110deg,#96B47C_40%,#C8E3B0_60%,#96B47C)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]">
                    {snsDomain}.sol
                  </p>
                </div>
              </Tippy>
            ) : null}
          </div>

          <div className="flex mt-1">
            <p className="font-semibold text-3xl relative">
              {userProfile.nickname}
            </p>
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
            <div className="flex gap-x-1 items-end relative bottom-1">
              <span className="text-lg font-cursive relative top-1">
                &quot;
              </span>
              <span className="text-sm font-semibold">{title}</span>
              <span className="text-lg font-cursive relative bottom-1 -scale-x-100 -scale-y-100">
                &quot;
              </span>

              {/* {canUpdateNickname && userProfile.version > 1 ? (
                <div
                  className="text-xs opacity-70 cursor-pointer hover:opacity-100 relative"
                  onClick={() => {
                    setIsUpdatingMetadata?.(true);
                    setActiveUpdateTab?.('title');
                  }}
                >
                  Edit
                </div>
              ) : null} */}
            </div>
          </Tippy>

          <AddTrader receiverWalletAddress={walletPubkey?.toBase58() ?? null} />

          {!readonly && userProfile.version > 1 ? (
            <Image
              src={editIcon}
              alt="Edit wallpaper"
              className="absolute top-2 right-4 z-20  w-4 h-4 opacity-70 cursor-pointer flex hover:opacity-100"
              onClick={() => {
                setIsUpdatingMetadata?.(true);
                setActiveUpdateTab?.('wallpaper');
              }}
            />
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {nicknameUpdating && (
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
                    width={18}
                    height={18}
                  />
                  500 ADX
                </div>
              </div>

              <InputString
                className="font-semibold text-xl relative p-3 border rounded-md text-center"
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
                  <div className="text-red-500 text-xs text-center mb-4 text-txtfade font-semibold">
                    Nickname must be at least 3 characters
                  </div>
                ) : null}

                {trimmedUpdatedNickname &&
                typeof alreadyTakenNicknames[trimmedUpdatedNickname] ===
                  'undefined' &&
                trimmedUpdatedNickname.length > 3 ? (
                  <div className="text-red-500 text-xs text-center mb-4 text-txtfade font-semibold">
                    Checking nickname availability...
                  </div>
                ) : null}

                {trimmedUpdatedNickname &&
                alreadyTakenNicknames[trimmedUpdatedNickname] === true ? (
                  <div className="text-red-500 text-xs text-center mb-4 text-yellow-400 font-semibold">
                    Nickname is already taken
                  </div>
                ) : null}

                {trimmedUpdatedNickname &&
                alreadyTakenNicknames[trimmedUpdatedNickname] === false ? (
                  <div className="text-red-500 text-xs text-center mb-4 text-green font-semibold">
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
        )}

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
                          width={12}
                          height={12}
                        />
                        <p className="text-nowrap font-semibold text-sm">
                          {name}
                        </p>
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
                        <h4 className="font-semibold">
                          Select your favorite achievements
                        </h4>

                        <p className="text-sm font-semibold opacity-50">
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
                              'relative flex flex-row gap-3 items-center border-4 p-3 rounded-md cursor-pointer transition duration-200 overflow-hidden',
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
                              className="absolute -top-9 scale-[1.5] w-full rounded-md opacity-20"
                              key={`achievement-${achievement.index}`}
                            />
                            <div className="relative z-20">
                              <p className="text-base font-semibold">
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
