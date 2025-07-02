import { BedInfoWindow } from '../Windows/BedInfoWindow';
import ObjectTiles from './ObjectTiles';

export default class BedTiles extends ObjectTiles {
  private infoWindow: BedInfoWindow | null = null;

  private interactionKey: Phaser.Input.Keyboard.Key | null = null;

  public override handleInteractionOn() {
    if (this.infoWindow) {
      this.handleInteractionOff();
    }

    // Set info window
    {
      this.infoWindow = new BedInfoWindow({
        scene: this.scene,
        variant: 'sleep',
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
          this.infoWindow?.setVariant('degen');
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
