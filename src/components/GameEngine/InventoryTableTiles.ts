import { AScene } from './AScene';
import { ItemInfoWindow } from './ItemInfoWindow';
import ItemTiles from './ItemTiles';
import ObjectTiles from './ObjectTiles';

class InventoryTableTiles extends ObjectTiles {
  private infoWindow: ItemInfoWindow | null = null;

  private interactionKey: Phaser.Input.Keyboard.Key | null = null;

  protected ItemTiles: ItemTiles | null = null;

  public override handleInteractionOn() {
    if (this.infoWindow) {
      this.handleInteractionOff();
    }

    // Set info window
    {
      this.infoWindow = new ItemInfoWindow({
        scene: this.scene,
        name: 'Sword of Devil',
        effect: '+0.5bps of trading fee',
        hint: '[E] to equip', // TODO: change depending on the type of item
      });

      const { x, y } = this.getCenter();

      const { width, height } = this.infoWindow.getSize();

      this.infoWindow.setPosition(x - width / 2, y - 50 - height / 2);

      this.infoWindow.setVisible(true);
    }

    {
      if (this.scene.input.keyboard) {
        this.interactionKey = this.scene.input.keyboard.addKey('E');

        this.interactionKey.on('down', () => {
          console.log('DO EQUIP!'); // TODO: change depending on the type of item
        });
      }
    }
  }

  public override handleInteractionOff() {
    console.log('handleInteractionOff called on InventoryTableTiles');
    this.infoWindow?.destroy(true);
    this.infoWindow = null;
    this.interactionKey?.destroy();
    this.interactionKey = null;
  }

  public override updateInteraction() {}

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
    if (this.ItemTiles) {
      this.ItemTiles.destroy();
    }

    this.ItemTiles = new ctor({
      scene: this.scene,
      position: this.getCenter(),
      itemId,
      offsetX,
      offsetY,
      depth,
    });
  }

  public removeItemFromTable(): void {
    if (this.ItemTiles) {
      this.ItemTiles.destroy();
      this.ItemTiles = null;
    }
  }
}

export default InventoryTableTiles;
