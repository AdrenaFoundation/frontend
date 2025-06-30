export default {
  // Game dimensions
  width: 1024,
  height: 768,
  backgroundColor: '#028af8',

  // Player settings
  playerSpeed: 100,
  playerFrameWidth: 32,
  playerFrameHeight: 32,

  // Interaction settings
  interactionDistance: 50,

  // Tilemap settings
  tilemapOffsetX: 192,
  tilemapOffsetY: 250,

  // Responsive settings
  responsive: {
    minScale: 0.5,
    maxScale: 1.0,
    maintainAspectRatio: true,
    centerOnResize: true,
  },

  // Asset paths
  assets: {
    external: {
      inventoryAtlas: {
        image:
          'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/inventory-cIfE3BZyKhWuGpKQPaEudyssmD6dGB.png',
        json: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/inventory-S2GJxM5Fp7vwUBCBKayeL59US8BnUw.json',
      },
      itemsAtlas: {
        image:
          'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/items-DTpUL0sSJs15YcqGe5JegStUJE39jv.png',
        json: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/items-FtK6rnKW6AigB8kb0kErCSS8RoS9s9.json',
      },
      inventoryWindow:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/inventory-IxO6leHEeX7bNFWCmh9evri3HmIkxZ.png',
      tiles:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/pixel-cyberpunk-interior-XtYiFktpomtHWKti7d7M04TetN7FGY.png',
      map: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/lobby-3JHrHW2N5XeHVZIxVG6MrjHvcBy2ap.tmj',
      player:
        'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/game/tyro-5KW3g9ugXSgLEHY3pKwyzR7bu2x6yV.png',
    },
    local: {
      basePath: '/assets/Game',
      star: 'star.png',
      background: 'bg.png',
      logo: 'logo.png',
    },
  },

  animations: {
    frameRate: 10,
    repeat: -1,
    playerFrames: {
      up: { start: 1, end: 2 }, // walking back
      down: { start: 4, end: 5 }, // walking forward
      right: { start: 6, end: 7 }, // side walk (left-facing frames)
      left: { start: 6, end: 7 }, // same frames as right, but flipX
    },
  },

  // UI settings
  ui: {
    title: {
      fontFamily: 'Arial Black',
      fontSize: 48,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
    },
    instructions: {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    },
    interaction: {
      font: '16px monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#00000080',
      padding: { x: 10, y: 5 },
    },
  },
} as const;
