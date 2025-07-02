import { AScene } from '../AScene';
import ObjectTiles from './ObjectTiles';

const ITEMS = [
  {
    id: 1,
    name: 'Daisy Space Ryder',
    effect: '+5% black market experience gain',
  },
  { id: 2, name: 'Boomstick', effect: '-0.2 bps trading fees' },
  { id: 3, name: 'Golden Boomstick', effect: '-0.5 bps trading fees' },
  { id: 4, name: 'Starfire Carbine', effect: '-0.2 bps trading fees' },
  { id: 5, name: 'Lance Railgun', effect: '-0.3 bps trading fees' },
  { id: 6, name: 'M9-Spear', effect: '-0.3 bps trading fees' },
  { id: 7, name: 'BitterBallen Gun', effect: '+1 experience on each trade' },
  { id: 8, name: 'Scrap-Iron Autogun', effect: '-2% borrow fees reduction' },
  {
    id: 9,
    name: 'Scavenger Wielding Gun',
    effect: '+1 Military Document per trade',
  },
  {
    id: 10,
    name: 'Golden Scrap-Iron Autogun',
    effect: '-10% borrow fees reduction',
  },
  {
    id: 11,
    name: "Blaster MK-II 'Military Issue'",
    effect: '-2% borrow fees reduction',
  },
  { id: 12, name: 'Plasma Revolver', effect: '-4% borrow fees reduction' },
  { id: 13, name: 'Voidreaper', effect: '-4% borrow fees reduction' },
  { id: 14, name: 'Adrena Hoodie', effect: '+1 experience on each trade' },
  {
    id: 15,
    name: 'Glow Worm Undershirt',
    effect: '+5% black market experience gain',
  },
  { id: 16, name: 'Kevlar', effect: '+20x liquidation leverage' },
  { id: 17, name: 'Scavenger Vest', effect: '+1 Military Document per trade' },
  { id: 18, name: 'Nanite Harness', effect: '+30x liquidation leverage' },
  { id: 19, name: 'Quantum Vest', effect: '+50x liquidation leverage' },
  {
    id: 20,
    name: 'Deficient Field Generator',
    effect: 'Marketplace fee reduction 4%',
  },
  {
    id: 21,
    name: 'Force field prototype',
    effect: 'Marketplace fee reduction 8%',
  },
  {
    id: 22,
    name: 'Personal Force Field',
    effect: 'Marketplace fee reduction 12%',
  },
  { id: 23, name: 'Plasma Shield', effect: 'Marketplace fee reduction 16%' },
  {
    id: 24,
    name: 'Scavenger Cortex Chip',
    effect: '+10% military document count during research',
  },
  {
    id: 25,
    name: 'Cerebral Accelerator',
    effect: '+5% black market experience gain',
  },
  {
    id: 26,
    name: 'Chipped Flamboyant Holo-gen',
    effect: 'Profile name slightly on fire',
  },
  {
    id: 27,
    name: 'Flamboyant Holo-gen',
    effect: 'Profile name greatly on fire',
  },
  { id: 28, name: 'Herder Implant', effect: 'Increase Companion Yields by 8%' },
  {
    id: 29,
    name: 'Adrenal Response Tuner',
    effect: '50 ADX price reduction on Crate (burn immunity)',
  },
  {
    id: 30,
    name: 'Pirate NeuroCrystal',
    effect: 'Black Market 15% fee reduction',
  },
  {
    id: 31,
    name: 'Low-Grade Centurion Implant',
    effect: '-0.1 bps trading fees',
  },
  {
    id: 32,
    name: 'High-Grade Centurion Implant',
    effect: '-0.2 bps trading fees',
  },
  {
    id: 33,
    name: 'Master Herder Implant',
    effect: 'Increase Companion Yields by 16%',
  },
];

// One object is one or multiple consecutive tiles
class ItemTiles extends ObjectTiles {
  // The IDs from the tileset that constitute the item
  protected tilesetItemIds: number[] = [];

  public readonly scene: AScene;
  protected images: Phaser.GameObjects.Image[];

  public readonly itemId: string;
  public readonly itemName: string;
  public readonly itemEffect: string | null;

  constructor({
    scene,
    itemId,
    position,
    // Adapt theses offsets depending on where you want to place the item
    offsetX,
    offsetY = 0.5,
    depth = 3,
  }: {
    scene: AScene;
    itemId: string;
    position: Phaser.Math.Vector2;
    offsetX?: number;
    offsetY?: number;
    depth?: number;
  }) {
    super({
      tiles: [],
      tiledObject: null,
      tilemapService: scene.getTilemapService(),
      scene,
    });

    this.itemId = itemId;
    const info = ITEMS.find((item) => item.id === parseInt(itemId));

    this.itemName = info?.name || 'Unknown Item';
    this.itemEffect = info?.effect || null;

    this.scene = scene;
    this.tilesetItemIds = this.tilemapService.getTilesIdsFromIdProperty(itemId);

    const manual = this.tilemapService.manual;

    if (!manual || !this.tilemapService.tiles) {
      throw new Error('Tilemap manual layer not found.');
    }

    const tileWidth = manual.tilemap.tileWidth;
    const tileHeight = manual.tilemap.tileHeight;

    const images: Phaser.GameObjects.Image[] = [];

    if (typeof offsetX === 'undefined') {
      // Default to center if not provided
      // Depends on the number of tiles of the item
      offsetX = this.tilesetItemIds.length > 1 ? 1 : 0.5;
    }

    this.tilesetItemIds.forEach((id, i) => {
      const frameIndex = id - this.tilemapService.tiles!.firstgid;

      const image = scene.add
        .image(
          position.x + i * tileWidth, // place next to each other horizontally
          position.y - tileHeight / 2,
          'tiles-sprite',
          frameIndex,
        )
        .setOrigin(offsetX, offsetY)
        .setDepth(depth);

      images.push(image);
    });

    this.images = images;
  }

  public override setVisible(v: boolean): void {
    this.images.forEach((image) => image.setVisible(v));
  }

  public override changeColor(color: number): void {
    this.images.forEach((image) => image.setTint(color));
  }

  // After calling this method, the object should not be used anymore and could lead to unexpected behavior
  public destroy(): void {
    this.images.forEach((image) => image.destroy());
  }
}

export default ItemTiles;
