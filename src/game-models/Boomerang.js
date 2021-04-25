const Enemy = require('./Enemy');
const Hero = require('./Hero');

class Boomerang {
  constructor(player, game) {
    this.skin = '🟡';
    this.player = player;
    this.dir = null;
    this.position = -1;
    this.fixedFly = 12;
    this.flyCount = 0;
    this.returnBack = false;
    this.game = game;
  }

  findEnemy(position) {
    return this.game.actors.findIndex((actor) => (actor instanceof Enemy ? actor.position === position : false));
  }

  back() {
    if (this.position == this.player.position) {
      this.newPos = -1;
      this.returnBack = false;
      return;
    }

    const diff = this.player.position - this.position;
    const step = diff / Math.abs(diff);

    let newPos = this.position + step;
    if (newPos === this.player.position) {
      newPos = -1;
      this.returnBack = false;
    }

    this.position = newPos;
    const killed = this.tryKillEnemy();
    if (killed) {
      this.game.enemyDied();
    }
  }

  isReadyToFly() {
    return this.position == -1;
  }

  fly(dir) {
    this.dir = dir;
    this.position = this.player.position;
  }

  tick() {
    if (this.position != -1) {
      if (!this.returnBack) {
        if (this.dir == 'left') {
          this.moveLeft();
        } else if (this.dir == 'right') {
          this.moveRight();
        }
      } else {
        this.back();
      }
    }
  }

  tryKillEnemy() {
    const enemy = this.findEnemy(this.position);
    if (enemy !== -1) {
      this.game.actors.splice(enemy, 1);
    }

    return enemy != -1;
  }

  moveLeft() {
    this.returnBack = this.tryKillEnemy();
    if (this.returnBack) {
      this.game.enemyDied();
      this.flyCount = 0;
      return;
    }

    const newPos = this.position - 1;
    this.flyCount += 1;
    if (newPos <= -1 || this.flyCount === this.fixedFly) {
      this.flyCount = 0;
      this.returnBack = true;
      return;
    }

    this.position = newPos;

    this.returnBack = this.tryKillEnemy();
    if (this.returnBack) {
      this.game.enemyDied();
      this.flyCount = 0;
    }
  }

  moveRight() {
    this.returnBack = this.tryKillEnemy();
    if (this.returnBack) {
      this.game.enemyDied();
      this.flyCount = 0;
      return;
    }

    const newPos = this.position + 1;
    this.flyCount += 1;
    if (newPos >= this.player.game.trackLength || this.flyCount === this.fixedFly) {
      this.flyCount = 0;
      this.returnBack = true;
      return;
    }

    this.position = newPos;
    const enemy = this.findEnemy();
    if (enemy !== -1) {
      this.game.actors.splice(enemy, 1);
    }

    this.returnBack = this.tryKillEnemy();
    if (this.returnBack) {
      this.game.enemyDied();
      this.flyCount = 0;
    }
  }
}
module.exports = Boomerang;
