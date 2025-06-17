import { Scene } from 'phaser';
import { PlayerState } from 'playroomkit';

import PlayroomKitService from '../../services/PlayroomKitService';
import { GameConfig } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { EventBus } from '../EventBus';
import { AssetLoader } from '../services/AssetLoader';
import { InteractionService } from '../services/InteractionService';
import { InventoryService } from '../services/InventoryService';
import { TilemapService } from '../services/TilemapService';
import { UIService } from '../services/UIService';

export class MainScene extends Scene {
  private playroomKit: PlayroomKitService;
  private assetLoader: AssetLoader;
  private tilemapService: TilemapService;
  private uiService: UIService;
  private interactionService: InteractionService;
  private inventoryService: InventoryService;

  private player: Player | undefined;

  private players: {
    sprite: Phaser.GameObjects.Sprite;
    state: PlayerState;
  }[] = [];

  constructor() {
    super('Main');
    this.playroomKit = PlayroomKitService.getInstance();
    this.assetLoader = new AssetLoader(this);
    this.tilemapService = new TilemapService(this);
    this.uiService = new UIService(this);
    this.interactionService = new InteractionService(
      GameConfig.width / 2,
      GameConfig.height / 2 - 100,
    );
    this.inventoryService = new InventoryService(this);
  }

  public async preload() {
    await this.assetLoader.loadAllAssets();
  }

  public async create() {
    // TODO: use for multiplayer
    //await this.playroomKit.initialize();

    this.initializeGame();
    this.setupResponsiveHandling();

    EventBus.emit('scene-ready', this);
  }

  private initializeGame(): void {
    const { width, height } = GameConfig;

    this.tilemapService.createTilemap();

    this.player = new Player(this, width / 2, height / 2);

    this.tilemapService.addColliderWithPlayer(this.player.getSprite());

    this.uiService.createTitle();
    this.uiService.createInstructions();
    this.uiService.createInteractionText();

    this.inventoryService.initializeInventory();

    this.setupInteractionControls();
  }

  private setupResponsiveHandling(): void {
    this.scale.on('resize', this.handleResize, this);

    this.scale.setGameSize(GameConfig.width, GameConfig.height);
    this.scale.setZoom(1);
  }

  private handleResize(gameSize: { width: number; height: number }): void {
    const { width, height } = gameSize;

    this.repositionTilemapForNewScreenSize();
    this.keepPlayerWithinScreenBounds(width, height);
    this.repositionUIElementsForNewScreenSize(width, height);
  }

  private repositionTilemapForNewScreenSize(): void {
    this.tilemapService.updateResponsivePosition();
  }

  private keepPlayerWithinScreenBounds(width: number, height: number): void {
    if (this.player) {
      const playerPos = this.player.getPosition();
      const newX = Math.max(0, Math.min(width, playerPos.x));
      const newY = Math.max(0, Math.min(height, playerPos.y));
      this.player.setPosition(newX, newY);
    }
  }

  private repositionUIElementsForNewScreenSize(
    width: number,
    height: number,
  ): void {
    this.uiService.updateResponsivePosition(width, height);
  }

  private setupInteractionControls(): void {
    this.input?.keyboard?.on('keydown-I', () => {
      if (
        this.player &&
        this.interactionService.isNearChest(
          this.player.getPosition().x,
          this.player.getPosition().y,
        )
      ) {
        this.inventoryService.toggleInventory();
      }
    });
  }

  public update() {
    if (this.player) {
      this.player.update();
    }

    if (this.player) {
      const position = this.player.getPosition();
      const isNearChest = this.interactionService.isNearChest(
        position.x,
        position.y,
      );
      const isInventoryOpen = this.inventoryService.isInventoryVisible();

      this.uiService.updateInteractionText(
        position.x,
        position.y,
        isNearChest,
        isInventoryOpen,
      );
    }

    // TODO: Multiplayer logic would go here
    // if (!myPlayer()) {
    //   return; // Wait until PlayroomKit is fully initialized
    // }
  }

  public getInventoryService(): InventoryService {
    return this.inventoryService;
  }
}
