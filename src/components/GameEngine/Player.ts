import config from '../GameScenes/MainScene/config';
import { AScene } from './AScene';
import ObjectTiles from './Tiles/ObjectTiles';

class Player {
  protected scene: AScene;
  protected sprite: Phaser.Physics.Arcade.Sprite;
  protected cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  protected nameTag: Phaser.GameObjects.Text;

  protected interactiveObjects: ObjectTiles[] = [];
  protected facingDirection: 'up' | 'down' | 'left' | 'right' = 'down';
  protected facedObject: ObjectTiles | null = null;

  public playerColliders: {
    collider: Phaser.Physics.Arcade.Collider;
    object: Phaser.GameObjects.GameObject;
  }[] = [];

  constructor({
    scene,
    startingPosition,
    nickname,
    showNickname = false,
  }: {
    scene: AScene;
    startingPosition: Phaser.Math.Vector2;
    nickname: string;
    showNickname?: boolean;
  }) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(
      startingPosition.x,
      startingPosition.y,
      'player',
      1,
    );
    this.sprite.setScale(1);
    this.sprite.setDepth(4);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setSize(16, 16);

    if (!scene.input?.keyboard) {
      throw new Error('Keyboard input is not available');
    }

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.createAnimations();

    this.nameTag = this.scene.add
      .text(startingPosition.x, startingPosition.y - 10, nickname, {
        font: '9px Monospace',
        color: '#000000',
      })
      .setOrigin(0.5, 0.25)
      .setDepth(100)
      .setVisible(showNickname);
  }

  protected createAnimations(): void {
    const { animations } = config;

    this.scene.anims.create({
      key: 'down',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 3,
        end: 5,
      }),
      frameRate: animations.frameRate,
      repeat: animations.repeat,
    });

    this.scene.anims.create({
      key: 'up',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 0,
        end: 2,
      }),
      frameRate: animations.frameRate,
      repeat: animations.repeat,
    });

    this.scene.anims.create({
      key: 'right',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 6,
        end: 7,
      }),
      frameRate: animations.frameRate,
      repeat: animations.repeat,
    });

    this.scene.anims.create({
      key: 'left',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 6,
        end: 7,
      }),
      frameRate: animations.frameRate,
      repeat: animations.repeat,
    });
  }

  public update(): void {
    this.sprite.setVelocity(0);

    const movingHorizontally =
      this.cursors.left.isDown || this.cursors.right.isDown;
    const movingVertically = this.cursors.up.isDown || this.cursors.down.isDown;

    // Horizontal
    if (this.cursors.left.isDown) {
      this.sprite.setVelocityX(-config.playerSpeed);
      this.sprite.setFlipX(false);
      this.sprite.anims.play('right', true);
      this.facingDirection = 'left';
    } else if (this.cursors.right.isDown) {
      this.sprite.setVelocityX(config.playerSpeed);
      this.sprite.setFlipX(true);
      this.sprite.anims.play('right', true);
      this.facingDirection = 'right';
    }

    // Vertical
    if (this.cursors.up.isDown) {
      this.sprite.setVelocityY(-config.playerSpeed);
      if (!movingHorizontally) {
        this.sprite.setFlipX(false);
        this.sprite.anims.play('up', true);
      }
      this.facingDirection = 'up';
    } else if (this.cursors.down.isDown) {
      this.sprite.setVelocityY(config.playerSpeed);
      if (!movingHorizontally) {
        this.sprite.setFlipX(false);
        this.sprite.anims.play('down', true);
      }
      this.facingDirection = 'down';
    }

    // Idle
    if (!movingHorizontally && !movingVertically) {
      this.sprite.anims.stop();

      switch (this.facingDirection) {
        case 'down':
          this.sprite.setFlipX(false);
          this.sprite.setFrame(5);
          break;
        case 'up':
          this.sprite.setFlipX(false);
          this.sprite.setFrame(2);
          break;
        case 'left':
          this.sprite.setFlipX(false);
          this.sprite.setFrame(6);
          break;
        case 'right':
          this.sprite.setFlipX(true);
          this.sprite.setFrame(6);
          break;
      }
    }

    // Name tag follows
    this.nameTag.setPosition(
      this.sprite.x,
      this.sprite.y - this.sprite.height / 2 + 30,
    );

    // Interactions
    const facingOneObject = this.interactiveObjects.find((objectTiles) => {
      return (
        objectTiles.getVisible() !== false && this.isFacingObject(objectTiles)
      );
    });

    if (!facingOneObject) {
      this.facedObject?.handleInteractionOff();
      this.facedObject = null;
    } else if (this.facedObject !== facingOneObject) {
      this.facedObject?.handleInteractionOff();
      this.facedObject = facingOneObject;
      this.facedObject.handleInteractionOn({});
    } else if (this.facedObject) {
      this.facedObject.updateInteraction();
    }
  }

  public addInteractiveObjects(objectTiles: ObjectTiles[]): void {
    this.interactiveObjects.push(...objectTiles);
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
    this.playerColliders.push({
      collider: this.scene.physics.add.collider(this.sprite, object),
      object,
    });
  }

  public removeCollider(object: Phaser.GameObjects.GameObject): void {
    this.playerColliders = this.playerColliders.filter(
      ({ object: obj, collider }) => {
        if (obj === object) {
          collider.destroy();
          return false;
        }
        return true;
      },
    );
  }

  public isFacingObject(object: ObjectTiles): boolean {
    const { x, y } = this.getPosition();
    const tileSize = 16;

    let facingX = x;
    let facingY = y;

    switch (this.facingDirection) {
      case 'up':
        facingY -= tileSize;
        break;
      case 'down':
        facingY += tileSize;
        break;
      case 'left':
        facingX -= tileSize;
        break;
      case 'right':
        facingX += tileSize;
        break;
    }

    const obj = object.tiledObject;
    if (!obj || obj.x == null || obj.y == null) return false;

    const centerX = obj.x + (obj.width ?? 0) / 2;
    const centerY = obj.y + (obj.height ?? 0) / 2;

    const distance = Phaser.Math.Distance.Between(
      facingX,
      facingY,
      centerX,
      centerY,
    );

    return distance <= tileSize;
  }
}

export default Player;
