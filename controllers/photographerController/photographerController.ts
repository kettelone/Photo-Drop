import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import aws from 'aws-sdk';
import {
  Photographer, Album, Photo, AppUser,
} from '../../models/model';
import { PhotosArray } from './interfaces';
import APIError from '../../errors/APIError';
import photographerService from '../../services/photographerService/photographerService';

const s3 = new aws.S3();

class PhotographerController {
  async login(req: Request, res: Response, next: NextFunction):Promise<void> {
    try {
      const { login, password } = req.body as {[key:string]:string};
      const user = await Photographer.findOne({ where: { login } });
      if (!user) {
        next(APIError.unauthorized('User not found'));
        return;
      }
      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        next(APIError.unauthorized('Wrong password'));
        return;
      }
      const token = jwt.sign({ id: user.id, login: user.login }, process.env.SECRET_KEY!, {
        expiresIn: '24h',
      });
      res.json({ token });
      return;
    } catch (e) {
      console.log(e);
      next(APIError.internal('Internal error on login'));
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction):Promise<void> {
    try {
      if (!req.headers.authorization) {
        next(APIError.unauthorized('Missing authorization token'));
        return;
      }
      const token = req.headers.authorization.split(' ')[1]; // Bearer ddhcjhdsjcsdcs
      if (!token) {
        next(APIError.unauthorized('Not authorized'));
      }
      jwt.verify(token, process.env.SECRET_KEY!);
      res.send();
    } catch (e) {
      next(APIError.unauthorized('Not authorized'));
    }
  }

  async createAlbum(req: Request, res: Response, next: NextFunction): Promise<void> {
    const {
      name, location, date, photographerId,
    } = req.body as {[key:string]:string};

    try {
      const photographerExist = await Photographer.findOne({ where: { id: photographerId } });
      if (!photographerExist) {
        next(APIError.notFound('Photographer does not exist'));
        return;
      }
      const albumExist = await Album.findOne({ where: { name, photographerId } });
      if (!albumExist) {
        const album = await Album.create({
          name, location, date, photographerId,
        });
        res.json(album);
        return;
      }
      next(APIError.conflict('The album with this name already exist'));
      return;
    } catch (e) {
      console.log(e);
      next(APIError.internal('Internal error on album create'));
    }
  }

  // create presigned post for photos
  async signOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { photosArray, people } = req.body as { photosArray: PhotosArray[][], people: string[] };
      const presignedPostsArray = photographerService.generatePresignedPost(photosArray, people);
      res.send(JSON.stringify(presignedPostsArray));
    } catch (e) {
      next(APIError.internal('Internal error on create presigned post'));
    }
  }

  async getAllPeople(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const people = await AppUser.findAll();
      res.json({ people });
    } catch (e) {
      console.log(e);
      next(APIError.internal('Internal error on getAllPeople'));
    }
  }

  async getAlbums(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { photographerId } = req.query as { photographerId: string };
    try {
      const photographerExist = await Photographer.findOne({ where: { id: photographerId } });
      if (!photographerExist) {
        next(APIError.notFound('Photographer with this id does not exist'));
        return;
      }
      const albums = await Album.findAll({ where: { photographerId } });
      const photos = await Photo.findAll({ where: { photographerId }, order: [['createdAt', 'DESC']] });
      if (albums.length < 1) {
        next(APIError.notFound('No albums found'));
        return;
      }
      const albumsInfo = albums.map(({
        id, name, location, date,
      }) => {
        const currentPhotos = photos.filter(({ albumId }) => albumId === id);

        // sign photo thumbnails
        const signedThumbnails = currentPhotos.map((photo) => {
          const url = s3.getSignedUrl('getObject', {
            Bucket: process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE,
            Key: photo.name,
            Expires: 60 * 120,
          });
          const thumbnail = {
            url,
            originalKey: photo.name,
          };
          return thumbnail;
        });

        // album icon url
        const icon = signedThumbnails.length ? signedThumbnails[0] : null;

        return {
          id,
          name,
          location,
          date,
          icon,
          thumbnails: signedThumbnails,
        };
      });

      res.send({ photographerId, albumsInfo });
      return;
    } catch (e) {
      next(APIError.internal('Internal error on getAlbums'));
    }
  }

  // TO DO: delete after Alexey implements changes
  async getAlbumsThumbnailIcon(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { albumIds }:{albumIds: string[]} = req.body;
    try {
      const albumThumbnails = await photographerService.getAlbumThumbnails(albumIds);
      res.json(albumThumbnails);
    } catch (e) {
      console.log(e);
      next(APIError.internal('Internal error on get album icon'));
    }
  }

  async getPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
    /* LIMIT will retrieve only the number of records specified after the LIMIT keyword,
     unless the query itself returns fewer records than the number specified by LIMIT.
    OFFSET is used to skip the number of records from the results. */
    const {
      albumId, photographerId, limit, page,
    } = req.query as { [key: string]: string };

    const finalPage = Number(page) || 1;
    const finalLimit = Number(limit) || 10;
    const offset = finalPage * finalLimit - finalLimit;

    try {
      const photographerExist = await Photographer.findOne({ where: { id: photographerId } });
      if (!photographerExist) {
        next(APIError.notFound('Photographer with this id does not exist'));
        return;
      }
      const albumExist = await Album.findOne({ where: { id: albumId } });
      if (!albumExist) {
        next(APIError.notFound('This album does not exist'));
        return;
      }
      const albumBelongsToUser = await Album.findOne({ where: { id: albumId, photographerId } });
      if (!albumBelongsToUser) {
        next(APIError.conflict('This album does not belong to this user'));
        return;
      }
      const photos = await Photo.findAndCountAll({
        where: { albumId, photographerId },
        order: [['createdAt', 'DESC']],
        limit: finalLimit,
        offset,
      });

      if (photos.count === 0) {
        res.send({ message: 'The album is empty' });
        return;
      }

      const photoKeys = photos.rows.map(({ name }) => {
        const keyObj = { photoKey: name };
        return keyObj;
      });
      const photoUrls = photographerService.generatePresignedGet(photoKeys);
      res.json(photoUrls);
      return;
    } catch (e) {
      next(APIError.internal('Internal Error on get photos'));
    }
  }

  // TO DO: remove after Alexey implements changes
  async createPresignedGetForPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const photoKeyArr: { photoKey: string }[] = req.body;
      const photoUrls = photographerService.generatePresignedGet(photoKeyArr);
      res.json(photoUrls);
    } catch (e) {
      next(APIError.internal('Internal Error on create presigned get'));
    }
  }
}

export default new PhotographerController();
