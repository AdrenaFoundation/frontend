import { Scene } from 'phaser';

type Variant = 'full' | 'slots';

export class KennelDoorInfoWindow extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;

  constructor({ scene, variant }: { scene: Scene; variant: Variant }) {
    super(scene);

    const width = 180;
    const padding = 10;
    let currentY = padding;

    const title = 'Kennel';
    const description =
      variant === 'full'
        ? 'Pay 5000 ADX to unlock'
        : 'Pay 500 ADX to unlock more slots';
    const hint = '[E] to buy';

    const titleText = scene.add.text(padding, currentY, title, {
      fontSize: '12px',
      color: '#FFFF00',
    });
    this.add(titleText);
    currentY += titleText.height + 4;

    const descriptionText = scene.add.text(padding, currentY, description, {
      fontSize: '12px',
      color: '#FFFFFF',
      wordWrap: { width: width - padding * 2 },
    });
    this.add(descriptionText);
    currentY += descriptionText.height + 6;

    const separator = scene.add
      .rectangle(padding, currentY, width - padding * 2, 1, 0xaaaaaa)
      .setOrigin(0, 0);
    this.add(separator);
    currentY += 6;

    const hintText = scene.add.text(padding, currentY, hint, {
      fontSize: '11px',
      color: '#aaaaaa',
    });
    this.add(hintText);
    currentY += hintText.height + padding;

    this.bg = scene.add
      .rectangle(0, 0, width, currentY, 0x000000, 0.8)
      .setOrigin(0)
      .setStrokeStyle(1, 0xffffff);
    this.addAt(this.bg, 0);

    this.setDepth(9999);
    scene.add.existing(this);
  }

  public getSize(): { width: number; height: number } {
    return {
      width: this.bg.width,
      height: this.bg.height,
    };
  }
}
