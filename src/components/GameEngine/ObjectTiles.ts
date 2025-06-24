import { AScene } from './AScene';
import TilemapService from './TilemapService';

// One object is one or multiple consecutive tiles
class ObjectTiles {
  public readonly tiles: Phaser.Tilemaps.Tile[];
  public readonly tilemapService: TilemapService;
  public readonly scene: AScene;

  constructor({
    tiles,
    tilemapService,
    scene,
  }: {
    tiles: Phaser.Tilemaps.Tile[];
    tilemapService: TilemapService;
    scene: AScene;
  }) {
    this.tiles = tiles;
    this.tilemapService = tilemapService;
    this.scene = scene;
  }

  // i.e 0xff0000
  public changeColor(color: number): void {
    this.tiles.forEach((tile) => {
      tile.tint = color;
    });
  }

  public setVisible(v: boolean): void {
    this.tiles.forEach((tile) => {
      tile.setVisible(v);
    });
  }

  // Return the world pixel coordinates of the center of the object
  public getCenter(): Phaser.Math.Vector2 {
    if (this.tiles.length === 0) {
      return new Phaser.Math.Vector2(0, 0);
    }

    const layer = this.tiles[0].layer.tilemapLayer;
    const offsetX = layer.x;
    const offsetY = layer.y;

    const minX = Math.min(...this.tiles.map((t) => t.pixelX));
    const minY = Math.min(...this.tiles.map((t) => t.pixelY));
    const maxX = Math.max(...this.tiles.map((t) => t.pixelX + t.width));
    const maxY = Math.max(...this.tiles.map((t) => t.pixelY + t.height));

    const centerX = (minX + maxX) / 2 + offsetX;
    const centerY = (minY + maxY) / 2 + offsetY;

    return new Phaser.Math.Vector2(centerX, centerY);
  }

  // Override this method to handle interaction logic
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handleInteractionOn(params: { [key: string]: unknown }) {}

  // Override this method to handle interaction logic
  public handleInteractionOff() {}

  // Override this method to update interaction logic
  public updateInteraction() {}
}

export default ObjectTiles;
