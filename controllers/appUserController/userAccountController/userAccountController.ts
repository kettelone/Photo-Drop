import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppUser, Person, SelfieMini } from '../../../models/model';

const generateJwt = (
  id: number,
  phone: string,
  email: string,
  name:string,
  emailNotification: boolean,
  textMessagesNotification: boolean,
  unsubscribe: boolean,
  activeSelfieKey: string | null,
):string => jwt.sign(
  {
    id,
    phone,
    email,
    name,
    emailNotification,
    textMessagesNotification,
    unsubscribe,
    activeSelfieKey,
  },
  process.env.SECRET_KEY!,
  {
    expiresIn: '24h',
  },
);

const getMiniSelfieKey = async (appUserId:number):Promise<string | null> => {
  const selfieInstance = await SelfieMini.findOne({ where: { appUserId, active: true } });
  let activeSelfieKey;
  if (selfieInstance) {
    activeSelfieKey = selfieInstance.name;
  } else {
    activeSelfieKey = null;
  }
  return activeSelfieKey;
};

class UserAccountController {
  async createAppUser(req: Request, res: Response): Promise<void> {
    interface Phone {
      phone: string
    }
    const { phone }:Phone = req.body;
    if (phone) {
      try {
        const appUserExist = await AppUser.findOne({ where: { phone } });
        if (appUserExist) {
          const {
            id, email, name, emailNotification, textMessagesNotification, unsubscribe,
          } = appUserExist;

          const activeSelfieKey = await getMiniSelfieKey(id);
          const token = generateJwt(
            id,
            phone,
            email,
            name,
            emailNotification,
            textMessagesNotification,
            unsubscribe,
            activeSelfieKey,
          );
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
          if (appUser && personExist === null) {
            const person = await Person.create({
              phone,
            });
            if (person) {
              const {
                id, email, name, emailNotification, textMessagesNotification, unsubscribe,
              } = appUser;
              const activeSelfieKey = null;
              const token = generateJwt(
                id,
                phone,
                email,
                name,
                emailNotification,
                textMessagesNotification,
                unsubscribe,
                activeSelfieKey,
              );
              res.json({ token });
              return;
            }
          } else if (personExist) {
            const {
              id, email, name, emailNotification, textMessagesNotification, unsubscribe,
            } = appUser;

            const activeSelfieKey = await getMiniSelfieKey(id);
            const token = generateJwt(
              id,
              phone,
              email,
              name,
              emailNotification,
              textMessagesNotification,
              unsubscribe,
              activeSelfieKey,
            );
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

  async getMe(req: Request, res: Response):Promise<void> {
    try {
      if (req.headers.authorization !== undefined) {
        const token = req.headers.authorization.split(' ')[1]; // Bearer ddhcjhdsjcsdcs

        if (!token) {
          res.status(401).json({ errors: [{ msg: 'Not authorized' }] });
        }

        const payload = jwt.verify(token, process.env.SECRET_KEY!);
        if (payload) {
          res.send();
        }
      } else {
        res.status(401).json({ errors: [{ msg: 'Missing authorization token' }] });
      }
    } catch (e) {
      res.status(401).json({ errors: [{ msg: 'Not authorized' }] });
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
          const {
            phone,
            email,
            emailNotification,
            textMessagesNotification,
            unsubscribe,
          } = user;
          user.name = name;
          user.save();

          const activeSelfieKey = await getMiniSelfieKey(id);
          const token = generateJwt(
            id,
            phone,
            email,
            name,
            emailNotification,
            textMessagesNotification,
            unsubscribe,
            activeSelfieKey,
          );
          res.json({ token });
          return;
        }
        res.send({ message: 'User not found' });
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
            const {
              name,
              email,
              emailNotification,
              textMessagesNotification,
              unsubscribe,
            } = user;
            oldPhone = user.phone;
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
            const activeSelfieKey = await getMiniSelfieKey(id);
            const token = generateJwt(
              id,
              phone,
              email,
              name,
              emailNotification,
              textMessagesNotification,
              unsubscribe,
              activeSelfieKey,
            );
            res.json({ token });
            return;
          }
          res.send({ message: 'User not found' });
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
          const {
            name,
            phone,
            emailNotification,
            textMessagesNotification,
            unsubscribe,
          } = user;
          user.email = email;
          user.save();

          const activeSelfieKey = await getMiniSelfieKey(id);
          const token = generateJwt(
            id,
            phone,
            email,
            name,
            emailNotification,
            textMessagesNotification,
            unsubscribe,
            activeSelfieKey,
          );
          res.json({ token });
          return;
        }
        res.send({ message: 'User not found' });
      } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Error occured' });
      }
    }
  }

  async editNotificationSettings(req: Request, res: Response): Promise<void> {
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
        const { name, email, phone } = user;
        user.textMessagesNotification = textMessagesNotification;
        user.emailNotification = emailNotification;
        user.unsubscribe = unsubscribe;
        user.save();

        const activeSelfieKey = await getMiniSelfieKey(id);
        const token = generateJwt(
          id,
          phone,
          email,
          name,
          emailNotification,
          textMessagesNotification,
          unsubscribe,
          activeSelfieKey,
        );
        res.json({ token });
        return;
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Error occured' });
    }
  }
}

export default new UserAccountController();
