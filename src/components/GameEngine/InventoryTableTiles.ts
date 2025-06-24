import { AScene } from './AScene';
import ItemTiles from './ItemTiles';
import { LockedInfoWindow } from './LockedInfoWindow';
import ObjectTiles from './ObjectTiles';

class InventoryTableTiles extends ObjectTiles {
  protected itemTiles: ItemTiles | null = null;
  protected locked: boolean = false;
  private lockedWindow: LockedInfoWindow | null = null;

  public override handleInteractionOn() {
    if (this.locked) {
      this.lockedWindow?.destroy();

      const center = this.getCenter();
      this.lockedWindow = new LockedInfoWindow(
        this.scene,
        'Reach level 15 to unlock',
      );

      const { width, height } = this.lockedWindow.getSize();

      this.lockedWindow.setPosition(
        center.x - width / 2,
        center.y - 30 - height / 2,
      );
    } else {
      this.itemTiles?.handleInteractionOn({ position: this.getCenter() });
    }
  }

  public override handleInteractionOff() {
    this.lockedWindow?.destroy();
    this.lockedWindow = null;

    if (!this.locked) {
      this.itemTiles?.handleInteractionOff();
    }
  }

  public override updateInteraction() {
    if (!this.locked) {
      this.itemTiles?.updateInteraction();
    }
  }

  public addItemOnTable<T extends ItemTiles>({
    itemId,
    offsetX,
    offsetY,
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

    this.itemTiles = new ctor({
      scene: this.scene,
      position: this.getCenter(),
      itemId,
      offsetX,
      offsetY,
      depth,
    });

    if (this.locked) {
      this.itemTiles.setVisible(false);
    }
  }

  public removeItemFromTable(): void {
    if (this.itemTiles) {
      this.itemTiles.destroy();
      this.itemTiles = null;
    }
  }

  public lock(): void {
    this.locked = true;

    if (this.itemTiles) {
      this.itemTiles.handleInteractionOff();
      this.itemTiles.setVisible(false);
    }

    this.changeColor(0x887c73);
  }

  public unlock(): void {
    this.locked = false;

    if (this.itemTiles) {
      this.itemTiles.setVisible(true);
    }

    this.lockedWindow?.destroy();
    this.lockedWindow = null;

    this.changeColor(0xffffff);
  }
}

export default InventoryTableTiles;
