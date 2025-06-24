import { AScene } from './AScene';
import ObjectTiles from './ObjectTiles';

// One object is one or multiple consecutive tiles
class ItemTiles extends ObjectTiles {
  // The IDs from the tileset that constitute the item
  protected tilesetItemIds: number[] = [];

  public readonly scene: AScene;
  protected images: Phaser.GameObjects.Image[];

  constructor({
    scene,
    itemId,
    position,
    // Adapt theses offsets depending on where you want to place the item
    offsetX = 0.5,
    offsetY = 0.5,
    depth = 10,
  }: {
    scene: AScene;
    itemId: string;
    position: Phaser.Math.Vector2;
    offsetX?: number;
    offsetY?: number;
    depth?: number;
  }) {
    super({ tiles: [], tilemapService: scene.getTilemapService(), scene });

    this.scene = scene;
    this.tilesetItemIds = this.tilemapService.getTilesIdsFromIdProperty(itemId);

    const manual = this.tilemapService.manual;

    if (!manual || !this.tilemapService.tiles) {
      throw new Error('Tilemap manual layer not found.');
    }

    const tileWidth = manual.tilemap.tileWidth;
    const tileHeight = manual.tilemap.tileHeight;

    const images: Phaser.GameObjects.Image[] = [];

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

  public override handleInteractionOn() {}
  public override handleInteractionOff() {}
  public override updateInteraction() {}
}

export default ItemTiles;
