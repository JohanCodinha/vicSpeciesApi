let fs = require('fs');
let mongoose = require('mongoose');
let aws = require('aws-sdk');
let https = require('https');
let Specie = require('./SpecieModel');
let searchMuseumSpecies = require('./api/museumVic');
let searchALASpecies = require('./api/atlasLivingAus');
let searchHerbariumSpecies = require('./api/herbarium');

let BUCKET_NAME = 'vba-species-image';
aws.config.loadFromPath('./awsConfig.json');
let s3 = new aws.S3();

let db = mongoose.connection;
mongoose.connect('mongodb://localhost:27017/test', {
  useMongoClient: true,
});
mongoose.Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('openUri', function() {
  console.log('connected to db');
});

async function fetchMetadata (scientificName,commonName, taxonType){
  const taxonomy = { scientificName, commonName };
  try {
    if (taxonType === 'Flora') {
      return await searchHerbariumSpecies(taxonomy) ||
        await searchALASpecies(taxonomy) ||
        await searchMuseumSpecies(taxonomy);
    } else {
      return await searchMuseumSpecies(taxonomy) ||
        await searchALASpecies(taxonomy) ||
        await searchHerbariumSpecies(taxonomy);
    }
  } catch (err) {
    console.log(err);
  }
};

function uploadFile(remoteFilename, file, contentType) {
  let image = new Buffer(file, 'binary');
  debugger;
  return new Promise((resolve, reject) => {
    s3.putObject({
      ACL: 'public-read',
      Bucket: BUCKET_NAME,
      Key: `${Date.now()}.jpg`,// remoteFilename,
      Body: image,
      ContentType: contentType,
    }, (error, response) => error
      ? reject(error)
      : resolve(response));
  });
};

function downloadFile(url) {
  return new Promise((resolve, reject) => https.get(url, function(res){
    let contentType = res.headers['content-type'];
    let imagedata = ''
    res.setEncoding('binary')
    res.on('data', function(chunk){
        imagedata += chunk
    })
    res.on('end', function(){
      return resolve({
        data: imagedata,
        contentType,
      });
    })
  }));
};

(async function (){
  let species = await Specie.find();
  for (specie of species.slice(0,5)) {
    const { scientificName, commonName, taxonType } = specie;
    const data = await fetchMetadata(scientificName, commonName, taxonType);
    console.log(data);
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
      const images = data.images.map(img => {
        return {
          url: img.medium,
          source: img.source,
          creator: img.creator,
        }
      });
      const fetchAndUploadPromises = images.map(image => {
        return new Promise(async (resolve, reject) => {
          try {
            console.log(image.url);
            if (!image.url) return resolve();
            const downloadedImage = await downloadFile(image.url);
            debugger;
            const uploadStatus = await uploadFile(
              /[^\/]+(?=\/$|$)/.exec(image.url)[0],
              downloadedImage.data,
              downloadedImage.contentType);
            resolve(uploadStatus);
          } catch (error) {
            reject(error);
          }
        });
      });
      try {
        const result = await Promise.all(fetchAndUploadPromises);
        const saved = await specie.update({images, description});
        console.log(result);
      } catch (err) {
        console.log(err)
      }
    }
    try {
      const saved = await specie.update({description});
      console.log(saved);
    } catch (error) {
      console.log(error);
    }
  }
  process.exit();

})()

