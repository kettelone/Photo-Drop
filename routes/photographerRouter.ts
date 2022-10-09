import express from 'express';
import photographerController from '../controllers/photographerController/photographerController';
import { checkAuth, checkValidationErrors } from '../middleware/authMiddleware';
import photographerValidator from '../validator/photographerValidator/photographerValidator';

const router = express.Router();

router.post('/login', photographerValidator.checkLogin(), checkValidationErrors, photographerController.login);
router.get('/get-me', photographerController.getMe);
router.post('/create-album', checkAuth, photographerValidator.checkCreateAlbum(), checkValidationErrors, photographerController.createAlbum);
router.post('/s3-upload', checkAuth, photographerValidator.checkS3Upload(), checkValidationErrors, photographerController.signOne);
router.post('/get-signed-photos', checkAuth, photographerValidator.checkGetSignedPhotos(), checkValidationErrors, photographerController.createPresignedGetForPhotos);
router.get('/get-all-people', checkAuth, photographerController.getAllPeople);
router.get('/get-albums-from-db', checkAuth, photographerValidator.checkGetAlbum(), checkValidationErrors, photographerController.getAlbums);
router.post('/get-albums-thumbnail-icons', checkAuth, photographerValidator.checkGetAlbumsThumbnailIcon(), checkValidationErrors, photographerController.getAlbumsThumbnailIcon);
router.get('/get-photos-from-db', checkAuth, photographerValidator.checkGetPhotos(), checkValidationErrors, photographerController.getPhotos);
export default router;
