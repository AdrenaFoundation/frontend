import TilemapService from '../services/TilemapService';

class ObjectTile {
  public readonly tile: Phaser.Tilemaps.Tile;
  public readonly tilemapService: TilemapService;

  constructor(tile: Phaser.Tilemaps.Tile, tilemapService: TilemapService) {
    this.tile = tile;
    this.tilemapService = tilemapService;
  }
}

export default ObjectTile;
