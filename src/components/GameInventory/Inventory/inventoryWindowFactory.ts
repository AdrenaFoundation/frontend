import OverlapSizer from 'phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer';
import Sizer from 'phaser3-rex-plugins/templates/ui/sizer/Sizer';

import { centerVH } from '@/utils';

import { AScene } from '../../GameEngine/AScene';
import InventoryService from '../InventoryService';
import InventoryGridFactory from './InventoryGridFactory';
import InventoryGridSlot from './InventoryGridSlot';
import InventoryGridSlotFactory from './InventoryGridSlotFactory';
import InventoryGridSlotSpriteFactory from './inventoryGridSlotSpriteFactory';

type SlotSpriteFactory = (scene: AScene) => OverlapSizer;

export default class InventoryWindow {
  private static inventoryWindow: Sizer | null = null;
  private static inventoryOpen: boolean = false;

  public static create(scene: AScene, inventoryService: InventoryService) {
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
    }) as Sizer;

    this.inventoryWindow.addBackground(backgroundImg);

    centerVH(this.inventoryWindow);

    const slots: InventoryGridSlot[] = InventoryGridSlotFactory.create(
      scene,
      30,
      InventoryGridSlotSpriteFactory.create as SlotSpriteFactory,
      inventoryService,
    );

    const inventoryGridManager = InventoryGridFactory.create(
      scene,
      slots,
    ) as Phaser.GameObjects.GameObject;

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
