import { AScene, ASceneConfig } from '@/components/GameEngine/AScene';
import ObjectTile from '@/components/GameEngine/ObjectTile';
import UIService from '@/components/GameScenes/MainScene/UIService';

type MainSceneConfig = ASceneConfig & {
  interactionDistance: number;

  // Default UI elements
  ui: {
    title: {
      fontFamily: string;
      fontSize: number;
      color: string;
      stroke: string;
      strokeThickness: number;
    };
    instructions: {
      fontFamily: string;
      fontSize: number;
      color: string;
      stroke: string;
      strokeThickness: number;
    };
    interaction: {
      font: string;
      color: string;
      stroke: string;
      strokeThickness: number;
      backgroundColor: string;
      padding: { x: number; y: number };
    };
  };
};

const config: MainSceneConfig = {
  width: 1024,
  height: 768,

  playerFrameWidth: 32,
  playerFrameHeight: 32,

  interactionDistance: 50,

  // Tilemap settings
  tilemapOffsetX: 192,
  tilemapOffsetY: 250,

  // Responsive settings
  responsive: {
    minScale: 0.5,
    maxScale: 1.0,
    maintainAspectRatio: true,
    centerOnResize: true,
  },

  // Asset paths
  assets: {
    external: {
      inventoryAtlas: {
        image:
          'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/inventory-cIfE3BZyKhWuGpKQPaEudyssmD6dGB.png',
        json: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/inventory-S2GJxM5Fp7vwUBCBKayeL59US8BnUw.json',
      },
      itemsAtlas: {
        image:
          'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/items-DTpUL0sSJs15YcqGe5JegStUJE39jv.png',
        json: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/items-FtK6rnKW6AigB8kb0kErCSS8RoS9s9.json',
      },
      inventoryWindow:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/inventory-IxO6leHEeX7bNFWCmh9evri3HmIkxZ.png',
      tiles:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/pixel-cyberpunk-interior-XtYiFktpomtHWKti7d7M04TetN7FGY.png',
      map: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/lobby-xuf4TSQUQoyicGByzWaiSIx25NGjw5.tmj',
      player:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tyro-5KW3g9ugXSgLEHY3pKwyzR7bu2x6yV.png',
    },
    local: {
      basePath: '/assets/Game',
      star: 'star.png',
      background: 'bg.png',
      logo: 'logo.png',
    },
  },

  // UI settings
  ui: {
    title: {
      fontFamily: 'Arial Black',
      fontSize: 48,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
    },
    instructions: {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    },
    interaction: {
      font: '16px monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#00000080',
      padding: { x: 10, y: 5 },
    },
  },
};

export class MainScene extends AScene<MainSceneConfig> {
  protected uiService: UIService;

  // Chest doesn't move
  protected chest: ObjectTile | null = null;

  constructor() {
    super({
      name: 'Main',
      config,
      enableInventory: true,
    });

    this.uiService = new UIService(this);
  }

  protected repositionUIElementsForNewScreenSize(
    width: number,
    height: number,
  ): void {
    this.uiService.updateResponsivePosition(width, height);
  }

  public async create() {
    this.uiService.createTitle();
    this.uiService.createInstructions();
    this.uiService.createInteractionText();

    await super.create();

    // We know there is only one chest in the scene
    this.chest = (await this.tilemapService.getObjectsByName('chest'))[0];
  }

  protected setupInteractionControls(): void {
    this.input?.keyboard?.on('keydown-I', () => {
      if (
        this.player &&
        this.chest &&
        this.player?.isNearObject(this.chest, this.config.interactionDistance)
      ) {
        this.getInventoryService().toggleInventory();
      }
    });
  }

  public update() {
    super.update();

    if (this.player && this.chest) {
      const isNearChest = this.player.isNearObject(
        this.chest,
        this.config.interactionDistance,
      );

      const isInventoryOpen = this.getInventoryService().isInventoryVisible();

      const { x: playerX, y: playerY } = this.player.getPosition();

      this.uiService.updateInteractionText(
        playerX,
        playerY,
        isNearChest,
        isInventoryOpen,
      );
    }

    // TODO: Multiplayer logic would go here
    // if (!myPlayer()) {
    //   return; // Wait until PlayroomKit is fully initialized
    // }
  }
}
