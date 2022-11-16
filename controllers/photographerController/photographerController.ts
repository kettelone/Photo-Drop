import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  Photographer, Album, Photo, AppUser,
} from '../../models/model';
import { PhotosArray } from './interfaces';
import ApiError from '../../errors/APIErrors';
import photographerService from '../../services/photographerService/photographerService';

class PhotographerController {
  async login(req: Request, res: Response):Promise<void> {
    try {
      const { login, password } = req.body as {[key:string]:string};
      const user = await Photographer.findOne({ where: { login } });
      if (!user) {
        ApiError.forbidden(res, 'User not found');
        return;
      }
      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        ApiError.forbidden(res, 'Wrong password');
        return;
      }
      const token = jwt.sign({ id: user.id, login: user.login }, process.env.SECRET_KEY!, {
        expiresIn: '24h',
      });
      res.json({ token });
      return;
    } catch (e) {
      console.log(e);
      ApiError.badRequest(res, 'Internal error on login');
    }
  }

  async getMe(req: Request, res: Response):Promise<void> {
    try {
      if (!req.headers.authorization) {
        ApiError.forbidden(res, 'Missing authorization token');
        return;
      }
      const token = req.headers.authorization.split(' ')[1]; // Bearer ddhcjhdsjcsdcs
      if (!token) {
        ApiError.forbidden(res, 'Not authorized');
      }
      jwt.verify(token, process.env.SECRET_KEY!);
      res.send();
    } catch (e) {
      ApiError.forbidden(res, 'Not authorized');
    }
  }

  async createAlbum(req: Request, res: Response): Promise<void> {
    const {
      name, location, date, photographerId,
    } = req.body as {[key:string]:string};

    try {
      const photographerExist = Photographer.findOne({ where: { id: photographerId } });
      if (!photographerExist) {
        ApiError.forbidden(res, 'Photographer does not exist');
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
      ApiError.forbidden(res, 'The album with this name already exist');
      return;
    } catch (e) {
      console.log(e);
      ApiError.internal(res, 'Internal error on album create');
    }
  }

  // create presigned post for photos
  async signOne(req: Request, res: Response): Promise<void> {
    try {
      const { photosArray, people } = req.body as { photosArray: PhotosArray[][], people: string[] };
      const presignedPostsArray = photographerService.generatePresignedPost(photosArray, people);
      res.send(JSON.stringify(presignedPostsArray));
    } catch (e) {
      ApiError.internal(res, 'Internal error on create presigned post');
    }
  }

  async getAllPeople(req: Request, res: Response): Promise<void> {
    try {
      const people = await AppUser.findAll();
      res.json({ people });
    } catch (e) {
      console.log(e);
      ApiError.internal(res, 'Internal error');
    }
  }

  async getAlbums(req: Request, res: Response): Promise<void> {
    const { photographerId } = req.query as { photographerId: string };
    try {
      const photographerExist = await Photographer.findOne({ where: { id: photographerId } });
      if (!photographerExist) {
        res.json({ errors: [{ msg: 'Photographer with this id does not exist' }] });
        return;
      }
      const albums = await Album.findAll({ where: { photographerId } });
      if (albums.length > 0) {
        res.json(albums);
        return;
      }
      res.json({ errors: [{ msg: 'No albums found' }] });
      return;
    } catch (e) {
      console.log(e);
      ApiError.internal(res, 'Internal error');
    }
  }

  async getAlbumsThumbnailIcon(req: Request, res: Response): Promise<void> {
    const { albumIds }:{albumIds: string[]} = req.body;
    try {
      const albumThumbnails = await photographerService.getAlbumThumbnails(albumIds);
      res.json(albumThumbnails);
    } catch (e) {
      console.log(e);
      ApiError.internal(res, 'Internal error on get album icon');
    }
  }

  async getPhotos(req: Request, res: Response): Promise<void> {
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
        ApiError.badRequest(res, 'Photographer with this id does not exist');
        return;
      }
      const albumExist = await Album.findOne({ where: { id: albumId } });
      if (!albumExist) {
        ApiError.badRequest(res, 'This album does not exist');
        return;
      }
      const albumBelongsToUser = await Album.findOne({ where: { id: albumId, photographerId } });
      if (!albumBelongsToUser) {
        ApiError.badRequest(res, 'This album does not belong to this user');
        return;
      }
      const photos = await Photo.findAndCountAll({
        where: { albumId, photographerId },
        order: [['createdAt', 'DESC']],
        limit: finalLimit,
        offset,
      });

      if (photos.count === 0) {
        ApiError.badRequest(res, 'The album is empty');
        return;
      }
      res.json(photos);
      return;
    } catch (e) {
      ApiError.internal(res, 'internal Error on get photos');
    }
  }

  async createPresignedGetForPhotos(req: Request, res: Response): Promise<void> {
    const photoKeyArr: { photoKey: string }[] = req.body;
    const photoUrls = photographerService.generatePresignedGet(photoKeyArr);
    res.json(photoUrls);
  }
}

export default new PhotographerController();
