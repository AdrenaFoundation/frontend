import config from '../GameScenes/MainScene/config';
import { AScene } from './AScene';
import ObjectTiles from './ObjectTiles';

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
    this.sprite.setScale(0.5); // Adjust from 32px player to 16px

    // Make the user in between the tiles layers (see TilemapService)
    this.sprite.setDepth(2.5);

    this.sprite.setCollideWorldBounds(true);

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

  public addInteractiveObjects(ObjectTiless: ObjectTiles[]): void {
    this.interactiveObjects.push(...ObjectTiless);
  }

  protected createAnimations(): void {
    const { animations } = config;

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
    // Handle player movement and animations
    {
      this.sprite.setVelocity(0);

      // Handle movement based on controls
      if (this.cursors.left.isDown) {
        this.sprite.setVelocityX(-config.playerSpeed);
        this.sprite.anims.play('left', true);
        this.facingDirection = 'left';
      } else if (this.cursors.right.isDown) {
        this.sprite.setVelocityX(config.playerSpeed);
        this.sprite.anims.play('right', true);
        this.facingDirection = 'right';
      }
      if (this.cursors.up.isDown) {
        this.sprite.setVelocityY(-config.playerSpeed);
        if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
          this.sprite.anims.play('up', true);
        }
        this.facingDirection = 'up';
      } else if (this.cursors.down.isDown) {
        this.sprite.setVelocityY(config.playerSpeed);
        if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
          this.sprite.anims.play('down', true);
        }
        this.facingDirection = 'down';
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

    // Make the name tag follow the player
    this.nameTag.setPosition(
      this.sprite.x,
      this.sprite.y - this.sprite.height / 2 + 30,
    );

    const facingOneObject = this.interactiveObjects.find((ObjectTiles) => {
      return this.isFacingObject(ObjectTiles);
    });

    if (!facingOneObject) {
      this.facedObject?.handleInteractionOff();
      this.facedObject = null;
    } else if (this.facedObject !== facingOneObject) {
      this.facedObject?.handleInteractionOff();
      this.facedObject = facingOneObject;
      this.facedObject.handleInteractionOn();
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

  public isNearObject(
    ObjectTiles: ObjectTiles,
    interactionDistance: number,
  ): boolean {
    const { x: playerX, y: playerY } = this.getPosition();

    const {
      x: offsetX,
      y: offsetY,
      scaleX,
      scaleY,
      tilemap: { tileWidth, tileHeight },
    } = ObjectTiles.tilemapService.getObjectsLayer();

    return ObjectTiles.tiles.some(({ pixelX: objectX, pixelY: objectY }) => {
      // Apply scale to object center
      const centerX = (objectX + tileWidth / 2) * scaleX + offsetX;
      const centerY = (objectY + tileHeight / 2) * scaleY + offsetY;

      const distance = Phaser.Math.Distance.Between(
        playerX,
        playerY,
        centerX,
        centerY,
      );

      return distance <= interactionDistance;
    });
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

    const {
      x: layerOffsetX,
      y: layerOffsetY,
      scaleX,
      scaleY,
    } = object.tilemapService.getObjectsLayer();

    return object.tiles.some((tile) => {
      const worldX =
        tile.pixelX * scaleX + layerOffsetX + (tile.width * scaleX) / 2;
      const worldY =
        tile.pixelY * scaleY + layerOffsetY + (tile.height * scaleY) / 2;

      const distance = Phaser.Math.Distance.Between(
        facingX,
        facingY,
        worldX,
        worldY,
      );

      return distance <= tileSize / 2;
    });
  }
}

export default Player;
