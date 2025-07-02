import { AScene, ASceneConfig } from '@/components/GameEngine/AScene';
import BedTiles from '@/components/GameEngine/Tiles/BedTiles';
import GearTiles from '@/components/GameEngine/Tiles/GearTiles';
import InventoryTableTiles from '@/components/GameEngine/Tiles/InventoryTableTiles';
import ItemTiles from '@/components/GameEngine/Tiles/ItemTiles';
import KennelDoorTiles from '@/components/GameEngine/Tiles/KennelDoorTiles';
import PetCageTiles from '@/components/GameEngine/Tiles/PetCageTiles';
import PetTiles from '@/components/GameEngine/Tiles/PetTiles';
import PlantTiles from '@/components/GameEngine/Tiles/PlantTiles';

const level = 16;

const unlockedKennel = true;
const unlockedPets = 10;

// MOCKUP of user inventory, initialized with 18 items
const inventory = [
  1, // Inventory slot 1
  3, // Inventory slot 2
  6, // Inventory slot 3
  0, // Inventory slot 4
  4, // Inventory slot 5
  0, // Inventory slot 6
  0, // Equipped Weapon
  0, // Equipped Torso
  0, // Equipped Neural Implant
  9, // Inventory slot 7 - Unlocked at level 14
  12, // Inventory slot 8 - Unlocked at level 14
  0, // Inventory slot 9 - Unlocked at level 18
  16, // Inventory slot 10 - Unlocked at level 18
  0, // Inventory slot 11 - Unlocked at level 22
  0, // Inventory slot 12 - Unlocked at level 22
  0, // TBD
  0, // TBD
  0, // TBD
];

type MainSceneConfig = ASceneConfig & {
  assets: {
    external: {
      map: string;
      player: string;
    };
  };
};

const config: MainSceneConfig = {
  playerFrameWidth: 16,
  playerFrameHeight: 32,

  playerStartingPosition: new Phaser.Math.Vector2(300, 300),

  assets: {
    external: {
      tiles:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tileset-v1.0.0-NghnvuWirfxTx85cH1iqsCpdABTqFi.png',
      map: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/lobby-aOlioJMWo44cf7IaTVQpCZU9RPrpxx.tmj',
      player:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/player-fB1bF09qB6Jk1WleesORLY4aBdvN56.png',
    },
  },
};

export class MainScene extends AScene<MainSceneConfig> {
  public inventoryTables: InventoryTableTiles[] = [];
  public petCages: PetCageTiles[] = [];
  public kennelDoor: KennelDoorTiles | null = null;
  public bed: BedTiles | null = null;
  public plant: PlantTiles | null = null;

  public itemsOnTables: {
    [key: string]: ItemTiles;
  } = {};

  constructor() {
    super({
      name: 'Main',
      config,
    });
  }

  protected override handleResize(gameSize: Phaser.Structs.Size): void {
    super.handleResize(gameSize);
  }

  protected override loadAssets(): void {
    super.loadAssets();
  }

  public override async create() {
    await super.create();

    // inventoryTables.forEach((table, i) => {
    //   table.addItemOnTable({
    //     itemId: (i + 1).toString(),
    //     ctor: GearTiles,
    //   });
    // });

    // inventoryTables.slice(inventoryTables.length - 2).forEach((table) => {
    //   table.lock();
    // });

    // Load the objects
    {
      this.inventoryTables =
        this.getTilemapService().getObjectsByType<InventoryTableTiles>(
          'table',
          InventoryTableTiles,
          true,
        );

      this.petCages = this.getTilemapService().getObjectsByType(
        'pet',
        PetCageTiles,
      );

      this.petCages[0].addPetOnCage({
        itemId: '31',
        ctor: PetTiles,
      });

      this.petCages[1].addPetOnCage({
        itemId: '32',
        ctor: PetTiles,
      });

      this.kennelDoor = this.getTilemapService().getObjectsByType(
        'kennel-door',
        KennelDoorTiles,
      )[0];

      this.bed = this.getTilemapService().getObjectsByType('bed', BedTiles)[0];

      this.plant = this.getTilemapService().getObjectsByType(
        'plant',
        PlantTiles,
      )[0];
    }

    this.kennelDoor.setVisible(!unlockedKennel);

    // Setup interactions
    {
      this.player?.addInteractiveObjects(this.inventoryTables);
      this.player?.addInteractiveObjects(this.petCages);
      this.player?.addInteractiveObjects([
        this.kennelDoor,
        this.bed,
        this.plant,
      ]);
    }

    this.applyInventoryTableUnlocks();
    this.applyInventory();
    this.applyPets();
  }

  protected applyPets() {
    this.petCages.forEach((pet, i) => {
      if (i < unlockedPets) {
        pet.unlock();
      } else {
        pet.lock();
      }
    });
  }

  protected applyInventoryOnOneTable(itemId: string, tableIndex: number) {
    // If the item is already on the table, skip it
    if (
      this.itemsOnTables[tableIndex] &&
      this.itemsOnTables[tableIndex].itemId === itemId
    ) {
      return;
    }

    // If the item is different, remove the old one
    if (this.itemsOnTables[tableIndex]) {
      this.inventoryTables[tableIndex].removeItemFromTable();
    }

    if (itemId === '0') {
      return;
    }

    this.itemsOnTables[tableIndex] = this.inventoryTables[
      tableIndex
    ].addItemOnTable({
      itemId,
      ctor: GearTiles,
    });
  }

  // Look at the inventory and add items to the tables if needed / replace items
  protected applyInventory() {
    // 6 first slots on the first 6 tables
    inventory
      .slice(0, 6)
      .forEach((itemId, i) =>
        this.applyInventoryOnOneTable(itemId.toString(), i),
      );

    // 6 next slots on the next 6 tables unlockable by level
    inventory
      .slice(10, 16)
      .forEach((itemId, i) =>
        this.applyInventoryOnOneTable(itemId.toString(), i + 6),
      );
  }

  protected applyInventoryTableUnlocks() {
    // Unlock inventory slots based on level
    if (level < 14) {
      this.inventoryTables[6].lock();
      this.inventoryTables[7].lock();
    }
    if (level < 18) {
      this.inventoryTables[8].lock();
      this.inventoryTables[9].lock();
    }
    if (level < 22) {
      this.inventoryTables[10].lock();
      this.inventoryTables[11].lock();
    }
  }

  protected override setupInteractionControls(): void {}

  public override update() {
    super.update();
  }
}
