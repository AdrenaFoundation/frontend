import { Scene } from 'phaser';

export class LockedPetInfoWindow extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;

  constructor(scene: Scene) {
    super(scene);

    const padding = 10;
    let currentY = padding;

    const titleText = scene.add.text(0, 0, 'Pet Slot Locked', {
      fontSize: '12px',
      color: '#FFFF00',
    });

    titleText.setPosition(padding, currentY);
    this.add(titleText);
    currentY += titleText.height + 4;

    const reasonText = scene.add.text(
      0,
      0,
      'Pay 500 ADX to unlock 2 pet boxes',
      {
        fontSize: '12px',
        color: '#FFFFFF',
        wordWrap: { width: 180 - padding * 2 },
      },
    );

    reasonText.setPosition(padding, currentY);
    this.add(reasonText);
    currentY += reasonText.height + 6;

    // Add separator line
    const separator = scene.add
      .rectangle(padding, currentY, 180 - padding * 2, 1, 0xaaaaaa)
      .setOrigin(0, 0);
    this.add(separator);
    currentY += 6;

    // Add [E] Buy hint
    const hintText = scene.add.text(padding, currentY, '[E] Buy', {
      fontSize: '11px',
      color: '#aaaaaa',
    });
    this.add(hintText);
    currentY += hintText.height + padding;

    // Calculate total width
    const width =
      Math.max(titleText.width, reasonText.width, hintText.width) + padding * 2;

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
