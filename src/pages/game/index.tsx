import React, { useEffect } from 'react'


export default function Game() {
  useEffect(() => {
    // Only execute this code on the client side
    const initGame = async () => {
      if (typeof window === 'undefined') return;

      const { default: MainScene } = await import('@/phaser/scenes/MainScene');
      const { default: Phaser } = await import('phaser');
      const RexUIPlugin = (await import('phaser3-rex-plugins/templates/ui/ui-plugin.js')).default;
      const { insertCoin } = await import('playroomkit');

      const config = {
        type: Phaser.AUTO,
        parent: "phaser",
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#000000",
        pixelArt: true,
        plugins: {
          scene: [
            {
              key: "rexUI",
              plugin: RexUIPlugin,
              mapping: "rexUI",
            },
          ],
        },
        dom: {
          createContainer: true
        },
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
        scene: MainScene,
      };

      setTimeout(() => {
        insertCoin().then(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new Phaser.Game(config as any);
        });
      }, 1000);
    };

    initGame();
  }, []);

  return <div id='phaser'></div>;
}
