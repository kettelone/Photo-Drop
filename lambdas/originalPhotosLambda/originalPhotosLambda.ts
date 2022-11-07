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
import sharp from 'sharp';
import convert from 'heic-convert';

import axios from 'axios';
import {
  Photo, PhotoMini, PhotoMiniWaterMark, Person, AppUser, Photo_Person,
} from '../../models/model';
import * as photoDropLogo from './PhotoDropLogo.png';
import * as photoDropLogoBig from './PhotoDropLogoBig.png';
import { PhotoInstance } from '../../models/interfaces';
/*
1.To import photoDropLogo index.d.ts has to be created and "*.png" has to be initiated and exported
*/
// get reference to S3 client
// delete this line after
const s3 = new AWS.S3();

// 1. Get metadata from the photo
const getMetaData = async (srcBucket:string, srcKey:string) => {
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
  const { photographerid } = metadata;
  const { albumid } = metadata;

  return { peopleArray, photographerid, albumid };
};

// 2.Add people to photo
const addPeopleToPhoto = async (phoneNumbersArray: string[], image: PhotoInstance): Promise<void> => {
  const promises = phoneNumbersArray.map((phoneNumber) => Person.findOne(
    { where: { phone: phoneNumber } },
  ));
  const allPeople = await Promise.all(promises);
  const peopleExistPromises = allPeople.filter((personExist) => personExist !== null);
  const peopleNotExistPromise = allPeople.filter((personExist) => personExist === null);
  const peopleExist = await Promise.all(peopleExistPromises);
  const peopleNotExist = await Promise.all(peopleNotExistPromise);
  const addExistingPerson = peopleExist.map((person) => Photo_Person.create(
    { photoId: image.id, personId: person!.id },
  ));
  const addNotExistingPerson = peopleNotExist.map((person) => Photo_Person.create(
    { photoId: image.id, personId: person!.id },
  ));
  await Promise.all(addExistingPerson);
  await Promise.all(addNotExistingPerson);
};

// 3. Handle image type
const handleImageType = (srcKey: string): boolean | string => {
  // Infer the image type from the file suffix.
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log('Could not determine the image type.');
    return false;
  }
  // Check that the image type is supported
  const imageType = typeMatch[1].toLowerCase();
  if (imageType !== 'jpg' && imageType !== 'png' && imageType !== 'jpeg') {
    console.log(`Unsupported image type: ${imageType}`);
    return imageType;
  }
  return true;
};

// 4. Create thumbnail
const createThumbnail = async (paramsObject:any, photographerid:string, albumid:string, originalImage:Buffer) => {
  try {
    const buffer = await Jimp.read(originalImage).then((image) => {
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

    const destparams = {
      Bucket: paramsObject.dstBucket,
      Key: paramsObject.dstKey,
      Body: buffer,
      ContentType: 'image',
    };

    const putResult = await s3.putObject(destparams).promise();
    if (putResult) {
      // save resized photo info to db
      const urlPhotoMini = `https://${paramsObject.dstBucket}.s3.eu-west-1.amazonaws.com/${paramsObject.dstKey}`;
      await PhotoMini.create({
        name: paramsObject.dstKey,
        photoMiniUrl: urlPhotoMini,
        photographerId: photographerid,
        albumId: albumid,
      });

      console.log(`Successfully resized ${paramsObject.dstKey} and uploaded to ${paramsObject.dstBucket}/${paramsObject.dstKey}`);
    }
  } catch (e) {
    console.log(e);
  }
};

// 5. Create watermarked thumbnail

const createWatermarkedThumbnail = async (paramsObject:any, photographerid:string, albumid:string, originalImage :Buffer) => {
  /*
        After importing the  photoDropLogo and deploying with "serverless deploy" command
        photoDropLogo image will be present in zip package file
        under the name "d8885004a7cbbc5c2de6177b99b30489.png"
        (have no idea why this name. I was trying to fix it with no success.)
        So later on we will read image using name mentioned above. The path will be
        "./d8885004a7cbbc5c2de6177b99b30489.png" - chekc zip file manually to double check
      */
  const logoImage = await Jimp.read('./d8885004a7cbbc5c2de6177b99b30489.png');
  try {
    const addWaterMark = async (image: Buffer) => {
      let imageResized = await Jimp.read(image);
      const originalHeight = imageResized.bitmap.height;
      const originalWidth = imageResized.bitmap.width;
      const minValue = originalWidth < originalHeight ? 'width' : 'heigth';
      const newWidth = minValue === 'width' ? 400 : Jimp.AUTO;
      const newHeight = minValue === 'heigth' ? 400 : Jimp.AUTO;

      imageResized = imageResized.resize(newWidth, newHeight);
      const img = await Jimp.read(imageResized);
      img.composite(
        logoImage,
        img.bitmap.width / 2 - logoImage.bitmap.width / 2,
        img.bitmap.height / 2 - logoImage.bitmap.height / 2,
      );
      return img.getBufferAsync(Jimp.MIME_JPEG);
    };

    const imageWM = await addWaterMark(originalImage);
    const destparamsWM = {
      Bucket: paramsObject.dstBucketWM,
      Key: paramsObject.dstKeyWM,
      Body: imageWM,
      ContentType: 'image',
    };
    const putResultWM = await s3.putObject(destparamsWM).promise();

    if (putResultWM) {
      // save resized photo info to db
      const urlPhotoMiniWaterMark = `https://${paramsObject.dstBucketWM}.s3.eu-west-1.amazonaws.com/${paramsObject.dstKeyWM}`;
      await PhotoMiniWaterMark.create({
        name: paramsObject.dstKeyWM,
        photoMiniWaterMarkUrl: urlPhotoMiniWaterMark,
        photographerId: photographerid,
        albumId: albumid,
      });
      console.log(`Successfully resized  ${paramsObject.dstKeyWM} and uploaded to ${paramsObject.dstBucketWM}`);
    }
  } catch (e) {
    console.log(e);
  }
};

// 6. Create Watermarked original photo
const createOriginalWatermarked = async (paramsObject: any, originalImage :Buffer) => {
  try {
    /*
        After importing the  photoDropLogo and deploying with "serverless deploy" command
        photoDropLogo image will be present in zip package file
        under the name "d8885004a7cbbc5c2de6177b99b30489.png"
        (have no idea why this name. I was trying to fix it with no success.)
        So later on we will read image using name mentioned above. The path will be
        "./d8885004a7cbbc5c2de6177b99b30489.png" - chekc zip file manually to double check
      */
    const addWaterMarkToOriginal = async (image: Buffer) => {
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
    const imageOWM = await addWaterMarkToOriginal(originalImage);
    const destparamsOWM = {
      Bucket: paramsObject.dstBucketOWM,
      Key: paramsObject.dstKeyOWM,
      Body: imageOWM,
      ContentType: 'image',
    };

    await s3.putObject(destparamsOWM).promise();
  } catch (e) {
    console.log(e);
  }
};

const handleNotification = async (peopleArray: string[], albumid: string) => {
  try {
    // // notify(in telegram) app user that photo has been uploaded
    const phoneNumbers = peopleArray;

    /* // 1. Check if user with such phone number exist
    const userExistPromises = phoneNumbers.map((phone) => AppUser.findOne({ where: { phone } }));
    let ExistingUsers = await Promise.all(userExistPromises);
    ExistingUsers = ExistingUsers.filter((user) => user !== null);
    // 2. Find person with user phone
    const peoplePromises = ExistingUsers.map((user) => Person.findOne({ where: { phone: user!.phone } }));
    let people = await Promise.all(peoplePromises);
    people = people.filter((person) => person !== null);
    // 3. Find all photos from album
    const photos = await Photo.findAll({ where: { albumId: albumid } });
    // 4. Find all photos id
    const photoIds = photos.map((photo) => photo.id);
    // 5. Check if photo belongs to the person
    const photoPersonPromise: any[] = [];
    people.forEach((person) => {
      photoIds.forEach((id) => {
        const result = Photo_Person.findOne({
          where: {
            photoId: id,
            personId: person!.id,
          },
        });
        photoPersonPromise.push(result);
      });
    });
    const photosWithPerson = await Promise.all(photoPersonPromise);
    // 6. Filter to have only not null responses
    const notNullResponse = photosWithPerson.filter((photo) => photo !== null);

    notNullResponse.forEach((el) => {
      if (el.length === 1) {
        const uri = encodeURI(`https://api.telegram.org/bot5620754624:AAECaxHAR6n5ITV14KjCpP-JPGCrFKcCRjY/sendMessage?chat_id=-678774504&text=PhotoDrop:${phoneNumbers[i]} your photos have dropped🔥\n\nCheck them out here:\n  https://dev-photodrop-client.vercel.app/albums/${albumid}`);
        await axios({
          method: 'get',
          url: uri,
        });
      }
    });
    */
    if (phoneNumbers) {
      for (let i = 0; i < phoneNumbers.length; i += 1) {
        const numericPhone = phoneNumbers[i].replace(/[^0-9]/g, '');
        // check if user with such phone number exist
        /* eslint-disable no-await-in-loop */
        const user = await AppUser.findOne({ where: { phone: numericPhone } });
        if (user) {
          /* eslint-disable no-await-in-loop */
          const person = await Person.findOne({ where: { phone: user.phone } });
          if (person) {
            // get all photos from specific album
            /* eslint-disable no-await-in-loop */
            const photos = await Photo.findAll({ where: { albumId: albumid } });
            // console.log({ photos });
            if (photos) {
              const photoIds = photos.map((image) => image.id);
              // check if there are already photos from this album with current user
              const promisesArray = photoIds.map((el) => Photo_Person.findOne({
                where: {
                  photoId: el,
                  personId: person.id,
                },
              }));
              const photosWithPerson = await Promise.all(promisesArray);
              const notNullResponse = photosWithPerson.filter((element) => element !== null);
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
  } catch (e) {
    console.log(e);
  }
};

const baseHandler = async (event :any) => {
  try {
    if (!photoDropLogo || !photoDropLogoBig) {
      return;
    }
    const srcBucket:string = event.Records[0].s3.bucket.name;
    const srcKey: string = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    const response = await getMetaData(srcBucket, srcKey);
    if (response) {
      const { peopleArray, photographerid, albumid } = response;

      const paramsObject = {
        dstBucket: `${srcBucket}-resized`,
        dstBucketWM: `${srcBucket}-resized-watermark`,
        dstBucketOWM: `${srcBucket}-watermarked`,
        dstKey: srcKey,
        dstKeyWM: srcKey,
        dstKeyOWM: srcKey,
      };

      // 1.Save photo to DB
      const urlPhoto = `https://${srcBucket}.s3.eu-west-1.amazonaws.com/${srcKey}`;
      const photo = await Photo.create({
        name: srcKey, photoUrl: urlPhoto, photographerId: photographerid, albumId: albumid,
      });
      // 2.Add people that are marked on the photo
      if (photo) {
        await addPeopleToPhoto(peopleArray, photo);
        console.log('Successfully uploaded');
      } else {
        console.log({ message: 'Photo was not found' });
      }
      // Get original image
      const origimage = await s3.getObject({ Bucket: srcBucket, Key: srcKey }).promise();
      let originalImage = origimage.Body as Buffer;

      // 3. Check image type
      const imageTypeCheck = handleImageType(srcKey);
      if (imageTypeCheck === false) { return; }
      if (imageTypeCheck === 'webp') {
        originalImage = await sharp(originalImage).jpeg().toBuffer();
      }
      if (imageTypeCheck === 'heic' || imageTypeCheck === 'heif') {
        const outputBuffer = await convert({
          buffer: originalImage, // the HEIC file buffer
          format: 'JPEG', // output format
          quality: 1, // the jpeg compression quality, between 0 and 1
        });
        originalImage = Buffer.from(outputBuffer);
      }
      // 4. Create thumbnail and save to DB
      await createThumbnail(paramsObject, photographerid, albumid, originalImage);

      // 5. Create watermarked thumbnail and save to DB
      await createWatermarkedThumbnail(paramsObject, photographerid, albumid, originalImage);

      // 6. Watermark original photo and save to DB
      await createOriginalWatermarked(paramsObject, originalImage);

      // 7. Handle Telegram notification
      await handleNotification(peopleArray, albumid);
    }
  } catch (e) {
    console.log(e);
  }
};
// @ts-ignore
const handler = baseHandler;

module.exports.handler = handler;
