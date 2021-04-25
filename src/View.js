// Сделаем отдельный класс для отображения игры в консоли.

class View {
  constructor(game) {
    this.game = game;
    this.showCounterDelay = 400;
    this.showGoDelay = 1500;
    this.onPlayerIsReady = null;
    this.stepCounter = this.game.trackLength / 10;
    this.playerIsReadyDelay = 500;
  }

  render() {
    const yourTeamName = 'Svyat';
    console.clear();
    console.log(this.game.track.join(''));
    process.stdout.write('\n\n');
    console.log(`Created by "${yourTeamName}" with love`);
  }

  victory(playerName) {
    console.clear();
    console.log(`YOU WON,${playerName.toUpperCase()}!`);
  }

  end() {
    console.log('YOU ARE DEAD!💀');
  }

  preparePlayerToPlay() {
    this.game.track = (new Array(this.game.trackLength)).fill('  ');
    this.showCounter = 10;
    this.showTrackEl = 0;
    setTimeout(() => { this.showCountDown(); }, this.showCounterDelay);
  }

  getHideIndex() {
    const i = (this.showTrackEl - this.stepCounter - 1);
    return Math.max(i, 0);
  }

  showCountDown() {
    console.log(this.showCounter);
    let putIndex = 0;
    if (this.showTrackEl > 0) {
      putIndex = this.showTrackEl - 1;
    }

    this.game.track[putIndex] = this.showCounter;
    this.showTrackEl += this.game.trackLength / 10;
    this.showCounter -= 1;
    this.render();
    if (this.showCounter == 0) {
      setTimeout(
        () => {
          this.game.track[this.getHideIndex()] = '  ';
          this.render();
          this.showGo();
        }, this.showCounterDelay,
      );
    } else {
      setTimeout(() => {
        this.game.track[this.getHideIndex()] = '  ';
        this.showCountDown();
      }, this.showCounterDelay);
    }
  }

  showGo() {
    this.game.track[23] = 'G';
    this.game.track[24] = 'O';
    this.game.track[25] = '!';

    this.render();
    setTimeout(() => {
      this.game.track[23] = '  ';
      this.game.track[24] = '  ';
      this.game.track[25] = '  ';
      this.render();
      this.onPlayerIsReady();
    }, this.showGoDelay);
  }
}

module.exports = View;
