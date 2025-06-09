export function centerVH(gameObj: {
  x: number;
  y: number;
  scene: Phaser.Scene;
}) {
  gameObj.x = gameObj.scene.scale.width / 2;
  gameObj.y = gameObj.scene.scale.height / 2;
}
