import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppUser, Person } from '../../../models/model';

const generateJwt = (id: number, phoneNumber: string):string => jwt.sign(
  { id, phoneNumber },
  process.env.SECRET_KEY!,
  {
    expiresIn: '24h',
  },
);

class UserAccountController {
  async createAppUser(req: Request, res: Response): Promise<void> {
    interface Phone {
      phone: string
    }
    const { phone }:Phone = req.body;
    if (phone) {
      try {
        const appUserExist = await AppUser.findAll({ where: { phone } });
        if (appUserExist.length > 0) {
          const userId = appUserExist[0].id;
          const phoneNumber = appUserExist[0].phone;
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
              const userId = appUser.id;
              const phoneNumber = appUser.phone;
              const token = generateJwt(userId, phoneNumber);
              res.json({ token });
              return;
            }
          } else if (personExist) {
            const userId = personExist.id;
            const phoneNumber = personExist.phone;
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
  }

  async editName(req: Request, res: Response): Promise<void> {
    interface Body {
      id: number,
      name: string
    }
    const { id, name }:Body = req.body;
    if (id && name) {
      try {
        const user = await AppUser.findOne({ where: { id } });
        if (user) {
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
  }

  async editPhone(req: Request, res: Response): Promise<void> {
      interface Body {
      id: number,
      phone: string
    }
      const { id, phone }:Body = req.body;
      if (id && phone) {
        try {
          const user = await AppUser.findOne({ where: { id } });
          let oldPhone;
          if (user) {
            oldPhone = user.phone;
            console.log({ oldPhone });
            user.phone = phone;
            user.save();
            try {
              const person = await Person.findOne({ where: { phone: oldPhone } });
              console.log({ person });
              if (person) {
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
  }

  async editEmail(req: Request, res: Response): Promise<void> {
    interface Body {
      id: number,
      email: string
    }
    const { id, email }:Body = req.body;
    if (id && email) {
      try {
        const user = await AppUser.findOne({ where: { id } });
        if (user) {
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
  }

  async editNotificationSettings(req: Request, res: Response) {
    interface Body {
      id: number,
      textMessagesNotification: boolean,
      emailNotification: boolean,
      unsubscribe: boolean
    }
    const {
      id, textMessagesNotification, emailNotification, unsubscribe,
    }:Body = req.body;
    try {
      const user = await AppUser.findOne({ where: { id } });
      if (user) {
        user.textMessagesNotification = textMessagesNotification;
        user.emailNotification = emailNotification;
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
