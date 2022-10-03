import { Request, Response } from 'express';
import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import {
  SelfieMini, Person, Photo_Person, Photo, UserAlbum, PhotoMini, PhotoMiniWaterMark,
} from '../../../models/model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-08-01',
});
// This is your test secret API key.
aws.config.update({
  region: 'eu-west-1',
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

const checkIfPaid = async (userId:number, albumId:number) => {
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

const generatePaymnet = async (albumId:Number, userId:Number) => {
  const albumItem = { id: 1, priceInCents: 500, name: 'Album' };
  try {
    const customer = await stripe.customers.create({
      // @ts-ignore
      metadata: { userId, albumId },
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
    return url;
  } catch (e) {
    return e;
  }
};

class PhotoController {
  async signSelfie(req: Request, res: Response) {
    const s3 = new aws.S3();
    const { name, userId } = req.body;
    const metadata = `${userId}`;
    const startIndex = name.indexOf('.') + 1;
    const photoExtension = name.substr(startIndex);

    const { url, fields } = s3.createPresignedPost({
      Fields: {
        key: `${userId}/${uuidv4()}_${name}`,
        'Content-Type': `image/${photoExtension}`,
        'x-amz-meta-userId': metadata,
      },
      Conditions: [['content-length-range', 0, 5000000]],
      Expires: 60 * 60, // seconds
      Bucket: process.env.S3_SELFIE_BUCKET,
    });
    res.send(JSON.stringify({ url, fields }));
  }

  async getSelfie(req: Request, res: Response) {
    const appUserId = req.query.appUserId as number|undefined;
    try {
      const selfie = await SelfieMini.findOne({ where: { appUserId, active: true } });
      if (selfie) {
        res.json(selfie);
      }
    } catch (e) {
      res.status(500).json({ message: 'Error occured' });
    }
  }

  async createPresignedGetForSelfie(req: Request, res: Response) {
    const s3 = new aws.S3();
    const { selfieKey } = req.body;
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

  async getAlbumsWithPerson(req: Request, res: Response) {
    const phone = `${req.query.phone}`;
    try {
      const person = await Person.findOne({ where: { phone } });
      if (person) {
        const photo_person = await Photo_Person.findAll({
          where:
          { personId: person.id },
        });
        const responseLength = photo_person.length;
        const promises = [];
        if (responseLength > 0) {
          for (let i = 0; i < responseLength; i += 1) {
            const photo = Photo.findOne({ where: { id: photo_person[i].photoId } });
            promises.push(photo);
          }
        }
        const photos = await Promise.all(promises);
        const albumIds:number[] = [];
        for (let i = 0; i < photos.length; i += 1) {
          const albumId = photos[i]?.albumId;
          if (albumId) {
            albumIds.push(albumId);
          }
        }
        const uniqueAlbumIds = [...new Set(albumIds)];
        console.log('uniqueAlbumIds are: ', uniqueAlbumIds);
        res.json({ albumIds: uniqueAlbumIds });
      } else {
        res.json({ message: 'No albums found' });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Error occured' });
    }
  }

  async getThumbnails(req: Request, res: Response) {
    const userId = req.query.userId as number|undefined;
    const albumId = req.query.albumId as number|undefined;
    if (userId && albumId) {
      const isPaid = await checkIfPaid(userId, albumId);
      console.log('Is Paid: ', isPaid);
      if (isPaid === true) {
        try {
          // return thumbnails without watermark
          const thumbnails = await PhotoMini.findAll({ where: { albumId } });
          const signedThumbnails:any = [];
          if (thumbnails.length > 0) {
            thumbnails.forEach((thumbnail) => {
              const s3 = new aws.S3();

              const url = s3.getSignedUrl('getObject', {
                Bucket: process.env.S3_BUCKET_RESIZED,
                Key: `resized-${thumbnail.name}`,
                Expires: 60 * 5,
              });
              signedThumbnails.push({
                isPaid: true, url, originalKey: thumbnail.name, albumId,
              });
            });
          }
          res.json(signedThumbnails);
        } catch (e) {
          console.log(e);
        }
      } else {
        try {
          // return thumbnails with watermark
          const thumbnailsWaterMark = await PhotoMiniWaterMark.findAll({
            where: { albumId },
          });
          const signedThumbnails:any = [];
          if (thumbnailsWaterMark.length > 0) {
            thumbnailsWaterMark.forEach((thumbnail) => {
              const s3 = new aws.S3();
              const url = s3.getSignedUrl('getObject', {
                Bucket: process.env.S3_BUCKET_RESIZED_WATERMARK,
                Key: `resized-watermarkresized-${thumbnail.name}`,
                Expires: 60 * 5,
              });
              signedThumbnails.push({
                isPaid: false, url, originalKey: thumbnail.name, albumId,
              });
            });
          }
          res.json(signedThumbnails);
        } catch (e) {
          console.log(e);
        }
      }
    } else {
      res.json({ message: 'query parameters missing' });
    }
  }

  async getOriginalPhoto(req: Request, res: Response) {
    const s3 = new aws.S3();
    const { originalKey } = req.query;
    const albumId = req.query.albumId as number|undefined;
    const userId = req.query.userId as number|undefined;
    // check if the album photo belongs to is paid by current user
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
