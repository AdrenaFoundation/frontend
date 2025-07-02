import { AScene } from '../AScene';
import { LockedPetInfoWindow } from '../Windows/LockedPetInfoWindow';
import SimpleTextWindow from '../Windows/SimpleTextWindow';
import ObjectTiles from './ObjectTiles';
import PetTiles from './PetTiles';

class PetCageTiles extends ObjectTiles {
  protected petTiles: PetTiles | null = null;
  protected locked: boolean = false;

  protected interactionKey: Phaser.Input.Keyboard.Key | null = null;

  protected lockedPetInfoWindow: LockedPetInfoWindow | null = null;
  protected noPetWindow: SimpleTextWindow | null = null;

  public override handleInteractionOn() {
    if (this.locked) {
      // Reset in case
      {
        this.lockedPetInfoWindow?.destroy();
        this.lockedPetInfoWindow = null;
        this.interactionKey?.destroy();
        this.interactionKey = null;
        this.noPetWindow?.destroy();
        this.noPetWindow = null;
      }

      const center = this.getCenter();
      this.lockedPetInfoWindow = new LockedPetInfoWindow(this.scene);

      const { width, height } = this.lockedPetInfoWindow.getSize();

      this.lockedPetInfoWindow.setPosition(
        center.x - width / 2,
        center.y - 50 - height / 2,
      );

      {
        if (this.scene.input.keyboard) {
          this.interactionKey = this.scene.input.keyboard.addKey('E');

          this.interactionKey.on('down', () => {
            console.log('DO BUY!'); // TODO: Do the logic
          });
        }
      }
    } else if (this.petTiles) {
      this.petTiles?.handleInteractionOn({ position: this.getCenter() });
    } else {
      // There is no pet
      const { x, y } = this.getCenter();

      this.noPetWindow = new SimpleTextWindow(this.scene, {
        text: 'This cage is empty...',
        centerX: x,
        y: y - 50,
      });
    }
  }

  public override handleInteractionOff() {
    this.lockedPetInfoWindow?.destroy();
    this.lockedPetInfoWindow = null;

    this.noPetWindow?.destroy();
    this.noPetWindow = null;

    if (!this.locked) {
      this.petTiles?.handleInteractionOff();
    }
  }

  public override updateInteraction() {
    if (!this.locked) {
      this.petTiles?.updateInteraction();
    }
  }

  public addPetOnCage<T extends PetTiles>({
    itemId,
    offsetX,
    offsetY,
    depth = 3,
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
  }): PetTiles {
    if (this.petTiles) {
      this.petTiles.destroy();
    }

    this.petTiles = new ctor({
      scene: this.scene,
      position: this.getCenter(),
      itemId,
      offsetX,
      offsetY,
      depth,
    });

    if (this.locked) {
      this.petTiles.setVisible(false);
    }

    return this.petTiles;
  }

  public removeItemFromTable(): void {
    if (this.petTiles) {
      this.petTiles.destroy();
      this.petTiles = null;
    }
  }

  public lock(): void {
    this.locked = true;

    if (this.petTiles) {
      this.petTiles.handleInteractionOff();
      this.petTiles.setVisible(false);
    }

    this.changeColor(0x887c73);
  }

  public unlock(): void {
    this.locked = false;

    if (this.petTiles) {
      this.petTiles.setVisible(true);
    }

    this.lockedPetInfoWindow?.destroy();
    this.lockedPetInfoWindow = null;

    this.interactionKey?.destroy();
    this.interactionKey = null;

    this.changeColor(0xffffff);
  }
}

export default PetCageTiles;
