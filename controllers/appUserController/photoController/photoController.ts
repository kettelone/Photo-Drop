import { Request, Response } from 'express';
import aws from 'aws-sdk';
import { SelfieMini } from '../../../models/model';
import appUserService from '../../../services/AppUserService/photoService/photoService';
import ApiError from '../../../errors/APIErrors';

// This is your test secret API key.
aws.config.update({
  region: 'eu-west-1',
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4', // It fixes the issue of "Missing Authentication Token" when generating presignedUrl for Object lambda Access Point
});

class PhotoController {
  async signSelfie(req: Request<any, any, { name: string; userId: string }>, res: Response): Promise<void> {
    try {
      const { name, userId } = req.body;
      const { url, fields } = appUserService.generatePresignedPost(name, userId);
      res.send(JSON.stringify({ url, fields }));
      return;
    } catch (e) {
      ApiError.internal(res, 'Internal error while signing selfie');
      console.log(e);
    }
  }

  async getSelfie(req: Request<any, any, any, {appUserId:string}>, res: Response) :Promise<void> {
    const { appUserId } = req.query;
    try {
      const selfie = await SelfieMini.findOne({ where: { appUserId, active: true } });
      if (selfie) {
        res.json(selfie);
        return;
      }
      // TO DO: inform about changes
      // res.json({ errors: [{ msg: 'User doesn`t have active selfie' }] });

      res.json({ message: 'User doesn`t have active selfie' });
      return;
    } catch (e) {
      ApiError.internal(res, 'Internal error while getting selfie');
      console.log(e);
    }
  }

  async createPresignedGetForSelfie(req: Request<any, any, { selfieKey: string }>, res: Response): Promise<void> {
    const { selfieKey } = req.body;
    try {
      const url = appUserService.generateSignedUrl(selfieKey);
      res.json(url);
      return;
    } catch (e) {
      ApiError.internal(res, 'Internal error while creating signed url for selfie');
      console.log(e);
    }
  }

  async getAlbumsWithPerson(req: Request<any, any, any, { phone:string }>, res: Response): Promise<void> {
    const { phone } = req.query;
    try {
      const albumsInfo = await appUserService.getAlbums(phone);
      if (albumsInfo) {
        res.json({ albumsInfo });
        return;
      }
      res.json({ message: 'No albums found' });
      return;
    } catch (e) {
      ApiError.internal(res, 'Internal error while getting albums with person');
      console.log(e);
    }
  }

  async getAlbumsThumbnailIcon(req: Request<any, any, {albumIds:string[], userId: string}>, res: Response): Promise<void> {
    const { albumIds, userId } = req.body;
    try {
      const albumThumbnails = await appUserService.findAlbumsIcons(albumIds, userId);
      res.json(albumThumbnails);
      return;
    } catch (e) {
      ApiError.internal(res, 'Internal error while getting albums thumbnail icons');
      console.log(e);
    }
  }

  async getThumbnails(req: Request<any, any, any, { userId: string }>, res: Response): Promise<void> {
    const { userId } = req.query;
    // TO DO: say Alexey to remove albumId from request
    try {
      const { photos, albumPaidStatus } = await appUserService.findUserPhotos(userId);
      const signedThumbnails = appUserService.getSignedThumbnails(photos, albumPaidStatus);
      res.json({ totalPhotos: photos.length, thumbnails: signedThumbnails });
      return;
    } catch (e) {
      ApiError.internal(res, 'Internal error while getting all thumbnails');
      console.log(e);
    }
  }

  async getOriginalPhoto(req: Request, res: Response): Promise <void> {
    const { originalKey, albumId, userId } = req.query as { [key: string]: string };
    try {
      const url = await appUserService.getOriginalPhoto(originalKey, albumId, userId);
      res.json(url);
      return;
    } catch (e) {
      ApiError.internal(res, 'Internal error while getting original photo');
      console.log(e);
    }
  }

  async generatePayment(req: Request, res: Response): Promise<void> {
    let host = req.headers.origin as string;
    // for testing from Postman
    if (!host) {
      host = 'http://localhost:3000/';
    }
    const { albumId, userId } = req.query as { [key: string]: string };
    // TODO: create separate service fot the below(Controller- Service separation)
    try {
      const paymentLink = await appUserService.generatePaymentLink(albumId, userId, host);

      if (paymentLink) {
        res.json(paymentLink);
        return;
      }
      throw Error;
    } catch (e) {
      ApiError.internal(res, 'Internal error while generating payment');
      console.log(e);
    }
  }
}

export default new PhotoController();
