import express from 'express';

import photographerController from '../controllers/photographerController';
import checkAuth from '../middleware/authMiddleware';

const router = express.Router();

router.post('/login', photographerController.login);
router.post('/create-album', checkAuth, photographerController.createAlbum);
router.post('/s3-upload', checkAuth, photographerController.signOne);
router.post('/save-photo-to-db', checkAuth, photographerController.savePhotoToDB);
router.post('/save-mini-photo-to-db', checkAuth, photographerController.savePhotoMiniToDB);
router.post('/save-photo-mini-watermark-to-db', checkAuth, photographerController.savePhotoMiniWaterMarkToDB);
router.post('/add-person-to-photo', checkAuth, photographerController.addPersonToPhoto);
router.get('/get-albums', checkAuth, photographerController.getAlbums);
router.get('/get-photos', checkAuth, photographerController.getPhotos);

export default router;
