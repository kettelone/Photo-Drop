import AWS from 'aws-sdk';
import axios from 'axios';
import Jimp from 'jimp';
import sharp from 'sharp';
import convert from 'heic-convert';
import * as photoDropLogo from './PhotoDropLogoBig.png';

const S3 = new AWS.S3();

const addWatermark = async (image :Buffer) => {
  if (!image) {
    return;
  }
  const logoImageBig = await Jimp.read('./4de5d5c7c739360235f407fb0f36b3bc.png');
  const imageOriginal = await Jimp.read(image);
  const originalHeight = imageOriginal.bitmap.height;
  const originalWidth = imageOriginal.bitmap.width;
  const minValue = originalWidth < originalHeight ? 'width' : 'heigth';
  const newWidth = minValue === 'width' ? originalWidth / 2.5 : Jimp.AUTO;
  const newHeight = minValue === 'heigth' ? originalHeight / 3.3 : Jimp.AUTO;

  logoImageBig.resize(newWidth, newHeight);
  imageOriginal.composite(
    logoImageBig,
    originalWidth / 2 - logoImageBig.bitmap.width / 2,
    originalHeight / 2 - logoImageBig.bitmap.height / 2,
  );
  return imageOriginal.getBufferAsync(Jimp.MIME_JPEG);
};

const baseHandler = async (event:any) => {
  if (!photoDropLogo) {
    return;
  }
  try {
    // Context given by s3-object-lambda event trigger.
    /* inputS3Url is a presigned URL that the function can use to download
    the original object from the supporting Access Point */

    console.log('Start Event', event);
    const { outputRoute, outputToken, inputS3Url } = event.getObjectContext || {};

    let { data: originalImage } = await axios.get(inputS3Url, { responseType: 'arraybuffer' });
    if (inputS3Url.includes('.webp?')) {
      originalImage = await sharp(originalImage).jpeg().toBuffer();
    }
    if (inputS3Url.includes('.heic?')) {
      const outputBuffer = await convert({
        buffer: originalImage, // the HEIC file buffer
        format: 'JPEG', // output format
        quality: 1, // the jpeg compression quality, between 0 and 1
      });
      originalImage = Buffer.from(outputBuffer);
    }
    const imageWithWatermark = await addWatermark(originalImage);
    console.log('Return imageWithWatermark');
    await S3.writeGetObjectResponse({
      RequestRoute: outputRoute,
      RequestToken: outputToken,
      Body: imageWithWatermark,
    }).promise();

    return {
      statusCode: 200,
    };
  } catch (e) {
    console.error('Error', e);
    return {
      statusCode: 500,
    };
  }
};

// @ts-ignore
const handler = baseHandler;

module.exports.handler = handler;
