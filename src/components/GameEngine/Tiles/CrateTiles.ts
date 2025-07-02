import { CrateInfoWindow } from '../Windows/CrateInfoWindow';
import ItemTiles from './ItemTiles';

class CrateTiles extends ItemTiles {
  private infoWindow: CrateInfoWindow | null = null;

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
      this.infoWindow = new CrateInfoWindow({
        scene: this.scene,
        name: 'Military Crate',
        rarity: 'Rare',
        hint: '[E] to open',
      });

      const { x, y } = position;

      const { width, height } = this.infoWindow.getSize();

      this.infoWindow.setPosition(x - width / 2, y - 50 - height / 2);

      this.infoWindow.setVisible(true);
    }

    {
      if (this.scene.input.keyboard) {
        this.interactionKey = this.scene.input.keyboard.addKey('E');

        this.interactionKey.on('down', () => {
          console.log('DO OPEN!'); // TODO: Do the open logic
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

export default CrateTiles;
