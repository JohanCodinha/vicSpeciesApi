const mongoose = require('mongoose');
const Specie = require('./SpecieModel');
const { hydrateSpecie } = require('./hydrate');
const readline = require('readline');

const db = mongoose.connection;
mongoose.connect('mongodb://localhost:27017/taxonList', {
  useMongoClient: true,
});
mongoose.Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('openUri', () => {
  console.log('connected to db');
});

function* displayUpdateStatus(numberOfItem) {
  let numberStatusDisplayed = 1;
  while (numberStatusDisplayed <= numberOfItem) {
    process.stdout.write(`\r${numberStatusDisplayed} / ${numberOfItem}`);
    yield numberStatusDisplayed += 1;
    readline.clearLine(process.stdout, 0);
  }
}

(async function asyncIIFE() {
  const species = await Specie.find({
    lastHydrated: { $exists: false },
  });
  const updateStatus = displayUpdateStatus(species.length);
  for (const specie of species) {
    try {
      await hydrateSpecie(specie.taxonId);
      updateStatus.next();
      console.log('\n');
    } catch (error) {
      console.log(error);
    }
  }
  console.log('DONE');
}());
