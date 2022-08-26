import express from 'express';
import telegramController from '../controllers/telegramController';
import checkAuth from '../middleware/authMiddleware';

const router = express.Router();

router.post('/send-otp', checkAuth, telegramController.generateOTP);

export default router;
