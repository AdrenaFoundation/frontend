import { AScene } from './AScene';
import ObjectTile from './ObjectTile';

// One object is one or multiple consecutive tiles
class ItemTile extends ObjectTile {
  // The IDs from the tileset that constitute the item
  protected tilesetItemIds: number[] = [];

  public readonly scene: AScene;
  protected image: Phaser.GameObjects.Image;

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
    super({ tiles: [], tilemapService: scene.getTilemapService() });

    this.scene = scene;
    this.tilesetItemIds = this.tilemapService.getTilesIdsFromIdProperty(itemId);

    const manual = this.tilemapService.manual;

    if (!manual || !this.tilemapService.tiles) {
      throw new Error('Tilemap manual layer not found.');
    }

    const frameIndex =
      this.tilesetItemIds[0] - this.tilemapService.tiles.firstgid;

    this.image = this.scene.add
      .image(
        position.x,
        position.y + -manual.tilemap.tileHeight / 2,
        'tiles-sprite',
        frameIndex,
      )
      .setOrigin(offsetX, offsetY)
      .setDepth(depth);
  }

  public override setVisible(v: boolean): void {
    this.image.setVisible(v);
  }

  public override changeColor(color: number): void {
    this.image.setTint(color);
  }

  // After calling this method, the object should not be used anymore and could lead to unexpected behavior
  public destroy(): void {
    this.image.destroy();
  }
}

export default ItemTile;
