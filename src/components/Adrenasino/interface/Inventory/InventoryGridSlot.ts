import OverlapSizer from 'phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer';

import { MainScene } from '../../game/scenes/MainScene';
import Item, { ItemConfig } from '../Item/Item';
import { InventoryGridContext } from './InventoryGridContext';

export default class InventoryGridSlot {
  public slotIndex: number = 0;
  private currentItem: Item | null = null;

  constructor(
    public scene: MainScene,
    public slotSprite: OverlapSizer,
    public slotType: InventoryGridContext,
  ) {
    this.slotSprite.setData('slotIndex', this.slotIndex);
    this.slotSprite.setData('slotType', slotType);
  }

  public addItem(item: ItemConfig) {
    if (this.slotSprite.getData('hasItem')) {
      console.warn('Slot already has an item. Cannot add another item.');
      return null;
    }

    const itemInstance = new Item(this.scene, this, item);
    this.currentItem = itemInstance;

    this.slotSprite.add(this.currentItem.itemSprite, {
      expand: false,
    });

    this.slotSprite.layout();

    this.slotSprite.setInteractive();

    this.slotSprite.on('pointerdown', () => {
      if (!this.currentItem) {
        console.warn('No item in this slot to interact with.');
        return;
      }

      console.log('Slot clicked:', this.currentItem);

      const nextSlotIndex = (this.slotIndex + 1) % 30;

      this.currentItem.moveToSlot(nextSlotIndex);
    });

    this.slotSprite.setData('hasItem', true);
    return item;
  }

  public removeItem() {
    this.currentItem = null;

    this.slotSprite.removeAll(true);

    this.slotSprite.setData('hasItem', false);
  }

  public setSlotIndex(slotIndex: number) {
    this.slotIndex = slotIndex;
    this.slotSprite.setData('slotIndex', this.slotIndex);
  }

  public getItem() {
    return this.currentItem;
  }

  // hideItem() {
  //   this.itemManager?.hideItem();
  // }

  // showItem() {
  //   this.itemManager?.showItem();
  // }

  // getItem() {
  //   return this.itemManager?.getItem();
  // }

  // hasItem() {
  //   return this.itemManager?.hasItem();
  // }

  // showItemInfo() {
  //   this.itemTooltipManager?.showItemTooltip();
  // }

  // handlePointerOut(activePointer: Phaser.Input.Pointer) {
  //   this.pointerEventManager?.handlePointerOut(activePointer);
  // }
  // handlePointerOver(activePointer: Phaser.Input.Pointer) {
  //   this.pointerEventManager?.handlePointerOut(activePointer);
  // }

  // registerManagers(
  //   pointerEventManager: PointerEventManager,
  //   itemManager: ItemManager,
  //   dragManager: DragManager,
  //   itemTooltipManager: ItemTooltipManager
  // ) {
  //   this.pointerEventManager = pointerEventManager;
  //   this.itemManager = itemManager;
  //   this.dragManager = dragManager;
  //   this.itemTooltipManager = itemTooltipManager;
  // }
}
