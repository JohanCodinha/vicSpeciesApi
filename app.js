const express = require('express');
const mongoose = require('mongoose');
const Specie = require('./SpecieModel');

const { hydrateSpecie } = require('./hydrate');

const app = express();

const db = mongoose.connection;
mongoose.connect('mongodb://localhost:27017/test', {
  useMongoClient: true,
});

mongoose.Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('openUri', () => {
  console.log('connected to db');
});

app.get('/search', async (req, res) => {
  const { query: seachQuery } = req.query;
  if (!seachQuery) res.status(422).send('No query provided');
  const regex = new RegExp(seachQuery, 'i');
  try {
    const result = await Specie.find({
      $or: [
        { commonName: regex },
        { scientificName: regex },
        { scientificNameSynonyme: regex },
        { commonNameSynonyme: regex },
      ],
    }, {
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
    }).limit(10);
    res.json(result);
  } catch (error) {
    res.send(error);
  }
});

app.get('/taxon/:taxonId', async (req, res) => {
  const { taxonId: taxonIdString } = req.params;
  const taxonId = Number(taxonIdString);
  if (!taxonId || Number.isNaN(taxonId)) res.status(422).send('No taxonId provided');
  const [result] = await Specie.find({ taxonId });
  if (result.lastHydrated) {
    res.json(result);
  } else {
    await hydrateSpecie(taxonId);
    const [hydratedResult] = await Specie.find({ taxonId });
    res.json(hydratedResult);
  } 
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
