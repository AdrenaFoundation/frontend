export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  image: string;
  type: string;
  rarity: string;
  stats: {
    attack: number;
    defense: number;
    speed: number;
  };
  quantity: number;
  equipped: boolean;
  slotIndex: number;
}

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'sword-001',
    name: 'Sword',
    description: 'A sharp sword for combat.',
    image: 'item26.png',
    type: 'weapon',
    rarity: 'common',
    stats: {
      attack: 10,
      defense: 0,
      speed: 0,
    },
    quantity: 1,
    equipped: false,
    slotIndex: 0,
  },
  {
    id: 'shield-001',
    name: 'Shield',
    description: 'A sturdy shield for protection.',
    image: 'item52.png',
    type: 'armor',
    rarity: 'uncommon',
    stats: {
      attack: 0,
      defense: 5,
      speed: -1,
    },
    quantity: 1,
    equipped: false,
    slotIndex: 1,
  },
  {
    id: 'helmet-001',
    name: 'Helmet',
    description: 'A protective helmet for the head.',
    image: 'item58.png',
    type: 'armor',
    rarity: 'rare',
    stats: {
      attack: 0,
      defense: 3,
      speed: 0,
    },
    quantity: 1,
    equipped: false,
    slotIndex: 2,
  },
  {
    id: 'sword-002',
    name: 'Long Sword',
    description: 'A longer sword with better reach.',
    image: 'item25.png',
    type: 'weapon',
    rarity: 'epic',
    stats: {
      attack: 15,
      defense: 0,
      speed: 0,
    },
    quantity: 1,
    equipped: false,
    slotIndex: 3,
  },
  {
    id: 'axe-001',
    name: 'Axe',
    description: 'A heavy axe for chopping.',
    image: 'item31.png',
    type: 'weapon',
    rarity: 'legendary',
    stats: {
      attack: 20,
      defense: 0,
      speed: -2,
    },
    quantity: 1,
    equipped: false,
    slotIndex: 4,
  },
  {
    id: 'bone-001',
    name: 'Bone',
    description: 'A sturdy bone, useful for crafting.',
    image: 'bone3.png',
    type: 'crafting',
    rarity: 'common',
    stats: {
      attack: 0,
      defense: 0,
      speed: 0,
    },
    quantity: 1,
    equipped: false,
    slotIndex: 20,
  },
  {
    id: 'emerald-001',
    name: 'Emerald',
    description: 'A beautiful emerald, valuable for trading.',
    image: 'item91.png',
    type: 'gem',
    rarity: 'rare',
    stats: {
      attack: 0,
      defense: 0,
      speed: 0,
    },
    quantity: 1,
    equipped: false,
    slotIndex: 19,
  },
  {
    id: 'diamond-001',
    name: 'Diamond',
    description: 'A precious diamond, valuable for trading.',
    image: 'item81.png',
    type: 'gem',
    rarity: 'legendary',
    stats: {
      attack: 0,
      defense: 0,
      speed: 0,
    },
    quantity: 1,
    equipped: false,
    slotIndex: 21,
  },
];
