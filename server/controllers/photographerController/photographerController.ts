import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import aws from 'aws-sdk';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  Photographer as db, Album, Photo, Person, AppUser,
} from '../../models/model';
import { PhotoObject, PhotosArray } from './index';

aws.config.update({
  region: 'eu-west-1',
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

const DB: any = db;
const Photographer = DB;

const generateJwt = (id:number, login:string) => jwt.sign({ id, login }, process.env.SECRET_KEY!, {
  expiresIn: '24h',
});

class PhotographerController {
  async login(req: Request, res: Response) {
    try {
      const login = req.body.login as string;
      const password = req.body.password as string;
      const user = await Photographer.findOne({ where: { login } });
      if (!user) {
        return res.status(403).json({ message: 'User not found' });
      }
      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return res.status(403).json({ message: 'Wrong password' });
      }
      const token = generateJwt(user.id, user.login);
      res.json({ token });
      return true;
    } catch (e) {
      console.log(e);
    }
    return true;
  }

  async createAlbum(req: Request, res: Response) {
    const name = req.body.name as string | undefined;
    const location = req.body.location as string | undefined;
    const date = req.body.date as string | undefined;
    const photographerId = req.body.photographerId as number | undefined;
    if (name && location && date && photographerId) {
      try {
        const albumExist = await Album.findOne({ where: { name, photographerId } });
        if (albumExist === null) {
          const album = await Album.create({
            name, location, date, photographerId,
          });
          res.json(album);
          return;
        }
        res.status(403).json({ message: 'The album with this name already exist' });
        return;
      } catch (e) {
        console.log(e);
        return res.json(e);
      }
    }
  }

  // create presigned post for one photo
  async signOne(req: Request, res: Response) {
    const s3 = new aws.S3();
    const photosArray = req.body.photosArray as PhotosArray[][];
    const people = req.body.people as [];
    const metadata = `${people}`;
    const presignedPostsArray: any = [];
    for (let i = 0; i < photosArray.length; i += 1) {
      const { photographerId } = photosArray[i][0];
      const { albumId } = photosArray[i][1];
      const { photoName } = photosArray[i][2];
      const startIndex = photoName.indexOf('.') + 1;
      const photoExtension = photoName.substr(startIndex).toLowerCase();

      const { url, fields } = s3.createPresignedPost({
        Fields: {
          key: `${photographerId}/${albumId}/${uuidv4()}_${photoName}`,
          'Content-Type': `image/${photoExtension}`,
          'x-amz-meta-people': metadata,
        },
        Conditions: [['content-length-range', 0, 8000000], ['starts-with', '$Content-Type', 'image/']],
        Expires: 60 * 60, // seconds
        Bucket: process.env.S3_BUCKET,
      });
      presignedPostsArray.push({ url, fields });
    }
    res.send(JSON.stringify(presignedPostsArray));
  }

  async getAllPeople(req: Request, res: Response) {
    try {
      const people = await AppUser.findAll();
      res.json({ people });
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  }

  async addPersonToPhoto(req: Request, res: Response) {
    const photoId = req.body.photoId as number | undefined;
    const clientsArray = req.body.clientsArray as [];
    if (photoId && clientsArray) {
      try {
        const photo = await Photo.findOne({ where: { id: photoId } });
        if (photo) {
          for (let i = 0; i < clientsArray.length; i += 1) {
            try {
              // eslint-disable-next-line no-await-in-loop
              const personExist = await Person.findOne({ where: { phone: clientsArray[i] } });
              if (personExist === null) {
                /* eslint-disable no-await-in-loop */
                const person = await Person.create({
                  phone: clientsArray[i],
                  photoId,
                });
                // @ts-ignore
                await person.addPhoto(photo);
              } else {
              // @ts-ignore
                await personExist.addPhoto(photo);
              }
            } catch (e) {
              console.log(e);
            }
          }
          res.send('Successfully uploaded');
        } else {
          res.status(403).json({ message: 'Photo was not found' });
        }
      } catch (e) {
        console.log(e);
        res.status(403).json({ message: 'Error occured' });
      }
    }
  }

  async getAlbums(req: Request, res: Response) {
    const photographerId = req.query.photographerId as number |undefined;
    try {
      if (photographerId) {
        const albums = await Album.findAll({ where: { photographerId } });
        if (albums) {
          res.json(albums);
        } else {
          res.status(403).json({ message: 'No albums found' });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getPhotos(req: Request, res: Response) {
    /* LIMIT will retrieve only the number of records specified after the LIMIT keyword,
     unless the query itself returns fewer records than the number specified by LIMIT.
    OFFSET is used to skip the number of records from the results. */

    const albumId = req.query.albumId as number | undefined;
    const photographerId = req.query.photographerId as number | undefined;
    let limit = req.query.limit as number | undefined;
    let page = req.query.page as number | undefined;

    page = page || 1;
    limit = limit || 10;
    const offset = page * limit - limit;
    if (albumId && photographerId && limit && page) {
      try {
        const albumExist = await Album.findOne({
          where: { id: albumId, photographerId },
        });

        if (albumExist === null) {
          res.status(403).json({ message: 'Album doesn`t exist' });
          return;
        }
        const album = await Photo.findAndCountAll({
          where: { id: albumId, photographerId },
          limit,
          offset,
        });
        if (album.count === 0) {
          res.json('The album is empty');
          return;
        }
        res.json(album);
      } catch (e) {
        console.log(e);
        res.status(403).json({ message: 'Error occured' });
      }
    }
  }

  async createPresignedGetForPhotos(req: Request, res: Response) {
    const s3 = new aws.S3();
    const photoKeyArr = req.body;
    const photoUrls: any[] = [];

    photoKeyArr.forEach((el:PhotoObject) => {
      const url = s3.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET,
        Key: el.photoKey,
        Expires: 60 * 5,
      });
      photoUrls.push(url);
    });
    res.json(photoUrls);
  }
}

export default new PhotographerController();
