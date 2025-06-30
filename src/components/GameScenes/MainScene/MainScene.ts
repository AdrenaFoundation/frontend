import { AScene, ASceneConfig } from '@/components/GameEngine/AScene';
import BedTiles from '@/components/GameEngine/BedTiles';
import CrateTiles from '@/components/GameEngine/CrateTiles';
import InventoryTableTiles from '@/components/GameEngine/InventoryTableTiles';
import KennelButtonTiles from '@/components/GameEngine/KennelButtonTiles';
import UiObjectTiles from '@/components/GameEngine/ObjectTiles';
import PlantTiles from '@/components/GameEngine/PlantTiles';
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

  assets: {
    external: {
      tiles:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tileset-v1.0.0-ShC2gB5oCTKeL4G8xql65LilQiITd8.png',
      map: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/lobby-CZHoZz3Jc3pJe0rEK6r8SnLnHmPZ6o.tmj',
      player:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tyro-5KW3g9ugXSgLEHY3pKwyzR7bu2x6yV.png',
    },
  },
};

export class MainScene extends AScene<MainSceneConfig> {
  protected uiService: UIService;

  constructor() {
    super({
      name: 'Main',
      config,
    });

    this.uiService = new UIService(this);
  }

  protected override handleResize(gameSize: Phaser.Structs.Size): void {
    super.handleResize(gameSize);
  }

  protected override loadAssets(): void {
    super.loadAssets();
  }

  public override async create() {
    await super.create();

    const inventoryTables =
      this.getTilemapService().getObjectsByType<InventoryTableTiles>(
        'table',
        InventoryTableTiles,
        true,
      );

    inventoryTables.forEach((table, i) => {
      table.addItemOnTable({
        itemId: (i + 1).toString(),
        ctor: CrateTiles,
      });
    });

    // inventoryTables.slice(inventoryTables.length - 2).forEach((table) => {
    //   table.lock();
    // });

    const pets = this.getTilemapService().getObjectsByType(
      'pet',
      UiObjectTiles,
    );

    const buttons = this.getTilemapService().getObjectsByType(
      'kennel',
      KennelButtonTiles,
    );

    const beds = this.getTilemapService().getObjectsByType('bed', BedTiles);

    const plants = this.getTilemapService().getObjectsByType(
      'plant',
      PlantTiles,
    );

    console.log('inventoryTables', inventoryTables);
    console.log('pets', pets);
    console.log('buttons', buttons);
    console.log('beds', beds);
    console.log('plants', plants);

    this.player?.addInteractiveObjects(inventoryTables);
    this.player?.addInteractiveObjects(pets);
    this.player?.addInteractiveObjects(buttons);
    this.player?.addInteractiveObjects(beds);
    this.player?.addInteractiveObjects(plants);
  }

  protected override setupInteractionControls(): void {}

  public override update() {
    super.update();
  }
}
