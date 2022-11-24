import express from 'express';
import photographerController from '../controllers/photographerController/photographerController';
import checkAuth from '../middleware/authMiddleware';
import checkValidationErrors from '../middleware/validationErrorsMiddleware';
import photographerValidator from '../validator/photographerValidator/photographerValidator';

const router = express.Router();
// TO DO:combine /get-albums-from-db && get-albums-thumbnail-icons && get-photos-from-db && get-signed-photos
// in one route

// login and auth routes
router.post('/login', photographerValidator.checkLogin(), checkValidationErrors, photographerController.login);
router.get('/get-me', photographerController.getMe);

// album route
router.post('/create-album', checkAuth, photographerValidator.checkCreateAlbum(), checkValidationErrors, photographerController.createAlbum);
// /get-albums-from-db and  /get-albums-thumbnail-icons combined into one route
// TO DO: delete /get-albums-thumbnail-icons route after Alexey implemets changes
router.get('/get-albums-from-db', checkAuth, photographerValidator.checkGetAlbum(), checkValidationErrors, photographerController.getAlbums);
router.post('/get-albums-thumbnail-icons', checkAuth, photographerValidator.checkGetAlbumsThumbnailIcon(), checkValidationErrors, photographerController.getAlbumsThumbnailIcon);

// photo routes
// /get-photos-from-db and  /get-signed-photos combined into one route
// TO DO: delete /get-signed-photos route after Alexey implemets changes
router.get('/get-photos-from-db', checkAuth, photographerValidator.checkGetPhotos(), checkValidationErrors, photographerController.getPhotos);
router.post('/get-signed-photos', checkAuth, photographerValidator.checkGetSignedPhotos(), checkValidationErrors, photographerController.createPresignedGetForPhotos);

router.post('/s3-upload', checkAuth, photographerValidator.checkS3Upload(), checkValidationErrors, photographerController.signOne);

// get people router
router.get('/get-all-people', checkAuth, photographerController.getAllPeople);

export default router;
