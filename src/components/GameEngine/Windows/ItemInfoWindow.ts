import { Scene } from 'phaser';

export class ItemInfoWindow extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;

  constructor({
    scene,
    name,
    effect,
    hint,
  }: {
    scene: Scene;
    name: string;
    effect: string;
    hint: string;
  }) {
    super(scene);

    const width = 220;
    const padding = 10;
    let currentY = padding;

    const nameLabel = scene.add.text(padding, currentY, 'Name', {
      fontSize: '12px',
      color: '#FFFF00',
    });

    currentY += nameLabel.height + 5;

    const nameValue = scene.add.text(padding, currentY, name, {
      fontSize: '12px',
      color: '#FFFFFF',
      wordWrap: { width: width - padding * 2 },
    });

    currentY += nameValue.height + 10;

    const effectLabel = scene.add.text(padding, currentY, 'Effect', {
      fontSize: '12px',
      color: '#FFFF00',
    });

    currentY += effectLabel.height + 5;

    const effectValue = scene.add.text(padding, currentY, effect, {
      fontSize: '12px',
      color: '#FFFFFF',
      wordWrap: { width: width - padding * 2 },
    });

    currentY += effectValue.height + 10;

    const separator = scene.add
      .rectangle(padding, currentY, width - padding * 2, 1, 0xaaaaaa)
      .setOrigin(0, 0);

    currentY += 6;

    const hintText = scene.add.text(padding, currentY, hint, {
      fontSize: '11px',
      color: '#aaaaaa',
      wordWrap: { width: width - padding * 2 },
    });

    currentY += hintText.height + padding;

    this.bg = scene.add
      .rectangle(0, 0, width, currentY, 0x000000, 0.8)
      .setOrigin(0)
      .setStrokeStyle(1, 0xffffff);

    this.add([
      this.bg,
      nameLabel,
      nameValue,
      effectLabel,
      effectValue,
      separator,
      hintText,
    ]);

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
