import { Request, Response } from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { UserOTP } from '../../../models/model';

const bot = new TelegramBot(`${process.env.TELEGRAM_BOT_KEY!}`, { polling: true });

class TelegramController {
  async generateOTP(req: Request): Promise<void> {
    interface Phone {
      phone: string
    }
    const { phone }: Phone = req.body;

    const OTP = `${Math.floor(Math.random() * (999999 - 100000) + 100000)}`;
    const phoneExist = await UserOTP.findOne({ where: { phone } });
    if (phoneExist) {
      phoneExist.otp = OTP;
      phoneExist.save();
    } else {
      await UserOTP.create({ phone, otp: OTP });
    }
    try {
      bot.sendMessage(
        Number(process.env.TB_BOT_GROUP_CHAT_ID),
        `Your phone is: ${phone}\nYour OTP is: ${OTP}`,
      );
    } catch (e) {
      console.log(e);
    }
  }

  async checkOTP(req: Request, res: Response) {
    const { phone, otp } = req.query as { [key: string]: string };
    const userOTP = await UserOTP.findOne({ where: { phone, otp } });
    if (userOTP) {
      res.send();
    } else {
      res.status(401).json({ errors: [{ msg: 'Incorrect verification code, please check again.' }] });
    }
  }

  sendPhotoNotification(req: Request, res: Response) {
    try {
      bot.sendMessage(Number(process.env.TB_BOT_GROUP_CHAT_ID), 'PhotoDrop: your photos have dropped🔥\n\nCheck the out here:\n https://userAppUrlWillBeSoonHere.com');

      res.send();
    } catch (e) {
      console.log(e);
    }
  }
}

export default new TelegramController();

// import { Request, Response } from 'express';

// import TelegramBot from 'node-telegram-bot-api';

// const bot = new TelegramBot(`${process.env.TELEGRAM_BOT_KEY!}`, { polling: true });

// class TelegramController {
//   generateOTP(req: Request, res: Response): void {
//     interface Phone {
//       phone: string
//     }
//     const { phone }: Phone = req.body;

//     const OTP = `${Math.floor(Math.random() * (999999 - 100000) + 100000)}`;

//     try {
//       bot.sendMessage(
//         Number(process.env.TB_BOT_GROUP_CHAT_ID),
//         `Your phone is: ${phone}\nYour OTP is: ${OTP}`,
//       );
//       res.json({ OTP });
//     } catch (e) {
//       console.log(e);
//     }
//   }

//   sendPhotoNotification(req: Request, res: Response) {
//     try {
//       bot.sendMessage(Number(process.env.TB_BOT_GROUP_CHAT_ID), 'PhotoDrop: your photos have dropped🔥\n\nCheck the out here:\n https://userAppUrlWillBeSoonHere.com');

//       res.send();
//     } catch (e) {
//       console.log(e);
//     }
//   }
// }

// export default new TelegramController();
