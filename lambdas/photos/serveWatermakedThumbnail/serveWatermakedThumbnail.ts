import AWS from 'aws-sdk';
import axios from 'axios';
import sharp from 'sharp';
import convert from 'heic-convert';
import * as photoDropLogo from './PhotoDropLogo.png';

const S3 = new AWS.S3();

const resizeAddWatermark = async (image :Buffer) => {
  const imageOriginal = sharp(image);
  const { width, height } = await sharp(image).metadata();
  if (!width || !height) return;

  const minValue = width < height ? 'width' : 'heigth';
  const imageWidth = minValue === 'width' ? 400 : null;
  const imageHeight = minValue === 'heigth' ? 400 : null;
  const resizeArgument = imageWidth === null ? { height: imageHeight! } : { width: imageWidth };
  const logo = await sharp('./d8885004a7cbbc5c2de6177b99b30489.png').toBuffer();
  const imageResized = imageOriginal.resize(resizeArgument);
  const composedImage = await imageResized.composite([{ input: logo }]).toBuffer();
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
    const imageResizedWatermarked = await resizeAddWatermark(originalImage);

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
