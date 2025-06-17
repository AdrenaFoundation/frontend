import { GameConfig } from '../config/GameConfig';

export class InteractionService {
  private chestPosition: Phaser.Math.Vector2;

  constructor(chestX: number, chestY: number) {
    this.chestPosition = new Phaser.Math.Vector2(chestX, chestY);
  }

  public isNearChest(playerX: number, playerY: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      playerX,
      playerY,
      this.chestPosition.x,
      this.chestPosition.y,
    );

    return distance <= GameConfig.interactionDistance;
  }

  public getChestPosition(): Phaser.Math.Vector2 {
    return this.chestPosition;
  }

  public setChestPosition(x: number, y: number): void {
    this.chestPosition.set(x, y);
  }
}
