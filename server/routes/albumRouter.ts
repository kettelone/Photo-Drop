import express from 'express';
import albumController from '../controllers/albumController';
import checkAuth from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create-album', checkAuth, albumController.createAlbum);
router.post('/save-to-database', checkAuth, albumController.uploadPhotosToDB);
router.post('/add-person-to-photo', checkAuth, albumController.addPersonToPhoto);
router.post('/s3-upload', checkAuth, albumController.signOne);

export default router;
