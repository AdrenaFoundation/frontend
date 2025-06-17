import { AUTO, Game as PhaserGame, Scene, Types } from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';

import { useSelector } from '@/store/store';

import { EventBus } from '../GameEngine/EventBus';
import { MainScene } from '../GameScenes/MainScene/MainScene';
import WalletConnection from '../WalletAdapter/WalletConnection';

export interface IRefGame {
    game: PhaserGame | null;
    scene: Scene | null;
}

interface IProps {
    currentActiveScene?: (scene: Scene) => void;
    config?: Types.Core.GameConfig;
}

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const DEFAULT_CONFIG: Types.Core.GameConfig = {
    type: AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#028af8',
    pixelArt: true,
    scene: [MainScene],
    plugins: {
        scene: [
            {
                key: 'rexUI',
                plugin: RexUIPlugin,
                mapping: 'rexUI',
            },
        ],
    },
    dom: {
        createContainer: true,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
        },
    },
};

export const Game = forwardRef<IRefGame, IProps>(function Game({
    currentActiveScene,
    config = DEFAULT_CONFIG,
}, ref) {
    const game = useRef<PhaserGame | null>(null);
    const wallet = useSelector((state) => state.walletState.wallet);

    useLayoutEffect(() => {
        if (game.current === null) {
            game.current = new PhaserGame({
                ...config,
                parent: "game-container",
            });

            if (typeof ref === 'function') {
                ref({
                    game: game.current,
                    scene: null,
                });
            } else if (ref !== null) {
                ref.current = {
                    game: game.current,
                    scene: null,
                };
            }

        }

        return () => {
            if (game.current) {
                game.current.destroy(true);

                if (game.current !== null) {
                    game.current = null;
                }
            }
        }
    }, [config, ref]);

    useEffect(() => {
        EventBus.on('scene-ready', (scene: Scene) => {
            if (currentActiveScene && typeof currentActiveScene === 'function') {
                currentActiveScene(scene);
            }

            if (typeof ref === 'function') {
                ref({
                    game: game.current,
                    scene,
                });
            } else if (ref) {
                ref.current = {
                    game: game.current,
                    scene,
                };
            }

        });

        return () => {
            EventBus.removeListener('scene-ready');
        };
    }, [currentActiveScene, ref]);

    if (!wallet) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <WalletConnection />
            </div>
        );
    }

    return (
        <div id="game-container"></div>
    );
});

export default Game;
