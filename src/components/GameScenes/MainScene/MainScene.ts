import { AScene, ASceneConfig } from '@/components/GameEngine/AScene';
import ItemTile from '@/components/GameEngine/ItemTile';
import ObjectTile from '@/components/GameEngine/ObjectTile';
import UIService from '@/components/GameScenes/MainScene/UIService';

type MainSceneConfig = ASceneConfig & {
  interactionDistance: number;

  assets: {
    external: {
      map: string;
      player: string;
    };
  };

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
  width: 1200,
  height: 1000,

  playerFrameWidth: 32,
  playerFrameHeight: 32,

  interactionDistance: 50,

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
      tiles:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tileset-v1.0.0-zVprLuvmZEAp5vplEXMKUcU7yQ8fQb.png',
      map: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/lobby-3Ai8xbysUAgatNctiMrPRkf5x353uw.tmj',
      player:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tyro-5KW3g9ugXSgLEHY3pKwyzR7bu2x6yV.png',
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
    });

    this.uiService = new UIService(this);
  }

  protected override handleResize(gameSize: {
    width: number;
    height: number;
  }): void {
    super.handleResize(gameSize);

    const { width, height } = gameSize;
    this.uiService.updateResponsivePosition(width, height);
  }

  protected override loadAssets(): void {
    super.loadAssets();
  }

  public override async create() {
    // this.uiService.createTitle();
    // this.uiService.createInstructions();
    // this.uiService.createInteractionText();

    await super.create();

    const inventoryTables = await this.getTilemapService().getObjectsByPrefix(
      'table',
      ObjectTile,
    );

    console.log('Inventory tables:', inventoryTables);

    const petTables = await this.getTilemapService().getObjectsByPrefix(
      'pet',
      ObjectTile,
    );

    console.log('Pet tables:', petTables);

    inventoryTables.forEach((table) => {
      const t = new ItemTile({
        scene: this,
        itemId: '1',
        position: table.getCenter(),
      });
    });
  }

  protected override setupInteractionControls(): void {
    // Open/Close inventory with 'I' key when close to the chest
    // this.input?.keyboard?.on('keydown-I', () => {
    //   if (
    //     this.player &&
    //     this.chest &&
    //     this.player?.isNearObject(this.chest, this.config.interactionDistance)
    //   ) {
    //     this.inventoryService.toggleInventory();
    //   } else {
    //     this.inventoryService.hideInventory();
    //   }
    // });
  }

  public override update() {
    super.update();

    // if (this.player && this.chest) {
    //   const isNearChest = this.player.isNearObject(
    //     this.chest,
    //     this.config.interactionDistance,
    //   );

    //   const { x: playerX, y: playerY } = this.player.getPosition();
    // }

    // TODO: Multiplayer logic would go here
    // if (!myPlayer()) {
    //   return; // Wait until PlayroomKit is fully initialized
    // }
  }
}
