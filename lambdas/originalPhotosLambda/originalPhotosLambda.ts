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
// import convert from 'heic-convert';

import {
  Photo, PhotoMini, PhotoMiniWaterMark, Person, AppUser, Photo_Person,
} from '../../models/model';
import * as photoDropLogo from './PhotoDropLogo.png';
import * as photoDropLogoBig from './PhotoDropLogoBig.png';

/*
1.To import photoDropLogo index.d.ts has to be created and "*.png" has to be initiated and exported
*/
// get reference to S3 client
// delete this line after
const s3 = new AWS.S3();

const baseHandler = async (event: any) => {
  if (!photoDropLogo || !photoDropLogoBig) {
    return;
  }
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
  // get data from the metadata
  const peopleString = metadata.people;
  const peopleArray = peopleString.split(',');
  const { photographerid } = metadata;
  const { albumid } = metadata;

  // resized photos bucket
  const dstBucket = `${srcBucket}-resized`;
  const dstKey = `resized-${srcKey}`;
  // resized with watermark photos bucket
  const dstBucketWM = `${srcBucket}-resized-watermark`;
  const dstKeyWM = `resized-watermark${dstKey}`;
  // // watermarked original photo
  const dstBucketOWM = 'photodropbucket-watermarked';
  const dstKeyOWM = `${srcKey}`;

  const urlPhoto = `https://${srcBucket}.s3.eu-west-1.amazonaws.com/${srcKey}`;
  try {
    const photo = await Photo.create({
      name: srcKey, photoUrl: urlPhoto, photographerId: photographerid, albumId: albumid,
    });
    if (photo) {
      // const photoId = photo.id;
      for (let i = 0; i < peopleArray.length; i += 1) {
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
    // if (imageType === 'heic' || imageType === 'heif') {
    //   origimage = convert({
    //     buffer: origimage.Body, // the HEIC file buffer
    //     format: 'PNG', // output format
    //   });
    // }
  } catch (error) {
    console.log(error);
    return;
  }

  // resize the original image to thumbnail size
  let buffer;
  try {
    // @ts-ignore
    buffer = await Jimp.read(origimage.Body).then((image) => {
      const originalHeight = image.bitmap.height;
      const originalWidth = image.bitmap.width;
      const minValue = originalWidth < originalHeight ? 'width' : 'heigth';
      const newWidth = minValue === 'width' ? 400 : Jimp.AUTO;
      const newHeight = minValue === 'heigth' ? 400 : Jimp.AUTO;

      const resizedImage = image
        .resize(newWidth, newHeight)
        .quality(100) // set JPEG quality
        .getBufferAsync(Jimp.MIME_JPEG);

      return resizedImage;
    });
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
            name: srcKey,
            photoMiniUrl: urlPhotoMini,
            photographerId: photographerid,
            albumId: albumid,
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
        (have no idea why this name. I was trying to fix it with no success.)
        So later on we will read image using name mentioned above. The path will be
        "./d8885004a7cbbc5c2de6177b99b30489.png" - chekc zip file manually to double check
      */
      const logoImage = await Jimp.read('./d8885004a7cbbc5c2de6177b99b30489.png');
      // const resizeWidth = 400;
      if (!image) {
        return;
      }
      let imageResized = await Jimp.read(image);
      const originalHeight = imageResized.bitmap.height;
      const originalWidth = imageResized.bitmap.width;
      const minValue = originalWidth < originalHeight ? 'width' : 'heigth';
      const newWidth = minValue === 'width' ? 400 : Jimp.AUTO;
      const newHeight = minValue === 'heigth' ? 400 : Jimp.AUTO;

      imageResized = imageResized.resize(newWidth, newHeight);
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
            name: srcKey,
            photoMiniWaterMarkUrl: urlPhotoMiniWaterMark,
            photographerId: photographerid,
            albumId: albumid,
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

    // // watermark original image and save to the photodropbucket-watermarked

    const addWaterMarkToOriginal = async (image: any) => {
      /*
      2.After importing the  photoDropLogo and deploying with "serverless deploy" command
        photoDropLogo image will be present in zip package file
        under the name "d8885004a7cbbc5c2de6177b99b30489.png"
        (have no idea why this name. I was trying to fix it with no success.)
        So later on we will read image using name mentioned above. The path will be
        "./d8885004a7cbbc5c2de6177b99b30489.png" - chekc zip file manually to double check
      */
      const logoImageBig = await Jimp.read('./4de5d5c7c739360235f407fb0f36b3bc.png');
      if (!image) {
        return;
      }
      const imageOriginal = await Jimp.read(image);
      const originalHeight = imageOriginal.bitmap.height;
      const originalWidth = imageOriginal.bitmap.width;
      const minValue = originalWidth < originalHeight ? 'width' : 'heigth';
      const newWidth = minValue === 'width' ? originalWidth / 2.5 : Jimp.AUTO;
      const newHeight = minValue === 'heigth' ? originalHeight / 3.3 : Jimp.AUTO;

      logoImageBig.resize(newWidth, newHeight);// second argument is height
      imageOriginal.composite(
        logoImageBig,
        originalWidth / 2 - logoImageBig.bitmap.width / 2,
        originalHeight / 2 - logoImageBig.bitmap.height / 2,
      );
      return imageOriginal.getBufferAsync(Jimp.MIME_JPEG);
    };

    const imageOWM = await addWaterMarkToOriginal(origimage.Body);

    const destparamsOWM = {
      Bucket: dstBucketOWM,
      Key: dstKeyOWM,
      Body: imageOWM,
      ContentType: 'image',
    };

    await s3.putObject(destparamsOWM).promise();

    // notify(in telegram) app user that photo has been uploaded
    const phoneNumbers = peopleArray;
    if (phoneNumbers) {
      const arrLength = phoneNumbers.length;
      for (let i = 0; i < arrLength; i += 1) {
        const numericPhone = phoneNumbers[i].replace(/[^0-9]/g, '');
        // check if user with such phone number exist
        const user = await AppUser.findOne({ where: { phone: numericPhone } });
        // console.log({ user });
        if (user) {
          const person = await Person.findOne({ where: { phone: user.phone } });
          if (person) {
            // get all photos from specific album
            const photos = await Photo.findAll({ where: { albumId: albumid } });
            // console.log({ photos });
            if (photos) {
              const photoIds: string[] = [];
              photos.forEach((photo) => {
                photoIds.push(photo.id);
              });
              // console.log({ photoIds });
              // check if there are already photos from this album with current user
              const promisesArray: any = [];
              photoIds.forEach((el) => {
                const result = Photo_Person.findOne({
                  where: {
                    photoId: el,
                    personId: person.id,
                  },
                });
                promisesArray.push(result);
              });
              const photosWithPerson = await Promise.all(promisesArray);
              const notNullResponse = [];
              // console.log({ photosWithPerson });
              photosWithPerson.forEach((element) => {
                if (element !== null) {
                  notNullResponse.push(element);
                }
              });
              // console.log({ notNR: notNullResponse.length });
              /* if there only 1(one) photo(which just got uploaded)
              with current person in specific album -send one time notification to the telegram */
              if (notNullResponse.length === 1) {
                const uri = encodeURI(`https://api.telegram.org/bot5620754624:AAECaxHAR6n5ITV14KjCpP-JPGCrFKcCRjY/sendMessage?chat_id=-678774504&text=PhotoDrop:${phoneNumbers[i]} your photos have dropped🔥\n\nCheck them out here:\n  https://dev-photodrop-client.vercel.app/albums/${albumid}`);
                await axios({
                  method: 'get',
                  url: uri,
                });
              }
            }
          }
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
