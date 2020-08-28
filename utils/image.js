const AWS = require('aws-sdk');

const colors = require('colors');

const bucketName = process.env.BUCKET_NAME;

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const imageHandler = async (req, up, del) => {
  if (up) await uploadHanlder(req);

  if (del) await deleteHandler(req);
};

const uploadHanlder = async (req) => {
  req.body.images = [];

  for (let image of req.files) {
    const keyName = image.originalname;
    const body = image.buffer;

    s3.createBucket({ Bucket: bucketName }, () => {
      const params = {
        Bucket: bucketName,
        Key: keyName,
        Body: body,
      };

      s3.putObject(params, (err, data) => {
        if (err) console.log(err);
        else
          console.log(
            `Successfully uploaded data to ${bucketName} / ${keyName}`
              .green.inverse
          );
      });
    });

    req.body.images.push(
      `https://imagesforshopapp.s3.amazonaws.com/${keyName}`
    );
  }
};

const deleteHandler = async (req) => {
  for (let image of req.imagesUrl) {
    const fileName = image.split('.com/')[1];

    const params = { Bucket: bucketName, Key: fileName };
    s3.deleteObject(params, (err, data) => {
      if (err) console.log(err);
      else console.log('deleted'); // deleted
    });
  }
};

module.exports = imageHandler;
