import { AScene } from './AScene';
import ItemTiles from './ItemTiles';
import ObjectTiles from './ObjectTiles';

class InventoryTableTiles extends ObjectTiles {
  protected itemTiles: ItemTiles | null = null;

  // Propagate interactions to Items
  public override handleInteractionOn() {
    this.itemTiles?.handleInteractionOn({
      position: this.getCenter(),
    });
  }

  public override handleInteractionOff() {
    this.itemTiles?.handleInteractionOff();
  }

  public override updateInteraction() {
    this.itemTiles?.updateInteraction();
  }

  public addItemOnTable<T extends ItemTiles>({
    itemId,
    offsetX = 0.5,
    offsetY = 0.5,
    depth = 10,
    ctor,
  }: {
    itemId: string;
    offsetX?: number;
    offsetY?: number;
    depth?: number;
    ctor: new (p: {
      scene: AScene;
      itemId: string;
      position: Phaser.Math.Vector2;
      offsetX?: number;
      offsetY?: number;
      depth?: number;
    }) => T;
  }): void {
    if (this.itemTiles) {
      this.itemTiles.destroy();
    }

    console.log('Adding item from table:');

    this.itemTiles = new ctor({
      scene: this.scene,
      position: this.getCenter(),
      itemId,
      offsetX,
      offsetY,
      depth,
    });
  }

  public removeItemFromTable(): void {
    if (this.itemTiles) {
      console.log('Removing item from table:', this.itemTiles);

      this.itemTiles.destroy();
      this.itemTiles = null;
    }
  }
}

export default InventoryTableTiles;
