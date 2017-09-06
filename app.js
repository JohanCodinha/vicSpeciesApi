const express = require('express');
const mongoose = require('mongoose');
const Specie = require('./SpecieModel');
const cors = require('cors');

const { hydrateSpecie } = require('./hydrate');

const app = express();
app.use(cors());

const PORT = process.argv[2];
if (PORT === undefined) {
  console.log(new Error('port argument is undefined'));
  process.exit(1);
}

const db = mongoose.connection;
mongoose.connect('mongodb://localhost:27017/taxonList', {
  useMongoClient: true,
});

mongoose.Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('openUri', () => {
  console.log('connected to db');
});
const specieProjection = {
  _id: 0,
  commonName: 1,
  commonNameSynonyme: 1,
  conservationStatus: 1,
  scientificName: 1,
  scientificNameSynonyme: 1,
  discipline: 1,
  images: 1,
  parentTaxonID: 1,
  taxonId: 1,
  taxonType: 1,
  shortName: 1,
  authority: 1,
  origin: 1,
  description: 1,
};

function formatDiscipline(discipline) {
  switch (discipline) {
    case 'fauna':
      return 'Terrestrial fauna';
    case 'flora':
      return 'Flora';
    case 'marine':
      return 'Marine';
    default:
      return new RegExp(/[\s\S]*/);
  }
}

app.get('/search', async (req, res) => {
  try {
    const {
      query: seachQuery,
      discipline = 'all',
    } = req.query;
    console.log(`searchd: ${seachQuery} | ${discipline}`);
    if (!seachQuery) return res.status(422).send('No query provided');
    const primaryDiscipline = formatDiscipline(discipline);
    const regex = new RegExp(seachQuery, 'i');
    const result = await Specie.find({
      $or: [
        { commonName: regex },
        { scientificName: regex },
        { scientificNameSynonyme: regex },
        { commonNameSynonyme: regex },
      ],
      'discipline.primary': primaryDiscipline,
    }, specieProjection)
      // .where('discipline.primary').equals(primaryDiscipline)
      .limit(15);
    result.forEach(specie => hydrateSpecie(specie.taxonId));
    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

app.get('/taxon/:taxonId', async (req, res) => {
  try {
    const { taxonId: taxonIdString } = req.params;
    const taxonId = Number(taxonIdString);
    if (!taxonId || Number.isNaN(taxonId)) return res.status(422).send('No taxonId provided');
    const [result] = await Specie.find({ taxonId }, specieProjection);
    if (!result) return res.status(404).send('Specie not found');
    hydrateSpecie(taxonId);
    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'The request failled',
      error,
    });
  }
});

app.get('/taxon/:taxonId/image', async (req, res) => {
  try {
    const { taxonId: taxonIdString } = req.params;
    const taxonId = Number(taxonIdString);
    if (!taxonId || Number.isNaN(taxonId)) return res.status(422).send('No taxonId provided');
    const [result] = await Specie.find({ taxonId }, specieProjection);
    if (!result) return res.status(404).send('Specie not found');
    hydrateSpecie(taxonId);
    if (result.images.length) return res.redirect(result.images[0].s3Url);
    return res.status(404).send(`No image available for ${taxonId}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'The request failled',
      error,
    });
  }
});

try {
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });
} catch (error) {
  console.log('could not start server');
  console.log(error);
}
