import Sizer from 'phaser3-rex-plugins/templates/ui/sizer/Sizer';

import { AScene } from './AScene';
import { InventoryGridContext } from './Inventory/InventoryGridContext';
import InventoryGridSlot from './Inventory/InventoryGridSlot';
import InventoryWindowFactory from './Inventory/inventoryWindowFactory';
import { INITIAL_INVENTORY_ITEMS } from './InventoryData';

class InventoryService {
  private scene: AScene;
  private inventoryItems: InventoryGridSlot[] = [];
  private inventoryWindow: Sizer | undefined;

  constructor(scene: AScene) {
    this.scene = scene;
  }

  public initializeInventory(): void {
    const inventoryWindow = InventoryWindowFactory.create(this.scene);

    this.inventoryItems = inventoryWindow.slots as InventoryGridSlot[];
    this.inventoryWindow = inventoryWindow.window || undefined;
    this.inventoryWindow?.setVisible(false);

    this.setupKeyboardControls();
    this.populateInventory();
  }

  private setupKeyboardControls(): void {
    this.scene.input?.keyboard?.on('keydown-I', () => {
      console.log('I key pressed, toggling inventory visibility');

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

  public getInventoryItems(): InventoryGridSlot[] {
    return this.inventoryItems;
  }

  public getInventoryWindow(): Sizer | undefined {
    return this.inventoryWindow;
  }

  public isInventoryVisible(): boolean {
    return this.inventoryWindow?.visible || false;
  }

  public toggleInventory(): void {
    if (this.inventoryWindow) {
      this.inventoryWindow.setVisible(!this.inventoryWindow.visible);
    }
  }
}

export default InventoryService;
