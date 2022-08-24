import express from 'express';
import appUserController from '../controllers/appUserController';

const router = express.Router();

router.post('/create-app-user', appUserController.createAppUser);
router.post('/presigned-post', appUserController.signSelfie);
router.post('/save-to-database', appUserController.uploadSelfieToDB);
router.get('/get-selfie', appUserController.getSelfie);

export default router;
