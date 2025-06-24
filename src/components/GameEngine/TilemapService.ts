import { AScene } from './AScene';
import ObjectTiles from './ObjectTiles';
import Player from './Player';

class TilemapService {
  public readonly scene: AScene;
  public readonly map: Phaser.Tilemaps.Tilemap | null = null;

  public readonly tiles: Phaser.Tilemaps.Tileset | null = null;

  public readonly floor: Phaser.Tilemaps.TilemapLayer | null = null;
  public readonly walls: Phaser.Tilemaps.TilemapLayer | null = null;
  public readonly objects: Phaser.Tilemaps.TilemapLayer | null = null;
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

    this.objects = this.map.createLayer(
      'objects',
      this.tiles,
      offsetX,
      offsetY,
    );

    // Set collision for everything in walls layer and objects layer
    this.walls?.setCollisionByExclusion([-1]);
    this.objects?.setCollisionByExclusion([-1]);

    // Set depth for layers
    this.floor?.setDepth(0);
    this.walls?.setDepth(1);
    this.objects?.setDepth(2);
    this.doors?.setDepth(3);
    this.manual?.setDepth(4);
  }

  public getObjectsLayer(): Phaser.Tilemaps.TilemapLayer {
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

  /**
   * Groups directional object tiles (top/right/bottom) based on a shared name prefix and sequential pattern.
   *
   * Example: for prefix "table", tiles should be named:
   *  - table-1/6
   *  - table-2/6
   *  - ...
   *  - table-6/6
   * They must be placed in order, connected in a straight line (top, right, or bottom).
   */
  public getObjectsByPrefix<T extends ObjectTiles>(
    prefix: string,
    ctor: new (p: {
      tiles: Phaser.Tilemaps.Tile[];
      tilemapService: TilemapService;
      scene: AScene;
    }) => T,
  ): Promise<T[]> {
    return new Promise((resolve) => {
      if (!this.objects) {
        resolve([]);
        return;
      }

      const width = this.objects.width;
      const height = this.objects.height;
      const visited = new Set<string>();
      const result: T[] = [];

      // Helper: creates a unique key for a tile position
      const key = (x: number, y: number) => `${x},${y}`;

      // Helper: safely get a tile at a position
      const getTile = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return null;
        if (!this.objects) return null;

        return this.objects.getTileAt(x, y);
      };

      // Iterate over every tile in the map
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const start = getTile(x, y);
          if (!start?.properties?.name || visited.has(key(x, y))) continue;

          // Match tiles like `prefix-1/N` to identify starting tiles
          const match = start.properties.name.match(
            new RegExp(`^${prefix}-1/(\\d+)$`),
          );
          if (!match) continue;

          const total = parseInt(match[1], 10); // number of parts for this object
          const group: Phaser.Tilemaps.Tile[] = [start];
          visited.add(key(x, y)); // mark the starting tile as visited

          let cx = x;
          let cy = y;
          let valid = true;

          // Try to find the next N-1 parts
          for (let i = 2; i <= total; i++) {
            let next: Phaser.Tilemaps.Tile | null = null;

            // Only check forward directions (top, right, bottom)
            const directions = [
              { dx: 1, dy: 0 }, // right
              { dx: 0, dy: -1 }, // top
              { dx: 0, dy: 1 }, // bottom
            ];

            // Try each direction to find the expected next tile
            for (const { dx, dy } of directions) {
              const nx = cx + dx;
              const ny = cy + dy;
              const ntile = getTile(nx, ny);
              if (
                ntile &&
                ntile.properties?.name === `${prefix}-${i}/${total}` &&
                !visited.has(key(nx, ny))
              ) {
                next = ntile;
                cx = nx;
                cy = ny;
                break;
              }
            }

            // If no next tile found, this group is invalid
            if (!next) {
              valid = false;
              break;
            }

            group.push(next);
            visited.add(key(cx, cy));
          }

          // Only add the group if all parts were found and it's complete
          if (valid && group.length === total) {
            result.push(
              new ctor({
                tiles: group,
                tilemapService: this,
                scene: this.scene,
              }),
            );
          }
        }
      }

      resolve(result);
    });
  }

  public addColliderWithPlayer(player: Player): void {
    if (this.walls && this.objects) {
      player.addCollider(this.walls);
      player.addCollider(this.objects);
    }
  }
}

export default TilemapService;
