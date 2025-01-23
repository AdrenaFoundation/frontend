import { StaticImageData } from 'next/image';

import abominationImage from '@/../public/images/abomination.png';
import demonImage from '@/../public/images/demon.png';
import leviathanImage from '@/../public/images/leviathan.png';
import spawnImage from '@/../public/images/spawn.png';

export type Division = {
  img: StaticImageData | null;
  title: string;
  topTradersPercentage: number;
  color: string;
};

export const DIVISIONS: Record<string, Division> = {
  Leviathan: {
    img: leviathanImage,
    title: 'Leviathan Division',
    topTradersPercentage: 10,
    color: 'text-[#A45DBD]',
  },
  Abomination: {
    img: abominationImage,
    title: 'Abomination Division',
    topTradersPercentage: 40,
    color: 'text-[#FFD700]',
  },
  Mutant: {
    img: demonImage,
    title: 'Mutant Division',
    topTradersPercentage: 60,
    color: 'text-[#4A90E2]',
  },
  Spawn: {
    img: spawnImage,
    title: 'Spawn Division',
    topTradersPercentage: 80,
    color: 'text-[#4CD964]',
  },
  'No Division': {
    img: null,
    title: 'No Division',
    topTradersPercentage: 100,
    color: 'text-[#FFFFFF]',
  },
} as const;

export const EXPANSE_DIVISIONS_NAMES = [
  'first',
  'second',
  'third',
  'fourth',
  'No Division',
] as const;

export const EXPANSE_DIVISIONS: Record<
  (typeof EXPANSE_DIVISIONS_NAMES)[number],
  Division
> = {
  first: {
    img: leviathanImage,
    title: 'First Division',
    topTradersPercentage: 10,
    color: 'text-[#A45DBD]',
  },
  second: {
    img: abominationImage,
    title: 'Second Division',
    topTradersPercentage: 40,
    color: 'text-[#FFD700]',
  },
  third: {
    img: demonImage,
    title: 'Third Division',
    topTradersPercentage: 60,
    color: 'text-[#4A90E2]',
  },
  fourth: {
    img: spawnImage,
    title: 'Fourth Division',
    topTradersPercentage: 80,
    color: 'text-[#4CD964]',
  },
  'No Division': {
    img: null,
    title: 'No Division',
    topTradersPercentage: 100,
    color: 'text-[#FFFFFF]',
  },
};
