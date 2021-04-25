const mongoose = require('mongoose');
const readline = require('readline');
const Game = require('./src/Game');

const connectPath = 'mongodb+srv://Svyatik:daladno753@svyatikscluster.sfxdd.mongodb.net/Boomerang?retryWrites=true&w=majority';

function start(withSaves) {
  const game = new Game({
    trackLength: 50,
    withSaves,
  });

  game.play();
}

async function run() {
  try {
    await mongoose.connect(connectPath, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true });

    start(true);
  } catch (err) {
    if (mongoose.connections[0].readyState === 0) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('Couldnt connect to DB, would you like to continue without saving result ? (y/n) ', (answer) => {
        if (answer === 'y') {
          start(false);
        }
      });
    }
  }
}

run();
