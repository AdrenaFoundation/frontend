export class ItemInfoWindow extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, name: string, effect: string) {
    super(scene);

    const width = 180;
    const padding = 10;
    let currentY = padding;

    const nameLabel = scene.add.text(padding, currentY, 'Name: ', {
      fontSize: '12px',
      color: '#FFFF00', // yellow
    });

    const nameValue = scene.add.text(
      nameLabel.x + nameLabel.width,
      currentY,
      name,
      {
        fontSize: '12px',
        color: '#FFFFFF', // white
        wordWrap: { width: width - padding * 2 - nameLabel.width },
      },
    );

    currentY += Math.max(nameLabel.height, nameValue.height) + 4;

    const effectLabel = scene.add.text(padding, currentY, 'Effect: ', {
      fontSize: '12px',
      color: '#FFFF00', // yellow
    });

    const effectValue = scene.add.text(
      effectLabel.x + effectLabel.width,
      currentY,
      effect,
      {
        fontSize: '12px',
        color: '#FFFFFF', // white
        wordWrap: { width: width - padding * 2 - effectLabel.width },
      },
    );

    currentY += Math.max(effectLabel.height, effectValue.height) + padding;

    this.bg = scene.add
      .rectangle(0, 0, width, currentY, 0x000000, 0.8)
      .setOrigin(0)
      .setStrokeStyle(1, 0xffffff);

    this.add([this.bg, nameLabel, nameValue, effectLabel, effectValue]);

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
