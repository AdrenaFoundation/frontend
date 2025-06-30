import { AScene } from './AScene';
import Player from './Player';
import ObjectTiles from './Tiles/ObjectTiles';

class TilemapService {
  public readonly scene: AScene;
  public readonly map: Phaser.Tilemaps.Tilemap | null = null;

  public readonly tiles: Phaser.Tilemaps.Tileset | null = null;

  public readonly floor: Phaser.Tilemaps.TilemapLayer | null = null;
  public readonly walls: Phaser.Tilemaps.TilemapLayer | null = null;
  public readonly uiObjects: Phaser.Tilemaps.TilemapLayer | null = null;
  public readonly objects: Phaser.Tilemaps.ObjectLayer | null = null;
  public readonly doors: Phaser.Tilemaps.TilemapLayer | null = null;

  // Layer used to dynamically place manual objects like items, etc.
  public readonly manual: Phaser.Tilemaps.TilemapLayer | null = null;

  constructor(scene: AScene) {
    this.scene = scene;

    this.map = this.scene.add.tilemap('map');

    // 1st parameter is the name of the tileset as defined in Tiled
    // 2nd parameter is the key of the tileset image loaded in preload
    this.tiles = this.map.addTilesetImage(
      'tileset-v1.0.0',
      'tiles',
      16,
      16,
      0,
      0,
    );

    if (!this.tiles) {
      console.error('Tileset not found. Please check the tileset image URL.');
      return;
    }

    const offsetX = 0;
    const offsetY = 0;

    this.objects = this.map.getObjectLayer('objects');

    this.floor = this.map.createLayer('floor', this.tiles, offsetX, offsetY);
    this.walls = this.map.createLayer('walls', this.tiles, offsetX, offsetY);
    this.doors = this.map.createLayer('doors', this.tiles, offsetX, offsetY);

    // Create a blank layer for manual objects
    this.manual = this.map.createBlankLayer(
      'manual',
      this.tiles,
      offsetX,
      offsetY,
    );

    this.uiObjects = this.map.createLayer(
      'uiobjects',
      this.tiles,
      offsetX,
      offsetY,
    );

    // Set collision for everything in walls layer and objects layer
    this.walls?.setCollisionByExclusion([-1]);

    // Set depth for layers
    this.floor?.setDepth(0);
    this.walls?.setDepth(1);
    this.uiObjects?.setDepth(2);
    this.manual?.setDepth(3);
    this.doors?.setDepth(30);
  }

  public getObjectsLayer(): Phaser.Tilemaps.ObjectLayer {
    if (!this.objects) {
      throw new Error(
        'Objects layer not found. Please create the tilemap first.',
      );
    }

    return this.objects;
  }

  // Looks at the tileset and returns all tile IDs that match the given id
  public getTilesIdsFromIdProperty(id: string): number[] {
    if (!this.tiles) {
      throw new Error('Tileset not found. Please create the tilemap first.');
    }

    const result: number[] = [];

    for (
      let i = this.tiles.firstgid;
      i < this.tiles.firstgid + this.tiles.total;
      i++
    ) {
      const props = this.tiles.getTileProperties(i);

      if (
        props &&
        typeof props === 'object' &&
        'id' in props &&
        typeof props.id === 'string' &&
        props.id === id
      ) {
        result.push(i);
      }
    }

    return result;
  }

  public getObjectsByType<T extends ObjectTiles>(
    type: string,
    ctor: new (p: {
      tiles: Phaser.Tilemaps.Tile[];
      tiledObject: Phaser.Types.Tilemaps.TiledObject;
      tilemapService: TilemapService;
      scene: AScene;
    }) => T,
    // Use true if there is a property `sort` in the Tiled object
    sort: boolean = false,
  ): T[] {
    if (!this.objects || !this.uiObjects) {
      return [];
    }

    const matchedObjects = this.objects.objects.map((obj) => {
      if (obj.name !== type) return null;

      const tiles = this.getTilesInsideObject({
        object: obj,
        layer: this.uiObjects!,
        tileSize: this.tiles?.tileWidth ?? 16,
      });

      return new ctor({
        tiledObject: obj,
        tiles,
        tilemapService: this,
        scene: this.scene,
      });
    });

    const objects = matchedObjects.filter((obj) => obj !== null) as T[];

    if (!sort) {
      return objects;
    }

    return objects.sort((a, b) => {
      if (!a.tiledObject || !b.tiledObject) {
        return 0; // If either object is missing, do not sort
      }

      const aSort = a.tiledObject.properties.find(
        (p: { name: string; value: number }) => p.name === 'sort',
      ).value;

      const bSort = b.tiledObject.properties.find(
        (p: { name: string; value: number }) => p.name === 'sort',
      ).value;

      return aSort - bSort;
    });
  }

  protected getTilesInsideObject({
    object,
    layer,
    tileSize,
  }: {
    object: Phaser.Types.Tilemaps.TiledObject;
    layer: Phaser.Tilemaps.TilemapLayer;
    tileSize: number;
  }): Phaser.Tilemaps.Tile[] {
    const tiles: Phaser.Tilemaps.Tile[] = [];

    const objX = object.x ?? 0;
    const objY = object.y ?? 0;
    const objW = object.width ?? 0;
    const objH = object.height ?? 0;

    const startX = Math.floor(objX / tileSize);
    const startY = Math.floor(objY / tileSize);
    const endX = Math.ceil((objX + objW) / tileSize);
    const endY = Math.ceil((objY + objH) / tileSize);

    for (let tx = startX; tx < endX; tx++) {
      for (let ty = startY; ty < endY; ty++) {
        const tile = layer.getTileAt(tx, ty);
        if (!tile) continue;

        const tileX = tile.pixelX;
        const tileY = tile.pixelY;

        const tileRect = {
          x: tileX,
          y: tileY,
          width: tile.width,
          height: tile.height,
        };

        const objectRect = {
          x: objX,
          y: objY,
          width: objW,
          height: objH,
        };

        const intersects =
          tileRect.x < objectRect.x + objectRect.width &&
          tileRect.x + tileRect.width > objectRect.x &&
          tileRect.y < objectRect.y + objectRect.height &&
          tileRect.y + tileRect.height > objectRect.y;

        if (intersects) {
          tiles.push(tile);
        }
      }
    }

    return tiles;
  }

  public addColliderWithPlayer(player: Player): void {
    if (this.walls) {
      player.addCollider(this.walls);
    }

    if (this.objects) {
      this.objects.objects.forEach((obj) => {
        if (!obj.x || !obj.y || !obj.width || !obj.height) return;

        const body = this.scene.physics.add
          .staticImage(obj.x + obj.width / 2, obj.y + obj.height / 2, '')
          .setSize(obj.width, obj.height)
          .setVisible(false); // hide collision object

        player.addCollider(body);
      });
    }
  }
}

export default TilemapService;
