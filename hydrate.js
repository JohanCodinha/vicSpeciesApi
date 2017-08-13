const mongoose = require('mongoose');
const aws = require('aws-sdk');
const https = require('https');
const crypto = require('crypto');
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

function uploadFile(taxonId, image) {
  const { data, contentType } = image;
  const BUCKET_NAME = 'vba-species-image';
  const imageBuffer = new Buffer(data, 'binary');
  const hashName = crypto.createHash('md5').update(data).digest('hex');
  const fileName = `${hashName}_${taxonId}`;
  return new Promise((resolve, reject) => {
    s3.upload({
      ACL: 'public-read',
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: imageBuffer,
      ContentType: contentType,
    }, (error, response) => {
      if (error) return reject(error);
      return resolve(Object.assign({},
        image,
        { s3Url: response.Location }));
    });
  });
}

function downloadFile(image) {
  return new Promise((resolve, reject) => {
    const url = image.url;
    if (typeof url !== 'string') return reject(new Error(`Url should be a string but is ${typeof url}`));
    return https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Network error, status code: ${res.statusCode}`));
      }
      const contentType = res.headers['content-type'];
      let data = '';
      res.setEncoding('binary');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(Object.assign({}, image, {
          data,
          contentType,
        }));
      });
      res.on('error', (err) => {
        reject(err);
      });
    });
  });
}

async function hydrateSpecie({ scientificName, commonName, taxonType, taxonId }) {
  const data = await fetchMetadata(scientificName, commonName, taxonType);
  console.log(data);
  console.log(`${taxonId} : ${data.images.length} image${data.images.length > 1 ? 's' : ''} found for ${commonName}`);
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
    const fetchAndUploadPromises = data.images
      .map(image => new Promise(async (resolve, reject) => {
        const imageUrl = image.url;
        try {
          if (!imageUrl) return resolve();
          const downloadedImage = await downloadFile(imageUrl);
          console.log(`Downloaded : ${/[^/]+(?=\/$|$)/.exec(imageUrl)[0]}`);
          const hashName = crypto.createHash('md5').update(downloadedImage.data).digest('hex');
          const fileName = `${hashName}_${taxonId}`;
          const { Location: location } = await uploadFile(
            fileName,
            downloadedImage.data,
            downloadedImage.contentType);
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
      const images = await Promise.all(fetchAndUploadPromises)
        .then(imgs => imgs.filter(img => img !== undefined));
      return {
        images,
        description,
      };
      // const saved = await specie.update({ images, description });
      // console.log(`${taxonId} | ${scientificName} update status: ${!!saved.ok}/n
        // ${JSON.stringify(images.map(img => img.url))}`);
    } catch (err) {
      console.log(err);
    }
  }
  return { description };
   // else {
    // try {
      // return
      // const saved = await specie.update({ description });
      // console.log(saved);
    // } catch (error) {
      // console.log(error);
    // }
  // }
}

(async function asyncIIFE() {
  const species = await Specie.find();
  const {taxonId, scientificName, commonName, taxonType} = species[1203];
  const metaData = await fetchMetadata(scientificName, commonName, taxonType);
  const images = metaData.images;
  const description = (metaData.distribution || metaData.habitat || metaData.biology)
  ? {
    source: metaData.source,
    distribution: metaData.distribution || undefined,
    habitat: metaData.habitat || undefined,
    biology: metaData.biology || undefined,
  }
  : undefined;
  console.log(scientificName);
  console.log(images);
  console.log(description);
  try {
    const downloadPromises = images.map(image => downloadFile(image));
    const imagesWithFile = await Promise.all(downloadPromises);
    const uploadPromises = imagesWithFile.map(image => uploadFile(taxonId, image));
    const uploadedImage = await Promise.all(uploadPromises);
    debugger;
  } catch (error) {
    console.log(error);
  }
}());
