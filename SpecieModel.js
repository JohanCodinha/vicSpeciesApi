const mongoose = require('mongoose');

const specieShema = mongoose.Schema({
  taxonId: {
    type: Number,
    index: true,
    required: true,
  },
  parentTaxonID: Number,
  taxonType: String,
  commonName: String,
  commonNameSynonyme: [String],
  scientificName: String,
  scientificNameSynonyme: [String],
  shortName: String,
  authority: String,
  origin: String,
  discipline: {
    primary: String,
    all: [String],
  },
  images: [{
    url: String,
    author: String,
    source: String,
  }],
  description: {
    distribution: String,
    habitat: String,
    biology: String,
    general: String,
    source: String,
  },
  conservationStatus: {
    ffgAct: String,
    epbcAct: String,
    vicAdvisory: String,
  },
});

const Specie = mongoose.model('Specie', specieShema);

module.exports = Specie;
