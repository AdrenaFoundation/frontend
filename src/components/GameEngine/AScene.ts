import { Scene } from 'phaser';
import { PlayerState } from 'playroomkit';

import { Player } from './entities/Player';
import { EventBus } from './EventBus';
import { InventoryService } from './services/InventoryService';
import { TilemapService } from './services/TilemapService';

// Cherry picked by:
// type t = Phaser.Types.Core.GameConfig;
export interface ASceneConfig {
  width: number;
  height: number;
  tilemapOffsetX: number;
  tilemapOffsetY: number;
  responsive: {
    minScale: number;
    maxScale: number;
    maintainAspectRatio: boolean;
    centerOnResize: boolean;
  };
  playerFrameWidth: number;
  playerFrameHeight: number;
  assets: {
    external: {
      itemsAtlas: {
        image: string;
        json: string;
      };
      tiles: string;
      map: string;
      player: string;
      //
      // Optional if inventory is enabled
      inventoryAtlas?: {
        image: string;
        json: string;
      };
      inventoryWindow?: string;
      //
      //
    };
    local?: {
      basePath?: string;
      star?: string;
      background?: string;
      logo?: string;
    };
  };
}

export abstract class AScene<
  T extends ASceneConfig = ASceneConfig,
> extends Scene {
  protected tilemapService: TilemapService;

  // Optional inventory
  protected inventoryService: InventoryService | null = null;

  public readonly config: T;

  protected player: Player | undefined;

  protected players: {
    sprite: Phaser.GameObjects.Sprite;
    state: PlayerState;
  }[] = [];

  constructor({
    name = 'Main',
    config,
    enableInventory = false,
  }: {
    name: string;
    config: T;
    enableInventory: boolean;
  }) {
    super(name);

    this.config = config;
    this.tilemapService = new TilemapService(this);

    if (enableInventory) {
      this.inventoryService = new InventoryService(this);
    }
  }

  protected loadAssets(): void {
    const {
      assets: { external },
      playerFrameWidth,
      playerFrameHeight,
    } = this.config;

    this.load.atlas(
      'A_items',
      external.itemsAtlas.image,
      external.itemsAtlas.json,
    );

    this.load.image('tiles', external.tiles);

    this.load.tilemapTiledJSON('map', external.map);

    this.load.spritesheet('player', external.player, {
      frameWidth: playerFrameWidth,
      frameHeight: playerFrameHeight,
    });

    if (this.inventoryService) {
      if (!external.inventoryAtlas || !external.inventoryWindow) {
        throw new Error(
          'Inventory Atlas and Window are required when inventory is enabled.',
        );
      }

      this.load.atlas(
        'A_inventory_window',
        external.inventoryAtlas.image,
        external.inventoryAtlas.json,
      );

      this.load.image('inventory_window', external.inventoryWindow);
    }
  }

  public async preload() {
    this.loadAssets();
  }

  public async create() {
    this.initializeGame();
    this.setupResponsiveHandling();

    EventBus.emit('scene-ready', this);
  }

  protected initializeGame(): void {
    const { width, height } = this.config;

    this.tilemapService.createTilemap();

    this.player = new Player(this, width / 2, height / 2);

    this.tilemapService.addColliderWithPlayer(this.player.getSprite());

    if (this.inventoryService) {
      this.inventoryService.initializeInventory();
    }

    this.setupInteractionControls();
  }

  protected setupResponsiveHandling(): void {
    this.scale.on('resize', this.handleResize, this);

    this.scale.setGameSize(this.config.width, this.config.height);
    this.scale.setZoom(1);
  }

  protected handleResize(gameSize: { width: number; height: number }): void {
    const { width, height } = gameSize;

    this.repositionTilemapForNewScreenSize();
    this.keepPlayerWithinScreenBounds(width, height);
    this.repositionUIElementsForNewScreenSize(width, height);
  }

  protected repositionTilemapForNewScreenSize(): void {
    this.tilemapService.updateResponsivePosition();
  }

  protected keepPlayerWithinScreenBounds(width: number, height: number): void {
    if (this.player) {
      const playerPos = this.player.getPosition();
      const newX = Math.max(0, Math.min(width, playerPos.x));
      const newY = Math.max(0, Math.min(height, playerPos.y));
      this.player.setPosition(newX, newY);
    }
  }

  protected abstract repositionUIElementsForNewScreenSize(
    width: number,
    height: number,
  ): void;

  protected abstract setupInteractionControls(): void;

  public update() {
    if (this.player) {
      this.player.update();
    }
  }

  public getInventoryService(): InventoryService {
    if (this.inventoryService === null) {
      throw new Error(
        'InventoryService is not initialized. Please enable inventory in the scene constructor.',
      );
    }

    return this.inventoryService;
  }
}
