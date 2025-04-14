export type Division = {
  img: string | null;
  title: string;
  topTradersPercentage: number;
  color: string;
};

export const DIVISIONS: Record<string, Division> = {
  Leviathan: {
    img: "https://iyd8atls7janm7g4.public.blob.vercel-storage.com/awakening/leviathan-TEBQv4TLozgYxTNKsApX32t7EupPLs.jpg",
    title: "Leviathan Division",
    topTradersPercentage: 10,
    color: "text-[#A45DBD]",
  },
  Abomination: {
    img: "https://iyd8atls7janm7g4.public.blob.vercel-storage.com/awakening/abomination-AQtGsOpfetiXzWP6t90frU2QqeBdwt.jpg",
    title: "Abomination Division",
    topTradersPercentage: 40,
    color: "text-[#FFD700]",
  },
  Mutant: {
    img: "https://iyd8atls7janm7g4.public.blob.vercel-storage.com/awakening/demon-Rz9jnBAA3uH4v2rMX4ifZWVYprlopL.jpg",
    title: "Mutant Division",
    topTradersPercentage: 60,
    color: "text-[#4A90E2]",
  },
  Spawn: {
    img: "https://iyd8atls7janm7g4.public.blob.vercel-storage.com/awakening/spawn-ShX34IjBEHxk8pp6baP6ewBepC9jZh.jpg",
    title: "Spawn Division",
    topTradersPercentage: 80,
    color: "text-[#4CD964]",
  },
  "No Division": {
    img: null,
    title: "No Division",
    topTradersPercentage: 100,
    color: "text-[#FFFFFF]",
  },
} as const;
