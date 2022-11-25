import { Request, Response, NextFunction } from 'express';
import aws from 'aws-sdk';
import { SelfieMini } from '../../../models/model';
import appUserService from '../../../services/AppUserService/photoService/photoService';
import APIError from '../../../errors/APIError';

// This is your test secret API key.
aws.config.update({
  region: 'eu-west-1',
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4', // It fixes the issue of "Missing Authentication Token" when generating presignedUrl for Object lambda Access Point
});

class PhotoController {
  async signSelfie(req: Request<any, any, { name: string; userId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, userId } = req.body;
      const { url, fields } = appUserService.generatePresignedPost(name, userId);
      res.send(JSON.stringify({ url, fields }));
      return;
    } catch (e) {
      next(APIError.internal('Internal error while signing selfie'));
    }
  }

  async getSelfie(req: Request<any, any, any, {appUserId:string}>, res: Response, next: NextFunction) :Promise<void> {
    const { appUserId } = req.query;
    try {
      const selfie = await SelfieMini.findOne({ where: { appUserId, active: true } });
      if (selfie) {
        res.json(selfie);
        return;
      }
      next(APIError.notFound('User doesn`t have active selfie'));

      return;
    } catch (e) {
      next(APIError.notFound('Internal error while getting selfie'));
      console.log(e);
    }
  }

  async createPresignedGetForSelfie(req: Request<any, any, { selfieKey: string }>, res: Response, next: NextFunction): Promise<void> {
    const { selfieKey } = req.body;
    try {
      const url = appUserService.generateSignedUrl(selfieKey);
      res.json(url);
      return;
    } catch (e) {
      next(APIError.notFound('Internal error while creating signed url for selfie'));
    }
  }

  async getAlbumsWithPerson(req: Request<any, any, any, { phone:string }>, res: Response, next: NextFunction): Promise<void> {
    const { phone } = req.query;
    try {
      const albumsInfo = await appUserService.getAlbums(phone);
      if (albumsInfo) {
        res.json({ albumsInfo });
        return;
      }
      next(APIError.notFound('No albums found'));
      return;
    } catch (e) {
      next(APIError.notFound('Internal error while getting albums with person'));
    }
  }

  async getOriginalPhoto(req: Request, res: Response, next: NextFunction): Promise <void> {
    const { originalKey, albumId, userId } = req.query as { [key: string]: string };
    try {
      const url = await appUserService.getOriginalPhoto(originalKey, albumId, userId);
      res.json(url);
      return;
    } catch (e) {
      next(APIError.internal('Internal error while getting original photo'));
    }
  }

  async generatePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(APIError.internal('Internal error while generating payment'));
    }
  }
}

export default new PhotoController();
