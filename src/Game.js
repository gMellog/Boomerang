const keypress = require('keypress');
const readline = require('readline');
const mongoose = require('mongoose');
const Hero = require('./game-models/Hero');
const Enemy = require('./game-models/Enemy');
const View = require('./View');

// connect to bd, if we can't say that to player, if we can so just connect to it.
// When player wrote his name we should check it in DB, maybe there is already some username, if so we can ask him to write his own password, for key if he want to play next game from ground up
// password will be a feature that will be available only after the win
// password will be checked with SHA-1

class Game {
  constructor({ trackLength, withSaves }) {
    this.trackLength = trackLength;
    this.withSaves = withSaves;
    this.view = new View(this);
    this.view.onPlayerIsReady = () => { this.startGame(); };
    this.track = [];

    this.keyboard = {
      a: false,
      d: false,
      f: false,
    };

    this.enemiesSpawnPositions = [0, trackLength - 1];
    this.enemySpawnDelay = 1000;

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.gameEnd = false;
    this.gameLoopDelay = 0;
    this.playerInfo = null;
  }

  isKeyPressed(key) {
    return this.keyboard[key];
  }

  initInput() {
    keypress(process.stdin);
    process.stdin.on('keypress', (ch, key) => {
      if (key) {
        const keyName = key.name.toLowerCase();
        if (keyName in this.keyboard) {
          this.keyboard[keyName] = true;
        }
        if (key.ctrl && key.name === 'c') {
          process.exit();
        }
      }
    });
    process.stdin.setRawMode(true);
  }

  clearInput() {
    for (const key in this.keyboard) {
      this.keyboard[key] = false;
    }
  }

  regenerateTrack() {
    this.track = (new Array(this.trackLength)).fill('  ');

    for (const actor of this.actors) {
      if (actor.position != -1) {
        this.track[actor.position] = actor.skin;
      }
    }
  }

  logic() {
    for (const actor of this.actors) {
      if (!this.gameEnd) {
        actor.tick();
      } else {
        break;
      }
    }
  }

  async victory() {
    this.view.victory(this.playerName);
    if (this.withSaves) {
      if (this.playerInfo !== null) {
        if (this.playerInfo.enemiesKilled < this.enemiesCount) {
          this.playerInfo.enemiesKilled = this.enemiesCount;
          await this.playerInfo.save();
        }
      } else {
        const user = new mongoose.models.User({ name: this.playerName, enemiesKilled: this.enemiesCount });
        await user.save();
      }
    }
    process.exit();
  }

  enemyDied() {
    this.enemiesDied += 1;
  }

  end() {
    this.gameEnd = true;
    this.regenerateTrack();
    this.view.render();
    this.view.end();
    this.clearInput();

    this.rl.close();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.rl.question(`Play again, ${this.playerName}? (y/n) `, (answer) => {
      if (answer === 'y') {
        this.gameEnd = false;
        this.view.preparePlayerToPlay();
      } else {
        process.exit();
      }
    });
  }

  gameLoop() {
    if (this.enemiesDied == this.maxEnemies) {
      this.victory();
    } else {
      this.timePassed += this.gameLoopDelay;
      if (this.enemiesCount != this.maxEnemies) {
        if (this.timePassed >= this.enemySpawnDelay) {
          this.enemiesCount += 1;
          this.timePassed = 0;
          const randIndex = Math.floor(Math.random() * this.enemiesSpawnPositions.length);
          const enemy = new Enemy(this.enemiesSpawnPositions[randIndex], this.hero);
          this.actors.push(enemy);
        }
      }

      this.logic();
      if (this.gameEnd) return;
      this.regenerateTrack();
      this.view.render();
      this.clearInput();

      setTimeout(() => { this.gameLoop(); }, this.gameLoopDelay);
    }
  }

  startGame() {
    this.actors = [];
    const playerStartPosition = Math.floor((this.trackLength / 2) - 1);
    this.hero = new Hero(playerStartPosition, this);

    this.timePassed = 0;
    this.enemiesCount = 0;
    this.maxEnemies = 20;
    this.enemiesDied = 0;

    this.initInput();
    this.gameLoopDelay = 35;
    setTimeout(() => {
      this.gameLoop();
    }, this.gameLoopDelay);
  }

  async play() {
    console.clear();
    this.rl.question('Its high time to play in BOOMERANG, ARE YOU READ ? (y/n) : ', (answer) => {
      if (answer === 'y') {
        this.rl.question('Alright, tell me your name: ', async (answer) => {
          this.playerName = answer;
          if (this.withSaves) {
            const userSchema = mongoose.Schema({ name: String, enemiesKilled: Number });
            const User = mongoose.model('User', userSchema);
            this.playerInfo = await User.findOne({ name: this.playerName });
          }
          this.view.preparePlayerToPlay();
        });
      } else {
        process.exit();
      }
    });
  }
}

module.exports = Game;
