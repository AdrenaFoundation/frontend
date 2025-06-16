import OverlapSizer from 'phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer';

import { MainScene } from '../../game/scenes/MainScene';
import { InventoryGridContext } from '../Inventory/InventoryGridContext';
import InventoryGridSlot from '../Inventory/InventoryGridSlot';

export interface ItemConfig {
  context: InventoryGridContext;
  quantity: number;
  equipped: boolean;
  slotIndex: number;
  data: {
    id: string;
    name: string;
    description: string;
    image: string;
    type: string;
    rarity: string;
    stats: {
      attack: number;
      defense: number;
      speed: number;
    };
  };
}

export default class Item {
  public itemSprite: OverlapSizer;
  public quantity: ItemConfig['quantity'];
  public equipped: ItemConfig['equipped'];
  public slotIndex: ItemConfig['slotIndex'];
  public context: InventoryGridContext = InventoryGridContext.inventory;
  public data: ItemConfig['data'];
  private currentSlot: InventoryGridSlot | null = null;

  constructor(
    public readonly scene: MainScene,
    public readonly slot: InventoryGridSlot,
    public readonly item: ItemConfig,
  ) {
    this.currentSlot = slot;

    const itemImage = scene.add.image(0, 0, 'A_items', item.data.image);

    const slotSprite = scene.rexUI.add.overlapSizer({
      x: 0,
      y: 0,
      width: itemImage.displayWidth,
      height: itemImage.displayHeight,
    }) as OverlapSizer;

    slotSprite.addBackground(itemImage);

    slotSprite.setScale(0.8);

    this.itemSprite = slotSprite;
    this.context = item.context;
    this.quantity = item.quantity;
    this.equipped = item.equipped;
    this.slotIndex = item.slotIndex;
    this.data = item.data;

    this.itemSprite.setData('slotIndex', item.slotIndex);
    this.itemSprite.setData('context', item.context);
    this.itemSprite.setData('quantity', item.quantity);
    this.itemSprite.setData('equipped', item.equipped);
    this.itemSprite.setData('data', item.data);
  }

  moveToSlot(newSlotIndex: number) {
    const newSlot = this.scene.getInventoryService().getInventoryItems()[
      newSlotIndex
    ];
    if (newSlot.slotSprite.getData('hasItem')) {
      console.warn('Target slot already has an item. Cannot move item.');
      return;
    }

    if (!this.currentSlot) return;

    this.currentSlot.removeItem();

    this.itemSprite.setData('slotIndex', newSlotIndex);
    this.slotIndex = newSlotIndex;

    newSlot.addItem(this.item);
  }

  setSlotIndex(slotIndex: number) {
    this.slotIndex = slotIndex;
    this.itemSprite.setData('slotIndex', slotIndex);
  }

  getItemData() {
    return this.itemSprite.getData('data');
  }
  getQuantity() {
    return this.itemSprite.getData('quantity');
  }
  isEquipped() {
    return this.itemSprite.getData('equipped');
  }
  getSlotIndex() {
    return this.itemSprite.getData('slotIndex');
  }
  getContext() {
    return this.itemSprite.getData('context');
  }

  getItemSprite() {
    return this.itemSprite;
  }
}
