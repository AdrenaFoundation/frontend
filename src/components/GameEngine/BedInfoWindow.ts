import { Scene } from 'phaser';

type Variant = 'sleep' | 'degen';

const allDegenSentences = [
  'What if the chart moves while I’m asleep?',
  'If I sleep, who watches the 5m chart?',
  'Only bears sleep. I’m bullish.',
  'Still coping from my last entry.',
  'Sleeping is how I missed the last 10x.',
  'If I close my eyes, the market dumps. Proven.',
  'Resting is for people in profit.',
  'My bedtime got liquidated.',
  'Just one more trade, I swear.',
  'No sleep till next bull run.',
];

export class BedInfoWindow extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private hintText: Phaser.GameObjects.Text | null = null;
  private separator: Phaser.GameObjects.Rectangle | null = null;
  private currentY: number = 0;
  private readonly padding = 10;
  private readonly infoWindowWidth = 180;
  private remainingDegenSentences: string[] = Phaser.Utils.Array.Shuffle([
    ...allDegenSentences,
  ]);

  constructor({ scene, variant }: { scene: Scene; variant: Variant }) {
    super(scene);

    this.bg = scene.add
      .rectangle(0, 0, this.infoWindowWidth, 10, 0x000000, 0.8)
      .setOrigin(0)
      .setStrokeStyle(1, 0xffffff);
    this.add(this.bg);

    this.titleText = scene.add.text(0, 0, '', {
      fontSize: '12px',
      color: '#FFFF00',
      wordWrap: { width: this.infoWindowWidth - this.padding * 2 },
    });
    this.add(this.titleText);

    this.setDepth(9999);
    scene.add.existing(this);

    this.setVariant(variant);
  }

  public setVariant(variant: Variant) {
    this.titleText.setText('');
    this.hintText?.destroy();
    this.separator?.destroy();
    this.hintText = null;
    this.separator = null;
    this.currentY = this.padding;

    let title: string;
    let showHint = true;

    if (variant === 'sleep') {
      title = 'My Bed';
    } else {
      if (this.remainingDegenSentences.length === 0) {
        title = 'You win. I surrender. — Dev';
        showHint = false;
      } else {
        title = this.remainingDegenSentences.pop()!;
      }
    }

    const hint = variant === 'sleep' ? '[E] to sleep' : "[E] but I'm sleepy...";

    this.titleText.setText(title);
    this.titleText.setColor(variant === 'sleep' ? '#FFFF00' : '#FFFFFF');
    this.titleText.setPosition(this.padding, this.currentY);
    this.currentY += this.titleText.height + 6;

    if (showHint) {
      this.separator = this.scene.add
        .rectangle(
          this.padding,
          this.currentY,
          this.infoWindowWidth - this.padding * 2,
          1,
          0xaaaaaa,
        )
        .setOrigin(0, 0);
      this.add(this.separator);
      this.currentY += 6;

      this.hintText = this.scene.add.text(this.padding, this.currentY, hint, {
        fontSize: '11px',
        color: '#aaaaaa',
      });
      this.add(this.hintText);
      this.currentY += this.hintText.height + this.padding;
    } else {
      this.currentY += this.padding;
    }

    this.bg.setSize(this.infoWindowWidth, this.currentY);
  }

  public getSize(): { width: number; height: number } {
    return {
      width: this.bg.displayWidth,
      height: this.bg.displayHeight,
    };
  }
}
