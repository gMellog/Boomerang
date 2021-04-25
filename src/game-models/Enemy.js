// Враг.

class Enemy {
  constructor(position, player, waitTicks = 10) {
    this.generateSkin();
    this.position = position;
    this.player = player;

    this.waitTicks = waitTicks;
    this.currWaitTicks = 0;
  }

  generateSkin() {
    const skins = ['👾', '💀', '👹', '👻', '👽', '👿', '💩', '🤡', '🤺', '🧛', '🧟', '🎃'];
    this.skin = skins[Math.floor(Math.random() * skins.length)];
  }

  followPlayer() {
    const diff = this.player.position - this.position;
    const step = diff / Math.abs(diff);

    const newPos = this.position + step;
    if (newPos === this.player.position) {
      this.player.die();
    }

    this.position = newPos;

    if (this.position === this.player.position) {
      this.player.die();
    }
  }

  tick() {
    if (this.position != -1) {
      if (this.position == this.player.position
        || (Math.abs(this.position - this.player.position) == 1)
      ) {
        this.player.die();
      }
      this.currWaitTicks += 1;
      if (this.currWaitTicks == this.waitTicks) {
        this.currWaitTicks = 0;
        this.followPlayer();
      }
    }
  }
}

module.exports = Enemy;
