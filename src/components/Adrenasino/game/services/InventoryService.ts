import { Scene } from 'phaser';
import Sizer from 'phaser3-rex-plugins/templates/ui/sizer/Sizer';

import { InventoryGridContext } from '../../interface/Inventory/InventoryGridContext';
import InventoryGridSlot from '../../interface/Inventory/InventoryGridSlot';
import InventoryWindowFactory from '../../interface/Inventory/inventoryWindowFactory';
import { INITIAL_INVENTORY_ITEMS } from '../data/InventoryData';
import { MainScene } from '../scenes/MainScene';

export class InventoryService {
  private scene: Scene;
  private inventoryItems: InventoryGridSlot[] = [];
  private inventoryWindow: Sizer | undefined;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  initializeInventory(): void {
    const inventoryWindow = InventoryWindowFactory.create(
      this.scene as MainScene,
    );
    this.inventoryItems = inventoryWindow.slots as InventoryGridSlot[];
    this.inventoryWindow = inventoryWindow.window || undefined;
    this.inventoryWindow?.setVisible(false);

    this.setupKeyboardControls();
    this.populateInventory();
  }

  private setupKeyboardControls(): void {
    this.scene.input?.keyboard?.on('keydown-I', () => {
      if (this.inventoryWindow) {
        this.inventoryWindow.setVisible(!this.inventoryWindow.visible);
      }
    });
  }

  private populateInventory(): void {
    for (let i = 0; i < INITIAL_INVENTORY_ITEMS.length; i++) {
      const item = INITIAL_INVENTORY_ITEMS[i];
      const slot = this.inventoryItems[item.slotIndex] as InventoryGridSlot;

      if (!slot) {
        console.error(`Slot with index ${item.slotIndex} not found.`);
        continue;
      }

      slot.addItem({
        context: InventoryGridContext.inventory,
        quantity: item.quantity,
        equipped: item.equipped,
        slotIndex: item.slotIndex,
        data: {
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image,
          type: item.type,
          rarity: item.rarity,
          stats: item.stats,
        },
      });
    }
  }

  getInventoryItems(): InventoryGridSlot[] {
    return this.inventoryItems;
  }

  getInventoryWindow(): Sizer | undefined {
    return this.inventoryWindow;
  }

  isInventoryVisible(): boolean {
    return this.inventoryWindow?.visible || false;
  }

  toggleInventory(): void {
    if (this.inventoryWindow) {
      this.inventoryWindow.setVisible(!this.inventoryWindow.visible);
    }
  }
}
