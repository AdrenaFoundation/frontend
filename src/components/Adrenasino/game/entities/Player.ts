import { Scene } from 'phaser';

import { GameConfig } from '../config/GameConfig';

export class Player {
  private scene: Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player', 1);
    this.sprite.setCollideWorldBounds(true);

    if (!scene.input?.keyboard) {
      throw new Error('Keyboard input is not available');
    }

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.createAnimations();
  }

  private createAnimations(): void {
    const { animations } = GameConfig;

    this.scene.anims.create({
      key: 'left',
      frames: this.scene.anims.generateFrameNumbers(
        'player',
        animations.playerFrames.left,
      ),
      frameRate: animations.frameRate,
      repeat: animations.repeat,
    });

    this.scene.anims.create({
      key: 'right',
      frames: this.scene.anims.generateFrameNumbers(
        'player',
        animations.playerFrames.right,
      ),
      frameRate: animations.frameRate,
      repeat: animations.repeat,
    });

    this.scene.anims.create({
      key: 'up',
      frames: this.scene.anims.generateFrameNumbers(
        'player',
        animations.playerFrames.up,
      ),
      frameRate: animations.frameRate,
      repeat: animations.repeat,
    });

    this.scene.anims.create({
      key: 'down',
      frames: this.scene.anims.generateFrameNumbers(
        'player',
        animations.playerFrames.down,
      ),
      frameRate: animations.frameRate,
      repeat: animations.repeat,
    });
  }

  public update(): void {
    this.sprite.setVelocity(0);

    // Handle movement based on controls
    if (this.cursors.left.isDown) {
      this.sprite.setVelocityX(-GameConfig.playerSpeed);
      this.sprite.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.sprite.setVelocityX(GameConfig.playerSpeed);
      this.sprite.anims.play('right', true);
    }

    if (this.cursors.up.isDown) {
      this.sprite.setVelocityY(-GameConfig.playerSpeed);
      // Only play up animation if we're not moving left/right
      if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
        this.sprite.anims.play('up', true);
      }
    } else if (this.cursors.down.isDown) {
      this.sprite.setVelocityY(GameConfig.playerSpeed);
      // Only play down animation if we're not moving left/right
      if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
        this.sprite.anims.play('down', true);
      }
    }

    // If no keys are pressed, stop animations
    if (
      !this.cursors.left.isDown &&
      !this.cursors.right.isDown &&
      !this.cursors.up.isDown &&
      !this.cursors.down.isDown
    ) {
      this.sprite.anims.stop();
    }
  }

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }

  public addCollider(object: Phaser.GameObjects.GameObject): void {
    this.scene.physics.add.collider(this.sprite, object);
  }
}
