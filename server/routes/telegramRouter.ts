import express from 'express';
import telegramController from '../controllers/telegramController';

const router = express.Router();

router.post('/send-otp', telegramController.generateOTP);

export default router;
