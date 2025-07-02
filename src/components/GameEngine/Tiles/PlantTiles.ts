import SimpleTextWindow from '../Windows/SimpleTextWindow';
import ObjectTiles from './ObjectTiles';

export default class PlantTiles extends ObjectTiles {
  private window: SimpleTextWindow | null = null;

  public override handleInteractionOn() {
    if (this.window) {
      this.handleInteractionOff();
    }

    const { x, y } = this.getCenter();

    this.window = new SimpleTextWindow(this.scene, {
      text: 'Just a plant...',
      centerX: x,
      y: y - 50,
    });
  }

  public override handleInteractionOff() {
    this.window?.destroy();
    this.window = null;
  }

  public override updateInteraction() {}
}
