import OverlapSizer from 'phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer';

import { AScene } from '../../GameEngine/AScene';
import InventoryService from '../InventoryService';
import { InventoryGridContext } from './InventoryGridContext';
import InventoryGridSlot from './InventoryGridSlot';

export default class InventoryGridSlotFactory {
  public static create(
    scene: AScene,
    amount: number,
    createSlotSprite: (scene: AScene) => OverlapSizer,
    inventoryService: InventoryService,
  ) {
    const slots = [];

    for (let i = 0; i < amount; i++) {
      const slotSprite = createSlotSprite(scene);

      const slot = new InventoryGridSlot(
        scene,
        slotSprite,
        InventoryGridContext.inventory,
        inventoryService,
      );

      slots.push(slot);
    }

    return slots;
  }
}
