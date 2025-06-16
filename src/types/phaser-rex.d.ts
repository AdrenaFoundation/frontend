declare module 'phaser3-rex-plugins/templates/ui/ui-plugin.js' {
  import { Plugin, PluginManager, Scene } from 'phaser';

  export default class RexUIPlugin extends Plugin {
    constructor(scene: Scene, pluginManager: PluginManager);
  }
}

// Extend Phaser types to include Rex UI functionality
declare module 'phaser' {
  interface Scene {
    rexUI: {
      add: {
        [key: string]: (...args: unknown[]) => unknown;
      };
    };
  }
}
