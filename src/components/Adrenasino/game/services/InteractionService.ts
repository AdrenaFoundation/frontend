import { GameConfig } from '../config/GameConfig';

export class InteractionService {
  private chestPosition: Phaser.Math.Vector2;

  constructor(chestX: number, chestY: number) {
    this.chestPosition = new Phaser.Math.Vector2(chestX, chestY);
  }

  isNearChest(playerX: number, playerY: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      playerX,
      playerY,
      this.chestPosition.x,
      this.chestPosition.y,
    );

    return distance <= GameConfig.interactionDistance;
  }

  getChestPosition(): Phaser.Math.Vector2 {
    return this.chestPosition;
  }

  setChestPosition(x: number, y: number): void {
    this.chestPosition.set(x, y);
  }
}
