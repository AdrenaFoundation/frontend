import { ItemInfoWindow } from './ItemInfoWindow';
import ItemTile from './ItemTile';
import ObjectTile from './ObjectTile';

class InventoryTableTile extends ObjectTile {
  private infoWindow: ItemInfoWindow | null = null;

  protected itemTile: ItemTile | null = null;

  public override handleInteractionOn() {
    if (!this.infoWindow) {
      this.infoWindow = new ItemInfoWindow(
        this.scene,
        'Sword of Devil',
        '+0.5bps of trading fee',
      );

      const { x, y } = this.getCenter();

      const { width, height } = this.infoWindow.getSize();

      this.infoWindow.setPosition(x - width / 2, y - 50 - height / 2);
    }

    this.infoWindow.setVisible(true);
  }

  public override handleInteractionOff() {
    this.infoWindow?.destroy();
    this.infoWindow = null;
  }

  public override updateInteraction() {}

  public addItemOnTable(itemId: string): void {
    if (this.itemTile) {
      this.itemTile.destroy();
    }

    this.itemTile = new ItemTile({
      scene: this.scene,
      itemId,
      position: this.getCenter(),
    });
  }

  public removeItemFromTable(): void {
    if (this.itemTile) {
      this.itemTile.destroy();
      this.itemTile = null;
    }
  }
}

export default InventoryTableTile;
