import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import {
  Person, Photo_Person, Photo, Album, AppUser, UserAlbum,
} from '../../../models/model';
import { PhotoInstance, TypeAlbumPaidStatus } from '../../../models/interfaces';

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
      Bucket: process.env.S3_SELFIE_BUCKET_RESIZED,
      Key: selfieKey,
      Expires: 60 * 120,
    });
    return url;
  }

  async getAlbums(phone:string) {
    const person = await Person.findOne({ where: { phone } });
    if (person) {
      const photo_person = await Photo_Person.findAll({ where: { personId: person.id } });
      const photoIds = photo_person.map(({ photoId }) => photoId);
      const photos = await Photo.findAll({ where: { id: photoIds } });
      const albumIds = photos.map(({ albumId }) => albumId);
      const uniqueAlbumIds = [...new Set(albumIds)];
      const albumsInfo = await Album.findAll({ where: { id: uniqueAlbumIds } });
      return albumsInfo;
    }
    return false;
  }

  async findAlbumsIcons(albumIds: string[], userId: string) {
        interface ThumbnailsObject{
      [key: string] : string | null
      }
        const albumThumbnails: ThumbnailsObject = {};
        const user = await AppUser.findOne({ where: { id: userId } });
        const person = await Person.findOne({ where: { phone: user?.phone } });
        const photoPeople = await Photo_Person.findAll({ where: { personId: person?.id } });
        const photoIds = photoPeople.map((el) => el.photoId);
        const photos = await Photo.findAll({ where: { id: photoIds } });

        albumIds.forEach((albumId) => {
          photos.forEach((photo) => {
            if (albumId === photo.albumId) {
              const url = s3.getSignedUrl('getObject', {
                Bucket: process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE,
                Key: photo.name,
                Expires: 60 * 120,
              });
              albumThumbnails[photo!.albumId] = url;
            }
          });
        });
        return albumThumbnails;
  }

  async findUserPhotos(userId: string) {
    const albumPaidStatus: TypeAlbumPaidStatus = {};

    const user = await AppUser.findOne({ where: { id: userId } });
    const person = await Person.findOne({ where: { phone: user?.phone } });
    const photoPeople = await Photo_Person.findAll({ where: { personId: person?.id } });
    const photoIds = photoPeople.map((photoPerson) => photoPerson.photoId);
    const photos = await Photo.findAll({ where: { id: photoIds } });
    const albumIds = photos.map((photo) => photo.albumId);
    const uniqueAlbumIds = [...new Set(albumIds)];
    const albums = await UserAlbum.findAll({ where: { userId, albumId: uniqueAlbumIds } });
    albums.forEach((album) => {
      albumPaidStatus[album.albumId] = album.isPaid;
    });
    return { photos, albumPaidStatus };
  }

  getSignedThumbnails(photos: PhotoInstance[], albumPaidStatus:TypeAlbumPaidStatus) {
    const signedThumbnails = photos.map((photo) => {
      const url = s3.getSignedUrl('getObject', {
        Bucket: albumPaidStatus[photo.albumId] === true
          ? process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE
          : process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE_WATERMARK,
        Key: photo.name,
        Expires: 60 * 120,
      });
      const thumbnail = {
        isPaid: albumPaidStatus[photo.albumId],
        url,
        originalKey: photo.name,
        albumId: photo.albumId,
      };
      return thumbnail;
    });
    return signedThumbnails;
  }

  async getOriginalPhoto(originalKey:string, albumId: string, userId:string) {
    const info = await UserAlbum.findOne({ where: { userId, albumId } });
    const url = s3.getSignedUrl('getObject', {
      Bucket: info && info.isPaid === true
        ? process.env.S3_BUCKET_ORIGINAL
        : process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_WATERMARK,
      Key: originalKey,
      Expires: 60 * 120,
      'Content-Disposition': 'attachment',
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
