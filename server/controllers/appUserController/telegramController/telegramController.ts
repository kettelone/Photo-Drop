import { Request, Response } from 'express';
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(`${process.env.TELEGRAM_BOT_KEY}`, { polling: true });

class TelegramController {
  generateOTP(req:Request, res:Response):void {
    const OTP = `${Math.floor(Math.random() * (999999 - 100000) + 100000)}`;
    try {
      bot.sendMessage(Number(process.env.TG_BOT_CHAT_ID), `Your OTP is: ${OTP}`);
    } catch (e) {
      console.log(e);
    }
    res.json({ OTP });
  }
}

export default new TelegramController();
