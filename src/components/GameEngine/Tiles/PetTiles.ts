import { AScene } from '../AScene';
import { ItemInfoWindow } from '../Windows/ItemInfoWindow';
import ObjectTiles from './ObjectTiles';

const ITEMS = [
  {
    id: 31,
    name: 'Doggy',
    effect: 'Woof Woof',
  },
  { id: 32, name: 'Dragon', effect: 'GRRRRRRR' },
];

class PetTiles extends ObjectTiles {
  private infoWindow: ItemInfoWindow | null = null;

  private interactionKey: Phaser.Input.Keyboard.Key | null = null;

  // The IDs from the tileset that constitute the item
  protected tilesetPetTiles: number[] = [];

  public readonly scene: AScene;
  protected images: Phaser.GameObjects.Image[] = [];

  public readonly petId: string;
  public readonly petName: string;
  public readonly petEffect: string | null;

  constructor({
    scene,
    itemId,
    position,
    // Adapt theses offsets depending on where you want to place the item
    offsetX,
    offsetY = -0.2,
  }: {
    scene: AScene;
    itemId: string;
    position: Phaser.Math.Vector2;
    offsetX?: number;
    offsetY?: number;
  }) {
    super({
      tiles: [],
      tiledObject: null,
      tilemapService: scene.getTilemapService(),
      scene,
    });

    this.petId = itemId;
    const info = ITEMS.find((item) => item.id === parseInt(itemId));

    this.petName = info?.name || 'Unknown Item';
    this.petEffect = info?.effect || null;

    this.scene = scene;
    this.tilesetPetTiles =
      this.tilemapService.getTilesIdsFromIdProperty(itemId);

    if (typeof offsetX === 'undefined') {
      // Default to center if not provided
      // Depends on the number of tiles of the item
      offsetX = this.tilesetPetTiles.length > 1 ? 1 : 0.5;
    }

    if (this.tilesetPetTiles.length === 1) {
      this.renderOneTilePet({
        position,
        offsetX,
        offsetY,
      });
    } else if (this.tilesetPetTiles.length === 4) {
      this.renderFourTilePet({
        position,
      });
    } else {
      throw new Error(
        `Unsupported number of tiles for pet: ${this.tilesetPetTiles.length}`,
      );
    }
  }

  protected renderOneTilePet({
    position,
    offsetX,
    offsetY,
  }: {
    position: Phaser.Math.Vector2;
    offsetX: number;
    offsetY: number;
  }) {
    const manualBetweenUiObjects = this.tilemapService.manualBetweenUiObjects;

    if (!manualBetweenUiObjects || !this.tilemapService.tiles) {
      throw new Error('Tilemap manual layer not found.');
    }

    const tileWidth = manualBetweenUiObjects.tilemap.tileWidth;
    const tileHeight = manualBetweenUiObjects.tilemap.tileHeight;

    const images: Phaser.GameObjects.Image[] = [];

    this.tilesetPetTiles.forEach((id, i) => {
      const frameIndex = id - this.tilemapService.tiles!.firstgid;

      const image = this.scene.add
        .image(
          position.x + i * tileWidth, // place next to each other horizontally
          position.y - tileHeight / 2,
          'tiles-sprite',
          frameIndex,
        )
        .setOrigin(offsetX, offsetY)
        .setDepth(manualBetweenUiObjects.depth);

      images.push(image);
    });

    this.images = images;
  }

  protected renderFourTilePet({ position }: { position: Phaser.Math.Vector2 }) {
    const manualBetweenUiObjects = this.tilemapService.manualBetweenUiObjects;

    if (!manualBetweenUiObjects || !this.tilemapService.tiles) {
      throw new Error('Tilemap manual layer not found.');
    }

    const tileWidth = manualBetweenUiObjects.tilemap.tileWidth;
    const tileHeight = manualBetweenUiObjects.tilemap.tileHeight;

    const images: Phaser.GameObjects.Image[] = [];

    this.tilesetPetTiles.forEach((id, i) => {
      const frameIndex = id - this.tilemapService.tiles!.firstgid;

      const col = i % 2;
      const row = Math.floor(i / 2);

      const image = this.scene.add
        .image(
          position.x + (col - 0.2) * tileWidth,
          position.y + row * tileHeight, // ← shift full grid to center
          'tiles-sprite',
          frameIndex,
        )
        .setOrigin(0.5, 1) // ← center X, bottom align Y
        .setDepth(manualBetweenUiObjects.depth);

      images.push(image);
    });
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

  public override handleInteractionOn({
    position,
  }: {
    position: Phaser.Math.Vector2;
  }) {
    if (this.infoWindow) {
      this.handleInteractionOff();
    }

    // Set info window
    {
      this.infoWindow = new ItemInfoWindow({
        scene: this.scene,
        name: this.petName,
        effect: this.petEffect ?? '',
        hint: '[E] to feed',
      });

      const { x, y } = position;

      const { width, height } = this.infoWindow.getSize();

      this.infoWindow.setPosition(x - width / 2, y - 70 - height / 2);

      this.infoWindow.setVisible(true);
    }

    {
      if (this.scene.input.keyboard) {
        this.interactionKey = this.scene.input.keyboard.addKey('E');

        this.interactionKey.on('down', () => {
          console.log('DO EQUIP!'); // TODO: Do the equip logic
        });
      }
    }
  }

  public override handleInteractionOff() {
    this.infoWindow?.destroy(true);
    this.infoWindow = null;
    this.interactionKey?.destroy();
    this.interactionKey = null;
  }

  public override updateInteraction() {}
}

export default PetTiles;
