import express from 'express';
import userRouter from './photographerRouter';
import albumRouter from './albumRouter';
import telegramRouter from './telegramRouter';

const router = express.Router();

router.use('/user', userRouter);
router.use('/album', albumRouter);
router.use('/telegram', telegramRouter);

export default router;
