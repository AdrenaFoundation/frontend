import ObjectTiles from './ObjectTiles';

export default class PlantTiles extends ObjectTiles {
  private container: Phaser.GameObjects.Container | null = null;
  private bg: Phaser.GameObjects.Rectangle | null = null;

  public override handleInteractionOn() {
    if (this.container) {
      this.handleInteractionOff();
    }

    const padding = 10;
    const textContent = 'Just a plant...';

    const text = this.scene.add.text(padding, padding, textContent, {
      fontSize: '12px',
      color: '#FFFFFF',
      wordWrap: { width: 180 - padding * 2 },
    });

    const width = text.width + padding * 2;
    const height = text.height + padding * 2;

    const bg = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0)
      .setStrokeStyle(1, 0xffffff);

    const container = this.scene.add.container(0, 0, [bg, text]);
    container.setDepth(9999);

    const { x, y } = this.getCenter();
    container.setPosition(x - width / 2, y - 30 - height / 2);

    this.container = container;
    this.bg = bg;
  }

  public override handleInteractionOff() {
    this.container?.destroy(true);
    this.container = null;
    this.bg = null;
  }

  public override updateInteraction() {}
}
