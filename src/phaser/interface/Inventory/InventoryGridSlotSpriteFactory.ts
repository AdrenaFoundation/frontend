import MainScene from '../../scenes/MainScene.ts';

export default class InventoryGridSlotSpriteFactory {
  static create(scene: MainScene) {
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
    });

    slotSprite.addBackground(slotSpriteBg);
    return slotSprite;
  }
}
