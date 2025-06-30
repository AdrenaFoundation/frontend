import config from '../GameScenes/MainScene/config';
import { AScene } from './AScene';
import ObjectTiles from './Tiles/ObjectTiles';

class Player {
  protected scene: AScene;
  protected sprite: Phaser.Physics.Arcade.Sprite;
  protected cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  protected nameTag: Phaser.GameObjects.Text;

  // List of interactive objects the player can interact with
  protected interactiveObjects: ObjectTiles[] = [];

  protected facingDirection: 'up' | 'down' | 'left' | 'right' = 'down';

  protected facedObject: ObjectTiles | null = null;

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

    // Make the user in between the tiles layers (see TilemapService)
    this.sprite.setDepth(4);

    this.sprite.setCollideWorldBounds(true);

    // only bottom part collides
    this.sprite.setSize(16, 16).setOffset(0, 16);

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

  public addInteractiveObjects(objectTiles: ObjectTiles[]): void {
    this.interactiveObjects.push(...objectTiles);
  }
  protected createAnimations(): void {
    const { animations } = config;

    this.scene.anims.create({
      key: 'down', // FRONT-facing
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 3,
        end: 5,
      }),
      frameRate: animations.frameRate,
      repeat: animations.repeat,
    });

    this.scene.anims.create({
      key: 'up', // BACK-facing
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
    // Handle player movement and animations
    {
      this.sprite.setVelocity(0);

      const movingHorizontally =
        this.cursors.left.isDown || this.cursors.right.isDown;
      const movingVertically =
        this.cursors.up.isDown || this.cursors.down.isDown;

      // --- Horizontal Movement ---
      if (this.cursors.left.isDown) {
        this.sprite.setVelocityX(-config.playerSpeed);
        this.sprite.setFlipX(false); // ← now NO flip = facing left
        this.sprite.anims.play('right', true); // we still use right frames
        this.facingDirection = 'left';
      } else if (this.cursors.right.isDown) {
        this.sprite.setVelocityX(config.playerSpeed);
        this.sprite.setFlipX(true); // ← now YES flip = facing right
        this.sprite.anims.play('right', true);
        this.facingDirection = 'right';
      }

      // --- Vertical Movement ---
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

      // --- Idle ---
      if (!movingHorizontally && !movingVertically) {
        this.sprite.anims.stop();
      }
    }

    // Make the name tag follow the player
    this.nameTag.setPosition(
      this.sprite.x,
      this.sprite.y - this.sprite.height / 2 + 30,
    );

    const facingOneObject = this.interactiveObjects.find((objectTiles) => {
      return this.isFacingObject(objectTiles);
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
