import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import aws from 'aws-sdk';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  Photographer as db, Album, Photo, Person, AppUser,
} from '../../models/model';

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
  async login(req: Request, res:Response) {
    try {
      const { login, password } = req.body;
      const user = await Photographer.findOne({ where: { login } });
      if (!user) {
        return res.status(403).json({ message: 'User not found' });
        // return next(ApiError.internal('User not found'));
      }
      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return res.status(403).json({ message: 'Wrong password' });
        // return next(ApiError.internal('Wrong password'));
      }
      const token = generateJwt(user.id, user.login);
      res.json({ token });
      return true;
    } catch (e) {
      console.log(e);
    }
    return true;
  }

  async createAlbum(req:Request, res:Response) {
    try {
      const {
        name, location, date, photographerId,
      } = req.body;

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

  async signOne(req: Request, res: Response) {
    const s3 = new aws.S3();
    const { photosArray, people } = req.body;
    const metadata = `${people}`;

    const presignedPostsArray = [];
    for (let i = 0; i < photosArray.length; i += 1) {
      const { photographerId } = photosArray[i][0];
      const { albumId } = photosArray[i][1];
      const { photoName } = photosArray[i][2];
      const startIndex = photoName.indexOf('.') + 1;
      const photoExtension = photoName.substr(startIndex);

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
    const { photoId, clientsArray } = req.body;
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
    }
  }

  async getAlbums(req: Request, res: Response) {
    const photographerId = Number(req.query.photographerId);
    try {
      const albums = await Album.findAll({ where: { photographerId } });
      if (albums) {
        res.json(albums);
      } else {
        res.status(403).json({ message: 'No albums found' });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getPhotos(req: Request, res: Response) {
    /* LIMIT will retrieve only the number of records specified after the LIMIT keyword,
     unless the query itself returns fewer records than the number specified by LIMIT.
    OFFSET is used to skip the number of records from the results. */
    const {
      albumId, photographerId, limit, page,
    } = req.query;
    let pageN = Number(page);
    const photographerIdN = Number(photographerId);
    const albumIdN = Number(albumId);
    let limitN = Number(limit);

    pageN = pageN || 1;
    // @ts-ignore
    limitN = limit || 10;
    const offset = pageN * limitN - limitN;
    const albumExist = await Album.findOne({
      where: { id: albumIdN, photographerId: photographerIdN },
    });

    if (albumExist === null) {
      res.status(403).json({ message: 'Album doesn`t exist' });
      return;
    }
    const album = await Photo.findAndCountAll({
      where: { id: albumIdN, photographerId: photographerIdN },
      limit: limitN,
      offset,
    });
    if (album.count === 0) {
      res.json('The album is empty');
      return;
    }
    res.json(album);
  }

  async createPresignedGetForPhotos(req: Request, res: Response) {
    const s3 = new aws.S3();
    const photoKeyArr = req.body;
    const photoUrls: any[] = [];
    photoKeyArr.forEach((el:any) => {
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
