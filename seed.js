const fs = require('fs');
const path = require('path');
const util = require('util');
const mongoose = require('mongoose');
const SpecieModel = require('./SpecieModel');

const readFileAsync = util.promisify(fs.readFile);
const db = mongoose.connection;

mongoose.connect('mongodb://localhost:27017/test', {
  useMongoClient: true,
});
mongoose.Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('openUri', () => {
  console.log('connected to db');
});

function hydrateDiscipline(code) {
  switch (code) {
    case 'tf':
      return 'Terrestrial fauna';
    case 'fl':
      return 'Flora';
    case 'ma':
      return 'Marine';
    case 'af':
      return 'Aquatic fauna';
    case 'ai':
      return 'Aquatic invertebrates';
    default:
      return undefined;
  }
}

function splitDisciplineCode(disciplineString) {
  if (disciplineString === '') return undefined;
  return disciplineString
    .slice(1, disciplineString.length - 1)
    .split('][');
}

function formatJson(specie) {
  const specieDocument = {
    taxonId: specie.TAXON_ID,
    taxonType: specie.TAXON_TYPE || undefined,
    parentTaxonID: specie.PARENT_TAXON_ID || undefined,
    commonName: specie.COMMON_NAME || undefined,
    commonNameSynonyme: specie.COMMON_NME_SYNONYM[0] === ''
      ? specie.COMMON_NME_SYNONYM.split(', ')
      : undefined,
    scientificName: specie.SCIENTIFIC_NAME,
    scientificNameSynonyme: specie.SCIENTIFIC_NME_SYNONYM[0] === ''
      ? specie.SCIENTIFIC_NME_SYNONYM.split(', ')
      : undefined,
    shortName: specie.SHORT_NAME || undefined,
    origin: specie.ORIGIN || undefined,
    discipline: {
      primary: specie.PRIMARY_DISCIPLINE || undefined,
      all: splitDisciplineCode(specie.ALL_DISCIPLINE_CODES)
        .map(hydrateDiscipline) || undefined,
    },
    authority: specie.AUTHORITY.replace(/[(|)]/g, '') || undefined,
    conservationStatus: {
      ffgAct: specie.FFG_ACT_STATUS || undefined,
      epbcAct: specie.EPBC_ACT_STATUS || undefined,
      vicAdvisory: specie.VIC_ADVISORY_STATUS || undefined,
    },
  };
  return specieDocument;
}

(async function asyncIIFE() {
  /* Drop all model from the database */
  await SpecieModel.remove({}, (err) => {
    if (err) console.log(err);
    console.log('All SpeciesModel removed from database');
  });
  const speciesJson = await readFileAsync(path.join(__dirname, 'speciesList.json'), 'utf8');
  const species = JSON.parse(speciesJson);
  const speciesDocuments = species.map(formatJson);
  try {
    SpecieModel.insertMany(speciesDocuments)
      .then(docs => console.log(`Done: ${docs.length} species saved`))
      .catch(console.log);
  } catch (error) {
    console.log(error);
  }
}());
