import { Scene } from 'phaser';

import { GameConfig } from '../config/GameConfig';

export class AssetLoader {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public async loadAllAssets(): Promise<void> {
    this.loadInventoryAndItemAtlases();
    this.loadIndividualGameImages();
    this.loadTilemapAndPlayerSpritesheet();
  }

  private loadInventoryAndItemAtlases(): void {
    const { external } = GameConfig.assets;

    this.scene.load.atlas(
      'A_inventory_window',
      external.inventoryAtlas.image,
      external.inventoryAtlas.json,
    );

    this.scene.load.atlas(
      'A_items',
      external.itemsAtlas.image,
      external.itemsAtlas.json,
    );
  }

  private loadIndividualGameImages(): void {
    const { external } = GameConfig.assets;

    this.scene.load.image('inventory_window', external.inventoryWindow);
    this.scene.load.image('tiles', external.tiles);
  }

  private loadTilemapAndPlayerSpritesheet(): void {
    const { external } = GameConfig.assets;

    this.scene.load.tilemapTiledJSON('map', external.map);

    this.scene.load.spritesheet('player', external.player, {
      frameWidth: GameConfig.playerFrameWidth,
      frameHeight: GameConfig.playerFrameHeight,
    });
  }
}
