import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppUser, Person } from '../../../models/model';

const generateJwt = (id: number, phoneNumber: string) => jwt.sign(
  { id, phoneNumber },
  process.env.SECRET_KEY!,
  {
    expiresIn: '24h',
  },
);

class UserAccountController {
  async createAppUser(req:Request, res:Response) {
    try {
      const { phone } = req.body;
      const appUserExist = await AppUser.findAll({ where: { phone } });
      if (appUserExist.length > 0) {
        // @ts-ignore
        const userId = appUserExist[0].dataValues.id;
        // @ts-ignore
        const phoneNumber = appUserExist[0].dataValues.phone;
        const token = generateJwt(userId, phoneNumber);
        res.json({ token });
        return;
      }
      try {
        const appUser = await AppUser.create({
          phone,
          textMessagesNotification: true,
          emailNotification: true,
          unsubscribe: false,
        });
        const personExist = await Person.findOne({ where: { phone } });
        console.log('personExist is: ', personExist);
        if (appUser && personExist === null) {
          const person = await Person.create({
            phone,
          });
          if (person) {
            // @ts-ignore
            const userId = appUser.id;
            // @ts-ignore
            const phoneNumber = appUser.phone;
            const token = generateJwt(userId, phoneNumber);
            res.json({ token });
            return;
          }
        } else {
          // @ts-ignore
          const userId = personExist.dataValues.id;
          // @ts-ignore
          const phoneNumber = personExist.dataValues.phone;
          const token = generateJwt(userId, phoneNumber);
          res.json({ token });
          return;
        }
      } catch (e) {
        res.json({ messsage: e });
      }
      return;
    } catch (e) {
      res.status(500).json({ message: 'Error occured' });
      console.log(e);
    }
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
      } else {
        res.send({ message: 'User not found' });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Error occured' });
    }
  }

  async editPhone(req: Request, res: Response) {
    const { id, phone } = req.body;
    try {
      const user = await AppUser.findOne({ where: { id } });
      let oldPhone;
      if (user) {
        // @ts-ignore
        oldPhone = user.phone;
        console.log({ oldPhone });
        // @ts-ignore
        user.phone = phone;
        user.save();
        try {
          const person = await Person.findOne({ where: { phone: oldPhone } });
          console.log({ person });
          if (person) {
            // @ts-ignore
            person.phone = phone;
            person.save();
          }
        } catch (e) {
          console.log(e);
        }
        const token = generateJwt(id, phone);
        res.json({ user, token });
      } else {
        res.send({ message: 'User not found' });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Error occured' });
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
      } else {
        res.send({ message: 'User not found' });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Error occured' });
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
      res.status(500).json({ message: 'Error occured' });
    }
  }
}

export default new UserAccountController();
