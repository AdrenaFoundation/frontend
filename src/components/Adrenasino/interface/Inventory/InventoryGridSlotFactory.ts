import OverlapSizer from 'phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer';

import { MainScene } from '../../game/scenes/MainScene';
import { InventoryGridContext } from './InventoryGridContext';
import InventoryGridSlot from './InventoryGridSlot';

export default class InventoryGridSlotFactory {
  public static create(
    scene: MainScene,
    amount: number,
    createSlotSprite: (scene: MainScene) => OverlapSizer,
  ) {
    const slots = [];

    for (let i = 0; i < amount; i++) {
      const slotSprite = createSlotSprite(scene);

      const slot = new InventoryGridSlot(
        scene,
        slotSprite,
        InventoryGridContext.inventory,
      );

      slots.push(slot);
    }

    return slots;
  }
}
