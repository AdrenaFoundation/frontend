import { Scene } from 'phaser';

export default class SimpleTextWindow extends Phaser.GameObjects.Container {
  protected bg: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Scene,
    {
      text,
      maxWidth,
      centerX,
      y = 0,
    }: {
      text: string;
      maxWidth?: number;
      centerX?: number; // Optional X to center around
      y?: number;
    },
  ) {
    super(scene, 0, y);

    const padding = 10;
    let currentY = padding;

    const wordWrapWidth = maxWidth ?? 1000;

    const textObject = scene.add.text(padding, currentY, text, {
      fontSize: '12px',
      color: '#FFFFFF',
      wordWrap: { width: wordWrapWidth - padding * 2 },
    });

    const bgWidth = maxWidth ?? textObject.width + padding * 2;
    currentY += textObject.height + padding;
    const bgHeight = currentY;

    this.bg = scene.add
      .rectangle(0, 0, bgWidth, bgHeight, 0x000000, 0.8)
      .setOrigin(0)
      .setStrokeStyle(1, 0xffffff);

    this.add([this.bg, textObject]);

    // ⬇️ Auto center on X if centerX is provided
    if (centerX !== undefined) {
      this.x = centerX - bgWidth / 2;
    }

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
