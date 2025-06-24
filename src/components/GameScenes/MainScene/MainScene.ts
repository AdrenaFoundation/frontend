import { AScene, ASceneConfig } from '@/components/GameEngine/AScene';
import CrateTiles from '@/components/GameEngine/CrateTiles';
import GearTiles from '@/components/GameEngine/GearTiles';
import InventoryTableTiles from '@/components/GameEngine/InventoryTableTiles';
import KennelButtonTiles from '@/components/GameEngine/KennelButtonTiles';
import ObjectTiles from '@/components/GameEngine/ObjectTiles';
import UIService from '@/components/GameScenes/MainScene/UIService';

type MainSceneConfig = ASceneConfig & {
  assets: {
    external: {
      map: string;
      player: string;
    };
  };
};

const config: MainSceneConfig = {
  playerFrameWidth: 32,
  playerFrameHeight: 32,

  playerStartingPosition: new Phaser.Math.Vector2(300, 300),

  // Asset paths
  assets: {
    external: {
      tiles:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tileset-v1.0.0-kmN3pq8g1Hry2iGmBZja2aiawblaWP.png',
      map: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/lobby-I4j1XE9e2mYCqRx7aBXcE2c60Rlu0p.tmj',
      player:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tyro-5KW3g9ugXSgLEHY3pKwyzR7bu2x6yV.png',
    },
  },
};

export class MainScene extends AScene<MainSceneConfig> {
  protected uiService: UIService;

  // Chest doesn't move
  protected chest: ObjectTiles | null = null;

  constructor() {
    super({
      name: 'Main',
      config,
    });

    this.uiService = new UIService(this);
  }

  protected override handleResize(gameSize: Phaser.Structs.Size): void {
    super.handleResize(gameSize);

    // const { width, height } = gameSize;
    // this.uiService.updateResponsivePosition(width, height);
  }

  protected override loadAssets(): void {
    super.loadAssets();
  }

  public override async create() {
    // this.uiService.createTitle();
    // this.uiService.createInstructions();
    // this.uiService.createInteractionText();

    await super.create();

    const inventoryTables =
      await this.getTilemapService().getObjectsByPrefix<InventoryTableTiles>(
        'table',
        InventoryTableTiles,
      );

    console.log('Inventory tables:', inventoryTables);

    inventoryTables.forEach((table, i) => {
      if (i % 2 === 0) {
        table.addItemOnTable({
          itemId: '2',
          ctor: CrateTiles,
        });
      } else {
        table.addItemOnTable({
          itemId: '1',
          ctor: GearTiles,
        });
      }
    });

    const pets = await this.getTilemapService().getObjectsByPrefix(
      'pet',
      ObjectTiles,
    );

    console.log('Pet:', pets);

    const buttons = await this.getTilemapService().getObjectsByPrefix(
      'button',
      KennelButtonTiles,
    );

    console.log('Buttons:', buttons);

    this.player?.addInteractiveObjects(inventoryTables);
    this.player?.addInteractiveObjects(pets);
    this.player?.addInteractiveObjects(buttons);
  }

  protected override setupInteractionControls(): void {}

  public override update() {
    super.update();
  }
}
