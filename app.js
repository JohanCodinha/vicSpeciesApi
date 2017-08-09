let fs = require('fs');
let aws = require('aws-sdk');
let mongoose = require('mongoose');

let BUCKET_NAME = 'vba-species-image';
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/test');
aws.config.loadFromPath('./awsConfig.json');

let s3 = new aws.S3();
let db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('openUri', function() {
//   console.log('connected to db');
// });

// let specieShema = mongoose.Schema({
//   taxonId: Number,
//   commonName: String,
//   scientificName: String,
// });

// let Specie = mongoose.model('Specie', specieShema);
// let possum = new Specie({taxonId: 12, commonName: 'Longtail Possum'});
// possum.save()
//   .then(saved => console.log(saved))
//   .catch(err => console.error(err));

// Specie.find({taxonId: 12345}, (poss)=> console.log(poss));
// Specie.find(function(err, species) {
//   console.log(species);
// });

function uploadFile(remoteFilename, file) {
  s3.putObject({
    ACL: 'public-read',
    Bucket: BUCKET_NAME,
    Key: remoteFilename,
    Body: file,
    ContentType: 'image/jpg'
  }, function(error, response) {
    console.log(arguments);
  });
};

fs.readFile('image.JPG', (err, data) => {
  if (err) throw err;
  uploadFile('testImage', data);
});