import AWS from 'aws-sdk';
import axios from 'axios';
import sharp from 'sharp';
import convert from 'heic-convert';

const S3 = new AWS.S3();

const resizeImage = async (origimage :Buffer) => {
  const imageOriginal = sharp(origimage);
  const { width, height } = await sharp(origimage).metadata();
  if (!width || !height) return;

  const minValue = width < height ? 'width' : 'heigth';
  const newWidth = minValue === 'width' ? 400 : null;
  const newHeight = minValue === 'heigth' ? 400 : null;
  const resizeArgument = newWidth === null ? { height: newHeight! } : { width: newWidth };
  const imageResized = await imageOriginal.resize(resizeArgument).toBuffer();
  return imageResized;
};

const baseHandler = async (event:any) => {
  try {
    // Context given by s3-object-lambda event trigger.
    /* inputS3Url is a presigned URL that the function can use to download
    the original object from the supporting Access Point */

    const { outputRoute, outputToken, inputS3Url } = event.getObjectContext || {};
    let { data: originalImage } = await axios.get(inputS3Url, { responseType: 'arraybuffer' });

    if (inputS3Url.includes('.heic?')) {
      const outputBuffer = await convert({
        buffer: originalImage, // the HEIC file buffer
        format: 'JPEG', // output format
        quality: 1, // the jpeg compression quality, between 0 and 1
      });
      originalImage = Buffer.from(outputBuffer);
    }
    const imageResizedWatermarked = await resizeImage(originalImage);
    await S3.writeGetObjectResponse({
      RequestRoute: outputRoute,
      RequestToken: outputToken,
      Body: imageResizedWatermarked,
    }).promise();

    return {
      statusCode: 200,
    };
  } catch (e) {
    return {
      statusCode: 500,
    };
  }
};

// @ts-ignore
const handler = baseHandler;

module.exports.handler = handler;
