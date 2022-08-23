import dotenv from 'dotenv';
import express, { Express } from 'express';
import TelegramBot from 'node-telegram-bot-api';
import cors from 'cors';
import sequelize from './db';
import router from './routes/index';
import telegramController from './controllers/telegramController';
// import db from './models/model';
// const DB: any = db;
// const User = DB;
dotenv.config();

const app: Express = express();
app.use(cors()); // чтобы можно было отправлять запросы с браузера
app.use(express.json()); // чтобы приложение могло парсить json формат
app.use('/api', router);

const bot = new TelegramBot(`${process.env.TELEGRAM_BOT_KEY}`, { polling: true });
// @ts-ignore
// 508002761
let chatId: number |null = null;

const { PORT } = process.env;
const start = async () => {
  try {
    // await sequelize.authenticate();
    // await sequelize.sync(); // будет сверят состояние базы данных со схемой данных
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

    // Listen for any kind of message. There are different kinds of
    // messages.
    bot.on('message', (msg) => {
      chatId = msg.chat.id;
    });
  } catch (e) {
    console.log(e);
  }
};

start();
export { bot, chatId };
