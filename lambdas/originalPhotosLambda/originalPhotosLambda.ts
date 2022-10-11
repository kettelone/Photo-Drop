/*
1.Configuration basics
https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html

2.Tutorial: Using an Amazon S3 trigger to invoke a Lambda function
https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html

3.Tutorial: Using an Amazon S3 trigger to create thumbnail images
https://docs.aws.amazon.com/lambda/latest/dg/with-s3-tutorial.html#with-s3-tutorial-create-function-createfunction

4.Working with object metadata
https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html#object-metadata

5.How can I get my CloudFormation stack to update if it's stuck in the UPDATE_ROLLBACK_FAILED state
https://aws.amazon.com/premiumsupport/knowledge-center/cloudformation-update-rollback-failed/
*/

import 'dotenv/config';
import AWS from 'aws-sdk';
import Jimp from 'jimp';
import axios from 'axios';
import {
  Photo, PhotoMini, PhotoMiniWaterMark, Person, AppUser,
} from '../../models/model';
import * as photoDropLogo from './PhotoDropLogo.png';

/*
1.To import photoDropLogo index.d.ts has to be created and "*.png" has to be initiated and exported
*/
// get reference to S3 client
// delete this line after
const s3 = new AWS.S3();

const baseHandler = async (event: any) => {
  if (!photoDropLogo) {
    return;
  }
  console.log('test');
  const srcBucket = event.Records[0].s3.bucket.name;
  // Object key may have spaces or unicode non-ASCII characters.
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  // for obtainig the meta data for the bucket and key
  const paramsS3 = {
    Bucket: srcBucket,
    Key: srcKey,
  };
  const data = await s3.headObject(paramsS3).promise();
  const metadata = (!data) ? null : data.Metadata;
  if (!metadata) {
    return;
  }
  const peopleString = metadata.people;
  const peopleArray = peopleString.split(',');

  // resized photos bucket
  const dstBucket = `${srcBucket}-resized`;
  const dstKey = `resized-${srcKey}`;
  // resized with watermark photos bucket
  const dstBucketWM = `${srcBucket}-resized-watermark`;
  const dstKeyWM = `resized-watermark${dstKey}`;

  // save original photo info to db
  const idEnd = srcKey.indexOf('/');
  const photographerId = Number(srcKey.substring(0, idEnd));
  // 1/1/491e9200-155e-4a19-8935-307b98fc3841_laptop.jpg

  const albumIdStart = srcKey.substring(idEnd + 1);
  const albumIdEnd = albumIdStart.indexOf('/');
  const albumId = Number(`${albumIdStart.substring(0, albumIdEnd)}`);
  const urlPhoto = `https://${srcBucket}.s3.eu-west-1.amazonaws.com/${srcKey}`;
  try {
    const photo = await Photo.create({
      name: srcKey, photoUrl: urlPhoto, photographerId, albumId,
    });
    if (photo) {
      // const photoId = photo.id;
      for (let i = 0; i < peopleArray.length; i += 1) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const personExist = await Person.findOne({ where: { phone: peopleArray[i] } });
          if (personExist === null) {
            /* eslint-disable no-await-in-loop */
            const numericPhone = peopleArray[i].replace(/[^0-9]/g, '');
            const person = await Person.create({
              phone: numericPhone,
              // photoId,
            });
            // @ts-ignore
            await person.addPhoto(photo);
          } else {
            // @ts-ignore
            await personExist.addPhoto(photo);
          }
        } catch (e) {
          console.log(e);
        }
      }
      console.log('Successfully uploaded');
    } else {
      console.log({ message: 'Photo was not found' });
    }
  } catch (e) {
    console.log(e);
    return;
  }

  // Infer the image type from the file suffix.
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log('Could not determine the image type.');
    return;
  }
  // Check that the image type is supported
  const imageType = typeMatch[1].toLowerCase();
  if (imageType !== 'jpg' && imageType !== 'png' && imageType !== 'jpeg') {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }

  // Download the image from the S3 source bucket.
  let origimage;
  try {
    const params = {
      Bucket: srcBucket,
      Key: srcKey,
    };
    origimage = await s3.getObject(params).promise();
  } catch (error) {
    console.log(error);
    return;
  }

  // set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
  const width = 400;

  // Use the sharp module to resize the image and save in a buffer.
  let buffer;
  try {
    // @ts-ignore
    buffer = await Jimp.read(origimage.Body).then((image) => {
      const resizedImage = image
        .resize(width, Jimp.AUTO)
        .quality(100) // set JPEG quality
        .getBufferAsync(Jimp.MIME_JPEG);

      return resizedImage;
    });
    // buffer = await sharp(origimage.Body).resize(width).toBuffer();
  } catch (error) {
    console.log(error);
    return;
  }

  // Upload the thumbnail image to the destination bucket
  try {
    const destparams = {
      Bucket: dstBucket,
      Key: dstKey,
      Body: buffer,
      ContentType: 'image',
    };

    const putResult = await s3.putObject(destparams).promise();
    if (putResult) {
      try {
        // save resized photo info to db
        const urlPhotoMini = `https://${dstBucket}.s3.eu-west-1.amazonaws.com/${srcKey}`;
        try {
          await PhotoMini.create({
            name: srcKey, photoMiniUrl: urlPhotoMini, photographerId, albumId,
          });
        } catch (e) {
          console.log(e);
          return;
        }
      } catch (e) {
        console.log(e);
        return;
      }
      console.log(`Successfully resized ${srcBucket}/${srcKey
      } and uploaded to ${dstBucket}/${dstKey}`);

      console.log('METADATA IS:   ', metadata);
    }
  } catch (error) {
    console.log(error);
    return;
  }

  try {
    // add watermark add upload to photodropbucket-resized-watermark
    const addWaterMark = async (image: any) => {
      /*
      2.After importing the  photoDropLogo and deploying with "serverless deploy" command
        photoDropLogo image will be present in zip package file
        under the name "d8885004a7cbbc5c2de6177b99b30489.png"
        (have no idea why this name. I was trying tix it with no success.)
        So later on we will read image using name mentioned above. The path will be
        "./d8885004a7cbbc5c2de6177b99b30489.png" - chekc zip file manually to double check
      */
      const logoImage = await Jimp.read('./d8885004a7cbbc5c2de6177b99b30489.png');
      const resizeWidth = 400;
      if (!image) {
        return;
      }
      let imageResized = await Jimp.read(image);
      imageResized = imageResized.resize(resizeWidth, Jimp.AUTO);
      // const imageResized = await sharp(image).resize(resizeWidth).toBuffer();
      const img = await Jimp.read(imageResized);
      img.composite(
        logoImage,
        img.bitmap.width / 2 - logoImage.bitmap.width / 2,
        img.bitmap.height / 2 - logoImage.bitmap.height / 2,
      );
      return img.getBufferAsync(Jimp.MIME_JPEG);
    };

    const imageWM = await addWaterMark(origimage.Body);

    const destparamsWM = {
      Bucket: dstBucketWM,
      Key: dstKeyWM,
      Body: imageWM,
      ContentType: 'image',
    };

    const putResultWM = await s3.putObject(destparamsWM).promise();

    if (putResultWM) {
      try {
        // save resized photo info to db
        const urlPhotoMiniWaterMark = `https://${dstBucketWM}.s3.eu-west-1.amazonaws.com/${srcKey}`;
        try {
          await PhotoMiniWaterMark.create({
            name: srcKey, photoMiniWaterMarkUrl: urlPhotoMiniWaterMark, photographerId, albumId,
          });
        } catch (e) {
          console.log(e);
          return;
        }
      } catch (e) {
        console.log(e);
        return;
      }
      console.log(`Successfully resized with matermark${srcBucket}/${srcKey} 
      and uploaded to ${dstBucketWM}/${dstKeyWM}`);
    }

    // notify(in telegram) app user that photo has been uploaded
    const phoneNumbers = peopleArray;
    if (phoneNumbers) {
      const arrLength = phoneNumbers.length;
      for (let i = 0; i < arrLength; i += 1) {
        const numericPhone = phoneNumbers[i].replace(/[^0-9]/g, '');
        const user = await AppUser.findOne({ where: { phone: numericPhone } });
        console.log({ user });
        if (user) {
          const uri = encodeURI(`https://api.telegram.org/bot5620754624:AAECaxHAR6n5ITV14KjCpP-JPGCrFKcCRjY/sendMessage?chat_id=-678774504&text=PhotoDrop:${phoneNumbers[i]} your photos have dropped🔥\n\nCheck them out here:\n https://userAppUrlWillBeSoonHere.com`);
          const response = await axios({
            method: 'get',
            url: uri,
          });
          console.log({ response });
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};
// @ts-ignore
const handler = baseHandler;

module.exports.handler = handler;
