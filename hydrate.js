const mongoose = require('mongoose');
const aws = require('aws-sdk');
const https = require('https');
const Specie = require('./SpecieModel');
const searchMuseumSpecies = require('./api/museumVic');
const searchALASpecies = require('./api/atlasLivingAus');
const searchHerbariumSpecies = require('./api/herbarium');

aws.config.loadFromPath('./awsConfig.json');
const s3 = new aws.S3();

const db = mongoose.connection;
mongoose.connect('mongodb://localhost:27017/test', {
  useMongoClient: true,
});
mongoose.Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('openUri', () => {
  console.log('connected to db');
});

async function fetchMetadata(scientificName, commonName, taxonType) {
  /* eslint-disable no-return-await */
  try {
    const taxonomy = { scientificName, commonName };
    if (taxonType === 'Flora') {
      return await searchHerbariumSpecies(taxonomy) ||
        await searchALASpecies(taxonomy) ||
        await searchMuseumSpecies(taxonomy);
    }
    return await searchMuseumSpecies(taxonomy) ||
      await searchALASpecies(taxonomy) ||
      await searchHerbariumSpecies(taxonomy);
  } catch (error) {
    console.log(error);
    return error;
  }
}

function uploadFile(remoteFilename, file, contentType) {
  const BUCKET_NAME = 'vba-species-image';
  const image = new Buffer(file, 'binary');
  // debugger;
  return new Promise((resolve, reject) => {
    s3.upload({
      ACL: 'public-read',
      Bucket: BUCKET_NAME,
      Key: remoteFilename, // `${Date.now()}.jpg`,
      Body: image,
      ContentType: contentType,
    }, (error, data) => {
      if (error) return reject(error);
      return resolve(data);
    });
  });
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    if (typeof url !== 'string') return reject(new Error(`Url should be a string but is ${typeof url}`));
    return https.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.log(res.statusCode);
        reject(new Error(`Network error, status code: ${res.statusCode}`));
      }
      const contentType = res.headers['content-type'];
      let imagedata = '';
      res.setEncoding('binary');
      try {
        res.on('data', (chunk) => {
          imagedata += chunk;
        });
        res.on('end', () => {
          resolve({
            data: imagedata,
            contentType,
          });
        });
        res.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        console.log(error);
      }
    });
  });
}

(async function asyncIIFE() {
  const species = await Specie.find();
  species.slice(0, 5).forEach(async (specie) => {
    const { scientificName, commonName, taxonType } = specie;
    const data = await fetchMetadata(scientificName, commonName, taxonType);
    console.log(!!data);
    console.log(`${specie.taxonId} : ${data.images.length} found for ${commonName}`);
    const description = {
      source: (data.distribution ||
        data.habitat || data.biology)
        ? data.source
        : undefined,
      distribution: data.distribution || undefined,
      habitat: data.habitat || undefined,
      biology: data.biology || undefined,
    };
    if (data.images.length) {
      // const images = data.images.map(img => ({
      //   url: img.medium,
      //   source: img.source,
      //   creator: img.creator,
      // }));
      const fetchAndUploadPromises = data.images
        .map(image => new Promise(async (resolve, reject) => {
          const imageUrl = image.medium;
          try {
            if (!imageUrl) return resolve();
            const downloadedImage = await downloadFile(imageUrl);
            console.log(`Downloaded : ${/[^/]+(?=\/$|$)/.exec(imageUrl)[0]}`);
            const { Location: location } = await uploadFile(
              /[^/]+(?=\/$|$)/.exec(imageUrl)[0],
              downloadedImage.data,
              downloadedImage.contentType);
            // console.log(location);
            return resolve({
              url: location,
              source: image.source,
              creator: image.creator,
            });
          } catch (error) {
            return reject(error);
          }
        }));
      try {
        const images = await Promise.all(fetchAndUploadPromises);
        const saved = await specie.update({ images, description });
        console.log(images, saved);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const saved = await specie.update({ description });
        console.log(saved);
      } catch (error) {
        console.log(error);
      }
    }
  });
}());
