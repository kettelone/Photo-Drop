import dotenv from 'dotenv';
import express, {
  Express,
} from 'express';
import cors from 'cors';
import sequelize from './db';
import router from './routes/index';
import apiErrorHandler from './middleware/errorrHandlingMiddleware';

dotenv.config();

const app: Express = express();
app.use(cors()); // чтобы можно было отправлять запросы с браузера
app.use(express.json()); // чтобы приложение могло парсить json формат
app.use('/api', router);
// Error handler middleware. Shoud be the last middleware
app.use(apiErrorHandler);

const { PORT } = process.env;
const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // будет сверят состояние базы данных со схемой данных
    // sync({ force: true }) - deletes everything!!!
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
