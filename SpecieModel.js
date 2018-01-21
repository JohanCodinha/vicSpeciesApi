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
    _id: false,
    url: String,
    s3Url: String,
    s3Name: String,
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
  lastHydrated: Date,
  lastUpdated: { type: Date, default: Date.now },
});

const Specie = mongoose.model('Specie', specieShema);

module.exports = Specie;
