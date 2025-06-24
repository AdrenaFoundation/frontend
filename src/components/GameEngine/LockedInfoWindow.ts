import { Scene } from 'phaser';

export class LockedInfoWindow extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;

  constructor(scene: Scene, reason: string = 'Unlock it to use this table') {
    super(scene);

    const padding = 10;
    let currentY = padding;

    // Title: "Locked" in yellow
    const titleText = scene.add.text(0, 0, 'Inventory Slot Locked', {
      fontSize: '12px',
      color: '#FFFF00',
    });

    titleText.setPosition(padding, currentY);
    this.add(titleText);
    currentY += titleText.height + 4;

    // Reason: white
    const reasonText = scene.add.text(0, 0, reason, {
      fontSize: '12px',
      color: '#FFFFFF',
      wordWrap: { width: 180 - padding * 2 },
    });

    reasonText.setPosition(padding, currentY);
    this.add(reasonText);
    currentY += reasonText.height + padding;

    // Calculate width based on longest text
    const width = Math.max(titleText.width, reasonText.width) + padding * 2;

    // Background with stroke
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
