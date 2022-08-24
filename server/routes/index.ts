import express from 'express';
import photographerRouter from './photographerRouter';
import albumRouter from './albumRouter';
import telegramRouter from './telegramRouter';
import appUserRouter from './appUserRouter';

const router = express.Router();

router.use('/photographer', photographerRouter);
router.use('/album', albumRouter);
router.use('/telegram', telegramRouter);
router.use('/app-user', appUserRouter);

export default router;
