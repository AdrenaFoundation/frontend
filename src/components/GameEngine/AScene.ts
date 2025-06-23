import { Scene } from 'phaser';

import { EventBus } from './EventBus';
import Player from './Player';
import TilemapService from './TilemapService';

// Cherry picked by:
// type t = Phaser.Types.Core.GameConfig;
export interface ASceneConfig {
  width: number;
  height: number;
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
      tiles: string;
      map: string;
      player: string;
    };
  };
}

export abstract class AScene<
  T extends ASceneConfig = ASceneConfig,
> extends Scene {
  protected tilemapService: TilemapService | null = null;

  public readonly config: T;

  protected player: Player | null = null;

  // protected players: {
  //   sprite: Phaser.GameObjects.Sprite;
  //   state: PlayerState;
  // }[] = [];

  constructor({ name = 'Main', config }: { name: string; config: T }) {
    super(name);

    this.config = config;
  }

  protected loadAssets(): void {
    const {
      assets: { external },
      playerFrameWidth,
      playerFrameHeight,
    } = this.config;

    this.load.image('tiles', external.tiles);

    this.load.tilemapTiledJSON('map', external.map);

    this.load.spritesheet('player', external.player, {
      frameWidth: playerFrameWidth,
      frameHeight: playerFrameHeight,
    });

    this.load.spritesheet('tiles-sprite', external.tiles, {
      frameWidth: 16, // 🟢 must match your tile size
      frameHeight: 16,
    });
  }

  public async preload() {
    this.loadAssets();
  }

  // Called automatically by Phaser after preload
  public async create() {
    const { width, height } = this.config;

    this.tilemapService = new TilemapService(this);

    this.player = new Player(this, width / 2, height / 2);

    this.tilemapService.addColliderWithPlayer(this.player);

    this.setupInteractionControls();
    this.setupResponsiveHandling();

    EventBus.emit('scene-ready', this);
  }

  protected setupResponsiveHandling(): void {
    this.scale.on('resize', this.handleResize, this);

    this.scale.setGameSize(this.config.width, this.config.height);
    this.scale.setZoom(1);
  }

  protected handleResize(gameSize: { width: number; height: number }): void {
    const { width, height } = gameSize;

    this.getTilemapService().updateResponsivePosition();
    this.keepPlayerWithinScreenBounds(width, height);
  }

  protected keepPlayerWithinScreenBounds(width: number, height: number): void {
    if (this.player) {
      const playerPos = this.player.getPosition();
      const newX = Math.max(0, Math.min(width, playerPos.x));
      const newY = Math.max(0, Math.min(height, playerPos.y));
      this.player.setPosition(newX, newY);
    }
  }

  protected abstract setupInteractionControls(): void;

  public update() {
    if (this.player) {
      this.player.update();
    }
  }

  public getPlayer(): Player | null {
    return this.player;
  }

  public getTilemapService(): TilemapService {
    if (!this.tilemapService) {
      throw new Error('TilemapService is not initialized');
    }

    return this.tilemapService;
  }
}
