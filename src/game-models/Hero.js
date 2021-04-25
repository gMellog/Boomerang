
const Boomerang = require('./Boomerang');
const dir = {'left' : 'left', 'right' : 'right'};


class Hero {
  constructor(position, game) {
    this.skin = '🤠';
    this.position = position;
    this.game = game;
    this.boomerang = new Boomerang(this, game);
    this.game.actors.push(this);
    this.game.actors.push(this.boomerang);
    this.dir = dir.right;
  }

  moveLeft() {
    this.dir = 'left';
    let newPos = this.position - 1;

    if(newPos <= -1)
    {
      newPos = this.game.trackLength;
    }

    this.position = newPos;
  }

  moveRight() {
    // Идём вправо.
    this.dir = 'right';
    let newPos = this.position + 1;

    if(newPos >= this.game.trackLength)
    {
      newPos = 0;
    }

    this.position = newPos;
  }

  attack() {
    this.boomerang.fly(this.dir);
  }

  tick() {
    if(this.game.isKeyPressed('a')){
      this.moveLeft();
   }
  
   if(this.game.isKeyPressed('d')){
     this.moveRight();
   }

   if(this.game.isKeyPressed('f')){
     if (this.boomerang.isReadyToFly()) {
      
      if(this.dir == 'right' && this.position == (this.game.trackLength - 1)){
        return;
      }

      if(this.dir == 'left' && this.position == 0){
        return;
      }

      this.attack();
     }
   }
  }

  die() {
      this.skin = '💀';
      this.game.end();
  }
}

module.exports = Hero;
