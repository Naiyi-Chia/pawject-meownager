import Phaser from 'phaser';

/** Technical placeholder only: no locations, event hooks, or product state. */
export class PlaceholderScene extends Phaser.Scene {
  constructor(private readonly onReady: () => void) {
    super('foundation-placeholder');
  }

  create() {
    const art = this.add.graphics();
    art.fillStyle(0xc2d4c4);
    art.fillRect(0, 168, 320, 72);
    art.fillStyle(0xf6f3ea);
    art.fillRect(32, 40, 72, 8);
    art.fillRect(216, 64, 48, 8);
    art.fillStyle(0x8ba697);
    art.fillRect(56, 136, 208, 8);
    art.fillRect(56, 144, 8, 32);
    art.fillRect(256, 144, 8, 32);
    art.fillStyle(0xabc1ae);
    art.fillRect(120, 196, 80, 8);

    // Simple blocks prove the Phaser renderer without introducing final art assets.
    art.fillStyle(0x263c3b);
    art.fillRect(132, 104, 56, 80);
    art.fillRect(132, 88, 16, 24);
    art.fillRect(172, 88, 16, 24);
    art.fillRect(188, 156, 16, 12);
    art.fillStyle(0xf0c695);
    art.fillRect(140, 112, 40, 40);
    art.fillStyle(0x263c3b);
    art.fillRect(148, 124, 4, 8);
    art.fillRect(168, 124, 4, 8);
    art.fillRect(156, 136, 8, 4);
    art.fillStyle(0xf6f3ea);
    art.fillRect(144, 168, 32, 8);

    this.onReady();
  }
}
