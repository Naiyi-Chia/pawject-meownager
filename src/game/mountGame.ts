import Phaser from 'phaser';
import { PlaceholderScene } from './scenes/PlaceholderScene';

export function mountGame(
  parent: HTMLElement,
  onReady: () => void,
): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 320,
    height: 240,
    backgroundColor: '#dce8de',
    pixelArt: true,
    banner: false,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [new PlaceholderScene(onReady)],
    // A modest frame budget is sufficient for this static placeholder.
    fps: { target: 30 },
  });
}
