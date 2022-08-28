import express from 'express';
import appUserController from '../controllers/appUserController';

const router = express.Router();

router.post('/send-otp', appUserController.generateOTP);
router.post('/create-app-user', appUserController.createAppUser);
router.post('/presigned-post', appUserController.signSelfie);
router.post('/save-to-database', appUserController.uploadSelfieToDB);
router.get('/get-selfie', appUserController.getSelfie);
router.post('/edit-name', appUserController.editName);
router.post('/edit-phone', appUserController.editPhone);
router.post('/edit-email', appUserController.editEmail);
router.get('get-album-with-person', appUserController.getAlbumWithPerson);
router.get('/get-photo-with-person', appUserController.getPhotoWithPerson);

export default router;
