import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import aws from 'aws-sdk';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '../errors/APIErrors';
import {
  Photographer as db, Album, Photo, Person,
} from '../models/model';

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
  async login(req: Request, res:Response, next: any) {
    try {
      const { login, password } = req.body;
      const user = await Photographer.findOne({ where: { login } });
      if (!user) {
        return next(ApiError.internal('User not found'));
      }
      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.internal('Wrong password'));
      }
      const token = generateJwt(user.id, user.login);
      return res.json({ token });
    } catch (e) {
      console.log(e);
    }
  }

  async createAlbum(req:Request, res:Response) {
    try {
      const {
        name, location, date, photographerId,
      } = req.body;
      const album = await Album.create({
        name, location, date, photographerId,
      });
      res.json(album);
      return;
    } catch (e) {
      console.log(e);
    }
  }

  async signOne(req: Request, res: Response) {
    const s3 = new aws.S3();
    const { photosArray, people } = req.body;
    const metadata = `${people}`;

    const presignedPostsArray = [];
    for (let i = 0; i < photosArray.length; i += 1) {
      const { photographerId } = photosArray[i][0];
      const { albumName } = photosArray[i][1];
      const { photoName } = photosArray[i][2];
      const startIndex = photoName.indexOf('.') + 1;
      const photoExtension = photoName.substr(startIndex);

      const { url, fields } = s3.createPresignedPost({
        Fields: {
          key: `${photographerId}/${albumName}/${uuidv4()}_${photoName}`,
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

  // async savePhotoToDB(req:Request, res:Response) {
  //   try {
  //     const {
  //       name, clientsArray, photoUrl, photographerId, albumName,
  //     } = req.body;
  //     const photo = await Photo.create({
  //       name, photoUrl, photographerId, albumName,
  //     });
  //     // @ts-ignore
  //     // const photoId = photo.dataValues.id;
  //     for (let i = 0; i < clientsArray.length; i += 1) {
  //       try {
  //         /* eslint-disable no-await-in-loop */
  //         const personExist = await Person.findOne({ where: { name: clientsArray[i] } });
  //         if (personExist === null) {
  //           /* eslint-disable no-await-in-loop */
  //           const person = await Person.create({
  //             name: clientsArray[i],
  //           });
  //           // @ts-ignore
  //           await person.addPhoto(photo);
  //         } else {
  //           // @ts-ignore
  //           personExist.addPhoto(photo);
  //         }
  //       } catch (e) {
  //         console.log(e);
  //       }
  //     }
  //     res.send('Successfully uploaded');
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // async savePhotoMiniToDB(req:Request, res:Response) {
  //   try {
  //     const {
  //       name, clientsArray, photoMiniUrl, photographerId, albumName,
  //     } = req.body;
  //     const photoMini = await PhotoMini.create({
  //       name, photoMiniUrl, photographerId, albumName,
  //     });
  //     // @ts-ignore
  //     // const photoMiniId = photoMini.dataValues.id;
  //     for (let i = 0; i < clientsArray.length; i += 1) {
  //       try {
  //         /* eslint-disable no-await-in-loop */
  //         const personExist = await Person.findOne({ where: { name: clientsArray[i] } });
  //         if (personExist === null) {
  //           /* eslint-disable no-await-in-loop */
  //           const person = await Person.create({
  //             name: clientsArray[i],
  //           });
  //           // @ts-ignore
  //           await person.addPhotoMini(photoMini);
  //         } else {
  //           // @ts-ignore
  //           personExist.addPhotoMini(photoMini);
  //         }
  //       } catch (e) {
  //         console.log(e);
  //       }
  //     }
  //     res.send('Successfully uploaded');
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // async savePhotoMiniWaterMarkToDB(req:Request, res:Response) {
  //   try {
  //     const {
  //       name, clientsArray, photoMiniWaterMarkUrl, photographerId, albumName,
  //     } = req.body;
  //     const photoMinWaterMark = await PhotoMiniWaterMark.create({
  //       name, photoMiniWaterMarkUrl, photographerId, albumName,
  //     });
  //     // @ts-ignore
  //     // const photoMinWaterMarkiId = photoMinWaterMark.dataValues.id;
  //     for (let i = 0; i < clientsArray.length; i += 1) {
  //       try {
  //         /* eslint-disable no-await-in-loop */
  //         const personExist = await Person.findOne({ where: { name: clientsArray[i] } });
  //         if (personExist === null) {
  //           /* eslint-disable no-await-in-loop */
  //           const person = await Person.create({
  //             name: clientsArray[i],
  //           });
  //           // @ts-ignore
  //           await person.addPhotoMiniWaterMark(photoMinWaterMark);
  //         } else {
  //           // @ts-ignore
  //           personExist.addPhotoMiniWaterMark(photoMinWaterMark);
  //         }
  //       } catch (e) {
  //         console.log(e);
  //       }
  //     }
  //     res.send('Successfully uploaded');
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  async createPerson(req: Request, res: Response) {
    const { name } = req.body;
    try {
      const person = await Person.create({ name });
      res.json(person);
    } catch (e) {
      console.log(e);
      // @ts-ignore
      if (e.errors[0].type === 'unique violation') {
        res.json('name must be unique');
      } else {
        res.json(e);
      }
    }
  }

  async getAllPeople(req: Request, res: Response) {
    try {
      const people = await Person.findAll();
      res.json(people);
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  }

  async addPersonToPhoto(req: Request, res: Response) {
    const { photoId, clientsArray } = req.body;
    try {
      const photo = await Photo.findOne({ where: { id: photoId } });

      for (let i = 0; i < clientsArray.length; i += 1) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const personExist = await Person.findOne({ where: { name: clientsArray[i] } });
          if (personExist === null) {
            /* eslint-disable no-await-in-loop */
            const person = await Person.create({
              name: clientsArray[i],
              photoId,
            });
            // @ts-ignore
            await person.addPhoto(photo);
            // @ts-ignore
            await person.addPhotoMini(photo);
            // @ts-ignore
            await person.addPhotoMiniWaterMark(photo);
          } else {
            // @ts-ignore
            await personExist.addPhoto(photo);
            // @ts-ignore
            await personExist.addPhotoMini(photo);
            // @ts-ignore
            await personExist.addPhotoMiniWaterMark(photo);
          }
        } catch (e) {
          console.log(e);
        }
      }
      res.send('Successfully uploaded');
    } catch (e) {
      console.log(e);
    }
  }

  async getAlbums(req: Request, res: Response) {
    const { photographerId } = req.query;
    console.log('photographerId is: ', photographerId);
    const albums = await Album.findAll({ where: { photographerId } });
    res.json(albums);
  }

  async getPhotos(req: Request, res: Response) {
    /* LIMIT will retrieve only the number of records specified after the LIMIT keyword,
     unless the query itself returns fewer records than the number specified by LIMIT.
    OFFSET is used to skip the number of records from the results. */
    let {
      albumName, photographerId, limit, page,
    } = req.query;
    // @ts-ignore
    page = page || 1;
    // @ts-ignore
    limit = limit || 10;
    // @ts-ignore
    const offset = page * limit - limit;
    // @ts-ignore
    const album = await Photo.findAndCountAll({
      where: { albumName, photographerId },
      // @ts-ignore
      limit,
      offset,
    });

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
