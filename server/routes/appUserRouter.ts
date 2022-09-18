import express from 'express';
import telegramController from '../controllers/appUserController/telegramController/telegramController';
import stripeController from '../controllers/appUserController/stripeWebhookController/stripeWebhookController';
import userAccountController from '../controllers/appUserController/userAccountController/userAccountController';
import photoController from '../controllers/appUserController/photoController/photoController';
import checkAuth from '../middleware/authMiddleware';

const router = express.Router();

router.post('/send-otp', telegramController.generateOTP);
router.post('/create-app-user', userAccountController.createAppUser);
router.post('/presigned-post', checkAuth, photoController.signSelfie);
router.get('/get-selfie', checkAuth, photoController.getSelfie);
router.post('/get-signed-selfie', checkAuth, photoController.createPresignedGetForSelfie);
router.put('/edit-notification-settings', checkAuth, userAccountController.editNotificationSettings);
router.put('/edit-name', checkAuth, userAccountController.editName);
router.put('/edit-phone', checkAuth, userAccountController.editPhone);
router.put('/edit-email', checkAuth, userAccountController.editEmail);
router.get('/get-albums-with-person', checkAuth, photoController.getAlbumsWithPerson);
router.get('/get-thumbnails-with-person', checkAuth, photoController.getThumbnails);
router.get('/get-original-photo', checkAuth, photoController.getOriginalPhoto);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.webhook);
export default router;
