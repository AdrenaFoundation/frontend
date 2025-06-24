import { KennelButtonInfoWindow } from './KennelButtonInfoWindow';
import ObjectTiles from './ObjectTiles';

export default class KennelButtonTiles extends ObjectTiles {
  private infoWindow: KennelButtonInfoWindow | null = null;

  private interactionKey: Phaser.Input.Keyboard.Key | null = null;

  public override handleInteractionOn() {
    if (this.infoWindow) {
      this.handleInteractionOff();
    }

    // Set info window
    {
      this.infoWindow = new KennelButtonInfoWindow({
        scene: this.scene,
        variant: 'full', // or 'slots'
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
