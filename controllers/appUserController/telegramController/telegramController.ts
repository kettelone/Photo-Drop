import { Request, Response, NextFunction } from 'express';
// import TelegramBot from 'node-telegram-bot-api';
import { UserOTP } from '../../../models/model';
import ApiError from '../../../errors/APIErrors';

// TO DO: Use stash to choose beetwen production and development bot

// const bot = new TelegramBot(`${process.env.TELEGRAM_BOT_KEY!}`, { polling: true });

class TelegramController {
  async generateOTP(req: Request, res: Response, next:NextFunction): Promise<void> {
    const { phone } = req.body as { phone: string };
    // const sendOTPToTelegram = (otp:string) => {
    //   bot.sendMessage(
    //     Number(process.env.TB_BOT_GROUP_CHAT_ID),
    //     `Your phone is: ${phone}\nYour OTP is: ${otp}`,
    //   );
    // };
    const OTP = `${Math.floor(Math.random() * (999999 - 100000) + 100000)}`;
    try {
      const phoneExist = await UserOTP.findOne({ where: { phone } });
      if (!phoneExist) {
        const otpCreated = Date.now();
        const newUser = await UserOTP.create({ phone, otp: OTP, otpCreated });
        newUser.save();
        // sendOTPToTelegram(OTP);
        res.send();
        return;
      }
      phoneExist.otp = OTP;
      phoneExist.otpCreated = Date.now();
      phoneExist.save();
      // sendOTPToTelegram(OTP);
      res.send();
      return;
    } catch (e) {
      console.log(e);
      next(new ApiError(500, 'Internal error while generating OTP'));
    }
  }

  async checkOTP(req: Request, res: Response, next:NextFunction) {
    try {
      const { phone, otp } = req.query as { [key: string]: string };
      const userOTP = await UserOTP.findOne({ where: { phone, otp } });
      const otpLifeTime = 30 * 1000;
      if (userOTP && userOTP.otpCreated && (Date.now() - userOTP.otpCreated < otpLifeTime)) {
        res.send();
        return;
      }
      next(new ApiError(401, 'Incorrect verification code, please check again'));
    } catch (e) {
      next(new ApiError(500, 'Internal error while checking OTP'));
    }
  }
}

export default new TelegramController();
