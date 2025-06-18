import { MainScene } from './MainScene';

class UIService {
  private scene: MainScene;
  private interactionText: Phaser.GameObjects.Text | undefined;
  private titleText: Phaser.GameObjects.Text | undefined;
  private instructionsText: Phaser.GameObjects.Text | undefined;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public createTitle(): void {
    const { width, ui } = this.scene.config;

    this.titleText = this.scene.add
      .text(width / 2, 50, 'Which name should I use?', ui.title)
      .setOrigin(0.5)
      .setDepth(100);
  }

  public createInstructions(): void {
    const { width, height, ui } = this.scene.config;

    this.instructionsText = this.scene.add
      .text(
        width / 2,
        height - 68,
        'Use arrow keys to move, press I near chest to open inventory',
        ui.instructions,
      )
      .setOrigin(0.5)
      .setDepth(100);
  }

  public createInteractionText(): void {
    const { width, height, ui } = this.scene.config;

    this.interactionText = this.scene.add.text(
      width / 2 - 50,
      height / 2 - 100,
      'Press I to open',
      ui.interaction,
    );
    this.interactionText.setOrigin(0.5);
    this.interactionText.setDepth(1000);
    this.interactionText.setVisible(false);
  }

  public updateInteractionText(
    playerX: number,
    playerY: number,
    isVisible: boolean,
    isInventoryOpen: boolean,
  ): void {
    if (!this.interactionText) return;

    if (isVisible && !isInventoryOpen) {
      this.interactionText.setPosition(playerX, playerY - 40);
      this.interactionText.setVisible(true);
    } else {
      this.interactionText.setVisible(false);
    }
  }

  public updateResponsivePosition(width: number, height: number): void {
    this.repositionTitleToCenterOfScreen(width);
    this.repositionInstructionsToBottomOfScreen(width, height);
    this.repositionInteractionTextNearPlayerIfVisible();
  }

  private repositionTitleToCenterOfScreen(width: number): void {
    if (this.titleText) {
      this.titleText.setPosition(width / 2, 50);
    }
  }

  private repositionInstructionsToBottomOfScreen(
    width: number,
    height: number,
  ): void {
    if (this.instructionsText) {
      this.instructionsText.setPosition(width / 2, height - 68);
    }
  }

  private repositionInteractionTextNearPlayerIfVisible(): void {
    if (this.interactionText && this.interactionText.visible) {
      const playerPos = this.getPlayerPosition();
      if (playerPos) {
        this.interactionText.setPosition(playerPos.x, playerPos.y - 40);
      }
    }
  }

  private getPlayerPosition(): { x: number; y: number } | null {
    // This would need to be connected to the player service
    // For now, return null - this can be enhanced later
    return null;
  }

  public getInteractionText(): Phaser.GameObjects.Text | undefined {
    return this.interactionText;
  }
}

export default UIService;
