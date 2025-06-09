import Phaser from 'phaser';
import Sizer from 'phaser3-rex-plugins/templates/ui/sizer/Sizer';
import type RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { isHost, myPlayer, onPlayerJoin, PlayerState } from 'playroomkit';

// import { checkStore, getStoreState } from '../gameloop/checkStore';
import InventoryGridSlot from '../interface/Inventory/InventoryGridSlot';
import InventoryWindowFactory from '../interface/Inventory/InventoryWindowFactory';
import { InventoryGridContext } from '../InventoryGridContext';

class MainScene extends Phaser.Scene {
  constructor() {
    super();
  }

  private outerWalls: Phaser.Tilemaps.TilemapLayer | undefined;
  private objects: Phaser.Tilemaps.TilemapLayer | undefined;
  private floor: Phaser.Tilemaps.TilemapLayer | undefined;
  private players: {
    sprite: Phaser.GameObjects.Sprite;
    state: PlayerState;
  }[] = [];

  public rexUI!: RexUIPlugin;
  // private showDebug = false;
  // private player: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cursors: any;
  public text: Phaser.GameObjects.Text | undefined;
  public inventoryItems: InventoryGridSlot[] = [];
  public gridWindow: Sizer | undefined;

  preload() {
    // this.load.setBaseURL('https://labs.phaser.io');

    this.load.atlas(
      'A_inventory_window',
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/inventory-cIfE3BZyKhWuGpKQPaEudyssmD6dGB.png',
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/inventory-S2GJxM5Fp7vwUBCBKayeL59US8BnUw.json',
    );

    this.load.atlas(
      'A_items',
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/items-DTpUL0sSJs15YcqGe5JegStUJE39jv.png',
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/items-FtK6rnKW6AigB8kb0kErCSS8RoS9s9.json',
    );

    this.load.image(
      'inventory_window',
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/inventory-IxO6leHEeX7bNFWCmh9evri3HmIkxZ.png',
    );

    this.load.image(
      'tiles',
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/pixel-cyberpunk-interior-rKgPFK5iDNifFzDrzhVG1mRgE1TN2I.png',
    );
    // this.load.tilemapTiledJSON(
    //   'map',
    //   'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/main-bOXHiIbeDpXyIOXO4Pbns4ZeKDYNgu.tmj',
    // );

    this.load.tilemapTiledJSON(
      'map',
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/lobby-3JHrHW2N5XeHVZIxVG6MrjHvcBy2ap.tmj',
    );

    this.load.spritesheet(
      'player',
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tyro-5KW3g9ugXSgLEHY3pKwyzR7bu2x6yV.png',
      { frameWidth: 32, frameHeight: 32 },
    );
  }
  create() {
    onPlayerJoin((playerState) => this.addPlayer(playerState));

    this.cursors = this.input?.keyboard?.createCursorKeys();

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // const map = this.add.tilemap('map');
    // const tiles = map.addTilesetImage('pixel-cyberpunk-interior', 'tiles');

    // if (!tiles) {
    //   console.error('Tileset not found. Please check the tileset image URL.');
    //   return;
    // }

    // const innerWalls = map.createLayer(
    //   'inner-walls',
    //   tiles,
    //   width / 2 - 192,
    //   height / 2 - 150,
    // );

    // const floor = map.createLayer(
    //   'floor',
    //   tiles,
    //   width / 2 - 192,
    //   height / 2 - 150,
    // );

    // const furniture = map.createLayer(
    //   'furniture',
    //   tiles,
    //   width / 2 - 192,
    //   height / 2 - 150,
    // );

    // const comp = map.createLayer(
    //   'comp',
    //   tiles,
    //   width / 2 - 192 + 5.55,
    //   height / 2 - 150 + 15.6,
    // );

    const inventoryWindow = InventoryWindowFactory.create(this);
    this.inventoryItems = inventoryWindow.slots as InventoryGridSlot[];
    this.gridWindow = inventoryWindow.window;

    const items = [
      {
        id: 'sword-001',
        name: 'Sword',
        description: 'A sharp sword for combat.',
        image: 'item26.png',
        type: 'weapon',
        rarity: 'common',
        stats: {
          attack: 10,
          defense: 0,
          speed: 0,
        },
        quantity: 1,
        equipped: false,
        slotIndex: 0,
      },
      {
        id: 'shield-001',
        name: 'Shield',
        description: 'A sturdy shield for protection.',
        image: 'item52.png',
        type: 'armor',
        rarity: 'uncommon',
        stats: {
          attack: 0,
          defense: 5,
          speed: -1,
        },
        quantity: 1,
        equipped: false,
        slotIndex: 1,
      },
      // helmet
      {
        id: 'helmet-001',
        name: 'Helmet',
        description: 'A protective helmet for the head.',
        image: 'item58.png',
        type: 'armor',
        rarity: 'rare',
        stats: {
          attack: 0,
          defense: 3,
          speed: 0,
        },
        quantity: 1,
        equipped: false,
        slotIndex: 2,
      },
      // sword 2
      {
        id: 'sword-002',
        name: 'Long Sword',
        description: 'A longer sword with better reach.',
        image: 'item25.png',
        type: 'weapon',
        rarity: 'epic',
        stats: {
          attack: 15,
          defense: 0,
          speed: 0,
        },
        quantity: 1,
        equipped: false,
        slotIndex: 3,
      },
      // axe
      {
        id: 'axe-001',
        name: 'Axe',
        description: 'A heavy axe for chopping.',
        image: 'item31.png',
        type: 'weapon',
        rarity: 'legendary',
        stats: {
          attack: 20,
          defense: 0,
          speed: -2,
        },
        quantity: 1,
        equipped: false,
        slotIndex: 4,
      },
      // bone
      {
        id: 'bone-001',
        name: 'Bone',
        description: 'A sturdy bone, useful for crafting.',
        image: 'bone3.png',
        type: 'crafting',
        rarity: 'common',
        stats: {
          attack: 0,
          defense: 0,
          speed: 0,
        },
        quantity: 1,
        equipped: false,
        slotIndex: 20,
      },
      // emrald gem
      {
        id: 'emerald-001',
        name: 'Emerald',
        description: 'A beautiful emerald, valuable for trading.',
        image: 'item91.png',
        type: 'gem',
        rarity: 'rare',
        stats: {
          attack: 0,
          defense: 0,
          speed: 0,
        },
        quantity: 1,
        equipped: false,
        slotIndex: 19,
      },
      // diamond
      {
        id: 'diamond-001',
        name: 'Diamond',
        description: 'A precious diamond, valuable for trading.',
        image: 'item81.png',
        type: 'gem',
        rarity: 'legendary',
        stats: {
          attack: 0,
          defense: 0,
          speed: 0,
        },
        quantity: 1,
        equipped: false,
        slotIndex: 21,
      },
    ];

    this.text = this.add.text(50, 250, 'Click on an item slot to see details', {
      font: '16px monospace',
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const slot = inventoryWindow.slots[item.slotIndex] as InventoryGridSlot;
      if (!slot) {
        console.error(`Slot with index ${item.slotIndex} not found.`);
        continue;
      }

      slot.addItem(this, {
        context: InventoryGridContext.inventory,
        quantity: item.quantity,
        equipped: item.equipped,
        slotIndex: item.slotIndex,
        data: {
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image,
          type: item.type,
          rarity: item.rarity,
          stats: item.stats,
        },
      });
    }

    // if (!comp || !furniture || !outerWalls || !innerWalls || !floor) {
    //   console.error(
    //     'One or more layers not found. Please check the map configuration.',
    //   );
    //   return;
    // }

    // const door = map.createFromObjects(
    //   'door',
    //   'door',
    //   {
    //     key: 'tiles',
    //     useTil
    //     frame: 0,
    //   },
    //   width / 2 - 192 + 5.55,
    //   height / 2 - 150 + 15.6,
    // );

    // const number = getStoreState().tokenPrices['SOL'];

    // const walletAddress = getStoreState().walletState.wallet.walletAddress;

    // this.add.text(10, 10, `Wallet: ${walletAddress}`, {
    //   font: '12px monospace',
    //   fill: '#ffffff',
    // });

    // const currentSolPrice = this.make.text({
    //   x: width / 2,
    //   y: height / 2 - 50,
    //   text: `SOL: ${number}\n`,
    //   style: {
    //     font: '14px monospace',
    //     fill: '#ffffff',
    //   },
    // });

    // this.text = currentSolPrice;

    // currentSolPrice.setOrigin(0.5, 0.5);

    // this.time.addEvent({
    //   delay: 500,
    //   callback: checkStore,
    //   callbackScope: this,
    //   loop: true,
    // });

    // this.background.setScale(2.6).setOrigin(0).setDepth(-13); // first tile's depth is -12.5

    // const particles = this.add.particles(0, 0, 'red', {
    //   speed: 100,
    //   scale: { start: 1, end: 0 },
    //   blendMode: 'ADD',
    // });

    // const logo = this.physics.add.image(400, 100, 'logo');

    // logo.setVelocity(100, 200);
    // logo.setBounce(1, 1);
    // logo.setCollideWorldBounds(true);

    // particles.startFollow(logo);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 6 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('player', { start: 8, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('player', { start: 3, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    const map = this.add.tilemap('map');
    const tiles = map.addTilesetImage('pixel-cyberpunk-interior', 'tiles');

    if (!tiles) {
      console.error('Tileset not found. Please check the tileset image URL.');
      return;
    }

    this.floor =
      map.createLayer('floor', tiles, width / 2 - 192, height / 2 - 250) ??
      undefined;

    this.outerWalls =
      map.createLayer('outerWalls', tiles, width / 2 - 192, height / 2 - 250) ??
      undefined;

    this.objects =
      map.createLayer('objects', tiles, width / 2 - 192, height / 2 - 250) ??
      undefined;
  }

  addPlayer(playerState: PlayerState) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Generate random starting position near center
    const randomX = width / 2 + (Math.random() * 100 - 50);
    const randomY = height / 2 + (Math.random() * 100 - 50);

    const player = this.physics.add.sprite(randomX, randomY, 'player', 1);

    if (!player.body) {
      this.physics.world.enable(player);
    }

    player.body.setCollideWorldBounds(true);

    if (this.outerWalls) {
      this.physics.add.collider(player, this.outerWalls);
      this.outerWalls.setCollisionBetween(0, 1000);
    }

    // this.cameras.main.startFollow(this.player);

    this.players.push({
      sprite: player,
      state: playerState,
    });

    if (!playerState.getState('dir')) {
      playerState.setState('dir', {
        left: false,
        right: false,
        up: false,
        down: false,
      });
    }

    playerState.onQuit(() => {
      player.destroy();
      this.players = this.players.filter((p) => p.state !== playerState);
    });
  }

  update() {
    if (!myPlayer()) {
      return; // Wait until PlayroomKit is fully initialized
    }

    if (this.cursors) {
      const directionState = {
        left: this.cursors.left.isDown,
        right: this.cursors.right.isDown,
        up: this.cursors.up.isDown,
        down: this.cursors.down.isDown,
      };

      myPlayer().setState('dir', directionState);

      const localPlayerObj = this.players.find((p) => p.state === myPlayer());
      if (localPlayerObj) {
        this.updatePlayer(directionState, localPlayerObj.sprite);
      }
    }

    if (isHost()) {
      for (const player of this.players) {
        if (!player.sprite.body) continue;

        const controls = player.state.getState('dir') || {};

        this.updatePlayer(controls, player.sprite);

        player.state.setState('pos', {
          x: player.sprite.x,
          y: player.sprite.y,
        });
      }
    } else {
      for (const player of this.players) {
        const pos = player.state.getState('pos');
        const controls = player.state.getState('dir');

        if (player.state !== myPlayer()) {
          if (pos) {
            // Apply smoothing for remote players
            player.sprite.x = Phaser.Math.Linear(player.sprite.x, pos.x, 0.3);
            player.sprite.y = Phaser.Math.Linear(player.sprite.y, pos.y, 0.3);
          }

          if (controls) {
            this.updateAnimationsOnly(controls, player.sprite);
          }
        }
      }
    }
  }

  // Add this new method for non-host players
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateAnimationsOnly(controls: any, player: any) {
    if (!controls) return;

    // Only handle animations, not movement (since position is synced)
    if (controls.left) {
      player.anims.play('left', true);
    } else if (controls.right) {
      player.anims.play('right', true);
    } else if (controls.up) {
      player.anims.play('up', true);
    } else if (controls.down) {
      player.anims.play('down', true);
    } else if (
      !controls.left &&
      !controls.right &&
      !controls.up &&
      !controls.down
    ) {
      player.anims.stop();
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatePlayer(controls: any, player: any) {
    if (!controls) return;

    player.body.setVelocity(0);

    // Handle movement based on controls
    if (controls.left) {
      player.body.setVelocityX(-100);
      player.anims.play('left', true);
    } else if (controls.right) {
      player.body.setVelocityX(100);
      player.anims.play('right', true);
    }

    if (controls.up) {
      player.body.setVelocityY(-100);
      // Only play up animation if we're not moving left/right
      if (!controls.left && !controls.right) {
        player.anims.play('up', true);
      }
    } else if (controls.down) {
      player.body.setVelocityY(100);
      // Only play down animation if we're not moving left/right
      if (!controls.left && !controls.right) {
        player.anims.play('down', true);
      }
    }

    // If no keys are pressed, stop animations
    if (!controls.left && !controls.right && !controls.up && !controls.down) {
      player.anims.stop();
    }
  }
}

export default MainScene;
