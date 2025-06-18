import OverlapSizer from 'phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer';

import { AScene } from '../AScene';

export default class InventoryGridSlotSpriteFactory {
  public static create(scene: AScene) {
    const slotSpriteBg = scene.add.image(
      0,
      0,
      'A_inventory_window',
      'slot-default.png',
    );

    const slotSprite = scene.rexUI.add.overlapSizer({
      x: 0,
      y: 0,
      width: slotSpriteBg.displayWidth,
      height: slotSpriteBg.displayHeight,
    }) as OverlapSizer;

    slotSprite.addBackground(slotSpriteBg);
    return slotSprite;
  }
}
