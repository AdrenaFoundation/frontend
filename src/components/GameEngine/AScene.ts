import { Scene } from 'phaser';

import { EventBus } from './EventBus';
import Player from './Player';
import TilemapService from './TilemapService';

export interface ASceneConfig {
  playerFrameWidth: number;
  playerFrameHeight: number;
  playerStartingPosition: Phaser.Math.Vector2;
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
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  public async preload() {
    this.loadAssets();
  }

  public async create() {
    this.tilemapService = new TilemapService(this);

    this.player = new Player({
      scene: this,
      startingPosition: this.config.playerStartingPosition,
      nickname: 'Orex',
    });

    this.tilemapService.addColliderWithPlayer(this.player);

    this.cameras.main.startFollow(this.player.getSprite());

    this.cameras.main.setBounds(
      0,
      0,
      this.tilemapService.map!.widthInPixels,
      this.tilemapService.map!.heightInPixels,
    );

    this.physics.world.setBounds(
      0,
      0,
      this.tilemapService.map!.widthInPixels,
      this.tilemapService.map!.heightInPixels,
    );

    this.setupInteractionControls();

    // Handle resizing the game
    {
      // Handle when the game is resized
      this.scale.on('resize', this.handleResize, this);

      let resizeTimeout: number;

      // Tell the game when the window is resized
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);

        resizeTimeout = window.setTimeout(() => {
          try {
            const { width, height } = this.getContainerSize();

            // TODO: handle scale that crashes idk why when resizing sometimes
            this.scale.resize(width, height);
          } catch {
            // Ignore
          }
        }, 150);
      });
    }

    EventBus.emit('scene-ready', this);
  }

  protected handleResize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize;

    // Resize camera to match new screen size
    this.cameras.resize(width, height);

    // Keep player within the bounds of the tilemap
    if (this.player && this.tilemapService && this.tilemapService.map) {
      const mapWidth = this.tilemapService.map.widthInPixels;
      const mapHeight = this.tilemapService.map.heightInPixels;

      const { x: playerX, y: playerY } = this.player.getPosition();

      const newX = Phaser.Math.Clamp(playerX, 0, mapWidth);
      const newY = Phaser.Math.Clamp(playerY, 0, mapHeight);
      this.player.setPosition(newX, newY);
    }
  }

  protected getContainerSize(): {
    width: number;
    height: number;
  } {
    const parent = this.game.config.parent;

    const container =
      typeof parent === 'string'
        ? document.getElementById(parent)
        : parent instanceof HTMLElement
          ? parent
          : null;

    if (!container) {
      throw new Error('Could not resolve Phaser container from config.parent');
    }

    return container.getBoundingClientRect();
  }

  protected abstract setupInteractionControls(): void;

  public update() {
    this.player?.update();
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
