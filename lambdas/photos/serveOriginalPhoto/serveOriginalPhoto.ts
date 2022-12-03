import AWS from 'aws-sdk';
import axios from 'axios';
import convert from 'heic-convert';

const S3 = new AWS.S3();

const baseHandler = async (event:any) => {
  try {
    // Context given by s3-object-lambda event trigger.
    /* inputS3Url is a presigned URL that the function can use to download
    the original object from the supporting Access Point */

    const getOriginalName = async () => {
      const { url }: {url:string} = event.userRequest;
      const srcKey = url.substring(url.lastIndexOf('/') + 1);
      const paramsS3 = {
        Bucket: process.env.S3_BUCKET!,
        Key: srcKey,
      };
      const data = await S3.headObject(paramsS3).promise();
      const fileName = data.ContentDisposition!.substring(data.ContentDisposition!.lastIndexOf('=') + 1);
      return fileName;
    };

    const originalImageName = await getOriginalName();
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
    await S3.writeGetObjectResponse({
      RequestRoute: outputRoute,
      RequestToken: outputToken,
      Body: originalImage,
      ContentDisposition: `attachment;filename=${originalImageName}`,
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
