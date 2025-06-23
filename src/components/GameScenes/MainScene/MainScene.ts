import { AScene, ASceneConfig } from '@/components/GameEngine/AScene';
import InventoryTableTile from '@/components/GameEngine/InventoryTableTile';
import ObjectTile from '@/components/GameEngine/ObjectTile';
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
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tileset-v1.0.0-q6GEZYurYLlnRk9xRq054LCHSwZprZ.png',
      map: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/lobby-yA5A8v7UqifQf8fiGUYlGObP1WUr9p.tmj',
      player:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tyro-5KW3g9ugXSgLEHY3pKwyzR7bu2x6yV.png',
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
      await this.getTilemapService().getObjectsByPrefix<InventoryTableTile>(
        'table',
        InventoryTableTile,
      );

    console.log('Inventory tables:', inventoryTables);

    inventoryTables.forEach((table) => {
      table.addItemOnTable('1');
    });

    const pets = await this.getTilemapService().getObjectsByPrefix(
      'pet',
      ObjectTile,
    );

    console.log('Pet:', pets);

    const buttons = await this.getTilemapService().getObjectsByPrefix(
      'button',
      ObjectTile,
    );

    console.log('Buttons:', buttons);

    this.player?.addInteractiveObjects(inventoryTables);
    this.player?.addInteractiveObjects(pets);
    this.player?.addInteractiveObjects(buttons);
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
