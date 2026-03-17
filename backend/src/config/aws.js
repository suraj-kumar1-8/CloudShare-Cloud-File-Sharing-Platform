const { S3Client } = require('@aws-sdk/client-s3');

/**
 * Initialise and export a shared S3 client instance.
 * Credentials are pulled from environment variables so they are
 * never hard-coded in source code.
 */
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = s3;
