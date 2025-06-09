import MainScene from '../../scenes/MainScene.ts';
// import { centerVH } from '../../utils/Utils';
// import InventoryWindowManager from "../managers/InventoryWindowManager.ts";
import InventoryGridFactory from './InventoryGridFactory.ts';
import InventoryGridSlotFactory from './InventoryGridSlotFactory.ts';
import InventoryGridSlotSpriteFactory from './InventoryGridSlotSpriteFactory.ts';
// import InventoryGridFilterFactory from "./InventoryGridFilterFactory.ts";

export default class InventoryWindow {
  static create(scene: MainScene) {
    const backgroundImg = scene.add.image(
      0,
      0,
      'A_inventory_window',
      'inventory.png',
    );

    const inventoryWindow = scene.rexUI.add.sizer({
      x: 150,
      y: 150,
      draggable: true,
      width: backgroundImg.displayWidth,
      height: backgroundImg.displayHeight,
      orientation: 'x',
    });

    inventoryWindow.addBackground(backgroundImg);

    // centerVH(inventoryWindow);
    const slots = InventoryGridSlotFactory.create(
      scene,
      30,
      InventoryGridSlotSpriteFactory.create,
    );

    const inventoryGridManager = InventoryGridFactory.create(scene, slots);

    inventoryWindow.add(inventoryGridManager, {
      expand: false,
    });

    inventoryWindow.layout();

    return {
      window: inventoryWindow,
      slots: slots,
    };
  }
}
