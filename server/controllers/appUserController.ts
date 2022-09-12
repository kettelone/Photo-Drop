import { Request, Response } from 'express';
import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import TelegramBot from 'node-telegram-bot-api';
import jwt from 'jsonwebtoken';

import {
  AppUser, Selfie, Person, Photo_Person, Photo,
} from '../models/model';

aws.config.update({
  region: 'eu-west-1',
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

// const bot = new TelegramBot(`${process.env.TELEGRAM_BOT_KEY}`, { polling: true });

const generateJwt = (id: number, phoneNumber: string) => jwt.sign(
  { id, phoneNumber },
  process.env.SECRET_KEY!,
  {
    expiresIn: '24h',
  },
);

class AppUserController {
  generateOTP(req:Request, res:Response) {
    const OTP = `${Math.floor(Math.random() * (999999 - 100000) + 100000)}`;
    try {
      // bot.sendMessage(Number(process.env.TG_BOT_CHAT_ID), `Your OTP is: ${OTP}`);
    } catch (e) {
      console.log(e);
    }
    res.json({ OTP });
  }

  async createAppUser(req:Request, res:Response) {
    try {
      const { phone } = req.body;
      const appUserExist = await AppUser.findAll({ where: { phone } });
      if (appUserExist.length > 0) {
        // @ts-ignore
        const userId = appUserExist[0].dataValues.id;
        // @ts-ignore
        const phoneNumber = appUserExist[0].dataValues.phone;
        console.log(userId, phoneNumber);
        const token = generateJwt(userId, phoneNumber);
        res.json({ token });
        return;
      }
      const appUser = await AppUser.create({
        phone,
        textMessagesNotification: true,
        emailNotification: true,
        unsubscribe: false,
      });

      if (appUser) {
        // @ts-ignore
        const userId = appUser.id;
        // @ts-ignore
        const phoneNumber = appUser.phone;
        const token = generateJwt(userId, phoneNumber);
        res.json({ token });
        return;
      }
      return;
    } catch (e) {
      res.send('Error occured');
      console.log(e);
    }
  }

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

  // async uploadSelfieToDB(req:Request, res:Response) {
  //   try {
  //     const {
  //       name, selfieUrl, appUserId,
  //     } = req.body;
  //     const oldSelfies = await Selfie.findAll({ where: { appUserId } });
  //     for (let i = 0; i < oldSelfies.length; i += 1) {
  //       // @ts-ignore
  //       oldSelfies[i].active = false;
  //       // eslint-disable-next-line no-await-in-loop
  //       await oldSelfies[i].save();
  //     }

  //     await Selfie.create({
  //       name, selfieUrl, appUserId, active: true,
  //     });
  //     res.send('Selfie saved to database');
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  async getSelfie(req: Request, res: Response) {
    const { appUserId } = req.query;
    const selfie = await Selfie.findOne({ where: { appUserId, active: true } });
    res.json(selfie);
  }

  async createPresignedGetForSelfie(req: Request, res: Response) {
    const s3 = new aws.S3();
    const { selfieKey } = req.body;
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_SELFIE_BUCKET,
      Key: selfieKey,
      Expires: 60 * 5,
    });

    res.json(url);
  }

  async editName(req: Request, res: Response) {
    const { id, name } = req.body;
    try {
      const user = await AppUser.findOne({ where: { id } });
      if (user) {
        // @ts-ignore
        user.name = name;
        user.save();
        res.json(user);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async editPhone(req: Request, res: Response) {
    const { id, phone } = req.body;
    try {
      const user = await AppUser.findOne({ where: { id } });
      if (user) {
        // @ts-ignore
        user.phone = phone;
        user.save();
        res.json(user);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async editEmail(req: Request, res: Response) {
    const { id, email } = req.body;
    try {
      const user = await AppUser.findOne({ where: { id } });
      if (user) {
        // @ts-ignore
        user.email = email;
        user.save();
        res.json(user);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async editNotificationSettings(req:Request, res:Response) {
    const {
      id, textMessagesNotification, emailNotification, unsubscribe,
    } = req.body;
    try {
      const user = await AppUser.findOne({ where: { id } });
      if (user) {
        // @ts-ignore
        user.textMessagesNotification = textMessagesNotification;
        // @ts-ignore
        user.emailNotification = emailNotification;
        // @ts-ignore
        user.unsubscribe = unsubscribe;
        user.save();
        res.json(user);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getAlbumsWithPerson(req: Request, res: Response) {
    const { personName } = req.query;
    const person = await Person.findOne({ where: { name: personName } });
    if (person) {
      // @ts-ignore
      // @elsint-ignore
      const photo_person = await Photo_Person.findAll({
        where:
        // @ts-ignore
          { personId: person.id },
      });
      // @elsint-ignore
      // @ts-ignore
      const photos = [];
      // @ts-ignore
      // @elsint-ignore
      if (photo_person.length > 0) {
        for (let i = 0; i < photo_person.length; i++) {
          // @ts-ignore
          // @elsint-ignore
          const photo = await Photo.findOne({ where: { id: photo_person[i].photoId } });
          photos.push(photo);
        }
      }
      const albumIds:[] = [];
      for (let i = 0; i < photos.length; i += 1) {
        // @ts-ignore
        const { albumId } = photos[i].dataValues;
        if (albumId !== null) {
          // @ts-ignore
          albumIds.push(albumId);
        }
      }
      // @ts-ignore
      const iniqueAlbumIds = [...new Set(albumIds)];
      console.log('iniqueAlbumIds are: ', iniqueAlbumIds);
      // @ts-ignore
      res.json({ albumIds: iniqueAlbumIds });
    }
  }

  async getPhotosWithPerson(req:Request, res:Response) {
    const { albumId } = req.query;
    // @ts-ignore
    // @elsint-ignore
    const photos = await Photo.findAll({ where: { albumId } });
    // @ts-ignore
    res.json(photos);
  }
}

export default new AppUserController();
