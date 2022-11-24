import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import {
  Person, Photo_Person, Photo, Album, AppUser, UserAlbum,
} from '../../../models/model';
import { TypeAlbumPaidStatus } from '../../../models/interfaces';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-08-01',
});
const s3 = new aws.S3();

class AppUserService {
  generatePresignedPost(name: string, userId: string) {
    const startIndex = name.indexOf('.') + 1;
    const photoExtension = name.substr(startIndex);
    const { url, fields } = s3.createPresignedPost({
      Fields: {
        key: `${uuidv4()}.${photoExtension}`,
        'Content-Type': `image/${photoExtension}`,
        'x-amz-meta-userId': userId,
        originalSelfieKey: name,
      },
      Conditions: [['content-length-range', 0, 5000000]],
      Expires: 60 * 120, // seconds
      Bucket: process.env.S3_SELFIE_BUCKET,
    });

    return { url, fields };
  }

  generateSignedUrl(selfieKey:string) {
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_LAMBDA_ACCESS_POINT_SELFIE_RESIZE,
      Key: selfieKey,
      Expires: 60 * 120,
    });
    return url;
  }

  async getAlbums(phone: string) {
    // TO DO: check arr.find()
    // check git commint amend
    // Update VS Code
    // check git stash

    const person = await Person.findOne({ where: { phone } });
    if (person) {
      const user = await AppUser.findOne({ where: { phone } });
      const photo_person = await Photo_Person.findAll({ where: { personId: person.id } });
      const photoIds = photo_person.map(({ photoId }) => photoId);
      const photos = await Photo.findAll({ where: { id: photoIds } });
      const albumIds = photos.map(({ albumId }) => albumId);
      const uniqueAlbumIds = [...new Set(albumIds)];
      const albumsInfo = await Album.findAll({ where: { id: uniqueAlbumIds } });
      const userAlbums = await UserAlbum.findAll({ where: { userId: user!.id, albumId: uniqueAlbumIds } });

      const infoCollection = albumsInfo.map(({ id, date, location }) => {
        // get photos which belongs to current album
        const currentPhotos = photos.filter(({ albumId }) => albumId === id);

        // generate thumbnails payment status
        const albumPaidStatus: TypeAlbumPaidStatus = {};
        userAlbums.forEach((album) => {
          albumPaidStatus[album.albumId] = album.isPaid;
        });

        // sign thumbnails
        const signedThumbnails = currentPhotos.map((photo) => {
          const url = s3.getSignedUrl('getObject', {
            Bucket: albumPaidStatus[photo.albumId] === true
              ? process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE
              : process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE_WATERMARK,
            Key: photo.name,
            Expires: 60 * 120,
          });
          const thumbnail = {
            url,
            originalKey: photo.name,
          };
          return thumbnail;
        });

        // generate album icon url
        const icon = currentPhotos.length ? s3.getSignedUrl('getObject', {
          Bucket: process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE,
          Key: currentPhotos[0].name,
          Expires: 60 * 120,
        }) : null;

        return {
          id,
          date,
          location,
          icon,
          thumbnails: signedThumbnails,
        };
      });

      return infoCollection;
    }
    return false;
  }

  async getOriginalPhoto(originalKey:string, albumId: string, userId:string) {
    const info = await UserAlbum.findOne({ where: { userId, albumId } });
    const url = s3.getSignedUrl('getObject', {
      Bucket: info && info.isPaid === true
        ? process.env.S3_BUCKET_ORIGINAL
        : process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_WATERMARK,
      Key: originalKey,
      Expires: 60 * 120,
    });

    return url;
  }

  async generatePaymentLink(albumId:string, userId:string, host: string) {
    const albumItem = { id: 1, priceInCents: 500, name: 'Album' };
    const customer = await stripe.customers.create({
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
      success_url: `${host}/albums/success/${albumId}`,
      cancel_url: `${host}/albums/cancel`,
    });
    const { url } = session;
    return url;
  }
}

export default new AppUserService();
