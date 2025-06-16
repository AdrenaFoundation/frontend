import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';

import { useSelector } from '@/store/store';

import WalletConnection from '../WalletAdapter/WalletConnection';
import { EventBus } from './game/EventBus';
import StartGame from './game/main';

export interface IRefAdrenasino {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void
}

export const Adrenasino = forwardRef<IRefAdrenasino, IProps>(function Adrenasino({ currentActiveScene }, ref) {
    const game = useRef<Phaser.Game | null>(null);
    const wallet = useSelector((state) => state.walletState.wallet);

    useLayoutEffect(() => {
        if (game.current === null) {

            game.current = StartGame("game-container");

            if (typeof ref === 'function') {
                ref({ game: game.current, scene: null });
            } else if (ref) {
                ref.current = { game: game.current, scene: null };
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
    }, [ref]);

    useEffect(() => {
        EventBus.on('scene-ready', (scene_instance: Phaser.Scene) => {
            if (currentActiveScene && typeof currentActiveScene === 'function') {

                currentActiveScene(scene_instance);

            }

            if (typeof ref === 'function') {

                ref({ game: game.current, scene: scene_instance });

            } else if (ref) {

                ref.current = { game: game.current, scene: scene_instance };

            }

        });
        return () => {

            EventBus.removeListener('scene-ready');

        }
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

export default Adrenasino;
