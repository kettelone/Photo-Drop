import { Request, Response } from 'Express';
import { bot, chatId } from '../index';

class TelegramController {
  generateOTP(req:Request, res:Response) {
    // const OTP = req.body.OTP
    const OTP = Math.floor(Math.random() * (999999 - 100000) + 100000);
    if (chatId !== null) {
      bot.sendMessage(chatId, `Your OTP is: ${OTP}`);
      res.send(`${OTP}`);
    }
  }
}

export default new TelegramController();
