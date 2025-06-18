import { AScene } from './AScene';
import ObjectTile from './ObjectTile';

class TilemapService {
  private scene: AScene;
  private map: Phaser.Tilemaps.Tilemap | null = null;
  private tiles: Phaser.Tilemaps.Tileset | null = null;
  private floor: Phaser.Tilemaps.TilemapLayer | null = null;
  private outerWalls: Phaser.Tilemaps.TilemapLayer | null = null;
  private objects: Phaser.Tilemaps.TilemapLayer | null = null;

  constructor(scene: AScene) {
    this.scene = scene;
  }

  public createTilemap(): void {
    const { width, height } = this.scene.config;

    this.map = this.scene.add.tilemap('map');
    this.tiles = this.map.addTilesetImage('pixel-cyberpunk-interior', 'tiles');

    if (!this.tiles) {
      console.error('Tileset not found. Please check the tileset image URL.');
      return;
    }

    const mapWidth = this.map.widthInPixels;
    const mapHeight = this.map.heightInPixels;

    const offsetX = (width - mapWidth) / 2;
    const offsetY = (height - mapHeight) / 2;

    this.floor = this.map.createLayer('floor', this.tiles, offsetX, offsetY);

    this.outerWalls = this.map.createLayer(
      'outerWalls',
      this.tiles,
      offsetX,
      offsetY,
    );

    this.objects = this.map.createLayer(
      'objects',
      this.tiles,
      offsetX,
      offsetY,
    );

    this.makeLayersResponsive();

    if (this.outerWalls) {
      // magic number TODO: check later the good practice
      this.outerWalls.setCollisionBetween(0, 1000);
    }
  }

  private makeLayersResponsive(): void {
    const { width, height, responsive } = this.scene.config;
    const layers = [this.floor, this.outerWalls, this.objects].filter(Boolean);

    layers.forEach((layer) => {
      if (layer) {
        const scale = this.calculateOptimalScaleForLayer(
          layer,
          width,
          height,
          responsive,
        );

        this.applyScaleToLayer(layer, scale);

        this.centerLayerOnScreenIfEnabled(
          layer,
          width,
          height,
          scale,
          responsive,
        );
      }
    });
  }

  private calculateOptimalScaleForLayer(
    layer: Phaser.Tilemaps.TilemapLayer,
    width: number,
    height: number,
    responsive: {
      minScale: number;
      maxScale: number;
      maintainAspectRatio: boolean;
    },
  ): number {
    const scaleX = width / (layer.width || 1);
    const scaleY = height / (layer.height || 1);

    let scale: number;
    if (responsive.maintainAspectRatio) {
      scale = Math.min(scaleX, scaleY);
    } else {
      scale = Math.min(scaleX, scaleY);
    }

    return Math.max(responsive.minScale, Math.min(responsive.maxScale, scale));
  }

  private applyScaleToLayer(
    layer: Phaser.Tilemaps.TilemapLayer,
    scale: number,
  ): void {
    layer.setScale(scale);
  }

  private centerLayerOnScreenIfEnabled(
    layer: Phaser.Tilemaps.TilemapLayer,
    width: number,
    height: number,
    scale: number,
    responsive: { centerOnResize: boolean },
  ): void {
    if (responsive.centerOnResize) {
      layer.setPosition(
        (width - (layer.width || 0) * scale) / 2,
        (height - (layer.height || 0) * scale) / 2,
      );
    }
  }

  public updateResponsivePosition(): void {
    this.makeLayersResponsive();
  }

  public getObjectsLayer(): Phaser.Tilemaps.TilemapLayer {
    if (!this.objects) {
      throw new Error(
        'Objects layer not found. Please create the tilemap first.',
      );
    }

    return this.objects;
  }

  public getObjectsByName(name: string): Promise<ObjectTile[]> {
    return new Promise((resolve) => {
      if (!this.objects) {
        resolve([]);
        return;
      }

      const matchingTiles: ObjectTile[] = [];

      this.objects.forEachTile((tile) => {
        if (tile.properties?.name === name) {
          matchingTiles.push(new ObjectTile(tile, this));
        }
      });

      resolve(matchingTiles);
    });
  }

  public addColliderWithPlayer(
    playerSprite: Phaser.Physics.Arcade.Sprite,
  ): void {
    if (this.outerWalls) {
      this.scene.physics.add.collider(playerSprite, this.outerWalls);
    }
  }
}

export default TilemapService;
