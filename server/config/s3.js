const AWS = require('aws-sdk');

// Configurar AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = 'lletresbarbares';
const IMAGES_FOLDER = 'images';
const VIDEOS_FOLDER = 'videos';

module.exports = {
  s3,
  BUCKET_NAME,
  IMAGES_FOLDER,
  VIDEOS_FOLDER
}; 