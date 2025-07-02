import { ItemInfoWindow } from '../Windows/ItemInfoWindow';
import ItemTiles from './ItemTiles';

class GearTiles extends ItemTiles {
  private infoWindow: ItemInfoWindow | null = null;

  private interactionKey: Phaser.Input.Keyboard.Key | null = null;

  public override handleInteractionOn({
    position,
  }: {
    position: Phaser.Math.Vector2;
  }) {
    if (this.infoWindow) {
      this.handleInteractionOff();
    }

    // Set info window
    {
      this.infoWindow = new ItemInfoWindow({
        scene: this.scene,
        name: this.itemName,
        effect: this.itemEffect ?? '',
        hint: '[E] to equip',
      });

      const { x, y } = position;

      const { width, height } = this.infoWindow.getSize();

      this.infoWindow.setPosition(x - width / 2, y - 70 - height / 2);

      this.infoWindow.setVisible(true);
    }

    {
      if (this.scene.input.keyboard) {
        this.interactionKey = this.scene.input.keyboard.addKey('E');

        this.interactionKey.on('down', () => {
          console.log('DO EQUIP!'); // TODO: Do the equip logic
        });
      }
    }
  }

  public override handleInteractionOff() {
    this.infoWindow?.destroy(true);
    this.infoWindow = null;
    this.interactionKey?.destroy();
    this.interactionKey = null;
  }

  public override updateInteraction() {}
}

export default GearTiles;
