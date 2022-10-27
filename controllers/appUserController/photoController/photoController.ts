import { Request, Response } from 'express';
import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import {
  SelfieMini, Person, Photo_Person, Photo, UserAlbum, PhotoMini, Album, AppUser,
} from '../../../models/model';
import { PhotoInstance } from '../../../models/interfaces';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-08-01',
});
// This is your test secret API key.
aws.config.update({
  region: 'eu-west-1',
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

const checkIfPaid = async (userId:string, albumId:string) :Promise<boolean> => {
  try {
    const info = await UserAlbum.findOne({ where: { userId, albumId } });
    if (info === null) {
      return false;
    }
    if (info.isPaid === false) {
      return false;
    }
    if (info.isPaid === true) {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
};

const generatePaymnet = async (albumId:string, userId:string):Promise<string |undefined> => {
  const albumItem = { id: 1, priceInCents: 500, name: 'Album' };
  if (albumId !== undefined && userId !== undefined) {
    try {
      const customer = await stripe.customers.create({
        metadata: { userId: `${userId}`, albumId: `${albumId}` },
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer: customer.id,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: albumItem.name,
            },
            unit_amount: albumItem.priceInCents,
          },
          quantity: 1,
        }],
        metadata: { userId: `${userId}`, albumId: `${albumId}` },
        success_url: `${process.env.SERVER_URL}/success`, // here should be client on success url page
        cancel_url: `${process.env.SERVER_URL}/cancel`, // here should be client on cancel url page
      });
      const { url } = session;
      if (url) {
        return url;
      }
    } catch (e) {
      console.log(e);
    }
  }
};

class PhotoController {
  async signSelfie(req: Request, res: Response) :Promise<void> {
    interface Body {
    name: string;
    userId: string;
  }
    const s3 = new aws.S3();
    const { name, userId } :Body = req.body;
    const metadata = `${userId}`;
    const startIndex = name.indexOf('.') + 1;
    const photoExtension = name.substr(startIndex);

    const { url, fields } = s3.createPresignedPost({
      Fields: {
        key: `${uuidv4()}.${photoExtension}`,
        'Content-Type': `image/${photoExtension}`,
        'x-amz-meta-userId': metadata,
        originalSelfieKey: name,
      },
      Conditions: [['content-length-range', 0, 5000000]],
      Expires: 60 * 60, // seconds
      Bucket: process.env.S3_SELFIE_BUCKET,
    });
    res.send(JSON.stringify({ url, fields }));
  }

  async getSelfie(req: Request, res: Response) :Promise<void> {
    const appUserId = req.query.appUserId as string|undefined;
    try {
      if (appUserId !== undefined) {
        const selfie = await SelfieMini.findOne({ where: { appUserId, active: true } });
        if (selfie) {
          res.json(selfie);
          return;
        }
        res.json({ errors: [{ msg: 'User doesn`t have active selfie' }] });
        return;
      }
    } catch (e) {
      res.status(500).json({ message: 'Error occured' });
    }
  }

  async createPresignedGetForSelfie(req: Request, res: Response): Promise<void> {
    const s3 = new aws.S3();
    interface Body {
      selfieKey: string
    }
    const { selfieKey } : Body = req.body;
    try {
      const url = s3.getSignedUrl('getObject', {
        Bucket: process.env.S3_SELFIE_BUCKET_RESIZED,
        Key: selfieKey,
        Expires: 60 * 5,
      });

      res.json(url);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Error occured' });
    }
  }

  async getAlbumsWithPerson(req: Request, res: Response): Promise<void> {
    const phone = `${req.query.phone}`;
    try {
      const person = await Person.findOne({ where: { phone } });
      if (person) {
        const photo_person = await Photo_Person.findAll({
          where:
          { personId: person.id },
        });
        const responseLength = photo_person.length;
        const promises:Promise<any>[] = [];
        if (responseLength > 0) {
          for (let i = 0; i < responseLength; i += 1) {
            const photo = Photo.findOne({ where: { id: photo_person[i].photoId } });
            promises.push(photo);
          }
        }
        const photos = await Promise.all(promises);
        const albumIds:string[] = [];
        for (let i = 0; i < photos.length; i += 1) {
          const albumId = photos[i]?.albumId;
          if (albumId) {
            albumIds.push(albumId);
          }
        }
        const uniqueAlbumIds = [...new Set(albumIds)];
        const albumInfoPromises = [];
        for (let i = 0; i < uniqueAlbumIds.length; i = +1) {
          const album = Album.findOne({ where: { id: uniqueAlbumIds[i] } });
          albumInfoPromises.push(album);
        }
        const albumsInfo = await Promise.all(albumInfoPromises);
        // console.log('uniqueAlbumIds are: ', uniqueAlbumIds);
        res.json({ albumsInfo });
      } else {
        res.json({ message: 'No albums found' });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Error occured' });
    }
  }

  async getAlbumsThumbnailIcon(req: Request, res: Response): Promise<void> {
    const s3 = new aws.S3();
    interface ThumbnailsObject{
      [key: string] : string | null
    }
    const albumIds = req.body.albumIds as string[];
    const albumThumbnails:ThumbnailsObject = {};
    const albumIdsLength = albumIds.length;
    try {
      if (albumIds) {
        for (let i = 0; i < albumIdsLength; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          const albumExist = await Album.findOne({ where: { id: albumIds[i] } });
          if (albumExist) {
            // eslint-disable-next-line no-await-in-loop
            const keyExist = await PhotoMini.findOne({ where: { albumId: albumIds[i] } });
            if (keyExist) {
              const url = s3.getSignedUrl('getObject', {
                Bucket: process.env.S3_BUCKET_RESIZED,
                Key: `resized-${keyExist.name}`,
                Expires: 60 * 60,
              });
              albumThumbnails[albumIds[i]] = url;
            } else {
              albumThumbnails[albumIds[i]] = null;
            }
          } else {
            albumThumbnails[albumIds[i]] = 'Album does not exist';
          }
        }

        res.json(albumThumbnails);
      }
    } catch (e) {
      console.log(e);
      res.status(403).json({ message: 'Error occured' });
    }
  }

  async getThumbnails(req: Request, res: Response) : Promise<void> {
    const userId = req.query.userId as string | undefined;
    const albumId = req.query.albumId as string | undefined;
       interface Thumbnails {
            isPaid: boolean,
            url: string,
            originalKey: string,
            albumId: string
    }

       const findUserPhoto = async (uId :string) => {
         const user = await AppUser.findOne({ where: { id: uId } });
         const person = await Person.findOne({ where: { phone: user?.phone } });
         // get all photos where user is present
         const photoPeople = await Photo_Person.findAll({ where: { personId: person?.id } });
         // get all photo id`s from the photos where user is present
         const photoIds: string[] = [];
         photoPeople.forEach((el) => {
           photoIds.push(el.photoId);
         });
         // find user photos keys(names) using array of ids
         const promises:Promise<PhotoInstance | null>[] = [];

         photoIds.forEach((id) => {
           const photo = Photo.findOne({ where: { id } });
           if (photo) {
             promises.push(photo);
           }
         });
         const photos = await Promise.all(promises);
         return photos;
       };
       if (userId && albumId) {
         const isPaid = await checkIfPaid(userId, albumId);
         if (isPaid === true) {
           try {
             const photos = await findUserPhoto(userId);

             const signedThumbnails:Thumbnails[] = [];
             if (photos.length > 0) {
               photos.forEach((photo) => {
                 if (photo) {
                   const s3 = new aws.S3();

                   const url = s3.getSignedUrl('getObject', {
                     Bucket: process.env.S3_BUCKET_RESIZED,
                     Key: `resized-${photo.name}`,
                     Expires: 60 * 5,
                   });
                   signedThumbnails.push({
                     isPaid: true, url, originalKey: photo.name, albumId,
                   });
                 }
               });
             }
             res.json({ totalPhotos: photos.length, thumbnails: signedThumbnails });
           } catch (e) {
             console.log(e);
           }
         } else {
           try {
             const thumbnailsWaterMark = await findUserPhoto(userId);
             const signedThumbnails:Thumbnails[] = [];
             if (thumbnailsWaterMark.length > 0) {
               thumbnailsWaterMark.forEach((thumbnail) => {
                 if (thumbnail) {
                   const s3 = new aws.S3();
                   const url = s3.getSignedUrl('getObject', {
                     Bucket: process.env.S3_BUCKET_RESIZED_WATERMARK,
                     Key: `resized-watermarkresized-${thumbnail.name}`,
                     Expires: 60 * 5,
                   });
                   signedThumbnails.push({
                     isPaid: false, url, originalKey: thumbnail.name, albumId,
                   });
                 }
               });
             }
             res.json({ totalPhotos: thumbnailsWaterMark.length, thumbnails: signedThumbnails });
           } catch (e) {
             console.log(e);
           }
         }
       } else {
         res.json({ message: 'query parameters missing' });
       }
  }

  async getOriginalPhoto(req: Request, res: Response): Promise <void> {
    const s3 = new aws.S3();
    const originalKey = req.query.originalKey as string | undefined;
    const albumId = req.query.albumId as string |undefined;
    const userId = req.query.userId as string |undefined;
    // check if the album photo belongs to and is paid by current user
    if (userId && albumId) {
      try {
        const isPaid = await checkIfPaid(userId, albumId);
        if (isPaid === true) {
          // send original photo
          const url = s3.getSignedUrl('getObject', {
            Bucket: process.env.S3_BUCKET,
            Key: originalKey,
            Expires: 60 * 5,
          });
          res.json(url);
        } else {
          // redirect to the payment page
          const paymentLink = await generatePaymnet(albumId, userId);
          res.json(paymentLink);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
}

export default new PhotoController();
