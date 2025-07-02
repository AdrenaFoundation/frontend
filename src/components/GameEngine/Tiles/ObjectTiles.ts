import { AScene } from '../AScene';
import TilemapService from '../TilemapService';

class ObjectTiles {
  public readonly tiles: Phaser.Tilemaps.Tile[];
  public readonly tilemapService: TilemapService;
  public readonly scene: AScene;
  public readonly tiledObject: Phaser.Types.Tilemaps.TiledObject | null;
  protected visible: boolean = true;

  constructor({
    tiles,
    tiledObject,
    tilemapService,
    scene,
  }: {
    tiles: Phaser.Tilemaps.Tile[];
    tiledObject: Phaser.Types.Tilemaps.TiledObject | null;
    tilemapService: TilemapService;
    scene: AScene;
  }) {
    this.tiles = tiles;
    this.tilemapService = tilemapService;
    this.scene = scene;
    this.tiledObject = tiledObject;
  }

  public getVisible(): boolean {
    return this.visible;
  }

  // i.e 0xff0000
  public changeColor(color: number): void {
    this.tiles.forEach((tile) => {
      tile.tint = color;
    });
  }

  public setVisible(v: boolean): void {
    if (this.visible === v) {
      return; // No change needed
    }

    this.visible = v;

    this.tiles.forEach((tile) => {
      tile.setVisible(v);
    });

    const player = this.scene.getPlayer();

    if (!player || !this.tiledObject) {
      return;
    }

    if (v === true) {
      this.tilemapService.addColliderWithPlayer(player, this.tiledObject);
    } else {
      this.tilemapService.removeColliderWithPlayer(player, this.tiledObject);
    }
  }

  // Return the world pixel coordinates of the center of the object
  public getCenter(): Phaser.Math.Vector2 {
    // Use the tiledObject if available, otherwise calculate from tiles
    if (this.tiledObject) {
      const x = this.tiledObject.x ?? 0;
      const y = this.tiledObject.y ?? 0;
      const width = this.tiledObject.width ?? 0;
      const height = this.tiledObject.height ?? 0;

      return new Phaser.Math.Vector2(x + width / 2, y + height / 2);
    }

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
