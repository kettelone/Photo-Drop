import { Request, Response } from 'express';
import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
// import { bot, chatId } from '../index';
import {
  AppUser, Selfie, Person, Photo_Person, Photo,
} from '../models/model';

aws.config.update({
  region: 'eu-west-1',
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

class AppUserController {
  generateOTP(req:Request, res:Response) {
    // // const OTP = req.body.OTP
    // const OTP = Math.floor(Math.random() * (999999 - 100000) + 100000);
    // if (chatId !== null) {
    //   bot.sendMessage(chatId, `Your OTP is: ${OTP}`);
    //   res.send('OTP sent');
    // }
    res.send('Ok');
  }

  async createAppUser(req:Request, res:Response) {
    try {
      const { phone } = req.body;
      const exist = await AppUser.findAll({ where: { phone } });
      if (exist.length > 0) {
        res.send('User with this phone number already exist');
        return;
      }
      const appUser = await AppUser.create({
        phone,
        textMessagesNotification: true,
        emailNotification: true,
        unsubscribe: false,
      });

      if (appUser) {
        res.json(appUser);
      }
      return;
    } catch (e) {
      res.send('Error occured');
      console.log(e);
    }
  }

  async signSelfie(req: Request, res: Response) {
    const s3 = new aws.S3();
    const selfie = req.body;
    const { url, fields } = s3.createPresignedPost({
      Fields: {
        key: `${uuidv4()}_${selfie.name}`,
      },
      Conditions: [['content-length-range', 0, 1000000]],
      Expires: 60 * 60, // seconds
      Bucket: process.env.S3_BUCKET,
    });
    res.send(JSON.stringify({ url, fields }));
  }

  async uploadSelfieToDB(req:Request, res:Response) {
    try {
      const {
        name, selfieUrl, appUserId,
      } = req.body;
      const oldSelfies = await Selfie.findAll({ where: { appUserId } });
      for (let i = 0; i < oldSelfies.length; i += 1) {
        // @ts-ignore
        oldSelfies[i].active = false;
        // eslint-disable-next-line no-await-in-loop
        await oldSelfies[i].save();
      }

      await Selfie.create({
        name, selfieUrl, appUserId, active: true,
      });
      res.send('Selfie saved to database');
    } catch (e) {
      console.log(e);
    }
  }

  async getSelfie(req: Request, res: Response) {
    const { appUserId } = req.query;
    const selfie = await Selfie.findOne({ where: { appUserId, active: true } });
    res.json(selfie);
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

  async getAlbumWithPerson(req: Request, res: Response) {
    res.json();
  }

  async getPhotoWithPerson(req:Request, res:Response) {
    const { personName } = req.query;
    const person = await Person.findOne({ where: { name: personName } });
    if (person) {
      // @ts-ignore
      const photo_person = await Photo_Person.findAll({
        where:
        // @ts-ignore
          { personId: person.id },
      });
      // @elsint-ignore
      // @ts-ignore
      const photos = [];
      // @ts-ignore
      if (photo_person.length > 0) {
        for (let i = 0; i < photo_person.length; i++) {
          // @ts-ignore
          const photo = await Photo.findOne({ where: { id: photo_person[i].photoId } });
          photos.push(photo);
        }
      }
      // @ts-ignore
      res.json(photos);
    }
  }
}

export default new AppUserController();
