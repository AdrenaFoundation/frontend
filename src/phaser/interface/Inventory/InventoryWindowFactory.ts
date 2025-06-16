import { centerVH } from '@/phaser/utils/Utils.ts';
import MainScene from '../../scenes/MainScene.ts';
// import { centerVH } from '../../utils/Utils';
// import InventoryWindowManager from "../managers/InventoryWindowManager.ts";
import InventoryGridFactory from './InventoryGridFactory.ts';
import InventoryGridSlotFactory from './InventoryGridSlotFactory.ts';
import InventoryGridSlotSpriteFactory from './InventoryGridSlotSpriteFactory.ts';

export default class InventoryWindow {
  private static inventoryWindow: any | null = null;
  private static inventoryOpen: boolean = false;

  static create(scene: MainScene) {
    const backgroundImg = scene.add.image(
      0,
      0,
      'A_inventory_window',
      'inventory.png',
    );

    this.inventoryWindow = scene.rexUI.add.sizer({
      x: 150,
      y: 150,
      draggable: true,
      width: backgroundImg.displayWidth,
      height: backgroundImg.displayHeight,
      orientation: 'x',
    });

    this.inventoryWindow.addBackground(backgroundImg);

    // centerVH(this.inventoryWindow);

    const slots = InventoryGridSlotFactory.create(
      scene,
      30,
      InventoryGridSlotSpriteFactory.create,
    );

    const inventoryGridManager = InventoryGridFactory.create(scene, slots);

    this.inventoryWindow.add(inventoryGridManager, {
      expand: false,
    });

    this.inventoryWindow.layout();

    return {
      window: this.inventoryWindow,
      slots: slots,
    };
  }
}
