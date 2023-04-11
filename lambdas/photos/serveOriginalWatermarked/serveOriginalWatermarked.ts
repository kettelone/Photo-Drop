import AWS from 'aws-sdk';
import axios from 'axios';
import sharp from 'sharp';
import convert from 'heic-convert';
import * as photoDropLogo from './PhotoDropLogoBig.png';

const S3 = new AWS.S3();

const addWatermark = async (image: Buffer) => {
  // change quality if image too poor
  const imageOriginal = sharp(image).webp({ quality: 25 });
  const { width, height } = await sharp(image).metadata();
  if (!width || !height) return;

  const minValue = width < height ? 'width' : 'heigth';
  const logoWidth = minValue === 'width' ? Number((width / 2.5).toFixed(0)) : null;
  const logoHeight = minValue === 'heigth' ? Number((height / 3.3).toFixed(0)) : null;
  const resizeArgument = logoWidth === null ? { height: logoHeight! } : { width: logoWidth };
  const logoResized = await sharp('./4de5d5c7c739360235f407fb0f36b3bc.png').resize(resizeArgument).toBuffer();
  const composedImage = await imageOriginal.composite([
    { input: logoResized },
  ]).toBuffer();

  return composedImage;
};

const baseHandler = async (event:any) => {
  if (!photoDropLogo) {
    return;
  }
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
    const imageWithWatermark = await addWatermark(originalImage);

    await S3.writeGetObjectResponse({
      RequestRoute: outputRoute,
      RequestToken: outputToken,
      Body: imageWithWatermark,
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
