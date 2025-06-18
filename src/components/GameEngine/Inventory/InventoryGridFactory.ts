import GridSizer from 'phaser3-rex-plugins/templates/ui/gridsizer/GridSizer';

import { AScene } from '../AScene';
import InventoryGridSlot from './InventoryGridSlot';

export default class InventoryGridFactory {
  public static create(scene: AScene, slots: InventoryGridSlot[]) {
    const cols = 6;
    const rows = 5;

    const table = scene.rexUI.add.gridSizer({
      column: cols,
      row: rows,
      space: { column: 0, row: 0 },
    }) as GridSizer;

    for (let i = 0; i < slots.length; i++) {
      const itemSlot = slots[i];
      const column = i % cols;
      const row = Math.floor(i / cols);

      itemSlot.setSlotIndex(i);

      table.add(itemSlot.slotSprite, {
        column: column,
        row: row,
        padding: {
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        },
        key: i.toString(),
        align: 'center',
      });
    }

    // We have to sort these because the rexUI plugin adds item slots to the grid column by column, instead of row by row
    // This ensures that slots[index] gives you the correct item slot as if you were counting from left to right
    slots.sort((slotA, slotB) => {
      return slotA.slotIndex - slotB.slotIndex;
    });

    return table;
  }
}
